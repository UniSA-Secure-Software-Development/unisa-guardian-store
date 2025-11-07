"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const utils = require("../lib/utils");
const challengeUtils = require("../lib/challengeUtils");
const challenges = require('../data/datacache').challenges;
const db = require('../data/mongodb');
module.exports = function trackOrder() {
    return (req, res) => {
        const id = utils.disableOnContainerEnv() ? String(req.params.id).replace(/[^\w-]+/g, '') : req.params.id;
        challengeUtils.solveIf(challenges.reflectedXssChallenge, () => { return utils.contains(id, '<iframe src="javascript:alert(`xss`)">'); });
        db.orders.find({ $where: `this.orderId === '${id}'` }).then((order) => {
            const result = utils.queryResultToJson(order);
            challengeUtils.solveIf(challenges.noSqlOrdersChallenge, () => { return result.data.length > 1; });
            if (result.data[0] === undefined) {
                result.data[0] = { orderId: id };
            }
            res.json(result);
        }, () => {
            res.status(400).json({ error: 'Wrong Param' });
        });
    };
};
//# sourceMappingURL=trackOrder.js.map