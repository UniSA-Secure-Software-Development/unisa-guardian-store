"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-expect-error due to non-existing type definitions for MarsDB
const MarsDB = require("marsdb");
const reviews = new MarsDB.Collection('posts');
const orders = new MarsDB.Collection('orders');
const db = {
    reviews,
    orders
};
module.exports = db;
//# sourceMappingURL=mongodb.js.map