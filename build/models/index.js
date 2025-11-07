"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const address_1 = require("./address");
const basket_1 = require("./basket");
const basketitem_1 = require("./basketitem");
const captcha_1 = require("./captcha");
const card_1 = require("./card");
const challenge_1 = require("./challenge");
const complaint_1 = require("./complaint");
const delivery_1 = require("./delivery");
const feedback_1 = require("./feedback");
const imageCaptcha_1 = require("./imageCaptcha");
const memory_1 = require("./memory");
const privacyRequests_1 = require("./privacyRequests");
const product_1 = require("./product");
const quantity_1 = require("./quantity");
const recycle_1 = require("./recycle");
const relations_1 = require("./relations");
const securityAnswer_1 = require("./securityAnswer");
const securityQuestion_1 = require("./securityQuestion");
const user_1 = require("./user");
const wallet_1 = require("./wallet");
/* jslint node: true */
const Sequelize = require('sequelize');
const sequelize = new Sequelize('database', 'username', 'password', {
    dialect: 'sqlite',
    retry: {
        match: [/SQLITE_BUSY/],
        name: 'query',
        max: 5
    },
    transactionType: 'IMMEDIATE',
    storage: 'data/juiceshop.sqlite',
    logging: false
});
exports.sequelize = sequelize;
(0, address_1.AddressModelInit)(sequelize);
(0, basket_1.BasketModelInit)(sequelize);
(0, basketitem_1.BasketItemModelInit)(sequelize);
(0, captcha_1.CaptchaModelInit)(sequelize);
(0, card_1.CardModelInit)(sequelize);
(0, challenge_1.ChallengeModelInit)(sequelize);
(0, complaint_1.ComplaintModelInit)(sequelize);
(0, delivery_1.DeliveryModelInit)(sequelize);
(0, feedback_1.FeedbackModelInit)(sequelize);
(0, imageCaptcha_1.ImageCaptchaModelInit)(sequelize);
(0, memory_1.MemoryModelInit)(sequelize);
(0, privacyRequests_1.PrivacyRequestModelInit)(sequelize);
(0, product_1.ProductModelInit)(sequelize);
(0, quantity_1.QuantityModelInit)(sequelize);
(0, recycle_1.RecycleModelInit)(sequelize);
(0, securityAnswer_1.SecurityAnswerModelInit)(sequelize);
(0, securityQuestion_1.SecurityQuestionModelInit)(sequelize);
(0, user_1.UserModelInit)(sequelize);
(0, wallet_1.WalletModelInit)(sequelize);
(0, relations_1.relationsInit)(sequelize);
//# sourceMappingURL=index.js.map