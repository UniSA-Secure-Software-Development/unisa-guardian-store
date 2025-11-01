"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const address_1 = require("../models/address");
module.exports.getAddress = function getAddress() {
    return async (req, res) => {
        const addresses = await address_1.AddressModel.findAll({ where: { UserId: req.body.UserId } });
        res.status(200).json({ status: 'success', data: addresses });
    };
};
module.exports.getAddressById = function getAddressById() {
    return async (req, res) => {
        const address = await address_1.AddressModel.findOne({ where: { id: req.params.id, UserId: req.body.UserId } });
        if (address) {
            res.status(200).json({ status: 'success', data: address });
        }
        else {
            res.status(400).json({ status: 'error', data: 'Malicious activity detected.' });
        }
    };
};
module.exports.delAddressById = function delAddressById() {
    return async (req, res) => {
        const address = await address_1.AddressModel.destroy({ where: { id: req.params.id, UserId: req.body.UserId } });
        if (address) {
            res.status(200).json({ status: 'success', data: 'Address deleted successfully.' });
        }
        else {
            res.status(400).json({ status: 'error', data: 'Malicious activity detected.' });
        }
    };
};
//# sourceMappingURL=address.js.map