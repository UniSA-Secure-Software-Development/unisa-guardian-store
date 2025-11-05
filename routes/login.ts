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

// Email character allow list, using pointers from https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
function isValidEmail (email: string): boolean {
  if (!email || typeof email !== 'string') return false

  // Check total length
  if (email.length > 254) return false

  // Email can't begin or end with hypen
  if (/^-|-$/.test(email)) return false

  // Split into local and domain parts
  const parts = email.split('@')
  if (parts.length !== 2) return false

  const [local, domain] = parts

  // Local part length check
  if (local.length === 0 || local.length > 63) return false

  // Allowed characters in local part
  // Alphanumeric, dot, underscore, hyphen, plus
  if (!/^[a-zA-Z0-9._+-]+$/.test(local)) return false

  // Allowed characters in domain
  // Alphanumeric, hyphens, dots
  if (!/^[a-zA-Z0-9.-]+$/.test(domain)) return false

  return true
}

function isValidPassword (password: string): boolean {
  if (!password || typeof password !== 'string') return false

  // Allow alphanumeric, and special characters, barring some SQL related characters e.g. [',",;]
  if (!/^[A-Za-z0-9!@#$%^&*()_\-+=[{\]}:,.?]+$/.test(password)) return false

  return true
}

// vuln-code-snippet start loginAdminChallenge loginBenderChallenge loginJimChallenge
module.exports = function login () {
  function afterLogin (user: { data: User, bid: number }, res: Response, next: NextFunction) {
    verifyPostLoginChallenges(user) // vuln-code-snippet hide-line
    BasketModel.findOrCreate({ where: { UserId: user.data.id } })
      .then(([basket]: [BasketModel, boolean]) => {
        const token = security.authorize(user)
        user.bid = basket.id // keep track of original basket
        security.authenticatedUsers.put(token, user)
        res.json({ authentication: { token, bid: basket.id, umail: user.data.email } })
      }).catch((error: Error) => {
        next(error)
      })
  }

  return (req: Request, res: Response, next: NextFunction) => {
    // Cast to string to prevent non string types (allow list technically??)
    const email = String(req.body.email || '')
    const password = String(req.body.password || '')

    verifyPreLoginChallenges(req) // vuln-code-snippet hide-line

    // Input validation, keeping same error message to reduce information leaked
    // Check for empty fields
    if (!email || !password) {
      res.status(401).send(res.__('Invalid email or password.')) // TODO need returns??
    }
    // Check email for invalid characters and other
    if (!isValidEmail(email)) {
      res.status(401).send(res.__('Invalid email or password.'))
    }
    // Check for SQL injection characters
    if (!isValidPassword(password)) {
      res.status(401).send(res.__('Invalid email or password.')) // TODO check if need to check during register
    }

    models.sequelize.query(
      `SELECT id, totpSecret, email, role
      FROM Users 
      WHERE email = $1 AND password = $2 AND deletedAt IS NULL
      LIMIT 1`,
      {
        bind: [email, security.hash(password)],
        model: UserModel,
        plain: true
      })// vuln-code-snippet vuln-line loginAdminChallenge loginBenderChallenge loginJimChallenge
      .then((authenticatedUser: { data: User }) => { // vuln-code-snippet neutral-line loginAdminChallenge loginBenderChallenge loginJimChallenge
        const user = utils.queryResultToJson(authenticatedUser)
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
          afterLogin(user, res, next)
        } else {
          res.status(401).send(res.__('Invalid email or password.'))
        }
      })
      .catch((error: Error) => {
        next(error)
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
