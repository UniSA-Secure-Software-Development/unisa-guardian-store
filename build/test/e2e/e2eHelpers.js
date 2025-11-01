"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.beforeEachLogin = exports.expectChallengeSolved = exports.basePath = void 0;
const otplib = require("otplib");
const protractor_1 = require("protractor");
const url = require('url');
let _basePath = (new url.URL(protractor_1.browser.baseUrl)).pathname;
if (_basePath === '/')
    _basePath = '';
exports.basePath = _basePath;
function expectChallengeSolved(context) {
    describe('(utils)', () => {
        beforeEach(() => {
            void protractor_1.browser.get(`${exports.basePath}/#/score-board`);
        });
        it(`challenge '${context.challenge}' should be solved on score board`, () => {
            expect((0, protractor_1.element)(protractor_1.by.id(`${context.challenge}.solved`)).isPresent()).toBeTruthy();
            expect((0, protractor_1.element)(protractor_1.by.id(`${context.challenge}.notSolved`)).isPresent()).toBeFalsy();
        });
    });
}
exports.expectChallengeSolved = expectChallengeSolved;
function beforeEachLogin(context) {
    describe('(utils)', () => {
        beforeEach(() => {
            void protractor_1.browser.get(`${exports.basePath}/#/login`);
            void (0, protractor_1.element)(protractor_1.by.id('email')).sendKeys(context.email);
            void (0, protractor_1.element)(protractor_1.by.id('password')).sendKeys(context.password);
            void (0, protractor_1.element)(protractor_1.by.id('loginButton')).click();
            if (context.totpSecret) {
                const EC = protractor_1.protractor.ExpectedConditions;
                const twoFactorTokenInput = (0, protractor_1.element)(protractor_1.by.id('totpToken'));
                const twoFactorSubmitButton = (0, protractor_1.element)(protractor_1.by.id('totpSubmitButton'));
                void protractor_1.browser.wait(EC.visibilityOf(twoFactorTokenInput), 1000, '2FA token field did not become visible');
                const totpToken = otplib.authenticator.generate(context.totpSecret);
                void twoFactorTokenInput.sendKeys(totpToken);
                void twoFactorSubmitButton.click();
            }
        });
        it(`should have logged in user "${context.email}" with password "${context.password}"`, () => {
            expect(protractor_1.browser.getCurrentUrl()).toMatch(/\/search/);
        });
    });
}
exports.beforeEachLogin = beforeEachLogin;
//# sourceMappingURL=e2eHelpers.js.map