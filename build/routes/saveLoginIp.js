"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("../models/user");
const challengeUtils = require("../lib/challengeUtils");
const utils = require('../lib/utils');
const security = require('../lib/insecurity');
const cache = require('../data/datacache');
const challenges = cache.challenges;
module.exports = function saveLoginIp() {
    return (req, res, next) => {
        const loggedInUser = security.authenticatedUsers.from(req);
        if (loggedInUser !== undefined) {
            let lastLoginIp = req.headers['true-client-ip'];
            if (!utils.disableOnContainerEnv()) {
                challengeUtils.solveIf(challenges.httpHeaderXssChallenge, () => { return lastLoginIp === '<iframe src="javascript:alert(`xss`)">'; });
            }
            else {
                lastLoginIp = security.sanitizeSecure(lastLoginIp);
            }
            if (lastLoginIp === undefined) {
                lastLoginIp = utils.toSimpleIpAddress(req.connection.remoteAddress);
            }
            user_1.UserModel.findByPk(loggedInUser.data.id).then((user) => {
                user === null || user === void 0 ? void 0 : user.update({ lastLoginIp: lastLoginIp === null || lastLoginIp === void 0 ? void 0 : lastLoginIp.toString() }).then((user) => {
                    res.json(user);
                }).catch((error) => {
                    next(error);
                });
            }).catch((error) => {
                next(error);
            });
        }
        else {
            res.sendStatus(401);
        }
    };
};
//# sourceMappingURL=saveLoginIp.js.map