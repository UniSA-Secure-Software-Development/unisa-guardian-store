// /*
//  * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
//  * SPDX-License-Identifier: MIT
//  */

// ORGINAL CODE

// import models = require('../models/index')
// import { Request, Response, NextFunction } from 'express'
// import { User } from '../data/types'
// import { BasketModel } from '../models/basket'
// import { UserModel } from '../models/user'
// import challengeUtils = require('../lib/challengeUtils')

// const utils = require('../lib/utils')
// const security = require('../lib/insecurity')
// const challenges = require('../data/datacache').challenges
// const users = require('../data/datacache').users
// const config = require('config')

// // vuln-code-snippet start loginAdminChallenge loginBenderChallenge loginJimChallenge
// module.exports = function login () {
//   function afterLogin (user: { data: User, bid: number }, res: Response, next: NextFunction) {
//     verifyPostLoginChallenges(user) // vuln-code-snippet hide-line
//     BasketModel.findOrCreate({ where: { UserId: user.data.id } })
//       .then(([basket]: [BasketModel, boolean]) => {
//         const token = security.authorize(user)
//         user.bid = basket.id // keep track of original basket
//         security.authenticatedUsers.put(token, user)
//         res.json({ authentication: { token, bid: basket.id, umail: user.data.email } })
//       }).catch((error: Error) => {
//         next(error)
//       })
//   }

//   return (req: Request, res: Response, next: NextFunction) => {
//     verifyPreLoginChallenges(req) // vuln-code-snippet hide-line
//     models.sequelize.query(`SELECT * FROM Users WHERE email = '${req.body.email || ''}' AND password = '${security.hash(req.body.password || '')}' AND deletedAt IS NULL`, { model: UserModel, plain: true }) // vuln-code-snippet vuln-line loginAdminChallenge loginBenderChallenge loginJimChallenge
//       .then((authenticatedUser: { data: User }) => { // vuln-code-snippet neutral-line loginAdminChallenge loginBenderChallenge loginJimChallenge
//         const user = utils.queryResultToJson(authenticatedUser)
//         if (user.data?.id && user.data.totpSecret !== '') {
//           res.status(401).json({
//             status: 'totp_token_required',
//             data: {
//               tmpToken: security.authorize({
//                 userId: user.data.id,
//                 type: 'password_valid_needs_second_factor_token'
//               })
//             }
//           })
//         } else if (user.data?.id) {
//           afterLogin(user, res, next)
//         } else {
//           res.status(401).send(res.__('Invalid email or password.'))
//         }
//       }).catch((error: Error) => {
//         next(error)
//       })
//   }
//   // vuln-code-snippet end loginAdminChallenge loginBenderChallenge loginJimChallenge

//   function verifyPreLoginChallenges (req: Request) {
//     challengeUtils.solveIf(challenges.weakPasswordChallenge, () => { return req.body.email === 'admin@' + config.get('application.domain') && req.body.password === 'admin123' })
//     challengeUtils.solveIf(challenges.loginSupportChallenge, () => { return req.body.email === 'support@' + config.get('application.domain') && req.body.password === 'J6aVjTgOpRs@?5l!Zkq2AYnCE@RF$P' })
//     challengeUtils.solveIf(challenges.loginRapperChallenge, () => { return req.body.email === 'mc.safesearch@' + config.get('application.domain') && req.body.password === 'Mr. N00dles' })
//     challengeUtils.solveIf(challenges.loginAmyChallenge, () => { return req.body.email === 'amy@' + config.get('application.domain') && req.body.password === 'K1f.....................' })
//     challengeUtils.solveIf(challenges.dlpPasswordSprayingChallenge, () => { return req.body.email === 'J12934@' + config.get('application.domain') && req.body.password === '0Y8rMnww$*9VFYE§59-!Fg1L6t&6lB' })
//     challengeUtils.solveIf(challenges.oauthUserPasswordChallenge, () => { return req.body.email === 'bjoern.kimminich@gmail.com' && req.body.password === 'bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI=' })
//   }

//   function verifyPostLoginChallenges (user: { data: User }) {
//     challengeUtils.solveIf(challenges.loginAdminChallenge, () => { return user.data.id === users.admin.id })
//     challengeUtils.solveIf(challenges.loginJimChallenge, () => { return user.data.id === users.jim.id })
//     challengeUtils.solveIf(challenges.loginBenderChallenge, () => { return user.data.id === users.bender.id })
//     challengeUtils.solveIf(challenges.ghostLoginChallenge, () => { return user.data.id === users.chris.id })
//     if (challengeUtils.notSolved(challenges.ephemeralAccountantChallenge) && user.data.email === 'acc0unt4nt@' + config.get('application.domain') && user.data.role === 'accounting') {
//       UserModel.count({ where: { email: 'acc0unt4nt@' + config.get('application.domain') } }).then((count: number) => {
//         if (count === 0) {
//           challengeUtils.solve(challenges.ephemeralAccountantChallenge)
//         }
//       }).catch(() => {
//         throw new Error('Unable to verify challenges! Try again')
//       })
//     }
//   }
// }

