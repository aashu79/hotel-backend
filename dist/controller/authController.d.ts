import { Request, Response } from "express";
declare class AuthController {
    sendOTPForRegistration(req: Request, res: Response): Promise<void>;
    verifyOTPAndRegister(req: Request, res: Response): Promise<void>;
    sendOTPForLogin(req: Request, res: Response): Promise<void>;
    verifyOTPAndLogin(req: Request, res: Response): Promise<void>;
    registerStaffAdmin(req: Request, res: Response): Promise<void>;
    loginStaffAdmin(req: Request, res: Response): Promise<void>;
    logout(req: Request, res: Response): Promise<void>;
}
declare const _default: AuthController;
export default _default;
//# sourceMappingURL=authController.d.ts.map