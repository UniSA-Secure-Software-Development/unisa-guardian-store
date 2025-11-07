"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const config = require("config");
const securityAnswer_1 = require("../models/securityAnswer");
const user_1 = require("../models/user");
const challengeUtils = require("../lib/challengeUtils");
const challenges = require('../data/datacache').challenges;
const users = require('../data/datacache').users;
const security = require('../lib/insecurity');
module.exports = function resetPassword() {
    return ({ body, connection }, res, next) => {
        const email = body.email;
        const answer = body.answer;
        const newPassword = body.new;
        const repeatPassword = body.repeat;
        if (!email || !answer) {
            next(new Error('Blocked illegal activity by ' + connection.remoteAddress));
        }
        else if (!newPassword || newPassword === 'undefined') {
            res.status(401).send(res.__('Password cannot be empty.'));
        }
        else if (newPassword !== repeatPassword) {
            res.status(401).send(res.__('New and repeated password do not match.'));
        }
        else {
            securityAnswer_1.SecurityAnswerModel.findOne({
                include: [{
                        model: user_1.UserModel,
                        where: { email }
                    }]
            }).then((data) => {
                if (data && security.hmac(answer) === data.answer) {
                    user_1.UserModel.findByPk(data.UserId).then((user) => {
                        user === null || user === void 0 ? void 0 : user.update({ password: newPassword }).then((user) => {
                            verifySecurityAnswerChallenges(user, answer);
                            res.json({ user });
                        }).catch((error) => {
                            next(error);
                        });
                    }).catch((error) => {
                        next(error);
                    });
                }
                else {
                    res.status(401).send(res.__('Wrong answer to security question.'));
                }
            }).catch((error) => {
                next(error);
            });
        }
    };
};
function verifySecurityAnswerChallenges(user, answer) {
    challengeUtils.solveIf(challenges.resetPasswordJimChallenge, () => { return user.id === users.jim.id && answer === 'Samuel'; });
    challengeUtils.solveIf(challenges.resetPasswordBenderChallenge, () => { return user.id === users.bender.id && answer === 'Stop\'n\'Drop'; });
    challengeUtils.solveIf(challenges.resetPasswordBjoernChallenge, () => { return user.id === users.bjoern.id && answer === 'West-2082'; });
    challengeUtils.solveIf(challenges.resetPasswordMortyChallenge, () => { return user.id === users.morty.id && answer === '5N0wb41L'; });
    challengeUtils.solveIf(challenges.resetPasswordBjoernOwaspChallenge, () => { return user.id === users.bjoernOwasp.id && answer === 'Zaya'; });
    challengeUtils.solveIf(challenges.resetPasswordUvoginChallenge, () => { return user.id === users.uvogin.id && answer === 'Silence of the Lambs'; });
    challengeUtils.solveIf(challenges.geoStalkingMetaChallenge, () => {
        const securityAnswer = ((() => {
            const memories = config.get('memories');
            for (let i = 0; i < memories.length; i++) {
                if (memories[i].geoStalkingMetaSecurityAnswer) {
                    return memories[i].geoStalkingMetaSecurityAnswer;
                }
            }
        })());
        return user.id === users.john.id && answer === securityAnswer;
    });
    challengeUtils.solveIf(challenges.geoStalkingVisualChallenge, () => {
        const securityAnswer = ((() => {
            const memories = config.get('memories');
            for (let i = 0; i < memories.length; i++) {
                if (memories[i].geoStalkingVisualSecurityAnswer) {
                    return memories[i].geoStalkingVisualSecurityAnswer;
                }
            }
        })());
        return user.id === users.emma.id && answer === securityAnswer;
    });
}
//# sourceMappingURL=resetPassword.js.map