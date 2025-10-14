import { body, validationResult, ValidationChain } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const validateRegisterCustomer: ValidationChain[] = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be 2-50 characters"),
  body("phoneNumber")
    .isMobilePhone("any")
    .withMessage("Valid phone number required"),
  body("email")
    .optional()
    .custom(() => {
      throw new Error("Email not allowed for customer registration");
    }),
];

export const validateLoginCustomer: ValidationChain[] = [
  body("phoneNumber")
    .isMobilePhone("any")
    .withMessage("Valid phone number required"),
];

export const validateRegisterStaffAdmin: ValidationChain[] = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be 2-50 characters"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
  body("password")
    .isLength({ min: 6 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must be 6+ chars with uppercase, lowercase, and number"
    ),
  body("phoneNumber")
    .optional()
    .custom(() => {
      throw new Error("Phone number not allowed for staff/admin registration");
    }),
];

export const validateLoginStaffAdmin: ValidationChain[] = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
  body("password").notEmpty().withMessage("Password required"),
];

export const validateVerifyOTP: ValidationChain[] = [
  body("identifier").notEmpty().withMessage("Phone number required"),
  body("otp")
    .isLength({ min: 6, max: 6 })
    .withMessage("Valid 6-digit OTP required"),
];

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
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
