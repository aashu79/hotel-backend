"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategoryValidator = exports.createCategoryValidator = void 0;
const express_validator_1 = require("express-validator");
exports.createCategoryValidator = [
    (0, express_validator_1.body)("name").isString().notEmpty().withMessage("Name is required"),
    (0, express_validator_1.body)("description").optional().isString(),
    (0, express_validator_1.body)("sortOrder").optional().isInt(),
    (0, express_validator_1.body)("isActive").optional().isBoolean(),
];
exports.updateCategoryValidator = [
    (0, express_validator_1.param)("id").isInt().withMessage("Valid category id required"),
    (0, express_validator_1.body)("name").optional().isString(),
    (0, express_validator_1.body)("description").optional().isString(),
    (0, express_validator_1.body)("sortOrder").optional().isInt(),
    (0, express_validator_1.body)("isActive").optional().isBoolean(),
];
//# sourceMappingURL=categoryValidation.js.map