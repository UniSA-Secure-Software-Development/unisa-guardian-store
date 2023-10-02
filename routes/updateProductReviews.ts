/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
import challengeUtils = require('../lib/challengeUtils')
import { Request, Response, NextFunction } from 'express'
import { Review } from 'data/types'

const challenges = require('../data/datacache').challenges
const db = require('../data/mongodb')
const security = require('../lib/insecurity')

// vuln-code-snippet start noSqlReviewsChallenge forgedReviewChallenge
module.exports = function productReviews () {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = security.authenticatedUsers.from(req) // vuln-code-snippet vuln-line forgedReviewChallenge

    // Check that the user editing the review is the user that created it.
    db.reviews.findOne(
      { _id: req.body.id }
    ).then(
      (review: Review) => {
        if (!review) {
          res.status(404).json({ error: 'Review not found' })
        } else {
          if (user?.data && review.author !== user.data.email) {
            res.status(403).json({ error: 'You do not have permission to edit this review' })
          } else {
            // If user is allowed to edit, process the change
            db.reviews.update( // vuln-code-snippet neutral-line forgedReviewChallenge
              { _id: req.body.id }, // vuln-code-snippet vuln-line noSqlReviewsChallenge forgedReviewChallenge
              { $set: { message: req.body.message } },
              { multi: true } // vuln-code-snippet vuln-line noSqlReviewsChallenge
            ).then(
              (result: { modified: number, original: Array<{ author: any }> }) => {
                challengeUtils.solveIf(challenges.noSqlReviewsChallenge, () => { return result.modified > 1 }) // vuln-code-snippet hide-line
                challengeUtils.solveIf(challenges.forgedReviewChallenge, () => { return user?.data && result.original[0] && result.original[0].author !== user.data.email && result.modified === 1 }) // vuln-code-snippet hide-line
                res.json(result)
              }, (err: unknown) => {
                res.status(500).json(err)
              }
            )
          }
        }
      }
    )
  }
}
// vuln-code-snippet end noSqlReviewsChallenge forgedReviewChallenge
