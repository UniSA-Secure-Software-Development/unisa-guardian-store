"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivacyRequestModelInit = exports.PrivacyRequestModel = void 0;
/* jslint node: true */
const sequelize_1 = require("sequelize");
class PrivacyRequestModel extends sequelize_1.Model {
}
exports.PrivacyRequestModel = PrivacyRequestModel;
const PrivacyRequestModelInit = (sequelize) => {
    PrivacyRequestModel.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        UserId: {
            type: sequelize_1.DataTypes.INTEGER
        },
        deletionRequested: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: 'PrivacyRequests',
        sequelize
    });
};
exports.PrivacyRequestModelInit = PrivacyRequestModelInit;
//# sourceMappingURL=privacyRequests.js.map