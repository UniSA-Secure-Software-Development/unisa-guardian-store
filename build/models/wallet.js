"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletModelInit = exports.WalletModel = void 0;
/* jslint node: true */
const sequelize_1 = require("sequelize");
class Wallet extends sequelize_1.Model {
}
exports.WalletModel = Wallet;
const WalletModelInit = (sequelize) => {
    Wallet.init({
        UserId: {
            type: sequelize_1.DataTypes.INTEGER
        },
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        balance: {
            type: sequelize_1.DataTypes.INTEGER,
            validate: {
                isInt: true
            },
            defaultValue: 0
        }
    }, {
        tableName: 'Wallets',
        sequelize
    });
};
exports.WalletModelInit = WalletModelInit;
//# sourceMappingURL=wallet.js.map