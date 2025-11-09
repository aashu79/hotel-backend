import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoute";
import { authenticateToken } from "./middleware/auth";
import menuCategoryRoute from "./routes/menuCategoryRoute";
import menuItemRoute from "./routes/menuItemRoute";
import orderRoute from "./routes/orderRoute";
import restaurantConfigRoute from "./routes/restaurantConfigRoute";
import locationRoute from "./routes/locationRoute";
import deliveryServiceRoute from "./routes/deliveryServiceRoute";
import paymentRoute from "./routes/paymentRoute";
import stripeWebhookRoute from "./routes/stripeWebhookRoute";
import taxServiceRateRoute from "./routes/taxServiceRateRoute";
import paymentAndSalesRoute from "./routes/paymentAndSalesRoute";
import { globalErrorHandler } from "./middleware/errorHandler";

dotenv.config();

import morgan from "morgan";

const app = express();

// Use morgan for HTTP request logging
if (process.env.NODE_ENV === "production") {
  app.use(
    morgan(":method :url :status :res[content-length] - :response-time ms")
  );
} else {
  app.use(morgan("dev"));
}
const allowedOrigins = [
  process.env.FRONTEND_URL1,
  process.env.FRONTEND_URL2,

  // add more URLs as needed
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
// Body parsing middleware with size limits
// Stripe webhook needs raw body
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
// Trust proxy for accurate IP logging
// app.set("trust proxy", 1);

// Security middleware
app.use(helmet());

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/menu-categories", menuCategoryRoute);
app.use("/api/menu-items", menuItemRoute);
app.use("/api/orders", orderRoute);
app.use("/api/restaurant", restaurantConfigRoute);
app.use("/api/locations", locationRoute);
app.use("/api/delivery-services", deliveryServiceRoute);
app.use("/api/payments", paymentRoute);
app.use("/api/stripe", stripeWebhookRoute);
app.use("/api/tax-service-rates", taxServiceRateRoute);
app.use("/api/admin", paymentAndSalesRoute);

// Protected route example
app.get("/api/protected", authenticateToken, (req: Request, res: Response) => {
  res.json({
    message: "This is a protected route",
    user: req.user,
  });
});

// 404 handler for undefined routes (must be before error handler)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Global error handling middleware (must be last)
app.use(globalErrorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT} in ${
      process.env.NODE_ENV || "development"
    } mode`
  );
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.warn("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated");
  });
});

process.on("SIGINT", () => {
  console.warn("SIGINT received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated");
  });
});

export default app;
