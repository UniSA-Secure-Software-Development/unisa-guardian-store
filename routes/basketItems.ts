/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Request, Response, NextFunction } from 'express'
import { BasketItemModel } from '../models/basketitem'
import { QuantityModel } from '../models/quantity'
import { ProductModel } from '../models/product'
import challengeUtils = require('../lib/challengeUtils')

const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges
const security = require('../lib/insecurity')

interface RequestWithRawBody extends Request {
  rawBody: string
}

module.exports.addBasketItem = function addBasketItem () {
  return async (req: RequestWithRawBody, res: Response, next: NextFunction) => {
    const result = utils.parseJsonCustom(req.rawBody)
    const productIds = []
    const basketIds = []
    const quantities = []

    for (let i = 0; i < result.length; i++) {
      if (result[i].key === 'ProductId') {
        productIds.push(result[i].value)
      } else if (result[i].key === 'BasketId') {
        basketIds.push(result[i].value)
      } else if (result[i].key === 'quantity') {
        quantities.push(result[i].value)
      }
    }

    const basketItem = { // Gotta move this before doing the check for basketId and such to actually make the proper checks
      ProductId: productIds[productIds.length - 1],
      BasketId: basketIds[basketIds.length - 1],
      quantity: quantities[quantities.length - 1]
    }

    const user = security.authenticatedUsers.from(req)
    if (user && basketItem.BasketId && basketItem.BasketId !== 'undefined' && Number(user.bid) !== Number(basketItem.BasketId)) { // New (Adding products into another's basket exploit)
      return res.status(401).send('{\'error\' : \'Invalid BasketId\'}')
    }

    try { // New (Christmas Special Exploit Fix)
      const product: any = await ProductModel.findOne({
        where: { id: basketItem.ProductId },
        paranoid: false
      })

      if (!product) {
        return res.status(404).json({
          error: 'Product not found'
        })
      }

      if (product.deletedAt !== null) {
        return res.status(400).json({
          error: 'This product is no longer availablem woops!'
        })
      }
    } catch (error) {
      return next(error)
    }

    challengeUtils.solveIf(challenges.basketManipulateChallenge, () => { return user && basketItem.BasketId && basketItem.BasketId !== 'undefined' && user.bid != basketItem.BasketId }) // eslint-disable-line eqeqeq

    const basketItemInstance = BasketItemModel.build(basketItem)
    basketItemInstance.save().then((addedBasketItem: BasketItemModel) => {
      res.json({ status: 'success', data: addedBasketItem })
    }).catch((error: Error) => {
      next(error)
    })
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
      challengeUtils.solveIf(challenges.basketManipulateChallenge, () => { return user && req.body.BasketId && user.bid != req.body.BasketId }) // eslint-disable-line eqeqeq
      if (req.body.quantity) {
        if (!item) {
          throw new Error('No such item found!')
        }
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
