"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecycleModelInit = exports.RecycleModel = void 0;
/* jslint node: true */
const sequelize_1 = require("sequelize");
class Recycle extends sequelize_1.Model {
}
exports.RecycleModel = Recycle;
const RecycleModelInit = (sequelize) => {
    Recycle.init({
        UserId: {
            type: sequelize_1.DataTypes.INTEGER
        },
        AddressId: {
            type: sequelize_1.DataTypes.INTEGER
        },
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        quantity: sequelize_1.DataTypes.INTEGER,
        isPickup: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: false },
        date: sequelize_1.DataTypes.DATE
    }, {
        tableName: 'Recycles',
        sequelize
    });
};
exports.RecycleModelInit = RecycleModelInit;
//# sourceMappingURL=recycle.js.map