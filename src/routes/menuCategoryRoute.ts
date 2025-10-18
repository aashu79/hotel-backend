import { Router } from "express";
import {
  createMenuCategory,
  getMenuCategories,
  getMenuCategoryById,
  updateMenuCategory,
  toggleMenuCategoryStatus,
  deleteMenuCategory,
} from "../controller/menuCategoryController";
import { authenticateToken, authorizeRoles } from "../middleware/auth";
import {
  createCategoryValidator,
  updateCategoryValidator,
} from "../middleware/categoryValidation";
import { handleValidationErrors } from "../middleware/validation";

const router = Router();

// Public routes
router.get("/", getMenuCategories);
router.get("/:id", getMenuCategoryById);

// Protected routes (Staff & Admin only)
router.post(
  "/",
  authenticateToken,
  authorizeRoles("STAFF", "ADMIN"),
  createCategoryValidator,
  handleValidationErrors,
  createMenuCategory
);

router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("STAFF", "ADMIN"),
  updateCategoryValidator,
  handleValidationErrors,
  updateMenuCategory
);

router.patch(
  "/:id/toggle-status",
  authenticateToken,
  authorizeRoles("STAFF", "ADMIN"),
  toggleMenuCategoryStatus
);

router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("STAFF", "ADMIN"),
  deleteMenuCategory
);

export default router;
