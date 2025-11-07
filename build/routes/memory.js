"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const memory_1 = require("../models/memory");
const user_1 = require("../models/user");
module.exports.addMemory = function addMemory() {
    return async (req, res, next) => {
        var _a;
        const record = {
            caption: req.body.caption,
            imagePath: 'assets/public/images/uploads/' + ((_a = req.file) === null || _a === void 0 ? void 0 : _a.filename),
            UserId: req.body.UserId
        };
        const memory = await memory_1.MemoryModel.create(record);
        res.status(200).json({ status: 'success', data: memory });
    };
};
module.exports.getMemories = function getMemories() {
    return async (req, res, next) => {
        const memories = await memory_1.MemoryModel.findAll({ include: [user_1.UserModel] });
        res.status(200).json({ status: 'success', data: memories });
    };
};
//# sourceMappingURL=memory.js.map