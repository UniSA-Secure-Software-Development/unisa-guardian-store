"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const user_1 = require("../models/user");
const utils = require('../lib/utils');
const security = require('../lib/insecurity');
const logger = require('../lib/logger');
const fileType = require('file-type');
module.exports = function fileUpload() {
    return async (req, res, next) => {
        const file = req.file;
        const buffer = file === null || file === void 0 ? void 0 : file.buffer;
        const uploadedFileType = await fileType.fromBuffer(buffer);
        if (uploadedFileType === undefined) {
            res.status(500);
            next(new Error('Illegal file type'));
        }
        else {
            if (uploadedFileType !== null && utils.startsWith(uploadedFileType.mime, 'image')) {
                const loggedInUser = security.authenticatedUsers.get(req.cookies.token);
                if (loggedInUser) {
                    fs.open(`frontend/dist/frontend/assets/public/images/uploads/${loggedInUser.data.id}.${uploadedFileType.ext}`, 'w', function (err, fd) {
                        if (err != null)
                            logger.warn('Error opening file: ' + err.message);
                        // @ts-expect-error
                        fs.write(fd, buffer, 0, buffer.length, null, function (err) {
                            if (err != null)
                                logger.warn('Error writing file: ' + err.message);
                            fs.close(fd, function () { });
                        });
                    });
                    user_1.UserModel.findByPk(loggedInUser.data.id).then(async (user) => {
                        if (user) {
                            return await user.update({ profileImage: `assets/public/images/uploads/${loggedInUser.data.id}.${uploadedFileType.ext}` });
                        }
                    }).catch((error) => {
                        next(error);
                    });
                    res.location(process.env.BASE_PATH + '/profile');
                    res.redirect(process.env.BASE_PATH + '/profile');
                }
                else {
                    next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress));
                }
            }
            else {
                res.status(415);
                next(new Error(`Profile image upload does not accept this file type${uploadedFileType ? (': ' + uploadedFileType.mime) : '.'}`));
            }
        }
    };
};
//# sourceMappingURL=profileImageFileUpload.js.map