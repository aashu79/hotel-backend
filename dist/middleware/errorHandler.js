"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchAsync = exports.globalErrorHandler = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../types/errors");
const logError = (err, req) => {
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
    console.error("=== ERROR LOG ===");
    console.error(JSON.stringify(errorDetails, null, 2));
    console.error("==================");
};
const handlePrismaError = (err) => {
    switch (err.code) {
        case "P2002":
            return new errors_1.ConflictError("A record with this information already exists");
        case "P2025":
            return new errors_1.NotFoundError("Record not found");
        case "P2003":
            return new errors_1.ValidationError("Invalid reference or foreign key constraint");
        default:
            return new errors_1.DatabaseError("Database operation failed");
    }
};
const handleJWTError = () => {
    return new errors_1.AuthenticationError("Invalid or expired token");
};
const handleMulterError = (err) => {
    if (err.code === "LIMIT_FILE_SIZE") {
        return new errors_1.ValidationError("File too large");
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return new errors_1.ValidationError("Unexpected file field");
    }
    return new errors_1.ValidationError("File upload error");
};
const sendErrorResponse = (err, req, res) => {
    const isDevelopment = process.env.NODE_ENV === "development";
    const errorResponse = {
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
const globalErrorHandler = (err, req, res, next) => {
    let error = err;
    logError(err, req);
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        error = handlePrismaError(err);
    }
    else if (err.name === "JsonWebTokenError" ||
        err.name === "TokenExpiredError") {
        error = handleJWTError();
    }
    else if (err.name === "MulterError") {
        error = handleMulterError(err);
    }
    else if (err.name === "ValidationError") {
        error = new errors_1.ValidationError(err.message);
    }
    else if (err.name === "CastError") {
        error = new errors_1.ValidationError("Invalid data format");
    }
    else if (!(err instanceof errors_1.AppError)) {
        const message = err.message || "Something went wrong";
        error = new errors_1.AppError(message, 500, false);
    }
    sendErrorResponse(error, req, res);
};
exports.globalErrorHandler = globalErrorHandler;
const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
exports.catchAsync = catchAsync;
process.on("unhandledRejection", (err) => {
    console.error("UNHANDLED REJECTION! 💥 Shutting down...");
    console.error(err.name, err.message);
    console.error(err.stack);
    process.exit(1);
});
process.on("uncaughtException", (err) => {
    console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
    console.error(err.name, err.message);
    console.error(err.stack);
    process.exit(1);
});
//# sourceMappingURL=errorHandler.js.map