"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const frisby = require("frisby");
const Joi = frisby.Joi;
const REST_URL = 'http://localhost:3000/rest';
describe('/rest/languages', () => {
    it('GET all languages', () => {
        return frisby.get(REST_URL + '/languages')
            .expect('status', 200)
            .expect('header', 'content-type', /application\/json/)
            .expect('jsonTypes', '*', {
            key: Joi.string(),
            lang: Joi.string(),
            icons: Joi.array(),
            percentage: Joi.number(),
            shortKey: Joi.string(),
            gauge: Joi.string()
        });
    });
});
//# sourceMappingURL=languagesSpec.js.map