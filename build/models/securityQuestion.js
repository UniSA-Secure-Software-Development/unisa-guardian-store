"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityQuestionModelInit = exports.SecurityQuestionModel = void 0;
/* jslint node: true */
const sequelize_1 = require("sequelize");
class SecurityQuestion extends sequelize_1.Model {
}
exports.SecurityQuestionModel = SecurityQuestion;
const SecurityQuestionModelInit = (sequelize) => {
    SecurityQuestion.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        question: {
            type: sequelize_1.DataTypes.STRING
        }
    }, {
        tableName: 'SecurityQuestions',
        sequelize
    });
};
exports.SecurityQuestionModelInit = SecurityQuestionModelInit;
//# sourceMappingURL=securityQuestion.js.map