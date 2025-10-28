/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import models = require('../models/index')
import { Request, Response, NextFunction } from 'express'
import { User } from '../data/types'
import { BasketModel } from '../models/basket'
import { UserModel } from '../models/user'
import challengeUtils = require('../lib/challengeUtils')

const utils = require('../lib/utils')
const security = require('../lib/insecurity')
const challenges = require('../data/datacache').challenges
const users = require('../data/datacache').users
const config = require('config')

// vuln-code-snippet start loginAdminChallenge loginBenderChallenge loginJimChallenge
module.exports = function login () {
  function afterLogin (user: { data: User, bid: number }, res: Response, next: NextFunction) {
    verifyPostLoginChallenges(user) // Check for completion of post-login challenges (related to gamified elements)

    // Creates or finds an existing basket for the user
    BasketModel.findOrCreate({ where: { UserId: user.data.id } })
      .then(([basket]: [BasketModel, boolean]) => {
        const token = security.authorize(user) // Generate an authorization token for the user session
        user.bid = basket.id // Attach basket ID to the user object for reference
        security.authenticatedUsers.put(token, user) // Store the authenticated user session
        res.json({ authentication: { token, bid: basket.id, umail: user.data.email } }) // Send token and basket ID to the client
      }).catch((error: Error) => {
        next(error)
      })
  }

  return (req: Request, res: Response, next: NextFunction) => {
    verifyPreLoginChallenges(req)

    // Use parameterized query to securely check user credentials in the database
    models.sequelize.query(
      'SELECT * FROM Users WHERE email = :email AND password = :password AND deletedAt IS NULL',
      {
        replacements: {
          email: req.body.email || '', // Assign email to the query safely
          password: security.hash(req.body.password || '') // Hash password and assign it safely to the query
        },
        model: UserModel,
        plain: true
      }
    )
      .then((authenticatedUser: { data: User } | null) => {
      // Check if a user is found with matching credentials
        if (authenticatedUser) {
          const user = utils.queryResultToJson(authenticatedUser) // Convert query result to JSON format

          // If the user has two-factor authentication enabled, prompt for TOTP token
          if (user.data?.id && user.data.totpSecret !== '') {
            res.status(401).json({
              status: 'totp_token_required',
              data: {
                tmpToken: security.authorize({
                  userId: user.data.id,
                  type: 'password_valid_needs_second_factor_token'
                })
              }
            })
          } else if (user.data?.id) {
          // Proceed to afterLogin function if no TOTP is needed
            afterLogin(user, res, next)
          } else {
          // Respond with 401 Unauthorized if login fails
            res.status(401).send(res.__('Invalid email or password.'))
          }
        } else {
        // Respond with 401 Unauthorized if no user found
          res.status(401).send(res.__('Invalid email or password.'))
        }
      })
      .catch((error: Error) => {
        next(error) // Pass any errors to the next error handling middleware
      })
  }

  // vuln-code-snippet end loginAdminChallenge loginBenderChallenge loginJimChallenge

  function verifyPreLoginChallenges (req: Request) {
    challengeUtils.solveIf(challenges.weakPasswordChallenge, () => { return req.body.email === 'admin@' + config.get('application.domain') && req.body.password === 'admin123' })
    challengeUtils.solveIf(challenges.loginSupportChallenge, () => { return req.body.email === 'support@' + config.get('application.domain') && req.body.password === 'J6aVjTgOpRs@?5l!Zkq2AYnCE@RF$P' })
    challengeUtils.solveIf(challenges.loginRapperChallenge, () => { return req.body.email === 'mc.safesearch@' + config.get('application.domain') && req.body.password === 'Mr. N00dles' })
    challengeUtils.solveIf(challenges.loginAmyChallenge, () => { return req.body.email === 'amy@' + config.get('application.domain') && req.body.password === 'K1f.....................' })
    challengeUtils.solveIf(challenges.dlpPasswordSprayingChallenge, () => { return req.body.email === 'J12934@' + config.get('application.domain') && req.body.password === '0Y8rMnww$*9VFYE§59-!Fg1L6t&6lB' })
    challengeUtils.solveIf(challenges.oauthUserPasswordChallenge, () => { return req.body.email === 'bjoern.kimminich@gmail.com' && req.body.password === 'bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI=' })
  }

  function verifyPostLoginChallenges (user: { data: User }) {
    challengeUtils.solveIf(challenges.loginAdminChallenge, () => { return user.data.id === users.admin.id })
    challengeUtils.solveIf(challenges.loginJimChallenge, () => { return user.data.id === users.jim.id })
    challengeUtils.solveIf(challenges.loginBenderChallenge, () => { return user.data.id === users.bender.id })
    challengeUtils.solveIf(challenges.ghostLoginChallenge, () => { return user.data.id === users.chris.id })
    if (challengeUtils.notSolved(challenges.ephemeralAccountantChallenge) && user.data.email === 'acc0unt4nt@' + config.get('application.domain') && user.data.role === 'accounting') {
      UserModel.count({ where: { email: 'acc0unt4nt@' + config.get('application.domain') } }).then((count: number) => {
        if (count === 0) {
          challengeUtils.solve(challenges.ephemeralAccountantChallenge)
        }
      }).catch(() => {
        throw new Error('Unable to verify challenges! Try again')
      })
    }
  }
}
