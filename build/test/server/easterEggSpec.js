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
describe('easterEgg', () => {
    const serveEasterEgg = require('../../routes/easterEgg');
    const challenges = require('../../data/datacache').challenges;
    let req;
    let res;
    let save;
    beforeEach(() => {
        res = { sendFile: sinon.spy() };
        req = {};
        save = () => ({
            then() { }
        });
    });
    it('should serve /frontend/dist/frontend/assets/private/threejs-demo.html', () => {
        serveEasterEgg()(req, res);
        expect(res.sendFile).to.have.been.calledWith(sinon.match(/frontend[/\\]dist[/\\]frontend[/\\]assets[/\\]private[/\\]threejs-demo\.html/));
    });
    it('should solve "easterEggLevelTwoChallenge"', () => {
        challenges.easterEggLevelTwoChallenge = { solved: false, save: save };
        serveEasterEgg()(req, res);
        expect(challenges.easterEggLevelTwoChallenge.solved).to.equal(true);
    });
});
//# sourceMappingURL=easterEggSpec.js.map