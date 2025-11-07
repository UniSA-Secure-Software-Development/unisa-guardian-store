"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryModelInit = exports.MemoryModel = void 0;
/* jslint node: true */
const sequelize_1 = require("sequelize");
class Memory extends sequelize_1.Model {
}
exports.MemoryModel = Memory;
const MemoryModelInit = (sequelize) => {
    Memory.init({
        UserId: {
            type: sequelize_1.DataTypes.INTEGER
        },
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        caption: sequelize_1.DataTypes.STRING,
        imagePath: sequelize_1.DataTypes.STRING
    }, {
        tableName: 'Memories',
        sequelize
    });
};
exports.MemoryModelInit = MemoryModelInit;
//# sourceMappingURL=memory.js.map