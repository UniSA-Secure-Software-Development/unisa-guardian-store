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
describe('keyServer', () => {
    const serveKeyFiles = require('../../routes/keyServer');
    let req;
    let res;
    let next;
    beforeEach(() => {
        req = { params: {} };
        res = { sendFile: sinon.spy(), status: sinon.spy() };
        next = sinon.spy();
    });
    it('should serve requested file from folder /encryptionkeys', () => {
        req.params.file = 'test.file';
        serveKeyFiles()(req, res, next);
        expect(res.sendFile).to.have.been.calledWith(sinon.match(/encryptionkeys[/\\]test.file/));
    });
    it('should raise error for slashes in filename', () => {
        req.params.file = '../../../../nice.try';
        serveKeyFiles()(req, res, next);
        expect(res.sendFile).to.have.not.been.calledWith(sinon.match.any);
        expect(next).to.have.been.calledWith(sinon.match.instanceOf(Error));
    });
});
//# sourceMappingURL=keyServerSpec.js.map