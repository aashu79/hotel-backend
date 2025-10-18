"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const menuCategoryController_1 = require("../controller/menuCategoryController");
const auth_1 = require("../middleware/auth");
const categoryValidation_1 = require("../middleware/categoryValidation");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.get("/", menuCategoryController_1.getMenuCategories);
router.get("/:id", menuCategoryController_1.getMenuCategoryById);
router.post("/", auth_1.authenticateToken, (0, auth_1.authorizeRoles)("STAFF", "ADMIN"), categoryValidation_1.createCategoryValidator, validation_1.handleValidationErrors, menuCategoryController_1.createMenuCategory);
router.put("/:id", auth_1.authenticateToken, (0, auth_1.authorizeRoles)("STAFF", "ADMIN"), categoryValidation_1.updateCategoryValidator, validation_1.handleValidationErrors, menuCategoryController_1.updateMenuCategory);
router.patch("/:id/toggle-status", auth_1.authenticateToken, (0, auth_1.authorizeRoles)("STAFF", "ADMIN"), menuCategoryController_1.toggleMenuCategoryStatus);
router.delete("/:id", auth_1.authenticateToken, (0, auth_1.authorizeRoles)("STAFF", "ADMIN"), menuCategoryController_1.deleteMenuCategory);
exports.default = router;
//# sourceMappingURL=menuCategoryRoute.js.map