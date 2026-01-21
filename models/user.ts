/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */

/* jslint node: true */
import config = require('config')
import {
  InferAttributes,
  InferCreationAttributes,
  Model,
  DataTypes,
  CreationOptional,
  Sequelize
} from 'sequelize'
import challengeUtils = require('../lib/challengeUtils')
const security = require('../lib/insecurity')
const utils = require('../lib/utils')
const challenges = require('../data/datacache').challenges

class User extends Model<
InferAttributes<User>,
InferCreationAttributes<User>
> {
  declare id: CreationOptional<number>
  declare username: string | undefined
  declare email: CreationOptional<string>
  declare password: CreationOptional<string>
  declare role: CreationOptional<string>
  declare deluxeToken: CreationOptional<string>
  declare lastLoginIp: CreationOptional<string>
  declare profileImage: CreationOptional<string>
  declare totpSecret: CreationOptional<string>
  declare isActive: CreationOptional<boolean>
}

const UserModelInit = (sequelize: Sequelize) => {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: DataTypes.STRING,
        defaultValue: '',
        set (username: string) {
          if (!utils.disableOnContainerEnv()) {
            username = security.sanitizeLegacy(username)
          } else {
            username = security.sanitizeSecure(username)
          }
          this.setDataValue('username', username)
        }
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        set (email: string) {
          if (!utils.disableOnContainerEnv()) {
            challengeUtils.solveIf(challenges.persistedXssUserChallenge, () => {
              return utils.contains(
                email,
                '<iframe src="javascript:alert(`xss`)">'
              )
            })
          } else {
            email = security.sanitizeSecure(email)
          }
          this.setDataValue('email', email)
        }
      },
      password: {
        type: DataTypes.STRING,
        set (clearTextPassword) {
          this.setDataValue('password', security.hash(clearTextPassword))
        }
      },
      role: {
        type: DataTypes.STRING,
        defaultValue: 'customer',
        validate: {
          isIn: [['customer', 'deluxe', 'accounting', 'admin']]
        },
        set (role: string) {
          this.setDataValue('role', 'customer')
        }
      },
      deluxeToken: {
        type: DataTypes.STRING,
        set (deluxeToken: string) {
          this.setDataValue('deluxeToken', '')
        }
      },
      lastLoginIp: {
        type: DataTypes.STRING,
        set (lastLoginIp: string) {
          this.setDataValue('lastLoginIp', '0.0.0.0')
        }
      },
      profileImage: {
        type: DataTypes.STRING,
        defaultValue: '/assets/public/images/uploads/default.svg'
      },
      totpSecret: {
        type: DataTypes.STRING,
        set (totpSecret: string) {
          this.setDataValue('totpSecret', '')
        }
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      tableName: 'Users',
      paranoid: true,
      sequelize
    }
  )

  User.addHook('afterValidate', (user: User) => {
    if (
      user.email &&
    user.email.toLowerCase() ===
      `acc0unt4nt@${config.get('application.domain')}`.toLowerCase()
    ) {
      return Promise.reject(
        new Error(
          'Nice try, but this is not how the "Ephemeral Accountant" challenge works!'
        )
      )
    }
  })
}

export { User as UserModel, UserModelInit }
