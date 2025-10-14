"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controller/authController");
const router = (0, express_1.Router)();
router.post("/signup", authController_1.Signup);
router.post("/login", authController_1.Login);
router.post("/logout", authController_1.Logout);
exports.default = router;
