import { Request, Response, NextFunction } from 'express'
import { sequelize } from '../models/index'
import { ProductModelInit } from '../models/product'
import Sequelize from 'sequelize'

const utils = require('../lib/utils')
const challengeUtils = require('../lib/challengeUtils')
const challenges = require('../data/datacache').challenges

class ErrorWithParent extends Error {
  parent: Error | undefined
}

// Initialize the Product model (ensures sequelize.models.Product is available)
ProductModelInit(sequelize)

// Define a regex pattern to validate input and prevent SQL injection
const validInputPattern = /^[a-zA-Z0-9\s]*$/

module.exports = function searchProducts() {
  return (req: Request, res: Response, next: NextFunction) => {
    let criteria: any = req.query.q === 'undefined' ? '' : req.query.q ?? ''
    criteria = (criteria.length <= 200) ? criteria : criteria.substring(0, 200)

    // Check if the input is valid; if not, block the request
    if (!validInputPattern.test(criteria)) {
      return res.status(403).json({ status: 'error', message: 'Access Denied' })
    }

    sequelize.models.Product.findAll({
      where: {
        [Sequelize.Op.or]: [
          { name: { [Sequelize.Op.like]: `%${criteria}%` } },
          { description: { [Sequelize.Op.like]: `%${criteria}%` } }
        ],
        deletedAt: null
      },
      order: [['name', 'ASC']]
    })
      .then((products: any) => {
        const dataString = JSON.stringify(products)

        if (challengeUtils.notSolved(challenges.unionSqlInjectionChallenge)) {
          let solved = true
          sequelize.models.User.findAll().then((data: any) => {
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

        if (challengeUtils.notSolved(challenges.dbSchemaChallenge)) {
          let solved = true
          sequelize.query('SELECT sql FROM sqlite_master').then(([data]: any) => {
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
        }

        for (let i = 0; i < products.length; i++) {
          products[i].name = req.__(products[i].name)
          products[i].description = req.__(products[i].description)
        }

        res.json(utils.queryResultToJson(products))
      }).catch((error: ErrorWithParent) => {
        next(error.parent)
      })
  }
}
