"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const challengeUtils = require("../lib/challengeUtils");
const utils = require('../lib/utils');
const challenges = require('../data/datacache').challenges;
const libxml = require('libxmljs2');
const os = require('os');
const vm = require('vm');
const unzipper = require('unzipper');
const path = require('path');
function ensureFileIsPassed({ file }, res, next) {
    if (file) {
        next();
    }
}
function handleZipFileUpload({ file }, res, next) {
    if (utils.endsWith(file === null || file === void 0 ? void 0 : file.originalname.toLowerCase(), '.zip')) {
        if ((file === null || file === void 0 ? void 0 : file.buffer) && !utils.disableOnContainerEnv()) {
            const buffer = file.buffer;
            const filename = file.originalname.toLowerCase();
            const tempFile = path.join(os.tmpdir(), filename);
            fs.open(tempFile, 'w', function (err, fd) {
                if (err != null) {
                    next(err);
                }
                fs.write(fd, buffer, 0, buffer.length, null, function (err) {
                    if (err != null) {
                        next(err);
                    }
                    fs.close(fd, function () {
                        fs.createReadStream(tempFile)
                            .pipe(unzipper.Parse())
                            .on('entry', function (entry) {
                            const fileName = entry.path;
                            const absolutePath = path.resolve('uploads/complaints/' + fileName);
                            challengeUtils.solveIf(challenges.fileWriteChallenge, () => { return absolutePath === path.resolve('ftp/legal.md'); });
                            if (absolutePath.includes(path.resolve('.'))) {
                                entry.pipe(fs.createWriteStream('uploads/complaints/' + fileName).on('error', function (err) { next(err); }));
                            }
                            else {
                                entry.autodrain();
                            }
                        }).on('error', function (err) { next(err); });
                    });
                });
            });
        }
        res.status(204).end();
    }
    else {
        next();
    }
}
function checkUploadSize({ file }, res, next) {
    if (file) {
        challengeUtils.solveIf(challenges.uploadSizeChallenge, () => { return (file === null || file === void 0 ? void 0 : file.size) > 100000; });
    }
    next();
}
function checkFileType({ file }, res, next) {
    const fileType = file === null || file === void 0 ? void 0 : file.originalname.substr(file.originalname.lastIndexOf('.') + 1).toLowerCase();
    challengeUtils.solveIf(challenges.uploadTypeChallenge, () => {
        return !(fileType === 'pdf' || fileType === 'xml' || fileType === 'zip');
    });
    next();
}
function handleXmlUpload({ file }, res, next) {
    if (utils.endsWith(file === null || file === void 0 ? void 0 : file.originalname.toLowerCase(), '.xml')) {
        challengeUtils.solveIf(challenges.deprecatedInterfaceChallenge, () => { return true; });
        if ((file === null || file === void 0 ? void 0 : file.buffer) && !utils.disableOnContainerEnv()) { // XXE attacks in Docker/Heroku containers regularly cause "segfault" crashes
            const data = file.buffer.toString();
            try {
                const sandbox = { libxml, data };
                vm.createContext(sandbox);
                const xmlDoc = vm.runInContext('libxml.parseXml(data, { noblanks: true, noent: true, nocdata: true })', sandbox, { timeout: 2000 });
                const xmlString = xmlDoc.toString(false);
                challengeUtils.solveIf(challenges.xxeFileDisclosureChallenge, () => { var _a; return ((_a = utils.matchesSystemIniFile(xmlString)) !== null && _a !== void 0 ? _a : utils.matchesEtcPasswdFile(xmlString)); });
                res.status(410);
                next(new Error('B2B customer complaints via file upload have been deprecated for security reasons: ' + utils.trunc(xmlString, 400) + ' (' + file.originalname + ')'));
            }
            catch (err) { // TODO: Remove any
                if (utils.contains(err.message, 'Script execution timed out')) {
                    if (challengeUtils.notSolved(challenges.xxeDosChallenge)) {
                        challengeUtils.solve(challenges.xxeDosChallenge);
                    }
                    res.status(503);
                    next(new Error('Sorry, we are temporarily not available! Please try again later.'));
                }
                else {
                    res.status(410);
                    next(new Error('B2B customer complaints via file upload have been deprecated for security reasons: ' + err.message + ' (' + file.originalname + ')'));
                }
            }
        }
        else {
            res.status(410);
            next(new Error('B2B customer complaints via file upload have been deprecated for security reasons (' + (file === null || file === void 0 ? void 0 : file.originalname) + ')'));
        }
    }
    res.status(204).end();
}
module.exports = {
    ensureFileIsPassed,
    handleZipFileUpload,
    checkUploadSize,
    checkFileType,
    handleXmlUpload
};
//# sourceMappingURL=fileUpload.js.map