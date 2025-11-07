"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasketModelInit = exports.BasketModel = void 0;
/* jslint node: true */
const sequelize_1 = require("sequelize");
class Basket extends sequelize_1.Model {
}
exports.BasketModel = Basket;
const BasketModelInit = (sequelize) => {
    Basket.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        coupon: sequelize_1.DataTypes.STRING,
        UserId: {
            type: sequelize_1.DataTypes.INTEGER
        }
    }, {
        tableName: 'Baskets',
        sequelize
    });
};
exports.BasketModelInit = BasketModelInit;
//# sourceMappingURL=basket.js.map