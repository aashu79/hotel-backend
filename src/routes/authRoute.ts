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
import { authenticateToken } from "../middleware/auth";

const router: Router = express.Router();

// PROFILE ROUTE (fetch logged-in user profile)
router.get("/profile", authenticateToken, authController.getProfile);
// Fetch all staff and admin users (STAFF/ADMIN only)
router.get("/users/staff", authenticateToken, authController.getStaffAndAdmins);
// Fetch all customer users (STAFF/ADMIN only)
router.get("/users/customers", authenticateToken, authController.getCustomers);

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
