"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressModelInit = exports.AddressModel = void 0;
const sequelize_1 = require("sequelize");
/* jslint node: true */
class Address extends sequelize_1.Model {
}
exports.AddressModel = Address;
const AddressModelInit = (sequelize) => {
    Address.init({
        UserId: {
            type: sequelize_1.DataTypes.INTEGER
        },
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        fullName: {
            type: sequelize_1.DataTypes.STRING
        },
        mobileNum: {
            type: sequelize_1.DataTypes.INTEGER,
            validate: {
                isInt: true,
                min: 1000000,
                max: 9999999999
            }
        },
        zipCode: {
            type: sequelize_1.DataTypes.STRING,
            validate: {
                len: [1, 8]
            }
        },
        streetAddress: {
            type: sequelize_1.DataTypes.STRING,
            validate: {
                len: [1, 160]
            }
        },
        city: sequelize_1.DataTypes.STRING,
        state: sequelize_1.DataTypes.STRING,
        country: sequelize_1.DataTypes.STRING
    }, {
        tableName: 'Addresses',
        sequelize
    });
};
exports.AddressModelInit = AddressModelInit;
//# sourceMappingURL=address.js.map