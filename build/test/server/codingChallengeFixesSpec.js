"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vulnCodeSnippet_1 = require("../../routes/vulnCodeSnippet");
const vulnCodeFixes_1 = require("../../routes/vulnCodeFixes");
const chai = require("chai");
const graceful_fs_1 = __importDefault(require("graceful-fs"));
const sinonChai = require('sinon-chai');
const expect = chai.expect;
chai.use(sinonChai);
describe('codingChallengeFixes', () => {
    let codingChallenges;
    before(async () => {
        codingChallenges = await (0, vulnCodeSnippet_1.retrieveChallengesWithCodeSnippet)();
    });
    it('should have a correct fix for each coding challenge', async () => {
        for (const challenge of codingChallenges) {
            const fixes = (0, vulnCodeFixes_1.readFixes)(challenge);
            expect(fixes.correct, `Coding challenge ${challenge} does not have a correct fix file`).to.be.greaterThan(-1);
        }
    });
    it('should have a total of three or more fix options for each coding challenge', async () => {
        for (const challenge of codingChallenges) {
            const fixes = (0, vulnCodeFixes_1.readFixes)(challenge);
            expect(fixes.fixes.length, `Coding challenge ${challenge} does not have enough fix option files`).to.be.greaterThanOrEqual(3);
        }
    });
    it('should have an info YAML file for each coding challenge', async () => {
        for (const challenge of codingChallenges) {
            expect(graceful_fs_1.default.existsSync('./data/static/codefixes/' + challenge + '.info.yml'), `Coding challenge ${challenge} does not have an info YAML file`).to.equal(true);
        }
    });
});
//# sourceMappingURL=codingChallengeFixesSpec.js.map