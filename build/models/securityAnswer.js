"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityAnswerModelInit = exports.SecurityAnswerModel = void 0;
/* jslint node: true */
const sequelize_1 = require("sequelize");
const security = require('../lib/insecurity');
class SecurityAnswer extends sequelize_1.Model {
}
exports.SecurityAnswerModel = SecurityAnswer;
const SecurityAnswerModelInit = (sequelize) => {
    SecurityAnswer.init({
        UserId: {
            type: sequelize_1.DataTypes.INTEGER,
            unique: true
        },
        SecurityQuestionId: {
            type: sequelize_1.DataTypes.INTEGER
        },
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        answer: {
            type: sequelize_1.DataTypes.STRING,
            set(answer) {
                this.setDataValue('answer', security.hmac(answer));
            }
        }
    }, {
        tableName: 'SecurityAnswers',
        sequelize
    });
};
exports.SecurityAnswerModelInit = SecurityAnswerModelInit;
//# sourceMappingURL=securityAnswer.js.map