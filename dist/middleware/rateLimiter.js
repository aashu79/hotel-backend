"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginRateLimiter = exports.otpRateLimiter = void 0;
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const otpLimiter = new rate_limiter_flexible_1.RateLimiterMemory({
    points: 40,
    duration: 60 * 10,
});
const loginLimiter = new rate_limiter_flexible_1.RateLimiterMemory({
    points: 40,
    duration: 60 * 15,
});
const rateLimiterMiddleware = (limiter) => {
    return async (req, res, next) => {
        try {
            await limiter.consume(req.ip || "unknown");
            next();
        }
        catch (rejRes) {
            res.status(429).json({
                success: false,
                message: "Too many requests, please try again later",
            });
        }
    };
};
exports.otpRateLimiter = rateLimiterMiddleware(otpLimiter);
exports.loginRateLimiter = rateLimiterMiddleware(loginLimiter);
//# sourceMappingURL=rateLimiter.js.map