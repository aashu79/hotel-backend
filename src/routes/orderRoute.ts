import { Router } from "express";
import { createOrder, getOrders } from "../controller/orderController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/createOrder", authMiddleware, createOrder);
router.get("/getOrders", authMiddleware, getOrders);

export default router;