/*
 * Modified Code
 */

import { Request, Response, NextFunction } from 'express'
import { BasketModel } from '../models/basket'
import { UserModel } from '../models/user'
const challengeUtils = require('../lib/challengeUtils')
const utils = require('../lib/utils')
const security = require('../lib/insecurity')
const challenges = require('../data/datacache').challenges
const users = require('../data/datacache').users
const config = require('config')

module.exports = function login () {
  function afterLogin (user: any, res: Response, next: NextFunction) {
    verifyPostLoginChallenges(user)
    BasketModel.findOrCreate({ where: { UserId: user.data.id } })
      .then(([basket]: any) => {
        const token = security.authorize(user)
        user.bid = basket.id
        security.authenticatedUsers.put(token, user)
        res.json({ authentication: { token, bid: basket.id, umail: user.data.email } })
      }).catch((error: Error) => next(error))
  }

  return (req: Request, res: Response, next: NextFunction) => {
    verifyPreLoginChallenges(req)

    // Replaced raw SQL concatenation with safe ORM lookup + hashed comparison.
    const email = (req.body.email || '').trim()
    const password = req.body.password || ''
    if (!email || !password) {
      return res.status(401).send(res.__('Invalid email or password.'))
    }

    // Look up user safely (Sequelize parameterises internally)
    UserModel.findOne({ where: { email: email } })
      .then((foundUser: any) => {
        if (!foundUser) {
          return res.status(401).send(res.__('Invalid email or password.'))
        }

        const storedPassword = foundUser.password
        const suppliedHash = security.hash(password)
        if (storedPassword !== suppliedHash) {
          return res.status(401).send(res.__('Invalid email or password.'))
        }

        const authenticatedUser = utils.queryResultToJson(foundUser)

        if (authenticatedUser.data?.id && authenticatedUser.data.totpSecret !== '') {
          return res.status(401).json({
            status: 'totp_token_required',
            data: {
              tmpToken: security.authorize({
                userId: authenticatedUser.data.id,
                type: 'password_valid_needs_second_factor_token'
              })
            }
          })
        } else if (authenticatedUser.data?.id) {
          return afterLogin(authenticatedUser, res, next)
        } else {
          return res.status(401).send(res.__('Invalid email or password.'))
        }
      })
      .catch((error: Error) => next(error))
    // ---------------------------- CHANGED CODE END ----------------------------
  }

  function verifyPreLoginChallenges (req: Request) {
    challengeUtils.solveIf(challenges.weakPasswordChallenge, () => { return req.body.email === 'admin@' + config.get('application.domain') && req.body.password === 'admin123' })
    challengeUtils.solveIf(challenges.loginSupportChallenge, () => { return req.body.email === 'support@' + config.get('application.domain') && req.body.password === 'J6aVjTgOpRs@?5l!Zkq2AYnCE@RF$P' })
    challengeUtils.solveIf(challenges.loginRapperChallenge, () => { return req.body.email === 'mc.safesearch@' + config.get('application.domain') && req.body.password === 'Mr. N00dles' })
    challengeUtils.solveIf(challenges.loginAmyChallenge, () => { return req.body.email === 'amy@' + config.get('application.domain') && req.body.password === 'K1f.....................' })
    challengeUtils.solveIf(challenges.dlpPasswordSprayingChallenge, () => { return req.body.email === 'J12934@' + config.get('application.domain') && req.body.password === '0Y8rMnww$*9VFYE§59-!Fg1L6t&6lB' })
    challengeUtils.solveIf(challenges.oauthUserPasswordChallenge, () => { return req.body.email === 'bjoern.kimminich@gmail.com' && req.body.password === 'bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI=' })
  }

  function verifyPostLoginChallenges (user: any) {
    challengeUtils.solveIf(challenges.loginAdminChallenge, () => { return user.data.id === users.admin.id })
    challengeUtils.solveIf(challenges.loginJimChallenge, () => { return user.data.id === users.jim.id })
    challengeUtils.solveIf(challenges.loginBenderChallenge, () => { return user.data.id === users.bender.id })
    challengeUtils.solveIf(challenges.ghostLoginChallenge, () => { return user.data.id === users.chris.id })
    if (challengeUtils.notSolved(challenges.ephemeralAccountantChallenge) &&
        user.data.email === 'acc0unt4nt@' + config.get('application.domain') &&
        user.data.role === 'accounting') {
      UserModel.count({ where: { email: 'acc0unt4nt@' + config.get('application.domain') } })
        .then((count: number) => {
          if (count === 0) {
            challengeUtils.solve(challenges.ephemeralAccountantChallenge)
          }
        })
        .catch(() => { throw new Error('Unable to verify challenges! Try again') })
    }
  }
}
