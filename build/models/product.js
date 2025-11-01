"use strict";
/*
 * Copyright (c) 2014-2022 Bjoern Kimminich & the OWASP Juice Shop contributors.
 * SPDX-License-Identifier: MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductModelInit = exports.ProductModel = void 0;
/* jslint node: true */
const utils = require("../lib/utils");
const challengeUtils = require("../lib/challengeUtils");
const sequelize_1 = require("sequelize");
const security = require('../lib/insecurity');
const challenges = require('../data/datacache').challenges;
class Product extends sequelize_1.Model {
}
exports.ProductModel = Product;
const ProductModelInit = (sequelize) => {
    Product.init({
        id: {
            type: sequelize_1.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: sequelize_1.DataTypes.STRING,
        description: {
            type: sequelize_1.DataTypes.STRING,
            set(description) {
                if (!utils.disableOnContainerEnv()) {
                    challengeUtils.solveIf(challenges.restfulXssChallenge, () => {
                        return utils.contains(description, '<iframe src="javascript:alert(`xss`)">');
                    });
                }
                else {
                    description = security.sanitizeSecure(description);
                }
                this.setDataValue('description', description);
            }
        },
        price: sequelize_1.DataTypes.DECIMAL,
        deluxePrice: sequelize_1.DataTypes.DECIMAL,
        image: sequelize_1.DataTypes.STRING
    }, {
        tableName: 'Products',
        sequelize,
        paranoid: true
    });
};
exports.ProductModelInit = ProductModelInit;
//# sourceMappingURL=product.js.map