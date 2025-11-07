/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */

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
const bcrypt = require('bcrypt')

console.log('✅ Patched login route active at', new Date().toISOString())

module.exports = function login () {
  async function afterLogin (user: { data: User, bid: number }, res: Response, next: NextFunction) {
    try {
      verifyPostLoginChallenges(user)

      const [basket] = await (BasketModel as any).findOrCreate({ where: { UserId: user.data.id } })
      const token = security.authorize(user)
      user.bid = basket.id // Keep track of original basket
      security.authenticatedUsers.put(token, user)
      res.json({ authentication: { token, bid: basket.id, umail: user.data.email } })
    } catch (error) {
      next(error)
    }
  }

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      verifyPreLoginChallenges(req)

      const email = (req.body.email || '').trim()
      const password = req.body.password || ''

      // Basic input detection (optional, logs suspicious inputs)
      if (email.includes("'") || email.toLowerCase().includes(' or ') || email.includes('--')) {
        console.warn('🚨 Possible injection-like input detected in login email:', email)
        return res.status(400).send('Invalid input detected.')
      }

      const authenticatedUser = await (UserModel as any).findOne({
        where: { email: email, deletedAt: null },
        raw: true
      })

      if (!authenticatedUser) {
        return res.status(401).send(res.__('Invalid email or password.'))
      }

      // if passwords are bcrypt-hashed in DB (recommended)
      const passwordMatch = await bcrypt.compare(password, authenticatedUser.password)
      if (!passwordMatch) {
        return res.status(401).send(res.__('Invalid email or password.'))
      }

      const user = utils.queryResultToJson(authenticatedUser)

      if (user.data?.id && user.data.totpSecret !== '') {
        return res.status(401).json({
          status: 'totp_token_required',
          data: {
            tmpToken: security.authorize({
              userId: user.data.id,
              type: 'password_valid_needs_second_factor_token'
            })
          }
        })
      } else if (user.data?.id) {
        // eslint rule requires `return await` in this context
        return await afterLogin(user, res, next)
      } else {
        return res.status(401).send(res.__('Invalid email or password.'))
      }
    } catch (error) {
      next(error)
    }
  }

  function verifyPreLoginChallenges (req: Request) {
    challengeUtils.solveIf(challenges.weakPasswordChallenge, () => {
      return req.body.email === 'admin@' + config.get('application.domain') && req.body.password === 'admin123'
    })
    challengeUtils.solveIf(challenges.loginSupportChallenge, () => {
      return req.body.email === 'support@' + config.get('application.domain') && req.body.password === 'J6aVjTgOpRs@?5l!Zkq2AYnCE@RF$P'
    })
    challengeUtils.solveIf(challenges.loginRapperChallenge, () => {
      return req.body.email === 'mc.safesearch@' + config.get('application.domain') && req.body.password === 'Mr. N00dles'
    })
    challengeUtils.solveIf(challenges.loginAmyChallenge, () => {
      return req.body.email === 'amy@' + config.get('application.domain') && req.body.password === 'K1f.....................'
    })
    challengeUtils.solveIf(challenges.dlpPasswordSprayingChallenge, () => {
      return req.body.email === 'J12934@' + config.get('application.domain') && req.body.password === '0Y8rMnww$*9VFYE§59-!Fg1L6t&6lB'
    })
    challengeUtils.solveIf(challenges.oauthUserPasswordChallenge, () => {
      return req.body.email === 'bjoern.kimminich@gmail.com' && req.body.password === 'bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI='
    })
  }

  function verifyPostLoginChallenges (user: { data: User }) {
    challengeUtils.solveIf(challenges.loginAdminChallenge, () => user.data.id === users.admin.id)
    challengeUtils.solveIf(challenges.loginJimChallenge, () => user.data.id === users.jim.id)
    challengeUtils.solveIf(challenges.loginBenderChallenge, () => user.data.id === users.bender.id)
    challengeUtils.solveIf(challenges.ghostLoginChallenge, () => user.data.id === users.chris.id)

    if (
      challengeUtils.notSolved(challenges.ephemeralAccountantChallenge) &&
      user.data.email === 'acc0unt4nt@' + config.get('application.domain') &&
      user.data.role === 'accounting'
    ) {
      ;(UserModel as any)
        .count({ where: { email: 'acc0unt4nt@' + config.get('application.domain') } })
        .then((count: number) => {
          if (count === 0) {
            challengeUtils.solve(challenges.ephemeralAccountantChallenge)
          }
        })
        .catch(() => {
          throw new Error('Unable to verify challenges! Try again')
        })
    }
  }
}
