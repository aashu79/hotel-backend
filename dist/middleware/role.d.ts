/// <reference types="cookie-parser" />
import { Request, Response, NextFunction } from "express";
export declare function requireStaffOrAdmin(req: Request, res: Response, next: NextFunction): void | Response<any, Record<string, any>>;
//# sourceMappingURL=role.d.ts.map