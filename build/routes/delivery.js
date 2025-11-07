"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const delivery_1 = require("../models/delivery");
const security = require('../lib/insecurity');
module.exports.getDeliveryMethods = function getDeliveryMethods() {
    return async (req, res, next) => {
        const methods = await delivery_1.DeliveryModel.findAll();
        if (methods) {
            const sendMethods = [];
            for (const method of methods) {
                sendMethods.push({
                    id: method.id,
                    name: method.name,
                    price: security.isDeluxe(req) ? method.deluxePrice : method.price,
                    eta: method.eta,
                    icon: method.icon
                });
            }
            res.status(200).json({ status: 'success', data: sendMethods });
        }
        else {
            res.status(400).json({ status: 'error' });
        }
    };
};
module.exports.getDeliveryMethod = function getDeliveryMethod() {
    return async (req, res, next) => {
        const method = await delivery_1.DeliveryModel.findOne({ where: { id: req.params.id } });
        if (method) {
            const sendMethod = {
                id: method.id,
                name: method.name,
                price: security.isDeluxe(req) ? method.deluxePrice : method.price,
                eta: method.eta,
                icon: method.icon
            };
            res.status(200).json({ status: 'success', data: sendMethod });
        }
        else {
            res.status(400).json({ status: 'error' });
        }
    };
};
//# sourceMappingURL=delivery.js.map