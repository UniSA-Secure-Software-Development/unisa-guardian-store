"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("../models/user");
const challengeUtils = require("../lib/challengeUtils");
const security = require('../lib/insecurity');
const utils = require('../lib/utils');
const cache = require('../data/datacache');
const challenges = cache.challenges;
module.exports = function updateUserProfile() {
    return (req, res, next) => {
        const loggedInUser = security.authenticatedUsers.get(req.cookies.token);
        if (loggedInUser) {
            user_1.UserModel.findByPk(loggedInUser.data.id).then((user) => {
                if (user) {
                    challengeUtils.solveIf(challenges.csrfChallenge, () => {
                        var _a, _b, _c;
                        return ((_b = ((_a = req.headers.origin) === null || _a === void 0 ? void 0 : _a.includes('://htmledit.squarefree.com'))) !== null && _b !== void 0 ? _b : ((_c = req.headers.referer) === null || _c === void 0 ? void 0 : _c.includes('://htmledit.squarefree.com'))) &&
                            req.body.username !== user.username;
                    });
                    void user.update({ username: req.body.username }).then((savedUser) => {
                        savedUser = utils.queryResultToJson(savedUser);
                        const updatedToken = security.authorize(savedUser);
                        security.authenticatedUsers.put(updatedToken, savedUser);
                        res.cookie('token', updatedToken);
                        res.location(process.env.BASE_PATH + '/profile');
                        res.redirect(process.env.BASE_PATH + '/profile');
                    });
                }
            }).catch((error) => {
                next(error);
            });
        }
        else {
            next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress));
        }
    };
};
//# sourceMappingURL=updateUserProfile.js.map