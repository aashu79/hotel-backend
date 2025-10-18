"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidationErrors = exports.validateVerifyOTP = exports.validateLoginStaffAdmin = exports.validateRegisterStaffAdmin = exports.validateLoginCustomer = exports.validateRegisterCustomer = void 0;
const express_validator_1 = require("express-validator");
const errors_1 = require("../types/errors");
exports.validateRegisterCustomer = [
    (0, express_validator_1.body)("name")
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be 2-50 characters"),
    (0, express_validator_1.body)("phoneNumber")
        .isMobilePhone("any")
        .withMessage("Valid phone number required"),
    (0, express_validator_1.body)("email")
        .optional()
        .custom(() => {
        throw new Error("Email not allowed for customer registration");
    }),
];
exports.validateLoginCustomer = [
    (0, express_validator_1.body)("phoneNumber")
        .isMobilePhone("any")
        .withMessage("Valid phone number required"),
];
exports.validateRegisterStaffAdmin = [
    (0, express_validator_1.body)("name")
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be 2-50 characters"),
    (0, express_validator_1.body)("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    (0, express_validator_1.body)("password")
        .isLength({ min: 6 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("Password must be 6+ chars with uppercase, lowercase, and number"),
    (0, express_validator_1.body)("phoneNumber")
        .optional()
        .custom(() => {
        throw new Error("Phone number not allowed for staff/admin registration");
    }),
];
exports.validateLoginStaffAdmin = [
    (0, express_validator_1.body)("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Password required"),
];
exports.validateVerifyOTP = [
    (0, express_validator_1.body)("identifier").notEmpty().withMessage("Phone number required"),
    (0, express_validator_1.body)("otp")
        .isLength({ min: 6, max: 6 })
        .withMessage("Valid 6-digit OTP required"),
];
const handleValidationErrors = (req, res, next) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors
                .array()
                .map((err) => err.msg)
                .join(", ");
            throw new errors_1.ValidationError(`Validation failed: ${errorMessages}`);
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.handleValidationErrors = handleValidationErrors;
//# sourceMappingURL=validation.js.map