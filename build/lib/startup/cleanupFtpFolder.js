"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const glob = require("glob");
const utils = require('../utils');
const path = require('path');
const fs = require('fs-extra');
const logger = require('../logger');
const cleanupFtpFolder = () => {
    glob(path.resolve('ftp/*.pdf'), (err, files) => {
        if (err != null) {
            logger.warn('Error listing PDF files in /ftp folder: ' + utils.getErrorMessage(err));
        }
        else {
            files.forEach((filename) => {
                fs.remove(filename);
            });
        }
    });
};
module.exports = cleanupFtpFolder;
//# sourceMappingURL=cleanupFtpFolder.js.map