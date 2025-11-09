import { logger } from "../utils/logger";
import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  ExternalServiceError,
} from "../types/errors";

interface ErrorResponse {
  success: boolean;
  message: string;
  error?: string;
  stack?: string;
  timestamp: string;
  path: string;
  method: string;
}

// Log error with detailed information
const logError = (err: Error, req: Request): void => {
  const timestamp = new Date().toISOString();
  const errorDetails = {
    timestamp,
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    body: req.method !== "GET" ? req.body : undefined,
    params: req.params,
    query: req.query,
    headers: {
      authorization: req.headers.authorization ? "[REDACTED]" : undefined,
      "content-type": req.headers["content-type"],
      "user-agent": req.headers["user-agent"],
    },
  };

  logger.error("=== ERROR LOG ===");
  logger.error(JSON.stringify(errorDetails, null, 2));
  logger.error("==================");
};

// Handle Prisma errors
const handlePrismaError = (
  err: Prisma.PrismaClientKnownRequestError
): AppError => {
  switch (err.code) {
    case "P2002":
      return new ConflictError("A record with this information already exists");
    case "P2025":
      return new NotFoundError("Record not found");
    case "P2003":
      return new ValidationError("Invalid reference or foreign key constraint");
    default:
      return new DatabaseError("Database operation failed");
  }
};

// Handle JWT errors
const handleJWTError = (): AppError => {
  return new AuthenticationError("Invalid or expired token");
};

// Handle Multer errors
const handleMulterError = (err: any): AppError => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return new ValidationError("File too large");
  }
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return new ValidationError("Unexpected file field");
  }
  return new ValidationError("File upload error");
};

// Send error response
const sendErrorResponse = (
  err: AppError,
  req: Request,
  res: Response
): void => {
  // In development, include stack trace
  const isDevelopment = process.env.NODE_ENV === "development";

  const errorResponse: ErrorResponse = {
    success: false,
    message: err.message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    ...(isDevelopment && {
      error: err.name,
      stack: err.stack,
    }),
  };

  res.status(err.statusCode).json(errorResponse);
};

// Global error handler middleware
export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let error = err;

  // Log the error
  logError(err, req);

  // Handle specific error types
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    error = handlePrismaError(err);
  } else if (
    err.name === "JsonWebTokenError" ||
    err.name === "TokenExpiredError"
  ) {
    error = handleJWTError();
  } else if (err.name === "MulterError") {
    error = handleMulterError(err);
  } else if (err.name === "ValidationError") {
    error = new ValidationError(err.message);
  } else if (err.name === "CastError") {
    error = new ValidationError("Invalid data format");
  } else if (!(err instanceof AppError)) {
    // Convert unknown errors to AppError
    const message = err.message || "Something went wrong";
    error = new AppError(message, 500, false);
  }

  // Send error response
  sendErrorResponse(error as AppError, req, res);
};

// Async error wrapper
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  logger.error("UNHANDLED REJECTION! 💥 Shutting down...");
  logger.error(`${err.name} ${err.message}`);
  logger.error(err.stack || "No stack trace available");

  // Close server gracefully
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err: Error) => {
  logger.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  logger.error(`${err.name} ${err.message}`);
  logger.error(err.stack || "No stack trace available");

  process.exit(1);
});
