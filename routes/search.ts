
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import models = require('../models/index')
import { Request, Response, NextFunction } from 'express'
import { UserModel } from '../models/user'
import { ParsedQs } from 'qs' // Importing ParsedQs for type safety

const utils = require('../lib/utils')
const challengeUtils = require('../lib/challengeUtils')
const challenges = require('../data/datacache').challenges

class ErrorWithParent extends Error {
  parent: Error | undefined
}

// vuln-code-snippet start unionSqlInjectionChallenge dbSchemaChallenge
module.exports = function searchProducts () {
  return (req: Request, res: Response, next: NextFunction) => {
    // Handle undefined or empty query parameter `q`
    let criteria: string = (req.query.q as string) === 'undefined' || !req.query.q ? '' : (req.query.q as string)

    // Truncate criteria if it's too long
    criteria = criteria.length <= 200 ? criteria : criteria.substring(0, 200)

    // Prepare the SQL query and replacements based on whether criteria is empty
    let query
    let replacements

    if (criteria === '') {
      // No search criteria, show all products
      query = 'SELECT * FROM Products WHERE deletedAt IS NULL ORDER BY name'
      replacements = {} 
    } else {
      // Search products based on the criteria
      query = 'SELECT * FROM Products WHERE (name LIKE :criteria OR description LIKE :criteria) AND deletedAt IS NULL ORDER BY name'
      replacements = { criteria: `%${criteria}%` } // Safely insert search criteria
    }

    models.sequelize.query(query, {
      replacements, // Use replacements for safely inserting criteria
      type: models.sequelize.QueryTypes.SELECT
    })
      .then((products: any) => {
        console.log('Products returned:', products) // Debugging line
        const dataString = JSON.stringify(products)

        // Challenge checks
        if (challengeUtils.notSolved(challenges.unionSqlInjectionChallenge)) { // vuln-code-snippet hide-start
          let solved = true
          UserModel.findAll().then(data => {
            const users = utils.queryResultToJson(data)
            if (users.data?.length) {
              for (let i = 0; i < users.data.length; i++) {
                solved = solved && utils.containsOrEscaped(dataString, users.data[i].email) && utils.contains(dataString, users.data[i].password)
                if (!solved) {
                  break
                }
              }
              if (solved) {
                challengeUtils.solve(challenges.unionSqlInjectionChallenge)
              }
            }
          }).catch((error: Error) => {
            next(error)
          })
        }

        // Check for database schema challenge
        if (challengeUtils.notSolved(challenges.dbSchemaChallenge)) {
          let solved = true
          models.sequelize.query('SELECT sql FROM sqlite_master').then(([data]: any) => {
            const tableDefinitions = utils.queryResultToJson(data)
            if (tableDefinitions.data?.length) {
              for (let i = 0; i < tableDefinitions.data.length; i++) {
                solved = solved && utils.containsOrEscaped(dataString, tableDefinitions.data[i].sql)
                if (!solved) {
                  break
                }
              }
              if (solved) {
                challengeUtils.solve(challenges.dbSchemaChallenge)
              }
            }
          })
        } // vuln-code-snippet hide-end

        // Localize product names and descriptions before returning
        for (let i = 0; i < products.length; i++) {
          products[i].name = req.__(products[i].name)
          products[i].description = req.__(products[i].description)
        }

        res.json(utils.queryResultToJson(products)) // Return products as JSON
      })
      .catch((error: ErrorWithParent) => {
        next(error.parent)
      })
  }
}
// vuln-code-snippet end unionSqlInjectionChallenge dbSchemaChallenge
