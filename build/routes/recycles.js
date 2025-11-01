"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const recycle_1 = require("../models/recycle");
const utils = require('../lib/utils');
exports.getRecycleItem = () => (req, res) => {
    recycle_1.RecycleModel.findAll({
        where: {
            id: JSON.parse(req.params.id)
        }
    }).then((Recycle) => {
        return res.send(utils.queryResultToJson(Recycle));
    }).catch((_) => {
        return res.send('Error fetching recycled items. Please try again');
    });
};
exports.blockRecycleItems = () => (req, res) => {
    const errMsg = { err: 'Sorry, this endpoint is not supported.' };
    return res.send(utils.queryResultToJson(errMsg));
};
//# sourceMappingURL=recycles.js.map