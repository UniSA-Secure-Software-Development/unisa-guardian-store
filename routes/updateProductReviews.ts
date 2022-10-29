/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Request, Response, NextFunction } from 'express'

const sanitize = require('mongo-sanitize')
const db = require('../data/mongodb')
const logger = require('../lib/logger')

// vuln-code-snippet start noSqlReviewsChallenge forgedReviewChallenge
module.exports = function productReviews () {
  return (req: Request, res: Response, next: NextFunction) => {
    // Sanatize the id for the query cause that's what we should do
    const sanatizedId = sanitize(req.body.id)
    db.reviews.find({ _id: sanatizedId }).limit(1).then((result: any[]) => {
      // There shoud only be 1 result
      const previousReview = result[0]
      if (!previousReview) {
        logger.error('Review does not exist')
        res.status(404).json({ status: 'error', message: 'review does not exist' })
      } else if (previousReview.author !== req.body.UserEmail) {
        // If not the same author then there is an issue.
        logger.error(`User ${req.body.UserEmail} tried to acces review belonging to another user`)
        res.status(401).json({ status: 'error', message: 'unauthorised access' })
      } else {
        db.reviews.update(
          { _id: sanatizedId },
          { $set: { message: req.body.message } }
        ).then(
          (result: { modified: number, original: Array<{ author: any }> }) => {
            res.json(result)
          }, (err: unknown) => {
            res.status(500).json(err)
          })
      }
    })
  }
}
// vuln-code-snippet end noSqlReviewsChallenge forgedReviewChallenge
