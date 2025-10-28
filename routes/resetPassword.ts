/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

import config = require('config')
import { Request, Response, NextFunction } from 'express'
import { Memory } from '../data/types'
import { SecurityAnswerModel } from '../models/securityAnswer'
import { UserModel } from '../models/user'
import challengeUtils = require('../lib/challengeUtils')
const challenges = require('../data/datacache').challenges
const users = require('../data/datacache').users
const security = require('../lib/insecurity')

// Define maximum allowed attempts and a record for tracking failed attempts
const MAX_FAILED_ATTEMPTS = 3
const failedAttempts: { [email: string]: { count: number, firstAttemptTime: number } } = {}

// Password strength validation function
function isPasswordStrong (password: string): boolean {
  const minLength = 13
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar
}

module.exports = function resetPassword () {
  return ({ body, connection }: Request, res: Response, next: NextFunction) => {
    const email = body.email
    const answer = body.answer
    const newPassword = body.new
    const repeatPassword = body.repeat

    if (!email || !answer) {
      next(new Error('Blocked illegal activity by ' + connection.remoteAddress))
    } else if (!newPassword || newPassword === 'undefined') {
      res.status(401).send(res.__('Password cannot be empty.'))
    } else if (newPassword !== repeatPassword) {
      res.status(401).send(res.__('New and repeated password do not match.'))
    } else if (!isPasswordStrong(newPassword)) {
      // Return error if password does not meet strength requirements
      res.status(400).send(res.__('Password does not meet strength requirements.'))
    } else {
      // Check if the user has exceeded the maximum number of attempts
      if (failedAttempts[email] && failedAttempts[email].count >= MAX_FAILED_ATTEMPTS) {
        const timeElapsed = Date.now() - failedAttempts[email].firstAttemptTime
        if (timeElapsed < 10 * 60 * 1000) { // Lockout time window of 10 minutes
          return res.status(429).send('Too many attempts. Please try again later.')
        } else {
          // Reset attempts count after time window
          failedAttempts[email] = { count: 0, firstAttemptTime: Date.now() }
        }
      }

      SecurityAnswerModel.findOne({
        include: [{
          model: UserModel,
          where: { email }
        }]
      }).then((data: SecurityAnswerModel | null) => {
        if (data && security.hmac(answer) === data.answer) {
          // Reset failed attempts on successful answer
          failedAttempts[email] = { count: 0, firstAttemptTime: Date.now() }

          UserModel.findByPk(data.UserId).then((user: UserModel | null) => {
            // Only update the password if it meets strength requirements
            if (isPasswordStrong(newPassword)) {
              user?.update({ password: newPassword }).then((user: UserModel) => {
                verifySecurityAnswerChallenges(user, answer)
                res.json({ user })
              }).catch((error: unknown) => {
                next(error)
              })
            } else {
              res.status(400).send(res.__('Password does not meet strength requirements.'))
            }
          }).catch((error: unknown) => {
            next(error)
          })
        } else {
          // Increment failed attempts on incorrect answer
          if (!failedAttempts[email]) {
            failedAttempts[email] = { count: 1, firstAttemptTime: Date.now() }
          } else {
            failedAttempts[email].count += 1
          }

          // Return a generic error message to avoid hinting at the exact problem
          res.status(401).send(res.__('Invalid email or security answer.'))
        }
      }).catch((error: unknown) => {
        next(error)
      })
    }
  }
}

// Function to verify and solve security answer challenges
function verifySecurityAnswerChallenges (user: UserModel, answer: string) {
  challengeUtils.solveIf(challenges.resetPasswordJimChallenge, () => { return user.id === users.jim.id && answer === 'Samuel' })
  challengeUtils.solveIf(challenges.resetPasswordBenderChallenge, () => { return user.id === users.bender.id && answer === 'Stop\'n\'Drop' })
  challengeUtils.solveIf(challenges.resetPasswordBjoernChallenge, () => { return user.id === users.bjoern.id && answer === 'West-2082' })
  challengeUtils.solveIf(challenges.resetPasswordMortyChallenge, () => { return user.id === users.morty.id && answer === '5N0wb41L' })
  challengeUtils.solveIf(challenges.resetPasswordBjoernOwaspChallenge, () => { return user.id === users.bjoernOwasp.id && answer === 'Zaya' })
  challengeUtils.solveIf(challenges.resetPasswordUvoginChallenge, () => { return user.id === users.uvogin.id && answer === 'Silence of the Lambs' })
  challengeUtils.solveIf(challenges.geoStalkingMetaChallenge, () => {
    const securityAnswer = ((() => {
      const memories: Memory[] = config.get('memories')
      for (let i = 0; i < memories.length; i++) {
        if (memories[i].geoStalkingMetaSecurityAnswer) {
          return memories[i].geoStalkingMetaSecurityAnswer
        }
      }
    })())
    return user.id === users.john.id && answer === securityAnswer
  })
  challengeUtils.solveIf(challenges.geoStalkingVisualChallenge, () => {
    const securityAnswer = ((() => {
      const memories: Memory[] = config.get('memories')
      for (let i = 0; i < memories.length; i++) {
        if (memories[i].geoStalkingVisualSecurityAnswer) {
          return memories[i].geoStalkingVisualSecurityAnswer
        }
      }
    })())
    return user.id === users.emma.id && answer === securityAnswer
  })
}
