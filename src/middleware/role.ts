import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";

export function requireStaffOrAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  console.log("User in requireStaffOrAdmin:", user);
  if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.STAFF)) {
    return res
      .status(403)
      .json({ message: "Access denied. Staff or Admin only." });
  }
  return next();
}
