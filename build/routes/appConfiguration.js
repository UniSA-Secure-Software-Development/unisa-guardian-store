"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const config = require("config");
module.exports = function retrieveAppConfiguration() {
    return (_req, res) => {
        res.json({ config });
    };
};
//# sourceMappingURL=appConfiguration.js.map