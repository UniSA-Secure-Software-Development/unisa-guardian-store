"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const config = require("config");
const notifications = require('../../data/datacache').notifications;
const utils = require('../utils');
const challengeUtils = require('../challengeUtils');
const security = require('../insecurity');
const challenges = require('../../data/datacache').challenges;
let firstConnectedSocket = null;
const registerWebsocketEvents = (server) => {
    const io = require('socket.io')(server);
    global.io = io;
    io.on('connection', (socket) => {
        if (firstConnectedSocket === null) {
            socket.emit('server started');
            firstConnectedSocket = socket.id;
        }
        notifications.forEach((notification) => {
            socket.emit('challenge solved', notification);
        });
        socket.on('notification received', (data) => {
            const i = notifications.findIndex(({ flag }) => flag === data);
            if (i > -1) {
                notifications.splice(i, 1);
            }
        });
        socket.on('verifyLocalXssChallenge', (data) => {
            challengeUtils.solveIf(challenges.localXssChallenge, () => { return utils.contains(data, '<iframe src="javascript:alert(`xss`)">'); });
            challengeUtils.solveIf(challenges.xssBonusChallenge, () => { return utils.contains(data, config.get('challenges.xssBonusPayload')); });
        });
        socket.on('verifySvgInjectionChallenge', (data) => {
            challengeUtils.solveIf(challenges.svgInjectionChallenge, () => { return (data === null || data === void 0 ? void 0 : data.match(/.*\.\.\/\.\.\/\.\.[\w/-]*?\/redirect\?to=https?:\/\/placekitten.com\/(g\/)?[\d]+\/[\d]+.*/)) && security.isRedirectAllowed(data); });
        });
    });
};
module.exports = registerWebsocketEvents;
//# sourceMappingURL=registerWebsocketEvents.js.map