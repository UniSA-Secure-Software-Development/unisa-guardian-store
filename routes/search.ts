/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import models = require('../models/index')
import { Request, Response, NextFunction } from 'express'
import { UserModel } from '../models/user'
import { ProductModel } from '../models/product'

// vuln-code-snippet start unionSqlInjectionChallenge dbSchemaChallenge

import { Op } from 'sequelize'

const utils = require('../lib/utils')
const challengeUtils = require('../lib/challengeUtils')
const challenges = require('../data/datacache').challenges

// class ErrorWithParent extends Error {
//   parent: Error | undefined
// }

module.exports = function searchProducts () {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let criteria: any = req.query.q === 'undefined' ? '' : req.query.q ?? ''
      if (typeof criteria !== 'string') {
        criteria = String(criteria)
      }
      criteria = criteria.trim().substring(0, 200)

      const products = await ProductModel.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${criteria}%` } },
            { description: { [Op.like]: `%${criteria}%` } }
          ]
        },
        order: [['name', 'ASC']]
      })
      const dataString = JSON.stringify(products)

      if (challengeUtils.notSolved(challenges.unionSqlInjectionChallenge)) {
        let solved = true
        const userData = await UserModel.findAll()
        const users = utils.queryResultToJson(userData)
        if (users.data?.length) {
          for (let i = 0; i < users.data.length; i++) {
            solved = solved && utils.containsOrEscaped(dataString, users.data[i].email) && utils.contains(dataString, users.data[i].password)
            if (!solved) break
          }
          if (solved) challengeUtils.solve(challenges.unionSqlInjectionChallenge)
        }
      }

      if (challengeUtils.notSolved(challenges.dbSchemaChallenge)) {
        let solved = true
        const [data]: any = await models.sequelize.query('SELECT sql FROM sqlite_master')
        const tableDefinitions = utils.queryResultToJson(data)
        if (tableDefinitions.data?.length) {
          for (let i = 0; i < tableDefinitions.data.length; i++) {
            solved = solved && utils.containsOrEscaped(dataString, tableDefinitions.data[i].sql)
            if (!solved) break
          }
          if (solved) challengeUtils.solve(challenges.dbSchemaChallenge)
        }
      }

      for (let i = 0; i < products.length; i++) {
        products[i].name = req.__(products[i].name)
        products[i].description = req.__(products[i].description)
      }

      res.json(utils.queryResultToJson(products))
    } catch (error: any) {
      next(error.parent || error)
    }
  }
}

// module.exports = function searchProducts () {
//   return (req: Request, res: Response, next: NextFunction) => {
//     let criteria: any = req.query.q === 'undefined' ? '' : req.query.q ?? ''
//     criteria = (criteria.length <= 200) ? criteria : criteria.substring(0, 200)
//     models.sequelize.query(`SELECT * FROM Products WHERE ((name LIKE '%${criteria}%' OR description LIKE '%${criteria}%') AND deletedAt IS NULL) ORDER BY name`) // vuln-code-snippet vuln-line unionSqlInjectionChallenge dbSchemaChallenge
//       .then(([products]: any) => {
//         const dataString = JSON.stringify(products)
//         if (challengeUtils.notSolved(challenges.unionSqlInjectionChallenge)) { // vuln-code-snippet hide-start
//           let solved = true
//           UserModel.findAll().then(data => {
//             const users = utils.queryResultToJson(data)
//             if (users.data?.length) {
//               for (let i = 0; i < users.data.length; i++) {
//                 solved = solved && utils.containsOrEscaped(dataString, users.data[i].email) && utils.contains(dataString, users.data[i].password)
//                 if (!solved) {
//                   break
//                 }
//               }
//               if (solved) {
//                 challengeUtils.solve(challenges.unionSqlInjectionChallenge)
//               }
//             }
//           }).catch((error: Error) => {
//             next(error)
//           })
//         }
//         if (challengeUtils.notSolved(challenges.dbSchemaChallenge)) {
//           let solved = true
//           models.sequelize.query('SELECT sql FROM sqlite_master').then(([data]: any) => {
//             const tableDefinitions = utils.queryResultToJson(data)
//             if (tableDefinitions.data?.length) {
//               for (let i = 0; i < tableDefinitions.data.length; i++) {
//                 solved = solved && utils.containsOrEscaped(dataString, tableDefinitions.data[i].sql)
//                 if (!solved) {
//                   break
//                 }
//               }
//               if (solved) {
//                 challengeUtils.solve(challenges.dbSchemaChallenge)
//               }
//             }
//           })
//         } // vuln-code-snippet hide-end
//         for (let i = 0; i < products.length; i++) {
//           products[i].name = req.__(products[i].name)
//           products[i].description = req.__(products[i].description)
//         }
//         res.json(utils.queryResultToJson(products))
//       }).catch((error: ErrorWithParent) => {
//         next(error.parent)
//       })
//   }
// }
// vuln-code-snippet end unionSqlInjectionChallenge dbSchemaChallenge
