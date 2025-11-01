"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const challengeUtils = require("../lib/challengeUtils");
const challenges = require('../data/datacache').challenges;
module.exports = function servePrivacyPolicyProof() {
    return (req, res) => {
        challengeUtils.solveIf(challenges.privacyPolicyProofChallenge, () => { return true; });
        res.sendFile(path.resolve('frontend/dist/frontend/assets/private/thank-you.jpg'));
    };
};
//# sourceMappingURL=privacyPolicyProof.js.map