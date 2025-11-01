"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.relationsInit = void 0;
const address_1 = require("./address");
const basket_1 = require("./basket");
const basketitem_1 = require("./basketitem");
const card_1 = require("./card");
const complaint_1 = require("./complaint");
const feedback_1 = require("./feedback");
const imageCaptcha_1 = require("./imageCaptcha");
const memory_1 = require("./memory");
const privacyRequests_1 = require("./privacyRequests");
const product_1 = require("./product");
const quantity_1 = require("./quantity");
const recycle_1 = require("./recycle");
const securityAnswer_1 = require("./securityAnswer");
const securityQuestion_1 = require("./securityQuestion");
const user_1 = require("./user");
const wallet_1 = require("./wallet");
const noUpdate_1 = require("../lib/noUpdate");
const relationsInit = (_sequelize) => {
    address_1.AddressModel.belongsTo(user_1.UserModel, {
        constraints: true,
        foreignKeyConstraint: true,
        foreignKey: {
            name: 'UserId'
        }
    });
    basket_1.BasketModel.belongsTo(user_1.UserModel, {
        constraints: true,
        foreignKeyConstraint: true,
        foreignKey: {
            name: 'UserId'
        }
    });
    basket_1.BasketModel.belongsToMany(product_1.ProductModel, {
        through: basketitem_1.BasketItemModel,
        as: 'Products',
        foreignKey: {
            name: 'BasketId'
        }
    });
    // @ts-expect-error
    (0, noUpdate_1.makeKeyNonUpdatable)(basketitem_1.BasketItemModel, 'BasketId');
    card_1.CardModel.belongsTo(user_1.UserModel, {
        constraints: true,
        foreignKeyConstraint: true,
        foreignKey: {
            name: 'UserId'
        }
    });
    complaint_1.ComplaintModel.belongsTo(user_1.UserModel, {
        constraints: true,
        foreignKeyConstraint: true,
        foreignKey: {
            name: 'UserId'
        }
    });
    feedback_1.FeedbackModel.belongsTo(user_1.UserModel, {
        foreignKey: {
            name: 'UserId'
        }
    }); // no FK constraint to allow anonymous feedback posts
    imageCaptcha_1.ImageCaptchaModel.belongsTo(user_1.UserModel, {
        foreignKey: {
            name: 'UserId'
        }
    });
    memory_1.MemoryModel.belongsTo(user_1.UserModel, {
        constraints: true,
        foreignKeyConstraint: true,
        foreignKey: {
            name: 'UserId'
        }
    });
    privacyRequests_1.PrivacyRequestModel.belongsTo(user_1.UserModel, {
        constraints: true,
        foreignKeyConstraint: true,
        foreignKey: {
            name: 'UserId'
        }
    });
    product_1.ProductModel.belongsToMany(basket_1.BasketModel, {
        through: basketitem_1.BasketItemModel,
        foreignKey: {
            name: 'ProductId'
        }
    });
    // @ts-expect-error
    (0, noUpdate_1.makeKeyNonUpdatable)(basketitem_1.BasketItemModel, 'ProductId');
    quantity_1.QuantityModel.belongsTo(product_1.ProductModel, {
        constraints: true,
        foreignKeyConstraint: true,
        foreignKey: {
            name: 'ProductId'
        }
    });
    recycle_1.RecycleModel.belongsTo(user_1.UserModel, {
        constraints: true,
        foreignKeyConstraint: true,
        foreignKey: {
            name: 'UserId'
        }
    });
    recycle_1.RecycleModel.belongsTo(address_1.AddressModel, {
        constraints: true,
        foreignKeyConstraint: true,
        foreignKey: {
            name: 'AddressId'
        }
    });
    securityAnswer_1.SecurityAnswerModel.belongsTo(user_1.UserModel, {
        foreignKey: {
            name: 'UserId'
        }
    });
    securityAnswer_1.SecurityAnswerModel.belongsTo(securityQuestion_1.SecurityQuestionModel, {
        constraints: true,
        foreignKeyConstraint: true,
        foreignKey: {
            name: 'SecurityQuestionId'
        }
    });
    wallet_1.WalletModel.belongsTo(user_1.UserModel, {
        constraints: true,
        foreignKeyConstraint: true,
        foreignKey: {
            name: 'UserId'
        }
    });
};
exports.relationsInit = relationsInit;
//# sourceMappingURL=relations.js.map