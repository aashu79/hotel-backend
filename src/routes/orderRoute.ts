import { Router } from "express";
import { createOrder, getOrders } from "../controller/orderController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.post("/createOrder", authenticateToken, createOrder);
router.get("/getOrders", authenticateToken, getOrders);

export default router;
