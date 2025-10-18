"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireStaffOrAdmin = void 0;
const client_1 = require("@prisma/client");
function requireStaffOrAdmin(req, res, next) {
    const user = req.user;
    console.log("User in requireStaffOrAdmin:", user);
    if (!user || (user.role !== client_1.UserRole.ADMIN && user.role !== client_1.UserRole.STAFF)) {
        return res
            .status(403)
            .json({ message: "Access denied. Staff or Admin only." });
    }
    return next();
}
exports.requireStaffOrAdmin = requireStaffOrAdmin;
//# sourceMappingURL=role.js.map