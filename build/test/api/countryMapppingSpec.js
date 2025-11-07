"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const frisby = require("frisby");
const REST_URL = 'http://localhost:3000/rest';
describe('/rest/country-mapping', () => {
    it('GET no country mapping present in default configuration', () => {
        return frisby.get(REST_URL + '/country-mapping')
            .expect('status', 500);
    });
});
//# sourceMappingURL=countryMapppingSpec.js.map