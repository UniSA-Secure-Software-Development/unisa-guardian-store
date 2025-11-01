"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeKeyNonUpdatable = void 0;
const { ValidationError, ValidationErrorItem } = require('sequelize/lib/errors');
const makeKeyNonUpdatable = (model, column) => {
    model.addHook('beforeValidate', (instance, options) => {
        if (!options.validate)
            return;
        if (instance.isNewRecord)
            return;
        const changedKeys = [];
        const instanceChanged = Array.from(instance._changed);
        instanceChanged.forEach((value) => changedKeys.push(value));
        if (!changedKeys.length)
            return;
        const validationErrors = [];
        changedKeys.forEach((fieldName) => {
            const fieldDefinition = instance.rawAttributes[fieldName];
            if (instance._previousDataValues[fieldName] !== undefined &&
                instance._previousDataValues[fieldName] !== null &&
                (fieldDefinition.fieldName === column)) {
                validationErrors.push(new ValidationErrorItem(`\`${fieldName}\` cannot be updated due \`noUpdate\` constraint`, 'noUpdate Violation', fieldName));
            }
        });
        if (validationErrors.length) {
            throw new ValidationError(null, validationErrors);
        }
    });
};
exports.makeKeyNonUpdatable = makeKeyNonUpdatable;
//# sourceMappingURL=noUpdate.js.map