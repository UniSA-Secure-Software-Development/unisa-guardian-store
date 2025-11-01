"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const card_1 = require("../models/card");
module.exports.getPaymentMethods = function getPaymentMethods() {
    return async (req, res, next) => {
        const displayableCards = [];
        const cards = await card_1.CardModel.findAll({ where: { UserId: req.body.UserId } });
        cards.forEach(card => {
            const displayableCard = {
                UserId: card.UserId,
                id: card.id,
                fullName: card.fullName,
                cardNum: '',
                expMonth: card.expMonth,
                expYear: card.expYear
            };
            const cardNumber = String(card.cardNum);
            displayableCard.cardNum = '*'.repeat(12) + cardNumber.substring(cardNumber.length - 4);
            displayableCards.push(displayableCard);
        });
        res.status(200).json({ status: 'success', data: displayableCards });
    };
};
module.exports.getPaymentMethodById = function getPaymentMethodById() {
    return async (req, res, next) => {
        const card = await card_1.CardModel.findOne({ where: { id: req.params.id, UserId: req.body.UserId } });
        const displayableCard = {
            UserId: 0,
            id: 0,
            fullName: '',
            cardNum: '',
            expMonth: 0,
            expYear: 0
        };
        if (card) {
            displayableCard.UserId = card.UserId;
            displayableCard.id = card.id;
            displayableCard.fullName = card.fullName;
            displayableCard.expMonth = card.expMonth;
            displayableCard.expYear = card.expYear;
            const cardNumber = String(card.cardNum);
            displayableCard.cardNum = '*'.repeat(12) + cardNumber.substring(cardNumber.length - 4);
        }
        if (card && displayableCard) {
            res.status(200).json({ status: 'success', data: displayableCard });
        }
        else {
            res.status(400).json({ status: 'error', data: 'Malicious activity detected' });
        }
    };
};
module.exports.delPaymentMethodById = function delPaymentMethodById() {
    return async (req, res, next) => {
        const card = await card_1.CardModel.destroy({ where: { id: req.params.id, UserId: req.body.UserId } });
        if (card) {
            res.status(200).json({ status: 'success', data: 'Card deleted successfully.' });
        }
        else {
            res.status(400).json({ status: 'error', data: 'Malicious activity detected.' });
        }
    };
};
//# sourceMappingURL=payment.js.map