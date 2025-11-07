"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackModelInit = exports.FeedbackModel = void 0;
/* jslint node: true */
const utils = require("../lib/utils");
const challengeUtils = require("../lib/challengeUtils");
const sequelize_1 = require("sequelize");
const security = require('../lib/insecurity');
const challenges = require('../data/datacache').challenges;
class Feedback extends sequelize_1.Model {
}
exports.FeedbackModel = Feedback;
const FeedbackModelInit = (sequelize) => {
    Feedback.init({
        UserId: {
            type: sequelize_1.DataTypes.INTEGER
        },
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        comment: {
            type: sequelize_1.DataTypes.STRING,
            set(comment) {
                let sanitizedComment;
                if (!utils.disableOnContainerEnv()) {
                    sanitizedComment = security.sanitizeHtml(comment);
                    challengeUtils.solveIf(challenges.persistedXssFeedbackChallenge, () => {
                        return utils.contains(sanitizedComment, '<iframe src="javascript:alert(`xss`)">');
                    });
                }
                else {
                    sanitizedComment = security.sanitizeSecure(comment);
                }
                this.setDataValue('comment', sanitizedComment);
            }
        },
        rating: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
            set(rating) {
                this.setDataValue('rating', rating);
                challengeUtils.solveIf(challenges.zeroStarsChallenge, () => {
                    return rating === 0;
                });
            }
        }
    }, {
        tableName: 'Feedbacks',
        sequelize
    });
};
exports.FeedbackModelInit = FeedbackModelInit;
//# sourceMappingURL=feedback.js.map