"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModelInit = exports.UserModel = void 0;
/* jslint node: true */
const config = require("config");
const sequelize_1 = require("sequelize");
const challengeUtils = require("../lib/challengeUtils");
const security = require('../lib/insecurity');
const utils = require('../lib/utils');
const challenges = require('../data/datacache').challenges;
class User extends sequelize_1.Model {
}
exports.UserModel = User;
const UserModelInit = (sequelize) => {
    User.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: sequelize_1.DataTypes.STRING,
            defaultValue: '',
            set(username) {
                if (!utils.disableOnContainerEnv()) {
                    username = security.sanitizeLegacy(username);
                }
                else {
                    username = security.sanitizeSecure(username);
                }
                this.setDataValue('username', username);
            }
        },
        email: {
            type: sequelize_1.DataTypes.STRING,
            unique: true,
            set(email) {
                if (!utils.disableOnContainerEnv()) {
                    challengeUtils.solveIf(challenges.persistedXssUserChallenge, () => {
                        return utils.contains(email, '<iframe src="javascript:alert(`xss`)">');
                    });
                }
                else {
                    email = security.sanitizeSecure(email);
                }
                this.setDataValue('email', email);
            }
        },
        password: {
            type: sequelize_1.DataTypes.STRING,
            set(clearTextPassword) {
                this.setDataValue('password', security.hash(clearTextPassword));
            }
        },
        role: {
            type: sequelize_1.DataTypes.STRING,
            defaultValue: 'customer',
            validate: {
                isIn: [['customer', 'deluxe', 'accounting', 'admin']]
            },
            set(role) {
                const profileImage = this.getDataValue('profileImage');
                if (role === security.roles.admin &&
                    (!profileImage ||
                        profileImage === '/assets/public/images/uploads/default.svg')) {
                    this.setDataValue('profileImage', '/assets/public/images/uploads/defaultAdmin.png');
                }
                this.setDataValue('role', role);
            }
        },
        deluxeToken: {
            type: sequelize_1.DataTypes.STRING,
            defaultValue: ''
        },
        lastLoginIp: {
            type: sequelize_1.DataTypes.STRING,
            defaultValue: '0.0.0.0'
        },
        profileImage: {
            type: sequelize_1.DataTypes.STRING,
            defaultValue: '/assets/public/images/uploads/default.svg'
        },
        totpSecret: {
            type: sequelize_1.DataTypes.STRING,
            defaultValue: ''
        },
        isActive: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: true
        }
    }, {
        tableName: 'Users',
        paranoid: true,
        sequelize
    });
    User.addHook('afterValidate', (user) => {
        if (user.email &&
            user.email.toLowerCase() ===
                `acc0unt4nt@${config.get('application.domain')}`.toLowerCase()) {
            return Promise.reject(new Error('Nice try, but this is not how the "Ephemeral Accountant" challenge works!'));
        }
    });
};
exports.UserModelInit = UserModelInit;
//# sourceMappingURL=user.js.map