import express, { Router } from "express";
import {
  validateRegisterCustomer,
  validateLoginCustomer,
  validateRegisterStaffAdmin,
  validateLoginStaffAdmin,
  validateVerifyOTP,
} from "../middleware/validation";
import { otpRateLimiter, loginRateLimiter } from "../middleware/rateLimiter";
import authController from "../controller/authController";

const router: Router = express.Router();

// CUSTOMER ROUTES
router.post(
  "/customer/register/send-otp",
  otpRateLimiter,
  validateRegisterCustomer,
  authController.sendOTPForRegistration
);
router.post(
  "/customer/register/verify-otp",
  validateVerifyOTP,
  authController.verifyOTPAndRegister
);

router.post(
  "/customer/login/send-otp",
  otpRateLimiter,
  validateLoginCustomer,
  authController.sendOTPForLogin
);
router.post(
  "/customer/login/verify-otp",
  validateVerifyOTP,
  authController.verifyOTPAndLogin
);

// STAFF/ADMIN ROUTES
router.post(
  "/staff/register",
  validateRegisterStaffAdmin,
  authController.registerStaffAdmin
);
router.post(
  "/staff/login",
  loginRateLimiter,
  validateLoginStaffAdmin,
  authController.loginStaffAdmin
);

// LOGOUT (for all roles)
router.post("/logout", authController.logout);

export default router;
