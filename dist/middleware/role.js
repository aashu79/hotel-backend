"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireStaffOrAdmin = requireStaffOrAdmin;
const client_1 = require("@prisma/client");
function requireStaffOrAdmin(req, res, next) {
    const user = req.user;
    if (!user || (user.role !== client_1.UserRole.ADMIN && user.role !== client_1.UserRole.STAFF)) {
        return res
            .status(403)
            .json({ message: "Access denied. Staff or Admin only." });
    }
    return next();
}
//# sourceMappingURL=role.js.map