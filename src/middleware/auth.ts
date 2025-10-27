import { Request, Response, NextFunction } from "express";
import JWTService from "../utils/jwtService";
import { PrismaClient } from "@prisma/client";
import { AuthenticationError, AuthorizationError } from "../types/errors";

const prisma = new PrismaClient();

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: "CUSTOMER" | "STAFF" | "ADMIN";
    locationId?: string; // Optional - only for STAFF/ADMIN
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      throw new AuthenticationError("Access token required");
    }

    const decoded = JWTService.verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: String(decoded.id) },
    });

    if (!user) {
      throw new AuthenticationError("User not found");
    }

    req.user = {
      id: user.id as string,
      role: user.role as "CUSTOMER" | "STAFF" | "ADMIN",
      locationId: user.locationId || undefined,
    };
    next();
  } catch (error) {
    next(error);
  }
};

export const authorizeRoles = (
  ...roles: ("CUSTOMER" | "STAFF" | "ADMIN")[]
) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      if (!req.user) {
        throw new AuthenticationError("Authentication required");
      }

      if (!roles.includes(req.user.role)) {
        throw new AuthorizationError("Insufficient permissions");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
