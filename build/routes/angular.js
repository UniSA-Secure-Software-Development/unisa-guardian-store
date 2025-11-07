"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const utils = require('../lib/utils');
module.exports = function serveAngularClient() {
    return ({ url }, res, next) => {
        if (!utils.startsWith(url, '/api') && !utils.startsWith(url, '/rest')) {
            res.sendFile(path.resolve('frontend/dist/frontend/index.html'));
        }
        else {
            next(new Error('Unexpected path: ' + url));
        }
    };
};
//# sourceMappingURL=angular.js.map