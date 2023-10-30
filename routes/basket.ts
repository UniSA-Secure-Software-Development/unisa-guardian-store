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
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    const user = security.authenticatedUsers.from(req) // Get the authenticated user

    BasketModel.findOne({ where: { id }, include: [{ model: ProductModel, paranoid: false, as: 'Products' }] })
      .then((basket) => {
        /* jshint eqeqeq:false */
        // Check if the user can access the basket
        if (!user || !id || id === 'null' || user.bid !== id) {
          res.status(401).json({ error: 'Unauthorized' }) // Return 401 Unauthorized
        } else {
          if (basket?.Products && basket.Products.length > 0) {
            for (let i = 0; i < basket.Products.length; i++) {
              basket.Products[i].name = req.__(basket.Products[i].name)
            }
          }
          res.json(utils.queryResultToJson(basket))
        }
      })
      .catch((error) => {
        next(error)
      })
  }
}
