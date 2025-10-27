import { RateLimiterMemory, IRateLimiterRes } from "rate-limiter-flexible";
import { Request, Response, NextFunction } from "express";

const otpLimiter = new RateLimiterMemory({
  points: 40, // requests
  duration: 60 * 10, // seconds (10 minutes)
});

const loginLimiter = new RateLimiterMemory({
  points: 40, // attempts
  duration: 60 * 15, // 15 minutes
});

const rateLimiterMiddleware = (limiter: RateLimiterMemory) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await limiter.consume(req.ip || "unknown");
      next();
    } catch (rejRes: any) {
      res.status(429).json({
        success: false,
        message: "Too many requests, please try again later",
      });
    }
  };
};

export const otpRateLimiter = rateLimiterMiddleware(otpLimiter);
export const loginRateLimiter = rateLimiterMiddleware(loginLimiter);
