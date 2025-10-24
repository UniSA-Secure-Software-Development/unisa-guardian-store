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
    const user = security.authenticatedUsers.from(req) // vuln-code-snippet vuln-line forgedReviewChallenge

    const rawId = req.body?.id
    if (rawId === undefined || rawId === null) {
      return res.status(400).json({ error: 'Missing review id' })
    }
    // Reject objects to avoid injection
    if (typeof rawId === 'object') {
      return res.status(400).json({ error: 'Invalid review id' })
    }
    const safeId = String(rawId).trim()

    // Ensure message is a string
    const rawMessage = req.body?.message
    if (rawMessage === undefined || rawMessage === null) {
      return res.status(400).json({ error: 'Missing review message' })
    }
    if (typeof rawMessage === 'object') {
      return res.status(400).json({ error: 'Invalid review message' })
    }
    const safeMessage = String(rawMessage)

    // Build safe query
    const query: any = { _id: safeId }
    db.reviews.update( // vuln-code-snippet neutral-line forgedReviewChallenge
      query,
      { $set: { message: safeMessage } },
      { multi: false }
    ).then(
      (result: { modified: number, original: Array<{ author: any }> }) => {
        challengeUtils.solveIf(challenges.noSqlReviewsChallenge, () => { return result.modified > 1 }) // vuln-code-snippet hide-line
        challengeUtils.solveIf(challenges.forgedReviewChallenge, () => { return user?.data && result.original[0] && result.original[0].author !== user.data.email && result.modified === 1 }) // vuln-code-snippet hide-line
        res.json(result)
      }, (err: unknown) => {
        res.status(500).json(err)
      })
  }
}
// vuln-code-snippet end noSqlReviewsChallenge forgedReviewChallenge

// PATCHED
