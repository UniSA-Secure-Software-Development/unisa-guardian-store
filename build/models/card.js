"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardModelInit = exports.CardModel = void 0;
/* jslint node: true */
const sequelize_1 = require("sequelize");
class Card extends sequelize_1.Model {
}
exports.CardModel = Card;
const CardModelInit = (sequelize) => {
    Card.init({
        UserId: {
            type: sequelize_1.DataTypes.INTEGER
        },
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        fullName: sequelize_1.DataTypes.STRING,
        cardNum: {
            type: sequelize_1.DataTypes.INTEGER,
            validate: {
                isInt: true,
                min: 1000000000000000,
                max: 9999999999999998
            }
        },
        expMonth: {
            type: sequelize_1.DataTypes.INTEGER,
            validate: {
                isInt: true,
                min: 1,
                max: 12
            }
        },
        expYear: {
            type: sequelize_1.DataTypes.INTEGER,
            validate: {
                isInt: true,
                min: 2080,
                max: 2099
            }
        }
    }, {
        tableName: 'Cards',
        sequelize
    });
};
exports.CardModelInit = CardModelInit;
//# sourceMappingURL=card.js.map