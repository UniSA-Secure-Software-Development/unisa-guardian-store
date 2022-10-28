/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Request, Response } from 'express'

const reviews = require('../data/mongodb').reviews

const utils = require('../lib/utils')

module.exports = function productReviews () {
  return (req: Request, res: Response) => {
    if (req.body.UserEmail !== req.body.author) {
      res.status(401).json({ status: 'error', message: 'not authorised' })
    } else {
      reviews.insert({
        product: req.params.id,
        message: req.body.message,
        author: req.body.author,
        likesCount: 0,
        likedBy: []
      }).then(() => {
        res.status(201).json({ status: 'success' })
      }, (err: unknown) => {
        res.status(500).json(utils.get(err))
      })
    }
  }
}
