"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const menuItemController_1 = require("../controller/menuItemController");
const auth_1 = require("../middleware/auth");
const menuItemValidation_1 = require("../middleware/menuItemValidation");
const validation_1 = require("../middleware/validation");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.get("/", menuItemController_1.getMenuItems);
router.get("/:id", menuItemController_1.getMenuItemById);
router.post("/", auth_1.authenticateToken, (0, auth_1.authorizeRoles)("STAFF", "ADMIN"), upload_1.upload.single("image"), menuItemValidation_1.createMenuItemValidator, validation_1.handleValidationErrors, menuItemController_1.createMenuItem);
router.put("/:id", auth_1.authenticateToken, (0, auth_1.authorizeRoles)("STAFF", "ADMIN"), upload_1.upload.single("image"), menuItemValidation_1.updateMenuItemValidator, validation_1.handleValidationErrors, menuItemController_1.updateMenuItem);
router.patch("/:id/toggle-availability", auth_1.authenticateToken, (0, auth_1.authorizeRoles)("STAFF", "ADMIN"), menuItemController_1.toggleMenuItemAvailability);
router.patch("/:id/toggle-vegetarian", auth_1.authenticateToken, (0, auth_1.authorizeRoles)("STAFF", "ADMIN"), menuItemController_1.toggleMenuItemVegetarian);
router.delete("/:id", auth_1.authenticateToken, (0, auth_1.authorizeRoles)("STAFF", "ADMIN"), menuItemController_1.deleteMenuItem);
exports.default = router;
//# sourceMappingURL=menuItemRoute.js.map