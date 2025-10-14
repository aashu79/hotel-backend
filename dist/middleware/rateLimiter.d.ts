import { Request, Response, NextFunction } from "express";
export declare const otpRateLimiter: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const loginRateLimiter: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=rateLimiter.d.ts.map