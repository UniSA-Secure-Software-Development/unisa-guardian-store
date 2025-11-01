"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const memory_1 = require("../models/memory");
const challengeUtils = require("../lib/challengeUtils");
const security = require('../lib/insecurity');
const db = require('../data/mongodb');
const challenges = require('../data/datacache').challenges;
module.exports = function dataExport() {
    return async (req, res, next) => {
        var _a, _b, _c;
        const loggedInUser = security.authenticatedUsers.get((_b = (_a = req.headers) === null || _a === void 0 ? void 0 : _a.authorization) === null || _b === void 0 ? void 0 : _b.replace('Bearer ', ''));
        if (((_c = loggedInUser === null || loggedInUser === void 0 ? void 0 : loggedInUser.data) === null || _c === void 0 ? void 0 : _c.email) && loggedInUser.data.id) {
            const username = loggedInUser.data.username;
            const email = loggedInUser.data.email;
            const updatedEmail = email.replace(/[aeiou]/gi, '*');
            const userData = {
                username,
                email,
                orders: [],
                reviews: [],
                memories: []
            };
            const memories = await memory_1.MemoryModel.findAll({ where: { UserId: req.body.UserId } });
            memories.forEach((memory) => {
                userData.memories.push({
                    imageUrl: req.protocol + '://' + req.get('host') + '/' + memory.imagePath,
                    caption: memory.caption
                });
            });
            db.orders.find({ email: updatedEmail }).then((orders) => {
                if (orders.length > 0) {
                    orders.forEach(order => {
                        userData.orders.push({
                            orderId: order.orderId,
                            totalPrice: order.totalPrice,
                            products: [...order.products],
                            bonus: order.bonus,
                            eta: order.eta
                        });
                    });
                }
                db.reviews.find({ author: email }).then((reviews) => {
                    if (reviews.length > 0) {
                        reviews.forEach(review => {
                            userData.reviews.push({
                                message: review.message,
                                author: review.author,
                                productId: review.product,
                                likesCount: review.likesCount,
                                likedBy: review.likedBy
                            });
                        });
                    }
                    const emailHash = security.hash(email).slice(0, 4);
                    for (const order of userData.orders) {
                        challengeUtils.solveIf(challenges.dataExportChallenge, () => { return order.orderId.split('-')[0] !== emailHash; });
                    }
                    res.status(200).send({ userData: JSON.stringify(userData, null, 2), confirmation: 'Your data export will open in a new Browser window.' });
                }, () => {
                    next(new Error(`Error retrieving reviews for ${updatedEmail}`));
                });
            }, () => {
                next(new Error(`Error retrieving orders for ${updatedEmail}`));
            });
        }
        else {
            next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress));
        }
    };
};
//# sourceMappingURL=dataExport.js.map