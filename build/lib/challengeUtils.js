"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.solveFixIt = exports.solveFindIt = exports.findChallengeById = exports.findChallengeByName = exports.notSolved = exports.sendNotification = exports.solve = exports.solveIf = void 0;
const sequelize_1 = require("sequelize");
const challenge_1 = require("../models/challenge");
const colors = require('colors/safe');
const config = require('config');
const challenges = require('../data/datacache').challenges;
const notifications = require('../data/datacache').notifications;
const sanitizeHtml = require('sanitize-html');
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
const webhook = require('./webhook');
const antiCheat = require('./antiCheat');
const accuracy = require('./accuracy');
const utils = require('./utils');
const logger = require('./logger');
const solveIf = function (challenge, criteria, isRestore = false) {
    if ((0, exports.notSolved)(challenge) && criteria()) {
        (0, exports.solve)(challenge, isRestore);
    }
};
exports.solveIf = solveIf;
const solve = function (challenge, isRestore = false) {
    challenge.solved = true;
    challenge.save().then((solvedChallenge) => {
        logger.info(`${isRestore ? colors.grey('Restored') : colors.green('Solved')} ${solvedChallenge.difficulty}-star ${colors.cyan(solvedChallenge.key)} (${solvedChallenge.name})`);
        (0, exports.sendNotification)(solvedChallenge, isRestore);
        if (!isRestore) {
            const cheatScore = antiCheat.calculateCheatScore(challenge);
            if (process.env.SOLUTIONS_WEBHOOK) {
                webhook.notify(solvedChallenge, cheatScore).catch((error) => {
                    logger.error('Webhook notification failed: ' + colors.red(utils.getErrorMessage(error)));
                });
            }
        }
    });
};
exports.solve = solve;
const sendNotification = function (challenge, isRestore) {
    if (!(0, exports.notSolved)(challenge)) {
        const flag = utils.ctfFlag(challenge.name);
        const notification = {
            key: challenge.key,
            name: challenge.name,
            challenge: challenge.name + ' (' + entities.decode(sanitizeHtml(challenge.description, { allowedTags: [], allowedAttributes: [] })) + ')',
            flag: flag,
            hidden: !config.get('challenges.showSolvedNotifications'),
            isRestore: isRestore
        };
        const wasPreviouslyShown = notifications.find(({ key }) => key === challenge.key) !== undefined;
        notifications.push(notification);
        if (global.io && (isRestore || !wasPreviouslyShown)) {
            // @ts-expect-error
            global.io.emit('challenge solved', notification);
        }
    }
};
exports.sendNotification = sendNotification;
const notSolved = (challenge) => challenge && !challenge.solved;
exports.notSolved = notSolved;
const findChallengeByName = (challengeName) => {
    for (const c in challenges) {
        if (Object.prototype.hasOwnProperty.call(challenges, c)) {
            if (challenges[c].name === challengeName) {
                return challenges[c];
            }
        }
    }
    logger.warn('Missing challenge with name: ' + challengeName);
};
exports.findChallengeByName = findChallengeByName;
const findChallengeById = (challengeId) => {
    for (const c in challenges) {
        if (Object.prototype.hasOwnProperty.call(challenges, c)) {
            if (challenges[c].id === challengeId) {
                return challenges[c];
            }
        }
    }
    logger.warn('Missing challenge with id: ' + challengeId);
};
exports.findChallengeById = findChallengeById;
const solveFindIt = async function (key, isRestore) {
    const solvedChallenge = challenges[key];
    await challenge_1.ChallengeModel.update({ codingChallengeStatus: 1 }, { where: { key, codingChallengeStatus: { [sequelize_1.Op.lt]: 2 } } });
    logger.info(`${isRestore ? colors.grey('Restored') : colors.green('Solved')} 'Find It' phase of coding challenge ${colors.cyan(solvedChallenge.key)} (${solvedChallenge.name})`);
    if (!isRestore) {
        accuracy.storeFindItVerdict(solvedChallenge.key, true);
        accuracy.calculateFindItAccuracy(solvedChallenge.key);
        antiCheat.calculateFindItCheatScore(solvedChallenge);
    }
};
exports.solveFindIt = solveFindIt;
const solveFixIt = async function (key, isRestore) {
    const solvedChallenge = challenges[key];
    await challenge_1.ChallengeModel.update({ codingChallengeStatus: 2 }, { where: { key } });
    logger.info(`${isRestore ? colors.grey('Restored') : colors.green('Solved')} 'Fix It' phase of coding challenge ${colors.cyan(solvedChallenge.key)} (${solvedChallenge.name})`);
    if (!isRestore) {
        accuracy.storeFixItVerdict(solvedChallenge.key, true);
        accuracy.calculateFixItAccuracy(solvedChallenge.key);
        antiCheat.calculateFixItCheatScore(solvedChallenge);
    }
};
exports.solveFixIt = solveFixIt;
//# sourceMappingURL=challengeUtils.js.map