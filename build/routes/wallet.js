"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const wallet_1 = require("../models/wallet");
const card_1 = require("../models/card");
module.exports.getWalletBalance = function getWalletBalance() {
    return async (req, res, next) => {
        const wallet = await wallet_1.WalletModel.findOne({ where: { UserId: req.body.UserId } });
        if (wallet) {
            res.status(200).json({ status: 'success', data: wallet.balance });
        }
        else {
            res.status(404).json({ status: 'error' });
        }
    };
};
module.exports.addWalletBalance = function addWalletBalance() {
    return async (req, res, next) => {
        const cardId = req.body.paymentId;
        const card = cardId ? await card_1.CardModel.findOne({ where: { id: cardId, UserId: req.body.UserId } }) : null;
        if (card) {
            const wallet = await wallet_1.WalletModel.increment({ balance: req.body.balance }, { where: { UserId: req.body.UserId } });
            if (wallet) {
                res.status(200).json({ status: 'success', data: wallet[0][0].balance });
            }
            else {
                res.status(404).json({ status: 'error' });
            }
        }
        else {
            res.status(402).json({ status: 'error', message: 'Payment not accepted.' });
        }
    };
};
//# sourceMappingURL=wallet.js.map