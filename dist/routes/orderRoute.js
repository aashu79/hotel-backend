"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controller/orderController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post("/createOrder", auth_1.authenticateToken, orderController_1.createOrder);
router.get("/getOrders", auth_1.authenticateToken, orderController_1.getOrders);
exports.default = router;
//# sourceMappingURL=orderRoute.js.map