"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    var _a;
    try {
        // Debug: Log all cookies
        console.log('All cookies:', req.cookies);
        // Extract token from cookies
        const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.token;
        console.log('Token from cookies:', token ? 'Present' : 'Missing');
        if (!token) {
            console.log('No token found in cookies');
            return res.status(401).json({
                success: false,
                message: "Access token not found in cookies"
            });
        }
        // Debug: Check if JWT secret is available
        const jwtSecret = process.env.MY_SERCET_KEY;
        console.log('JWT Secret available:', jwtSecret ? 'Yes' : 'No');
        // Verify the JWT token
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret || 'your-secret-key');
        console.log('Token decoded successfully, userId:', decoded.userId);
        // Attach only userId to request object
        req.userId = decoded.userId;
        // Continue to the next middleware/route handler
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        console.error('Error details:', error);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};
exports.authMiddleware = authMiddleware;
