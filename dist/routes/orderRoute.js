"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controller/orderController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post("/createOrder", authMiddleware_1.authMiddleware, orderController_1.createOrder);
router.get("/getOrders", authMiddleware_1.authMiddleware, orderController_1.getOrders);
exports.default = router;
