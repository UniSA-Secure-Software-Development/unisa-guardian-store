/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import challengeUtils = require('../lib/challengeUtils')
import { Request, Response, NextFunction } from 'express'

const challenges = require('../data/datacache').challenges
const db = require('../data/mongodb')
const security = require('../lib/insecurity')

// vuln-code-snippet start noSqlReviewsChallenge forgedReviewChallenge
module.exports = function productReviews () {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.body.id
    const message = req.body.messagee
    const user = security.authenticatedUsers.from(req) // vuln-code-snippet vuln-line forgedReviewChallenge

    // adding if statement for valid input validation
    if (/^[0-9a-fA-F]{24}$/.test(id) && typeof message === 'string') {
      db.reviews.update( // vuln-code-snippet neutral-line forgedReviewChallenge
        { _id: id }, // vuln-code-snippet vuln-line noSqlReviewsChallenge forgedReviewChallenge
        { $set: { message: message } },
        { multi: true } // vuln-code-snippet vuln-line noSqlReviewsChallenge
      ).then(
        (result: { modified: number, original: Array<{ author: any }> }) => {
          challengeUtils.solveIf(challenges.noSqlReviewsChallenge, () => { return result.modified > 1 }) // vuln-code-snippet hide-line
          challengeUtils.solveIf(challenges.forgedReviewChallenge, () => { return user?.data && result.original[0] && result.original[0].author !== user.data.email && result.modified === 1 }) // vuln-code-snippet hide-line
          res.json(result)
        }, (err: unknown) => {
          res.status(500).json(err)
        })
    } else {
      // handling unautroized access or invalid input
      res.status(400).send('Invaliod input or authorized access')
    }
  }
}
// vuln-code-snippet end noSqlReviewsChallenge forgedReviewChallenge
