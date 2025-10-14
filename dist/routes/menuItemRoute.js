"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const menuItemController_1 = require("../controller/menuItemController");
const role_1 = require("../middleware/role");
const menuItemValidation_1 = require("../middleware/menuItemValidation");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.get("/", menuItemController_1.getMenuItems);
router.post("/", role_1.requireStaffOrAdmin, upload_1.upload.single("image"), menuItemValidation_1.createMenuItemValidator, menuItemController_1.createMenuItem);
router.put("/:id", role_1.requireStaffOrAdmin, upload_1.upload.single("image"), menuItemValidation_1.updateMenuItemValidator, menuItemController_1.updateMenuItem);
router.delete("/:id", role_1.requireStaffOrAdmin, menuItemController_1.deleteMenuItem);
exports.default = router;
//# sourceMappingURL=menuItemRoute.js.map