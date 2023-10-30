/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Request, Response, NextFunction } from 'express'

const db = require('../data/mongodb')
const security = require('../lib/insecurity')

// vuln-code-snippet start noSqlReviewsChallenge forgedReviewChallenge
module.exports = function productReviews () {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = security.authenticatedUsers.from(req)

    if (typeof req.body.id !== 'string') {
      return res.status(400).send()
    }

    db.reviews
      .update({ _id: req.body.id }, { $set: { message: req.body.message } })
      .then(
        (result: { modified: number, original: Array<{ author: any }> }) => {
          res.json(result)
        },
        (err: unknown) => {
          res.status(500).json(err)
        }
      )
  }
}
