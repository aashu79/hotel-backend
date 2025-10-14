import { Router } from "express";
import {
  createMenuItem,
  getMenuItems,
  updateMenuItem,
  deleteMenuItem,
} from "../controller/menuItemController";
import { requireStaffOrAdmin } from "../middleware/role";
import {
  createMenuItemValidator,
  updateMenuItemValidator,
} from "../middleware/menuItemValidation";
import { upload } from "../middleware/upload";

const router = Router();

router.get("/", getMenuItems);
router.post(
  "/",
  requireStaffOrAdmin,
  upload.single("image"),
  createMenuItemValidator,
  createMenuItem
);
router.put(
  "/:id",
  requireStaffOrAdmin,
  upload.single("image"),
  updateMenuItemValidator,
  updateMenuItem
);
router.delete("/:id", requireStaffOrAdmin, deleteMenuItem);

export default router;
