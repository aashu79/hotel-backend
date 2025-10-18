import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
export declare const createOrder: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getOrders: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=orderController.d.ts.map