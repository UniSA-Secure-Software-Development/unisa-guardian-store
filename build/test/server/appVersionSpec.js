"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const sinon = require("sinon");
const config = require('config');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);
describe('appVersion', () => {
    const retrieveAppVersion = require('../../routes/appVersion');
    let req;
    let res;
    it('should ' + config.get('application.showVersionNumber') ? '' : 'not ' + 'return version specified in package.json', () => {
        req = {};
        res = { json: sinon.spy() };
        retrieveAppVersion()(req, res);
        expect(res.json).to.have.been.calledWith({ version: config.get('application.showVersionNumber') ? require('../../package.json').version : '' });
    });
});
//# sourceMappingURL=appVersionSpec.js.map