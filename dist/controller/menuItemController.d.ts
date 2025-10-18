import { Response, NextFunction, Request } from "express";
import { MulterRequest } from "../types/multerRequest";
export declare const createMenuItem: (req: MulterRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getMenuItems: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getMenuItemById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateMenuItem: (req: MulterRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const toggleMenuItemAvailability: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const toggleMenuItemVegetarian: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteMenuItem: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=menuItemController.d.ts.map