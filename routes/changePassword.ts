/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import { Request, Response, NextFunction } from 'express'
import { UserModel } from '../models/user'
import challengeUtils = require('../lib/challengeUtils')
import jwt from 'jsonwebtoken'

const security = require('../lib/insecurity')
const cache = require('../data/datacache')
const challenges = cache.challenges
const secret = process.env.TOKEN_SECRET ?? 'default_secret'

module.exports = function changePassword () {
  return ({ query, headers, connection }: Request, res: Response, next: NextFunction) => {
    const currentPassword = query.current
    const newPassword = query.new
    const newPasswordInString = newPassword?.toString()
    const repeatPassword = query.repeat
    if (!newPassword || newPassword === 'undefined') {
      res.status(401).send(res.__('Password cannot be empty.'))
    } else if (newPassword !== repeatPassword) {
      res.status(401).send(res.__('New and repeated password do not match.'))
    } else {
      const token = headers.authorization?.replace('Bearer ', '')
      if (!token) {
        return res.status(401).send('Missing authentication token.')
      }
      const decoded = jwt.verify(token, secret)
      if (typeof decoded !== 'object' || !('data' in decoded)) {
        return res.status(401).send('Invalid token payload.')
      }
      const userId = decoded.data.id
      const loggedInUser = security.authenticatedUsers.get(token)
      if (loggedInUser) {
        UserModel.findByPk(userId).then((user: UserModel | null) => {
          if (!user) {
            return res.status(404).send('User not found.')
          }
          if (currentPassword && security.hash(currentPassword) !== user.password) {
            return res.status(401).send(res.__('Current password is not correct.'))
          }
          user.update({ password: newPasswordInString }).then((updatedUser: UserModel) => {
            challengeUtils.solveIf(
              challenges.changePasswordBenderChallenge,
              () => updatedUser.id === 3 && !currentPassword && updatedUser.password === security.hash('slurmCl4ssic')
            )
            res.json({ user: updatedUser })
          }).catch((error: Error) => {
            next(error)
          })
        }).catch((error: Error) => {
          next(error)
        })
      } else {
        next(new Error('Blocked illegal activity by ' + connection.remoteAddress))
      }
    }
  }
}
