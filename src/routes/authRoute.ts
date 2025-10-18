import express, { Router } from "express";
import {
  validateRegisterCustomer,
  validateLoginCustomer,
  validateRegisterStaffAdmin,
  validateLoginStaffAdmin,
  validateVerifyOTP,
  handleValidationErrors,
} from "../middleware/validation";
import { otpRateLimiter, loginRateLimiter } from "../middleware/rateLimiter";
import authController from "../controller/authController";

const router: Router = express.Router();

// CUSTOMER ROUTES
router.post(
  "/customer/register/send-otp",
  otpRateLimiter,
  validateRegisterCustomer,
  handleValidationErrors,
  authController.sendOTPForRegistration
);
router.post(
  "/customer/register/verify-otp",
  validateVerifyOTP,
  handleValidationErrors,
  authController.verifyOTPAndRegister
);

router.post(
  "/customer/login/send-otp",
  otpRateLimiter,
  validateLoginCustomer,
  handleValidationErrors,
  authController.sendOTPForLogin
);
router.post(
  "/customer/login/verify-otp",
  validateVerifyOTP,
  handleValidationErrors,
  authController.verifyOTPAndLogin
);

// STAFF/ADMIN ROUTES
router.post(
  "/staff/register",
  validateRegisterStaffAdmin,
  handleValidationErrors,
  authController.registerStaffAdmin
);
router.post(
  "/staff/login",
  loginRateLimiter,
  validateLoginStaffAdmin,
  handleValidationErrors,
  authController.loginStaffAdmin
);

// LOGOUT (for all roles)
router.post("/logout", authController.logout);

export default router;
