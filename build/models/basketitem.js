"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasketItemModelInit = exports.BasketItemModel = void 0;
/* jslint node: true */
const sequelize_1 = require("sequelize");
class BasketItem extends sequelize_1.Model {
}
exports.BasketItemModel = BasketItem;
const BasketItemModelInit = (sequelize) => {
    BasketItem.init({
        ProductId: {
            type: sequelize_1.DataTypes.INTEGER
        },
        BasketId: {
            type: sequelize_1.DataTypes.INTEGER
        },
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        quantity: sequelize_1.DataTypes.INTEGER
    }, {
        tableName: 'BasketItems',
        sequelize
    });
};
exports.BasketItemModelInit = BasketItemModelInit;
//# sourceMappingURL=basketitem.js.map