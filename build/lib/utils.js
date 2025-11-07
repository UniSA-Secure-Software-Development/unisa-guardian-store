"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchesEtcPasswdFile = exports.matchesSystemIniFile = exports.getErrorMessage = exports.thaw = exports.toSimpleIpAddress = exports.parseJsonCustom = exports.determineDisabledEnv = exports.disableOnWindowsEnv = exports.disableOnContainerEnv = exports.randomHexString = exports.jwtFrom = exports.downloadToFile = exports.extractFilename = exports.toISO8601 = exports.toMMMYY = exports.ctfFlag = exports.version = exports.trunc = exports.unquote = exports.containsOrEscaped = exports.containsEscaped = exports.contains = exports.endsWith = exports.startsWith = exports.isUrl = exports.queryResultToJson = void 0;
/* jslint node: true */
const package_json_1 = __importDefault(require("../package.json"));
const fs = require("fs");
const jsSHA = require('jssha');
const config = require('config');
const download = require('download');
const crypto = require('crypto');
const clarinet = require('clarinet');
const isDocker = require('is-docker');
const isHeroku = require('is-heroku');
const isGitpod = require('is-gitpod');
const isWindows = require('is-windows');
const logger = require('./logger');
const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
let ctfKey;
if (process.env.CTF_KEY !== undefined && process.env.CTF_KEY !== '') {
    ctfKey = process.env.CTF_KEY;
}
else {
    fs.readFile('ctf.key', 'utf8', (err, data) => {
        if (err != null) {
            throw err;
        }
        ctfKey = data;
    });
}
const queryResultToJson = (data, status = 'success') => {
    var _a;
    let wrappedData = {};
    if (data) {
        if (!data.length && data.dataValues) {
            wrappedData = data.dataValues;
        }
        else if (data.length > 0) {
            wrappedData = [];
            for (let i = 0; i < data.length; i++) {
                wrappedData.push(((_a = data[i]) === null || _a === void 0 ? void 0 : _a.dataValues) ? data[i].dataValues : data[i]);
            }
        }
        else {
            wrappedData = data;
        }
    }
    return {
        status,
        data: wrappedData
    };
};
exports.queryResultToJson = queryResultToJson;
const isUrl = (url) => {
    return (0, exports.startsWith)(url, 'http');
};
exports.isUrl = isUrl;
const startsWith = (str, prefix) => str ? str.indexOf(prefix) === 0 : false;
exports.startsWith = startsWith;
const endsWith = (str, suffix) => str ? str.includes(suffix, str.length - suffix.length) : false;
exports.endsWith = endsWith;
const contains = (str, element) => str ? str.includes(element) : false; // TODO Inline all usages as this function is not adding any functionality to String.includes
exports.contains = contains;
const containsEscaped = function (str, element) {
    return (0, exports.contains)(str, element.replace(/"/g, '\\"'));
};
exports.containsEscaped = containsEscaped;
const containsOrEscaped = function (str, element) {
    return (0, exports.contains)(str, element) || (0, exports.containsEscaped)(str, element);
};
exports.containsOrEscaped = containsOrEscaped;
const unquote = function (str) {
    if (str && (0, exports.startsWith)(str, '"') && (0, exports.endsWith)(str, '"')) {
        return str.substring(1, str.length - 1);
    }
    else {
        return str;
    }
};
exports.unquote = unquote;
const trunc = function (str, length) {
    str = str.replace(/(\r\n|\n|\r)/gm, '');
    return (str.length > length) ? str.substr(0, length - 1) + '...' : str;
};
exports.trunc = trunc;
const version = (module) => {
    if (module) {
        // @ts-expect-error
        return package_json_1.default.dependencies[module];
    }
    else {
        return package_json_1.default.version;
    }
};
exports.version = version;
const ctfFlag = (text) => {
    const shaObj = new jsSHA('SHA-1', 'TEXT'); // eslint-disable-line new-cap
    shaObj.setHMACKey(ctfKey, 'TEXT');
    shaObj.update(text);
    return shaObj.getHMAC('HEX');
};
exports.ctfFlag = ctfFlag;
const toMMMYY = (date) => {
    const month = date.getMonth();
    const year = date.getFullYear();
    return months[month] + year.toString().substring(2, 4);
};
exports.toMMMYY = toMMMYY;
const toISO8601 = (date) => {
    let day = '' + date.getDate();
    let month = '' + (date.getMonth() + 1);
    const year = date.getFullYear();
    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;
    return [year, month, day].join('-');
};
exports.toISO8601 = toISO8601;
const extractFilename = (url) => {
    let file = decodeURIComponent(url.substring(url.lastIndexOf('/') + 1));
    if ((0, exports.contains)(file, '?')) {
        file = file.substring(0, file.indexOf('?'));
    }
    return file;
};
exports.extractFilename = extractFilename;
const downloadToFile = async (url, dest) => {
    return download(url).then((data) => {
        fs.writeFileSync(dest, data);
    }).catch((err) => {
        logger.warn('Failed to download ' + url + ' (' + (0, exports.getErrorMessage)(err) + ')');
    });
};
exports.downloadToFile = downloadToFile;
const jwtFrom = ({ headers }) => {
    if (headers === null || headers === void 0 ? void 0 : headers.authorization) {
        const parts = headers.authorization.split(' ');
        if (parts.length === 2) {
            const scheme = parts[0];
            const token = parts[1];
            if (/^Bearer$/i.test(scheme)) {
                return token;
            }
        }
    }
    return undefined;
};
exports.jwtFrom = jwtFrom;
const randomHexString = (length) => {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
};
exports.randomHexString = randomHexString;
const disableOnContainerEnv = () => {
    return (isDocker() || isGitpod() || isHeroku) && !config.get('challenges.safetyOverride');
};
exports.disableOnContainerEnv = disableOnContainerEnv;
const disableOnWindowsEnv = () => {
    return isWindows();
};
exports.disableOnWindowsEnv = disableOnWindowsEnv;
const determineDisabledEnv = (disabledEnv) => {
    if (isDocker()) {
        return disabledEnv && (disabledEnv === 'Docker' || disabledEnv.includes('Docker')) ? 'Docker' : null;
    }
    else if (isHeroku) {
        return disabledEnv && (disabledEnv === 'Heroku' || disabledEnv.includes('Heroku')) ? 'Heroku' : null;
    }
    else if (isWindows()) {
        return disabledEnv && (disabledEnv === 'Windows' || disabledEnv.includes('Windows')) ? 'Windows' : null;
    }
    else if (isGitpod()) {
        return disabledEnv && (disabledEnv === 'Gitpod' || disabledEnv.includes('Gitpod')) ? 'Gitpod' : null;
    }
    return null;
};
exports.determineDisabledEnv = determineDisabledEnv;
const parseJsonCustom = (jsonString) => {
    const parser = clarinet.parser();
    const result = [];
    parser.onkey = parser.onopenobject = (k) => {
        result.push({ key: k, value: null });
    };
    parser.onvalue = (v) => {
        result[result.length - 1].value = v;
    };
    parser.write(jsonString).close();
    return result;
};
exports.parseJsonCustom = parseJsonCustom;
const toSimpleIpAddress = (ipv6) => {
    if ((0, exports.startsWith)(ipv6, '::ffff:')) {
        return ipv6.substr(7);
    }
    else if (ipv6 === '::1') {
        return '127.0.0.1';
    }
    else {
        return ipv6;
    }
};
exports.toSimpleIpAddress = toSimpleIpAddress;
const thaw = (frozenObject) => {
    return JSON.parse(JSON.stringify(frozenObject));
};
exports.thaw = thaw;
const getErrorMessage = (error) => {
    if (error instanceof Error)
        return error.message;
    return String(error);
};
exports.getErrorMessage = getErrorMessage;
const matchesSystemIniFile = (text) => {
    const match = text.match(/(; for 16-bit app support|drivers|mci|driver32|386enh|keyboard|boot|display)/gi);
    return match !== null && match.length >= 1;
};
exports.matchesSystemIniFile = matchesSystemIniFile;
const matchesEtcPasswdFile = (text) => {
    const match = text.match(/\w*:\w*:\d*:\d*:\w*:.*/gi);
    return match !== null && match.length >= 1;
};
exports.matchesEtcPasswdFile = matchesEtcPasswdFile;
//# sourceMappingURL=utils.js.map