import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  getAllDeliveryServices,
  getDeliveryServicesByLocation,
  getDeliveryServiceById,
  createDeliveryService,
  updateDeliveryService,
  deleteDeliveryService,
} from "../controller/deliveryServiceController";

const router = Router();

// Public routes
router.get("/", getAllDeliveryServices);
router.get("/location/:locationId", getDeliveryServicesByLocation);
router.get("/:id", getDeliveryServiceById);

// Protected routes (ADMIN only)
router.post("/", authenticateToken, createDeliveryService);
router.put("/:id", authenticateToken, updateDeliveryService);
router.delete("/:id", authenticateToken, deleteDeliveryService);

export default router;
