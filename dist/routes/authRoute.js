"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validation_1 = require("../middleware/validation");
const rateLimiter_1 = require("../middleware/rateLimiter");
const authController_1 = __importDefault(require("../controller/authController"));
const router = express_1.default.Router();
router.post("/customer/register/send-otp", rateLimiter_1.otpRateLimiter, validation_1.validateRegisterCustomer, authController_1.default.sendOTPForRegistration);
router.post("/customer/register/verify-otp", validation_1.validateVerifyOTP, authController_1.default.verifyOTPAndRegister);
router.post("/customer/login/send-otp", rateLimiter_1.otpRateLimiter, validation_1.validateLoginCustomer, authController_1.default.sendOTPForLogin);
router.post("/customer/login/verify-otp", validation_1.validateVerifyOTP, authController_1.default.verifyOTPAndLogin);
router.post("/staff/register", validation_1.validateRegisterStaffAdmin, authController_1.default.registerStaffAdmin);
router.post("/staff/login", rateLimiter_1.loginRateLimiter, validation_1.validateLoginStaffAdmin, authController_1.default.loginStaffAdmin);
router.post("/logout", authController_1.default.logout);
exports.default = router;
//# sourceMappingURL=authRoute.js.map