"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.authenticateToken = void 0;
const jwtService_1 = __importDefault(require("../utils/jwtService"));
const client_1 = require("@prisma/client");
const errors_1 = require("../types/errors");
const prisma = new client_1.PrismaClient();
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) {
            throw new errors_1.AuthenticationError("Access token required");
        }
        const decoded = jwtService_1.default.verifyToken(token);
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
        });
        if (!user) {
            throw new errors_1.AuthenticationError("User not found");
        }
        req.user = {
            id: user.id,
            role: user.role,
        };
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authenticateToken = authenticateToken;
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                throw new errors_1.AuthenticationError("Authentication required");
            }
            if (!roles.includes(req.user.role)) {
                throw new errors_1.AuthorizationError("Insufficient permissions");
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
exports.authorizeRoles = authorizeRoles;
//# sourceMappingURL=auth.js.map