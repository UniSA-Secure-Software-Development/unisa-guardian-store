"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const expect = chai.expect;
describe('fileUpload', () => {
    const { checkUploadSize, checkFileType } = require('../../routes/fileUpload');
    const challenges = require('../../data/datacache').challenges;
    let req;
    let save;
    beforeEach(() => {
        req = { file: { originalname: '' } };
        save = () => ({
            then() { }
        });
    });
    describe('should not solve "uploadSizeChallenge" when file size is', () => {
        const sizes = [0, 1, 100, 1000, 10000, 99999, 100000];
        sizes.forEach(size => {
            it(`${size} bytes`, () => {
                challenges.uploadSizeChallenge = { solved: false, save: save };
                req.file.size = size;
                checkUploadSize(req, undefined, () => { });
                expect(challenges.uploadSizeChallenge.solved).to.equal(false);
            });
        });
    });
    it('should solve "uploadSizeChallenge" when file size exceeds 100000 bytes', () => {
        challenges.uploadSizeChallenge = { solved: false, save: save };
        req.file.size = 100001;
        checkUploadSize(req, undefined, () => { });
        expect(challenges.uploadSizeChallenge.solved).to.equal(true);
    });
    it('should solve "uploadTypeChallenge" when file type is not PDF', () => {
        challenges.uploadTypeChallenge = { solved: false, save: save };
        req.file.originalname = 'hack.exe';
        checkFileType(req, undefined, () => { });
        expect(challenges.uploadTypeChallenge.solved).to.equal(true);
    });
    it('should not solve "uploadTypeChallenge" when file type is PDF', () => {
        challenges.uploadTypeChallenge = { solved: false, save: save };
        req.file.originalname = 'hack.pdf';
        checkFileType(req, undefined, () => { });
        expect(challenges.uploadTypeChallenge.solved).to.equal(false);
    });
});
//# sourceMappingURL=fileUploadSpec.js.map