import { Router } from "express";
import {
  createMenuCategory,
  getMenuCategories,
  updateMenuCategory,
  deleteMenuCategory,
} from "../controller/menuCategoryController";
import { requireStaffOrAdmin } from "../middleware/role";
import {
  createCategoryValidator,
  updateCategoryValidator,
} from "../middleware/categoryValidation";
import { upload } from "../middleware/upload";

const router = Router();

router.get("/", getMenuCategories);
router.post(
  "/",
  requireStaffOrAdmin,
  upload.single("image"),
  createCategoryValidator,
  createMenuCategory
);
router.put(
  "/:id",
  requireStaffOrAdmin,
  upload.single("image"),
  updateCategoryValidator,
  updateMenuCategory
);
router.delete("/:id", requireStaffOrAdmin, deleteMenuCategory);

export default router;
