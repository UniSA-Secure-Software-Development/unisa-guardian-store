"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const protractor_1 = require("protractor");
const e2eHelpers_1 = require("./e2eHelpers");
const config = require('config');
const utils = require('../../lib/utils');
describe('/#/complain', () => {
    let file, complaintMessage, submitButton;
    (0, e2eHelpers_1.beforeEachLogin)({ email: `admin@${config.get('application.domain')}`, password: 'admin123' });
    beforeEach(() => {
        void protractor_1.browser.get(`${e2eHelpers_1.basePath}/#/complain`);
        file = (0, protractor_1.element)(protractor_1.by.id('file'));
        complaintMessage = (0, protractor_1.element)(protractor_1.by.id('complaintMessage'));
        submitButton = (0, protractor_1.element)(protractor_1.by.id('submitButton'));
    });
    describe('challenge "uploadSize"', () => {
        it('should be possible to upload files greater 100 KB directly through backend', () => {
            void protractor_1.browser.waitForAngularEnabled(false);
            void protractor_1.browser.executeScript((baseUrl) => {
                const over100KB = Array.apply(null, new Array(11000)).map(String.prototype.valueOf, '1234567890');
                const blob = new Blob(over100KB, { type: 'application/pdf' });
                const data = new FormData();
                data.append('file', blob, 'invalidSizeForClient.pdf');
                const request = new XMLHttpRequest();
                request.open('POST', `${baseUrl}/file-upload`);
                request.send(data);
            }, protractor_1.browser.baseUrl);
            void protractor_1.browser.driver.sleep(1000);
            void protractor_1.browser.waitForAngularEnabled(true);
        });
        (0, e2eHelpers_1.expectChallengeSolved)({ challenge: 'Upload Size' });
    });
    describe('challenge "uploadType"', () => {
        it('should be possible to upload files with other extension than .pdf directly through backend', () => {
            void protractor_1.browser.waitForAngularEnabled(false);
            void protractor_1.browser.executeScript((baseUrl) => {
                const data = new FormData();
                const blob = new Blob(['test'], { type: 'application/x-msdownload' });
                data.append('file', blob, 'invalidTypeForClient.exe');
                const request = new XMLHttpRequest();
                request.open('POST', `${baseUrl}/file-upload`);
                request.send(data);
            }, protractor_1.browser.baseUrl);
            void protractor_1.browser.driver.sleep(1000);
            void protractor_1.browser.waitForAngularEnabled(true);
        });
        (0, e2eHelpers_1.expectChallengeSolved)({ challenge: 'Upload Type' });
    });
    describe('challenge "deprecatedInterface"', () => {
        it('should be possible to upload XML files', () => {
            void complaintMessage.sendKeys('XML all the way!');
            void file.sendKeys(path.resolve('test/files/deprecatedTypeForServer.xml'));
            void submitButton.click();
        });
        (0, e2eHelpers_1.expectChallengeSolved)({ challenge: 'Deprecated Interface' });
    });
    if (!utils.disableOnContainerEnv()) {
        describe('challenge "xxeFileDisclosure"', () => {
            it('should be possible to retrieve file from Windows server via .xml upload with XXE attack', () => {
                void complaintMessage.sendKeys('XXE File Exfiltration Windows!');
                void file.sendKeys(path.resolve('test/files/xxeForWindows.xml'));
                void submitButton.click();
            });
            it('should be possible to retrieve file from Linux server via .xml upload with XXE attack', () => {
                void complaintMessage.sendKeys('XXE File Exfiltration Linux!');
                void file.sendKeys(path.resolve('test/files/xxeForLinux.xml'));
                void submitButton.click();
            });
            afterAll(() => {
                (0, e2eHelpers_1.expectChallengeSolved)({ challenge: 'XXE Data Access' });
            });
        });
        describe('challenge "xxeDos"', () => {
            it('should be possible to trigger request timeout via .xml upload with Quadratic Blowup attack', () => {
                void complaintMessage.sendKeys('XXE Quadratic Blowup!');
                void file.sendKeys(path.resolve('test/files/xxeQuadraticBlowup.xml'));
                void submitButton.click();
            });
            it('should be possible to trigger request timeout via .xml upload with dev/random attack', () => {
                void complaintMessage.sendKeys('XXE Quadratic Blowup!');
                void file.sendKeys(path.resolve('test/files/xxeDevRandom.xml'));
                void submitButton.click();
            });
            afterAll(() => {
                (0, e2eHelpers_1.expectChallengeSolved)({ challenge: 'XXE DoS' });
            });
        });
        describe('challenge "arbitraryFileWrite"', () => {
            it('should be possible to upload zip file with filenames having path traversal', () => {
                void complaintMessage.sendKeys('Zip Slip!');
                void file.sendKeys(path.resolve('test/files/arbitraryFileWrite.zip'));
                void submitButton.click();
            });
            (0, e2eHelpers_1.expectChallengeSolved)({ challenge: 'Arbitrary File Write' });
        });
        describe('challenge "videoXssChallenge"', () => {
            it('should be possible to inject js in subtitles by uploading zip file with filenames having path traversal', () => {
                const EC = protractor_1.protractor.ExpectedConditions;
                void complaintMessage.sendKeys('Here we go!');
                void file.sendKeys(path.resolve('test/files/videoExploit.zip'));
                void submitButton.click();
                void protractor_1.browser.waitForAngularEnabled(false);
                void protractor_1.browser.get(`${e2eHelpers_1.basePath}/promotion`);
                void protractor_1.browser.wait(EC.alertIsPresent(), 5000, "'xss' alert is not present on /promotion");
                void protractor_1.browser.switchTo().alert().then(alert => {
                    expect(alert.getText()).toEqual(Promise.resolve('xss'));
                    void alert.accept();
                });
                void protractor_1.browser.get(`${e2eHelpers_1.basePath}/`);
                void protractor_1.browser.driver.sleep(5000);
                void protractor_1.browser.waitForAngularEnabled(true);
            });
            (0, e2eHelpers_1.expectChallengeSolved)({ challenge: 'Video XSS' });
        });
    }
});
//# sourceMappingURL=complainSpec.js.map