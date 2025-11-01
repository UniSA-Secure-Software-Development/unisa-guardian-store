"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const sinon = require("sinon");
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);
describe('appConfiguration', () => {
    const retrieveAppConfiguration = require('../../routes/appConfiguration');
    let req;
    let res;
    it('should return configuration object', () => {
        req = {};
        res = { json: sinon.spy() };
        retrieveAppConfiguration()(req, res);
        expect(res.json).to.have.been.calledWith({ config: require('config') });
    });
});
//# sourceMappingURL=appConfigurationSpec.js.map