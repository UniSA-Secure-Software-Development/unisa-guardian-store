/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
import { Request, Response, NextFunction } from 'express'
import { UserModel } from '../models/user'

const utils = require('../lib/utils')
const security = require('../lib/insecurity')

module.exports = function retrieveUserList () {
  return (_req: Request, res: Response, next: NextFunction) => {
    // add authorisation check to grab user lists to ensure that no unauthorised users can fetch lists
    if (!_req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    const user = _req.user as { role?: string }

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admins only' })
    }
    UserModel.findAll().then((users: UserModel[]) => {
      const usersWithLoginStatus = utils.queryResultToJson(users)
      usersWithLoginStatus.data.forEach((user: { token: string, password: string, totpSecret: string }) => {
        user.token = security.authenticatedUsers.tokenOf(user)
        if (user.password) {
          user.password = user.password.replace(/./g, '*')
        }
        if (user.totpSecret) {
          user.totpSecret = user.totpSecret.replace(/./g, '*')
        }
      })
      res.json(usersWithLoginStatus)
    }).catch((error: Error) => {
      next(error)
    })
  }
}
