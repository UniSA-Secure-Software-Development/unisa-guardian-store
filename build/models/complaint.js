"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplaintModelInit = exports.ComplaintModel = void 0;
/* jslint node: true */
const sequelize_1 = require("sequelize");
class Complaint extends sequelize_1.Model {
}
exports.ComplaintModel = Complaint;
const ComplaintModelInit = (sequelize) => {
    Complaint.init({
        UserId: {
            type: sequelize_1.DataTypes.INTEGER
        },
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        message: sequelize_1.DataTypes.STRING,
        file: sequelize_1.DataTypes.STRING
    }, {
        tableName: 'Complaints',
        sequelize
    });
};
exports.ComplaintModelInit = ComplaintModelInit;
//# sourceMappingURL=complaint.js.map