"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const config = require("config");
const utils = require('../lib/utils');
module.exports = function retrieveAppVersion() {
    return (_req, res) => {
        res.json({
            version: config.get('application.showVersionNumber') ? utils.version() : ''
        });
    };
};
//# sourceMappingURL=appVersion.js.map