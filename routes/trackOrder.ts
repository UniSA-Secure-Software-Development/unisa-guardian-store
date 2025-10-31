/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import utils = require('../lib/utils')
import { Request, Response } from 'express'
const db = require('../data/mongodb')

module.exports = function trackOrder () {
  return (req: Request, res: Response) => {
    const id = String(req.params.id).replace(/[^\w-]+/g, '')
    if (!id || id.length === 0) {
      return res.status(400).json({ error: 'Invalid order ID format' })
    }

    const email = req.body?.email || req.query?.email
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email parameter required' })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    db.orders.find({
      orderId: id,
      email: email
    }).then((order: any) => {
      if (!order || order.length === 0) {
        return res.status(404).json({ error: 'Order not found' })
      }

      if (order.length > 1) {
        console.error('Multiple orders found for single orderId - potential injection attempt')
        return res.status(400).json({ error: 'Invalid request' })
      }

      const result = utils.queryResultToJson(order)

      const sanitizedData = result.data.map((orderItem: any) => ({
        orderId: orderItem.orderId,
        totalPrice: orderItem.totalPrice,
        products: orderItem.products,
        eta: orderItem.eta,
        delivered: orderItem.delivered,
        bonus: orderItem.bonus
      }))

      res.json({ status: 'success', data: sanitizedData })
    }, (error: any) => {
      console.error('Database error:', error)
      res.status(500).json({ error: 'Unable to retrieve order' })
    })
  }
}
