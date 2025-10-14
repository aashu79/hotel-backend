import { Response } from "express";
import { MulterRequest } from "../types/multerRequest";
export declare const createMenuItem: (req: MulterRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getMenuItems: (req: MulterRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateMenuItem: (req: MulterRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteMenuItem: (req: MulterRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=menuItemController.d.ts.map