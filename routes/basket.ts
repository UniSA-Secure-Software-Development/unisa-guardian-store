/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Request, Response, NextFunction } from 'express'
import { ProductModel } from '../models/product'
import { BasketModel } from '../models/basket'
import challengeUtils = require('../lib/challengeUtils')

const utils = require('../lib/utils')
const security = require('../lib/insecurity')
const challenges = require('../data/datacache').challenges

module.exports = function retrieveBasket () {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id

      // leave this challenge call as it is (unchanged)
      /* jshint eqeqeq:false */
      challengeUtils.solveIf(challenges.basketAccessChallenge, () => {
        const user = security.authenticatedUsers.from(req)
        return user && id && id !== 'undefined' && id !== 'null' && id !== 'NaN' && user.bid && user.bid != id // eslint-disable-line eqeqeq
      })

      // Auth required
      const authUser = security.authenticatedUsers.from(req)
      const userId: number | undefined = (authUser?.data && authUser.data.id) ?? authUser?.id
      if (!userId) return res.status(401).json({ message: 'Unauthenticated' })

      // Ignore client-supplied :id; always return the caller's basket
      let basket = await BasketModel.findOne({ where: { UserId: userId } })
      if (!basket) {
        basket = await BasketModel.create({ UserId: userId })
      }

      // Reload with products included
      const full = await BasketModel.findOne({
        where: { id: basket.id },
        include: [{ model: ProductModel, paranoid: false, as: 'Products' }]
      })

      if (!full) {
        return res.status(404).json({ message: 'Basket not found' })
      }

      // i18n of product names (unchanged)
      if (full.Products?.length) {
        for (let i = 0; i < full.Products.length; i++) {
          full.Products[i].name = req.__(full.Products[i].name)
        }
      }

      return res.json(utils.queryResultToJson(full))
    } catch (err) {
      return next(err)
    }
  }
}
