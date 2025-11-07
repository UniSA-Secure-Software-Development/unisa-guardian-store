"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const challengeUtils = require("../lib/challengeUtils");
const security = require('../lib/insecurity');
const cache = require('../data/datacache');
const challenges = cache.challenges;
module.exports = function retrieveLoggedInUser() {
    return (req, res) => {
        let user;
        try {
            if (security.verify(req.cookies.token)) {
                user = security.authenticatedUsers.get(req.cookies.token);
            }
        }
        catch (err) {
            user = undefined;
        }
        finally {
            const response = { user: { id: ((user === null || user === void 0 ? void 0 : user.data) ? user.data.id : undefined), email: ((user === null || user === void 0 ? void 0 : user.data) ? user.data.email : undefined), lastLoginIp: ((user === null || user === void 0 ? void 0 : user.data) ? user.data.lastLoginIp : undefined), profileImage: ((user === null || user === void 0 ? void 0 : user.data) ? user.data.profileImage : undefined) } };
            if (req.query.callback === undefined) {
                res.json(response);
            }
            else {
                challengeUtils.solveIf(challenges.emailLeakChallenge, () => { return true; });
                res.jsonp(response);
            }
        }
    };
};
//# sourceMappingURL=currentUser.js.map