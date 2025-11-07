"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const imageCaptcha_1 = require("../models/imageCaptcha");
const sequelize_1 = require("sequelize");
const svgCaptcha = require('svg-captcha');
const security = require('../lib/insecurity');
function imageCaptchas() {
    return (req, res) => {
        const captcha = svgCaptcha.create({ size: 5, noise: 2, color: true });
        const imageCaptcha = {
            image: captcha.data,
            answer: captcha.text,
            UserId: security.authenticatedUsers.from(req).data.id
        };
        const imageCaptchaInstance = imageCaptcha_1.ImageCaptchaModel.build(imageCaptcha);
        imageCaptchaInstance.save().then(() => {
            res.json(imageCaptcha);
        }).catch(() => {
            res.status(400).send(res.__('Unable to create CAPTCHA. Please try again.'));
        });
    };
}
imageCaptchas.verifyCaptcha = () => (req, res, next) => {
    const user = security.authenticatedUsers.from(req);
    const UserId = user ? user.data ? user.data.id : undefined : undefined;
    imageCaptcha_1.ImageCaptchaModel.findAll({
        limit: 1,
        where: {
            UserId: UserId,
            createdAt: {
                [sequelize_1.Op.gt]: new Date(Date.now() - 300000)
            }
        },
        order: [['createdAt', 'DESC']]
    }).then(captchas => {
        if (!captchas[0] || req.body.answer === captchas[0].answer) {
            next();
        }
        else {
            res.status(401).send(res.__('Wrong answer to CAPTCHA. Please try again.'));
        }
    }).catch(() => {
        res.status(401).send(res.__('Something went wrong while submitting CAPTCHA. Please try again.'));
    });
};
module.exports = imageCaptchas;
//# sourceMappingURL=imageCaptcha.js.map