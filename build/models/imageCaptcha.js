"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageCaptchaModelInit = exports.ImageCaptchaModel = void 0;
const sequelize_1 = require("sequelize");
class ImageCaptcha extends sequelize_1.Model {
}
exports.ImageCaptchaModel = ImageCaptcha;
const ImageCaptchaModelInit = (sequelize) => {
    ImageCaptcha.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        image: sequelize_1.DataTypes.STRING,
        answer: sequelize_1.DataTypes.STRING,
        UserId: { type: sequelize_1.DataTypes.INTEGER },
        createdAt: sequelize_1.DataTypes.DATE
    }, {
        tableName: 'ImageCaptchas',
        sequelize
    });
};
exports.ImageCaptchaModelInit = ImageCaptchaModelInit;
//# sourceMappingURL=imageCaptcha.js.map