import { Router } from "express";
import {
  createMenuItem,
  getMenuItems,
  getMenuItemById,
  updateMenuItem,
  toggleMenuItemAvailability,
  toggleMenuItemVegetarian,
  deleteMenuItem,
} from "../controller/menuItemController";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import {
  createMenuItemValidator,
  updateMenuItemValidator,
} from "../middleware/menuItemValidation";
import { handleValidationErrors } from "../middleware/validation";
import { upload } from "../middleware/upload";

const router = Router();

// Public routes
router.get("/", getMenuItems);
router.get("/:id", getMenuItemById);

// Protected routes (Staff & Admin only)
router.post(
  "/",
  authenticateToken,
  authorizeRoles("STAFF", "ADMIN"),
  upload.single("image"),
  createMenuItemValidator,
  handleValidationErrors,
  createMenuItem
);

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("STAFF", "ADMIN"),
  upload.single("image"),
  updateMenuItemValidator,
  handleValidationErrors,
  updateMenuItem
);

router.patch(
  "/:id/toggle-availability",
  authenticateToken,
  authorizeRoles("STAFF", "ADMIN"),
  toggleMenuItemAvailability
);

router.patch(
  "/:id/toggle-vegetarian",
  authenticateToken,
  authorizeRoles("STAFF", "ADMIN"),
  toggleMenuItemVegetarian
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("STAFF", "ADMIN"),
  deleteMenuItem
);

export default router;
