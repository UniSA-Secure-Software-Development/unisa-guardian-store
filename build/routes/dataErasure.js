"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const securityAnswer_1 = require("../models/securityAnswer");
const user_1 = require("../models/user");
const securityQuestion_1 = require("../models/securityQuestion");
const privacyRequests_1 = require("../models/privacyRequests");
const insecurity = require('../lib/insecurity');
const challenges = require('../data/datacache').challenges;
const challengeUtils = require('../lib/challengeUtils');
const router = express_1.default.Router();
// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.get('/', async (req, res, next) => {
    const loggedInUser = insecurity.authenticatedUsers.get(req.cookies.token);
    if (!loggedInUser) {
        next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress));
        return;
    }
    const email = loggedInUser.data.email;
    try {
        const answer = await securityAnswer_1.SecurityAnswerModel.findOne({
            include: [{
                    model: user_1.UserModel,
                    where: { email }
                }]
        });
        if (!answer) {
            throw new Error('No answer found!');
        }
        const question = await securityQuestion_1.SecurityQuestionModel.findByPk(answer.SecurityQuestionId);
        if (!question) {
            throw new Error('No question found!');
        }
        res.render('dataErasureForm', { userEmail: email, securityQuestion: question.question });
    }
    catch (error) {
        next(error);
    }
});
// eslint-disable-next-line @typescript-eslint/no-misused-promises
router.post('/', async (req, res, next) => {
    const loggedInUser = insecurity.authenticatedUsers.get(req.cookies.token);
    if (!loggedInUser) {
        next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress));
        return;
    }
    try {
        await privacyRequests_1.PrivacyRequestModel.create({
            UserId: loggedInUser.data.id,
            deletionRequested: true
        });
        res.clearCookie('token');
        if (req.body.layout !== undefined) {
            const filePath = path_1.default.resolve(req.body.layout).toLowerCase();
            const isForbiddenFile = (filePath.includes('ftp') || filePath.includes('ctf.key') || filePath.includes('encryptionkeys'));
            if (!isForbiddenFile) {
                res.render('dataErasureResult', {
                    ...req.body
                }, (error, html) => {
                    if (!html || error) {
                        next(new Error(error.message));
                    }
                    else {
                        const sendlfrResponse = html.slice(0, 100) + '......';
                        res.send(sendlfrResponse);
                        challengeUtils.solve(challenges.lfrChallenge);
                    }
                });
            }
            else {
                next(new Error('File access not allowed'));
            }
        }
        else {
            res.render('dataErasureResult', {
                ...req.body
            });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=dataErasure.js.map