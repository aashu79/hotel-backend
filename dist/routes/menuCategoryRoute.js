"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const menuCategoryController_1 = require("../controller/menuCategoryController");
const role_1 = require("../middleware/role");
const categoryValidation_1 = require("../middleware/categoryValidation");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.get("/", menuCategoryController_1.getMenuCategories);
router.post("/", role_1.requireStaffOrAdmin, upload_1.upload.single("image"), categoryValidation_1.createCategoryValidator, menuCategoryController_1.createMenuCategory);
router.put("/:id", role_1.requireStaffOrAdmin, upload_1.upload.single("image"), categoryValidation_1.updateCategoryValidator, menuCategoryController_1.updateMenuCategory);
router.delete("/:id", role_1.requireStaffOrAdmin, menuCategoryController_1.deleteMenuCategory);
exports.default = router;
//# sourceMappingURL=menuCategoryRoute.js.map