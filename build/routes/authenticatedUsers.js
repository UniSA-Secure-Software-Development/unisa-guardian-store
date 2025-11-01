"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("../models/user");
const utils = require('../lib/utils');
const security = require('../lib/insecurity');
module.exports = function retrieveUserList() {
    return (_req, res, next) => {
        user_1.UserModel.findAll().then((users) => {
            const usersWithLoginStatus = utils.queryResultToJson(users);
            usersWithLoginStatus.data.forEach((user) => {
                user.token = security.authenticatedUsers.tokenOf(user);
                if (user.password) {
                    user.password = user.password.replace(/./g, '*');
                }
                if (user.totpSecret) {
                    user.totpSecret = user.totpSecret.replace(/./g, '*');
                }
            });
            res.json(usersWithLoginStatus);
        }).catch((error) => {
            next(error);
        });
    };
};
//# sourceMappingURL=authenticatedUsers.js.map