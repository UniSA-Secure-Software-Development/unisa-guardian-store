"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const user_1 = require("../models/user");
const challengeUtils = require("../lib/challengeUtils");
const utils = require('../lib/utils');
const security = require('../lib/insecurity');
const challenges = require('../data/datacache').challenges;
const pug = require('pug');
const config = require('config');
const themes = require('../views/themes/themes').themes;
const Entities = require('html-entities').AllHtmlEntities;
const entities = new Entities();
module.exports = function getUserProfile() {
    return (req, res, next) => {
        fs.readFile('views/userProfile.pug', function (err, buf) {
            if (err != null)
                throw err;
            const loggedInUser = security.authenticatedUsers.get(req.cookies.token);
            if (loggedInUser) {
                user_1.UserModel.findByPk(loggedInUser.data.id).then((user) => {
                    let template = buf.toString();
                    let username = user === null || user === void 0 ? void 0 : user.username;
                    if ((username === null || username === void 0 ? void 0 : username.match(/#{(.*)}/)) !== null && !utils.disableOnContainerEnv()) {
                        req.app.locals.abused_ssti_bug = true;
                        const code = username === null || username === void 0 ? void 0 : username.substring(2, username.length - 1);
                        try {
                            if (!code) {
                                throw new Error('Username is null');
                            }
                            username = eval(code); // eslint-disable-line no-eval
                        }
                        catch (err) {
                            username = '\\' + username;
                        }
                    }
                    else {
                        username = '\\' + username;
                    }
                    const theme = themes[config.get('application.theme')];
                    if (username) {
                        template = template.replace(/_username_/g, username);
                    }
                    template = template.replace(/_emailHash_/g, security.hash(user === null || user === void 0 ? void 0 : user.email));
                    template = template.replace(/_title_/g, entities.encode(config.get('application.name')));
                    template = template.replace(/_favicon_/g, favicon());
                    template = template.replace(/_bgColor_/g, theme.bgColor);
                    template = template.replace(/_textColor_/g, theme.textColor);
                    template = template.replace(/_navColor_/g, theme.navColor);
                    template = template.replace(/_primLight_/g, theme.primLight);
                    template = template.replace(/_primDark_/g, theme.primDark);
                    template = template.replace(/_logo_/g, utils.extractFilename(config.get('application.logo')));
                    const fn = pug.compile(template);
                    const CSP = `img-src 'self' ${user === null || user === void 0 ? void 0 : user.profileImage}; script-src 'self' 'unsafe-eval' https://code.getmdl.io http://ajax.googleapis.com`;
                    challengeUtils.solveIf(challenges.usernameXssChallenge, () => { return (user === null || user === void 0 ? void 0 : user.profileImage.match(/;[ ]*script-src(.)*'unsafe-inline'/g)) !== null && utils.contains(username, '<script>alert(`xss`)</script>'); });
                    res.set({
                        'Content-Security-Policy': CSP
                    });
                    res.send(fn(user));
                }).catch((error) => {
                    next(error);
                });
            }
            else {
                next(new Error('Blocked illegal activity by ' + req.connection.remoteAddress));
            }
        });
    };
    function favicon() {
        return utils.extractFilename(config.get('application.favicon'));
    }
};
//# sourceMappingURL=userProfile.js.map