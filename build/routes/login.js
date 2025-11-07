"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const models = require("../models/index");
const basket_1 = require("../models/basket");
const user_1 = require("../models/user");
const challengeUtils = require("../lib/challengeUtils");
const utils = require('../lib/utils');
const security = require('../lib/insecurity');
const challenges = require('../data/datacache').challenges;
const users = require('../data/datacache').users;
const config = require('config');
// vuln-code-snippet start loginAdminChallenge loginBenderChallenge loginJimChallenge
module.exports = function login() {
    function afterLogin(user, res, next) {
        verifyPostLoginChallenges(user); // vuln-code-snippet hide-line
        basket_1.BasketModel.findOrCreate({ where: { UserId: user.data.id } })
            .then(([basket]) => {
            const token = security.authorize(user);
            user.bid = basket.id; // keep track of original basket
            security.authenticatedUsers.put(token, user);
            res.json({ authentication: { token, bid: basket.id, umail: user.data.email } });
        }).catch((error) => {
            next(error);
        });
    }
    return (req, res, next) => {
        verifyPreLoginChallenges(req); // vuln-code-snippet hide-line
        // models.sequelize.query(`SELECT * FROM Users WHERE email = '${req.body.email || ''}' AND password = '${security.hash(req.body.password || '')}' AND deletedAt IS NULL`, { model: UserModel, plain: true }) // vuln-code-snippet vuln-line loginAdminChallenge loginBenderChallenge loginJimChallenge
        models.sequelize.query('SELECT * FROM Users WHERE email = ? AND password = ? AND deletedAt IS NULL', { replacements: [`${req.body.email || ''}`, `${security.hash(req.body.password || '')}`], model: user_1.UserModel, plain: true })
            .then((authenticatedUser) => {
            var _a, _b;
            const user = utils.queryResultToJson(authenticatedUser);
            if (((_a = user.data) === null || _a === void 0 ? void 0 : _a.id) && user.data.totpSecret !== '') {
                res.status(401).json({
                    status: 'totp_token_required',
                    data: {
                        tmpToken: security.authorize({
                            userId: user.data.id,
                            type: 'password_valid_needs_second_factor_token'
                        })
                    }
                });
            }
            else if ((_b = user.data) === null || _b === void 0 ? void 0 : _b.id) {
                afterLogin(user, res, next);
            }
            else {
                res.status(401).send(res.__('Invalid email or password.'));
            }
        }).catch((error) => {
            next(error);
        });
    };
    // vuln-code-snippet end loginAdminChallenge loginBenderChallenge loginJimChallenge
    function verifyPreLoginChallenges(req) {
        challengeUtils.solveIf(challenges.weakPasswordChallenge, () => { return req.body.email === 'admin@' + config.get('application.domain') && req.body.password === 'admin123'; });
        challengeUtils.solveIf(challenges.loginSupportChallenge, () => { return req.body.email === 'support@' + config.get('application.domain') && req.body.password === 'J6aVjTgOpRs@?5l!Zkq2AYnCE@RF$P'; });
        challengeUtils.solveIf(challenges.loginRapperChallenge, () => { return req.body.email === 'mc.safesearch@' + config.get('application.domain') && req.body.password === 'Mr. N00dles'; });
        challengeUtils.solveIf(challenges.loginAmyChallenge, () => { return req.body.email === 'amy@' + config.get('application.domain') && req.body.password === 'K1f.....................'; });
        challengeUtils.solveIf(challenges.dlpPasswordSprayingChallenge, () => { return req.body.email === 'J12934@' + config.get('application.domain') && req.body.password === '0Y8rMnww$*9VFYE§59-!Fg1L6t&6lB'; });
        challengeUtils.solveIf(challenges.oauthUserPasswordChallenge, () => { return req.body.email === 'bjoern.kimminich@gmail.com' && req.body.password === 'bW9jLmxpYW1nQGhjaW5pbW1pay5ucmVvamI='; });
    }
    function verifyPostLoginChallenges(user) {
        challengeUtils.solveIf(challenges.loginAdminChallenge, () => { return user.data.id === users.admin.id; });
        challengeUtils.solveIf(challenges.loginJimChallenge, () => { return user.data.id === users.jim.id; });
        challengeUtils.solveIf(challenges.loginBenderChallenge, () => { return user.data.id === users.bender.id; });
        challengeUtils.solveIf(challenges.ghostLoginChallenge, () => { return user.data.id === users.chris.id; });
        if (challengeUtils.notSolved(challenges.ephemeralAccountantChallenge) && user.data.email === 'acc0unt4nt@' + config.get('application.domain') && user.data.role === 'accounting') {
            user_1.UserModel.count({ where: { email: 'acc0unt4nt@' + config.get('application.domain') } }).then((count) => {
                if (count === 0) {
                    challengeUtils.solve(challenges.ephemeralAccountantChallenge);
                }
            }).catch(() => {
                throw new Error('Unable to verify challenges! Try again');
            });
        }
    }
};
//# sourceMappingURL=login.js.map