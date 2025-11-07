"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVerdict = exports.retrieveChallengesWithCodeSnippet = exports.retrieveCodeSnippet = exports.fileSniff = void 0;
const graceful_fs_1 = __importDefault(require("graceful-fs"));
const fs_1 = __importDefault(require("fs"));
const js_yaml_1 = __importDefault(require("js-yaml"));
const utils = require('../lib/utils');
const challengeUtils = require('../lib/challengeUtils');
const challenges = require('../data/datacache').challenges;
const path = require('path');
const accuracy = require('../lib/accuracy');
graceful_fs_1.default.gracefulify(fs_1.default);
const SNIPPET_PATHS = Object.freeze(['./server.ts', './routes', './lib', './data', './frontend/src/app']);
const cache = {};
const fileSniff = async (paths, match) => {
    const matches = [];
    for (const currPath of paths) {
        if (graceful_fs_1.default.lstatSync(currPath).isDirectory()) {
            const files = graceful_fs_1.default.readdirSync(currPath);
            const moreMatches = await (0, exports.fileSniff)(files.map(file => path.resolve(currPath, file)), match);
            matches.push(...moreMatches);
        }
        else {
            const data = graceful_fs_1.default.readFileSync(currPath);
            const code = data.toString();
            const lines = code.split('\n');
            for (const line of lines) {
                if (match.test(line)) {
                    matches.push({
                        path: currPath,
                        match: line
                    });
                }
            }
        }
    }
    return matches;
};
exports.fileSniff = fileSniff;
class BrokenBoundary extends Error {
    constructor(message) {
        super(message);
        this.name = 'BrokenBoundary';
        this.message = message;
    }
}
class SnippetNotFound extends Error {
    constructor(message) {
        super(message);
        this.name = 'SnippetNotFound';
        this.message = message;
    }
}
class UnknownChallengekey extends Error {
    constructor(message) {
        super(message);
        this.name = 'UnknownChallengeKey';
        this.message = message;
    }
}
const setStatusCode = (error) => {
    switch (error.name) {
        case 'BrokenBoundary':
            return 422;
        case 'SnippetNotFound':
            return 404;
        case 'UnknownChallengeKey':
            return 412;
        default:
            return 200;
    }
};
const retrieveCodeSnippet = async (key, pass = false) => {
    let challenge = challenges[key];
    if (pass)
        challenge = { key };
    if (challenge) {
        if (!cache[challenge.key]) {
            const match = new RegExp(`vuln-code-snippet start.*${challenge.key}`);
            const matches = await (0, exports.fileSniff)(SNIPPET_PATHS, match);
            if (matches[0]) { // TODO Currently only a single source file is supported
                const source = graceful_fs_1.default.readFileSync(path.resolve(matches[0].path), 'utf8');
                const snippets = source.match(`[/#]{0,2} vuln-code-snippet start.*${challenge.key}([^])*vuln-code-snippet end.*${challenge.key}`);
                if (snippets != null) {
                    let snippet = snippets[0]; // TODO Currently only a single code snippet is supported
                    snippet = snippet.replace(/\s?[/#]{0,2} vuln-code-snippet start.*[\r\n]{0,2}/g, '');
                    snippet = snippet.replace(/\s?[/#]{0,2} vuln-code-snippet end.*/g, '');
                    snippet = snippet.replace(/.*[/#]{0,2} vuln-code-snippet hide-line[\r\n]{0,2}/g, '');
                    snippet = snippet.replace(/.*[/#]{0,2} vuln-code-snippet hide-start([^])*[/#]{0,2} vuln-code-snippet hide-end[\r\n]{0,2}/g, '');
                    snippet = snippet.trim();
                    let lines = snippet.split('\r\n');
                    if (lines.length === 1)
                        lines = snippet.split('\n');
                    if (lines.length === 1)
                        lines = snippet.split('\r');
                    const vulnLines = [];
                    const neutralLines = [];
                    for (let i = 0; i < lines.length; i++) {
                        if (new RegExp(`vuln-code-snippet vuln-line.*${challenge.key}`).exec(lines[i]) != null) {
                            vulnLines.push(i + 1);
                        }
                        else if (new RegExp(`vuln-code-snippet neutral-line.*${challenge.key}`).exec(lines[i]) != null) {
                            neutralLines.push(i + 1);
                        }
                    }
                    snippet = snippet.replace(/\s?[/#]{0,2} vuln-code-snippet vuln-line.*/g, '');
                    snippet = snippet.replace(/\s?[/#]{0,2} vuln-code-snippet neutral-line.*/g, '');
                    cache[challenge.key] = { snippet, vulnLines, neutralLines };
                }
                else {
                    throw new BrokenBoundary('Broken code snippet boundaries for: ' + challenge.key);
                }
            }
            else {
                throw new SnippetNotFound('No code snippet available for: ' + challenge.key);
            }
        }
        return cache[challenge.key];
    }
    else {
        throw new UnknownChallengekey('Unknown challenge key: ' + key);
    }
};
exports.retrieveCodeSnippet = retrieveCodeSnippet;
exports.serveCodeSnippet = () => async (req, res, next) => {
    let snippetData;
    try {
        snippetData = await (0, exports.retrieveCodeSnippet)(req.params.challenge);
        res.status(setStatusCode(snippetData)).json({ snippet: snippetData.snippet });
    }
    catch (error) {
        const statusCode = setStatusCode(error);
        res.status(statusCode).json({ status: 'error', error: utils.getErrorMessage(error) });
    }
};
const retrieveChallengesWithCodeSnippet = async () => {
    if (!cache.codingChallenges) {
        const match = /vuln-code-snippet start .*/;
        const matches = await (0, exports.fileSniff)(SNIPPET_PATHS, match);
        cache.codingChallenges = matches.map(m => m.match.trim().substr(26).trim()).join(' ').split(' ').filter(c => c.endsWith('Challenge'));
    }
    return cache.codingChallenges;
};
exports.retrieveChallengesWithCodeSnippet = retrieveChallengesWithCodeSnippet;
exports.serveChallengesWithCodeSnippet = () => async (req, res, next) => {
    const codingChallenges = await (0, exports.retrieveChallengesWithCodeSnippet)();
    res.json({ challenges: codingChallenges });
};
const getVerdict = (vulnLines, neutralLines, selectedLines) => {
    if (selectedLines === undefined)
        return false;
    if (vulnLines.length > selectedLines.length)
        return false;
    if (!vulnLines.every(e => selectedLines.includes(e)))
        return false;
    const okLines = [...vulnLines, ...neutralLines];
    const notOkLines = selectedLines.filter(x => !okLines.includes(x));
    return notOkLines.length === 0;
};
exports.getVerdict = getVerdict;
exports.checkVulnLines = () => async (req, res, next) => {
    const key = req.body.key;
    let snippetData;
    try {
        snippetData = await (0, exports.retrieveCodeSnippet)(key);
    }
    catch (error) {
        const statusCode = setStatusCode(error);
        res.status(statusCode).json({ status: 'error', error: utils.getErrorMessage(error) });
        return;
    }
    const vulnLines = snippetData.vulnLines;
    const neutralLines = snippetData.neutralLines;
    const selectedLines = req.body.selectedLines;
    const verdict = (0, exports.getVerdict)(vulnLines, neutralLines, selectedLines);
    let hint;
    if (graceful_fs_1.default.existsSync('./data/static/codefixes/' + key + '.info.yml')) {
        const codingChallengeInfos = js_yaml_1.default.load(graceful_fs_1.default.readFileSync('./data/static/codefixes/' + key + '.info.yml', 'utf8'));
        if (codingChallengeInfos === null || codingChallengeInfos === void 0 ? void 0 : codingChallengeInfos.hints) {
            if (accuracy.getFindItAttempts(key) > codingChallengeInfos.hints.length) {
                if (vulnLines.length === 1) {
                    hint = res.__('Line {{vulnLine}} is responsible for this vulnerability or security flaw. Select it and submit to proceed.', { vulnLine: vulnLines[0].toString() });
                }
                else {
                    hint = res.__('Lines {{vulnLines}} are responsible for this vulnerability or security flaw. Select them and submit to proceed.', { vulnLines: vulnLines.toString() });
                }
            }
            else {
                const nextHint = codingChallengeInfos.hints[accuracy.getFindItAttempts(key) - 1]; // -1 prevents after first attempt
                if (nextHint)
                    hint = res.__(nextHint);
            }
        }
    }
    if (verdict) {
        await challengeUtils.solveFindIt(key);
        res.status(200).json({
            verdict: true
        });
    }
    else {
        accuracy.storeFindItVerdict(key, false);
        res.status(200).json({
            verdict: false,
            hint
        });
    }
};
//# sourceMappingURL=vulnCodeSnippet.js.map