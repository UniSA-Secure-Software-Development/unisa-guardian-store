"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const challengeUtils = require("../lib/challengeUtils");
const utils = require('../lib/utils');
const security = require('../lib/insecurity');
const challenges = require('../data/datacache').challenges;
module.exports = function servePublicFiles() {
    return ({ params, query }, res, next) => {
        const file = params.file;
        if (!file.includes('/')) {
            verify(file, res, next);
        }
        else {
            res.status(403);
            next(new Error('File names cannot contain forward slashes!'));
        }
    };
    function verify(file, res, next) {
        if (file && (endsWithAllowlistedFileType(file) || (file === 'incident-support.kdbx'))) {
            file = security.cutOffPoisonNullByte(file);
            challengeUtils.solveIf(challenges.directoryListingChallenge, () => { return file.toLowerCase() === 'acquisitions.md'; });
            verifySuccessfulPoisonNullByteExploit(file);
            res.sendFile(path.resolve('ftp/', file));
        }
        else {
            res.status(403);
            next(new Error('Only .md and .pdf files are allowed!'));
        }
    }
    function verifySuccessfulPoisonNullByteExploit(file) {
        challengeUtils.solveIf(challenges.easterEggLevelOneChallenge, () => { return file.toLowerCase() === 'eastere.gg'; });
        challengeUtils.solveIf(challenges.forgottenDevBackupChallenge, () => { return file.toLowerCase() === 'package.json.bak'; });
        challengeUtils.solveIf(challenges.forgottenBackupChallenge, () => { return file.toLowerCase() === 'coupons_2013.md.bak'; });
        challengeUtils.solveIf(challenges.misplacedSignatureFileChallenge, () => { return file.toLowerCase() === 'suspicious_errors.yml'; });
        challengeUtils.solveIf(challenges.nullByteChallenge, () => {
            return challenges.easterEggLevelOneChallenge.solved || challenges.forgottenDevBackupChallenge.solved || challenges.forgottenBackupChallenge.solved ||
                challenges.misplacedSignatureFileChallenge.solved || file.toLowerCase() === 'encrypt.pyc';
        });
    }
    function endsWithAllowlistedFileType(param) {
        return utils.endsWith(param, '.md') || utils.endsWith(param, '.pdf');
    }
};
//# sourceMappingURL=fileServer.js.map