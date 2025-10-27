import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  getLocationStaff,
} from "../controller/locationController";

const router = Router();

// Public routes
router.get("/", getAllLocations);
router.get("/:id", getLocationById);

// Protected routes (ADMIN only)
router.post("/", authenticateToken, createLocation);
router.put("/:id", authenticateToken, updateLocation);
router.delete("/:id", authenticateToken, deleteLocation);
router.get("/:id/staff", authenticateToken, getLocationStaff);

export default router;
