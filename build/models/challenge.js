"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChallengeModelInit = exports.ChallengeModel = void 0;
/* jslint node: true */
const sequelize_1 = require("sequelize");
class Challenge extends sequelize_1.Model {
}
exports.ChallengeModel = Challenge;
const ChallengeModelInit = (sequelize) => {
    Challenge.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        key: sequelize_1.DataTypes.STRING,
        name: sequelize_1.DataTypes.STRING,
        category: sequelize_1.DataTypes.STRING,
        tags: sequelize_1.DataTypes.STRING,
        description: sequelize_1.DataTypes.STRING,
        difficulty: sequelize_1.DataTypes.INTEGER,
        hint: sequelize_1.DataTypes.STRING,
        hintUrl: sequelize_1.DataTypes.STRING,
        mitigationUrl: sequelize_1.DataTypes.STRING,
        solved: sequelize_1.DataTypes.BOOLEAN,
        disabledEnv: sequelize_1.DataTypes.STRING,
        tutorialOrder: sequelize_1.DataTypes.NUMBER,
        codingChallengeStatus: sequelize_1.DataTypes.NUMBER
    }, {
        tableName: 'Challenges',
        sequelize
    });
};
exports.ChallengeModelInit = ChallengeModelInit;
//# sourceMappingURL=challenge.js.map