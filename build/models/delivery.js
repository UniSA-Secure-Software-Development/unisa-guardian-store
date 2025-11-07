"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeliveryModelInit = exports.DeliveryModel = void 0;
const sequelize_1 = require("sequelize");
class Delivery extends sequelize_1.Model {
}
exports.DeliveryModel = Delivery;
const DeliveryModelInit = (sequelize) => {
    Delivery.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: sequelize_1.DataTypes.STRING,
        price: sequelize_1.DataTypes.FLOAT,
        deluxePrice: sequelize_1.DataTypes.FLOAT,
        eta: sequelize_1.DataTypes.FLOAT,
        icon: sequelize_1.DataTypes.STRING
    }, {
        tableName: 'Deliveries',
        sequelize
    });
};
exports.DeliveryModelInit = DeliveryModelInit;
//# sourceMappingURL=delivery.js.map