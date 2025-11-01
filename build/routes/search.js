"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const models = require("../models/index");
const user_1 = require("../models/user");
const utils = require('../lib/utils');
const challengeUtils = require('../lib/challengeUtils');
const challenges = require('../data/datacache').challenges;
class ErrorWithParent extends Error {
}
// vuln-code-snippet start unionSqlInjectionChallenge dbSchemaChallenge
module.exports = function searchProducts() {
    return (req, res, next) => {
        var _a;
        let criteria = req.query.q === 'undefined' ? '' : (_a = req.query.q) !== null && _a !== void 0 ? _a : '';
        criteria = (criteria.length <= 200) ? criteria : criteria.substring(0, 200);
        models.sequelize.query(`SELECT * FROM Products WHERE ((name LIKE '%${criteria}%' OR description LIKE '%${criteria}%') AND deletedAt IS NULL) ORDER BY name`) // vuln-code-snippet vuln-line unionSqlInjectionChallenge dbSchemaChallenge
            .then(([products]) => {
            const dataString = JSON.stringify(products);
            if (challengeUtils.notSolved(challenges.unionSqlInjectionChallenge)) { // vuln-code-snippet hide-start
                let solved = true;
                user_1.UserModel.findAll().then(data => {
                    var _a;
                    const users = utils.queryResultToJson(data);
                    if ((_a = users.data) === null || _a === void 0 ? void 0 : _a.length) {
                        for (let i = 0; i < users.data.length; i++) {
                            solved = solved && utils.containsOrEscaped(dataString, users.data[i].email) && utils.contains(dataString, users.data[i].password);
                            if (!solved) {
                                break;
                            }
                        }
                        if (solved) {
                            challengeUtils.solve(challenges.unionSqlInjectionChallenge);
                        }
                    }
                }).catch((error) => {
                    next(error);
                });
            }
            if (challengeUtils.notSolved(challenges.dbSchemaChallenge)) {
                let solved = true;
                models.sequelize.query('SELECT sql FROM sqlite_master').then(([data]) => {
                    var _a;
                    const tableDefinitions = utils.queryResultToJson(data);
                    if ((_a = tableDefinitions.data) === null || _a === void 0 ? void 0 : _a.length) {
                        for (let i = 0; i < tableDefinitions.data.length; i++) {
                            solved = solved && utils.containsOrEscaped(dataString, tableDefinitions.data[i].sql);
                            if (!solved) {
                                break;
                            }
                        }
                        if (solved) {
                            challengeUtils.solve(challenges.dbSchemaChallenge);
                        }
                    }
                });
            } // vuln-code-snippet hide-end
            for (let i = 0; i < products.length; i++) {
                products[i].name = req.__(products[i].name);
                products[i].description = req.__(products[i].description);
            }
            res.json(utils.queryResultToJson(products));
        }).catch((error) => {
            next(error.parent);
        });
    };
};
// vuln-code-snippet end unionSqlInjectionChallenge dbSchemaChallenge
//# sourceMappingURL=search.js.map