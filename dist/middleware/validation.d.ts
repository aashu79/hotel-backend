import { ValidationChain } from "express-validator";
import { Request, Response, NextFunction } from "express";
export declare const validateRegisterCustomer: ValidationChain[];
export declare const validateLoginCustomer: ValidationChain[];
export declare const validateRegisterStaffAdmin: ValidationChain[];
export declare const validateLoginStaffAdmin: ValidationChain[];
export declare const validateVerifyOTP: ValidationChain[];
export declare const handleValidationErrors: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.d.ts.map