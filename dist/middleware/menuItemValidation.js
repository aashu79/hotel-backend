"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMenuItemValidator = exports.createMenuItemValidator = void 0;
const express_validator_1 = require("express-validator");
exports.createMenuItemValidator = [
    (0, express_validator_1.body)("name").isString().notEmpty().withMessage("Name is required"),
    (0, express_validator_1.body)("description").optional().isString(),
    (0, express_validator_1.body)("price")
        .isFloat({ gt: 0 })
        .withMessage("Price must be a positive number"),
    (0, express_validator_1.body)("isVegetarian").optional().isBoolean(),
    (0, express_validator_1.body)("isAvailable").optional().isBoolean(),
    (0, express_validator_1.body)("prepTimeMins").optional().isInt({ min: 0 }),
    (0, express_validator_1.body)("sortOrder").optional().isInt(),
    (0, express_validator_1.body)("categoryId").isInt().withMessage("Valid categoryId required"),
];
exports.updateMenuItemValidator = [
    (0, express_validator_1.param)("id").isInt().withMessage("Valid menu item id required"),
    (0, express_validator_1.body)("name").optional().isString(),
    (0, express_validator_1.body)("description").optional().isString(),
    (0, express_validator_1.body)("price").optional().isFloat({ gt: 0 }),
    (0, express_validator_1.body)("isVegetarian").optional().isBoolean(),
    (0, express_validator_1.body)("isAvailable").optional().isBoolean(),
    (0, express_validator_1.body)("prepTimeMins").optional().isInt({ min: 0 }),
    (0, express_validator_1.body)("sortOrder").optional().isInt(),
    (0, express_validator_1.body)("categoryId").optional().isInt(),
];
//# sourceMappingURL=menuItemValidation.js.map