import { Router } from "express";
import {
  createOrder,
  getOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from "../controller/orderController";
import { authenticateToken, authorizeRoles } from "../middleware/auth";

const router = Router();

// Create order
router.post("/", authenticateToken, createOrder);
// Get all orders for logged-in user
router.get(
  "/user/orders",
  authenticateToken,

  getOrders
);
// Get all orders (admin/staff only)
router.get(
  "/all",
  authenticateToken,
  authorizeRoles("STAFF", "ADMIN"),
  getAllOrders
);
// Get order by ID
router.get("/:id", authenticateToken, getOrderById);
// Update order status (admin/staff only)
router.patch("/:id/status", authenticateToken, updateOrderStatus);
// Delete order (owner or admin)
router.delete("/:id", authenticateToken, deleteOrder);

export default router;
