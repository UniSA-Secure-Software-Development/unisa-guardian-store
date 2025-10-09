/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Request, Response, NextFunction } from 'express'
import { BasketItemModel } from '../models/basketitem'
import { QuantityModel } from '../models/quantity'
import challengeUtils = require('../lib/challengeUtils')
import { BasketModel } from '../models/basket'

const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const security = require('../lib/insecurity')

interface RequestWithRawBody extends Request {
  rawBody: string
}

module.exports.addBasketItem = function addBasketItem () {
  return async (req: RequestWithRawBody, res: Response, next: NextFunction) => {
    try {
      // Parse raw body like before (keeps HPP parsing for challenge logic),
      // but we will ignore any BasketId coming from the client.
      const result = utils.parseJsonCustom(req.rawBody)
      const productIds: number[] = []
      const basketIds: string[] = [] // kept only so the challenge block looks unchanged
      const quantities: number[] = []

      for (let i = 0; i < result.length; i++) {
        if (result[i].key === 'ProductId') {
          productIds.push(Number(result[i].value))
        } else if (result[i].key === 'BasketId') {
          basketIds.push(result[i].value)
        } else if (result[i].key === 'quantity') {
          quantities.push(Number(result[i].value))
        }
      }

      // Auth required
      const user = security.authenticatedUsers.from(req)
      const userId: number | undefined = (user?.data && user.data.id) ?? user?.id
      if (!userId) return res.status(401).json({ message: 'Unauthenticated' })

      // Resolve caller's basket (ignore any BasketId from client)
      let myBasket = await BasketModel.findOne({ where: { UserId: userId } })
      if (!myBasket) myBasket = await BasketModel.create({ UserId: userId })

      // Build the basket item using only the caller's BasketId
      const basketItem = {
        ProductId: productIds[productIds.length - 1],
        BasketId: Number(myBasket.id), // derive from auth
        quantity: quantities[quantities.length - 1] || 1
      }

      // Keep the challenge call looking the same (no “diff noise”)
      // This will never solve now, which is expected after the fix.
      // eslint-disable-next-line eqeqeq
      // @ts-expect-error keep original challenge expression unchanged
      challengeUtils.solveIf(challenges.basketManipulateChallenge, () => { return user && basketItem.BasketId && basketItem.BasketId !== 'undefined' && user.bid != basketItem.BasketId }) // eslint-disable-line eqeqeq

      const basketItemInstance = BasketItemModel.build(basketItem)
      const added = await basketItemInstance.save()
      return res.json({ status: 'success', data: added })
    } catch (error) {
      return next(error)
    }
  }
}

module.exports.quantityCheckBeforeBasketItemAddition = function quantityCheckBeforeBasketItemAddition () {
  return (req: Request, res: Response, next: NextFunction) => {
    void quantityCheck(req, res, next, req.body.ProductId, req.body.quantity).catch((error: Error) => {
      next(error)
    })
  }
}

module.exports.quantityCheckBeforeBasketItemUpdate = function quantityCheckBeforeBasketItemUpdate () {
  return (req: Request, res: Response, next: NextFunction) => {
    BasketItemModel.findOne({ where: { id: req.params.id } }).then((item: BasketItemModel | null) => {
      const user = security.authenticatedUsers.from(req)

      // Challenge hook (unchanged)
      // eslint-disable-line eqeqeq
      challengeUtils.solveIf(challenges.basketManipulateChallenge, () => { return user && req.body.BasketId && user.bid != req.body.BasketId }) // eslint-disable-line eqeqeq

      // enforce ownership
      if (!item) {
        throw new Error('No such item found!')
      }

      // Ensure the basket item belongs to the caller
      const callerBid = Number(user?.bid)
      if (!callerBid || Number(item.BasketId) !== callerBid) {
        return res.status(403).json({ message: 'Forbidden' })
      }

      if (req.body.quantity) {
        void quantityCheck(req, res, next, item.ProductId, req.body.quantity)
      } else {
        next()
      }
    }).catch((error: Error) => {
      next(error)
    })
  }
}

async function quantityCheck (req: Request, res: Response, next: NextFunction, id: number, quantity: number) {
  const product = await QuantityModel.findOne({ where: { ProductId: id } })
  if (!product) {
    throw new Error('No such product found!')
  }

  // is product limited per user and order, except if user is deluxe?
  if (!product.limitPerUser || (product.limitPerUser && product.limitPerUser >= quantity) || security.isDeluxe(req)) {
    if (product.quantity >= quantity) { // enough in stock?
      next()
    } else {
      res.status(400).json({ error: res.__('We are out of stock! Sorry for the inconvenience.') })
    }
  } else {
    res.status(400).json({ error: res.__('You can order only up to {{quantity}} items of this product.', { quantity: product.limitPerUser.toString() }) })
  }
}
