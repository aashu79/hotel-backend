"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidationErrors = exports.validateVerifyOTP = exports.validateLoginStaffAdmin = exports.validateRegisterStaffAdmin = exports.validateLoginCustomer = exports.validateRegisterCustomer = void 0;
const express_validator_1 = require("express-validator");
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
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: errors.array(),
        });
        return;
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
//# sourceMappingURL=validation.js.map