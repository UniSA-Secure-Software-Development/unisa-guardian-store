"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CaptchaModelInit = exports.CaptchaModel = void 0;
const sequelize_1 = require("sequelize");
class Captcha extends sequelize_1.Model {
}
exports.CaptchaModel = Captcha;
const CaptchaModelInit = (sequelize) => {
    Captcha.init({
        captchaId: {
            type: sequelize_1.DataTypes.INTEGER
        },
        captcha: sequelize_1.DataTypes.STRING,
        answer: sequelize_1.DataTypes.STRING
    }, {
        tableName: 'Captchas',
        sequelize
    });
};
exports.CaptchaModelInit = CaptchaModelInit;
//# sourceMappingURL=captcha.js.map