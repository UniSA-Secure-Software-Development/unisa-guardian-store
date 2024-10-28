/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Request, Response, NextFunction } from 'express'

const orders = require('../data/mongodb').orders

const security = require('../lib/insecurity')

module.exports.orderHistory = function orderHistory () {
  return async (req: Request, res: Response, next: NextFunction) => {
    const loggedInUser = security.authenticatedUsers.get(req.headers?.authorization?.replace('Bearer ', ''))
    if (loggedInUser?.data?.email && loggedInUser.data.id) {
      const email = loggedInUser.data.email
      const updatedEmail = email
      const order = await orders.find({ email: updatedEmail })
      const obfuscatedOrders = order.map((x: { email: string }) => {
        if (order.email) {
          x.email = x.email.replace(/aeiou/gi, '*')
        }
        return x
      })
      res.status(200).json({ status: 'success', data: obfuscatedOrders })
    } else {
      next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress))
    }
  }
}

module.exports.allOrders = function allOrders () {
  return async (req: Request, res: Response, next: NextFunction) => {
    const order = await orders.find()
    res.status(200).json({ status: 'success', data: order.reverse() })
  }
}

module.exports.toggleDeliveryStatus = function toggleDeliveryStatus () {
  return async (req: Request, res: Response, next: NextFunction) => {
    const deliveryStatus = !req.body.deliveryStatus
    const eta = deliveryStatus ? '0' : '1'
    await orders.update({ _id: req.params.id }, { $set: { delivered: deliveryStatus, eta: eta } })
    res.status(200).json({ status: 'success' })
  }
}
