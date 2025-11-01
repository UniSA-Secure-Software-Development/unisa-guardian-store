"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("../models/user");
const challengeUtils = require("../lib/challengeUtils");
const security = require('../lib/insecurity');
const cache = require('../data/datacache');
const challenges = cache.challenges;
module.exports = function changePassword() {
    return ({ query, headers, connection }, res, next) => {
        const currentPassword = query.current;
        const newPassword = query.new;
        const newPasswordInString = newPassword === null || newPassword === void 0 ? void 0 : newPassword.toString();
        const repeatPassword = query.repeat;
        if (!newPassword || newPassword === 'undefined') {
            res.status(401).send(res.__('Password cannot be empty.'));
        }
        else if (newPassword !== repeatPassword) {
            res.status(401).send(res.__('New and repeated password do not match.'));
        }
        else {
            const token = headers.authorization ? headers.authorization.substr('Bearer='.length) : null;
            const loggedInUser = security.authenticatedUsers.get(token);
            if (loggedInUser) {
                if (currentPassword && security.hash(currentPassword) !== loggedInUser.data.password) {
                    res.status(401).send(res.__('Current password is not correct.'));
                }
                else {
                    user_1.UserModel.findByPk(loggedInUser.data.id).then((user) => {
                        if (user) {
                            user.update({ password: newPasswordInString }).then((user) => {
                                challengeUtils.solveIf(challenges.changePasswordBenderChallenge, () => { return user.id === 3 && !currentPassword && user.password === security.hash('slurmCl4ssic'); });
                                res.json({ user });
                            }).catch((error) => {
                                next(error);
                            });
                        }
                    }).catch((error) => {
                        next(error);
                    });
                }
            }
            else {
                next(new Error('Blocked illegal activity by ' + connection.remoteAddress));
            }
        }
    };
};
//# sourceMappingURL=changePassword.js.map