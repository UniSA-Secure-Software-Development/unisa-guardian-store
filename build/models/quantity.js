"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuantityModelInit = exports.QuantityModel = void 0;
/* jslint node: true */
const sequelize_1 = require("sequelize");
class Quantity extends sequelize_1.Model {
}
exports.QuantityModel = Quantity;
const QuantityModelInit = (sequelize) => {
    Quantity.init({
        ProductId: {
            type: sequelize_1.DataTypes.INTEGER
        },
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        quantity: {
            type: sequelize_1.DataTypes.INTEGER,
            validate: {
                isInt: true
            }
        },
        limitPerUser: {
            type: sequelize_1.DataTypes.INTEGER,
            validate: {
                isInt: true
            },
            defaultValue: null
        }
    }, {
        tableName: 'Quantities',
        sequelize
    });
};
exports.QuantityModelInit = QuantityModelInit;
//# sourceMappingURL=quantity.js.map