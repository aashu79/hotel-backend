import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { requireAdmin } from "../middleware/role";
import {
  // Payment Controllers
  getAllPayments,
  getPaymentById,
  getPaymentsByUser,
  getPaymentStats,
  // Sales Controllers
  getAllSales,
  getSaleById,
  getSalesByLocation,
  getSalesStats,
  // Dashboard Metrics Controllers
  getDashboardMetrics,
  getMostSoldItems,
  getRevenueTrends,
  getSalesByCategory,
  getTopCustomers,
  getOrderStatusDistribution,
  getLocationPerformance,
} from "../controller/paymentAndSalesController";

const router = Router();

// ==========================================
// PAYMENT ROUTES
// ==========================================

/**
 * @route   GET /api/admin/payments
 * @desc    Get all payments with filtering and pagination
 * @access  Admin only
 * @query   page, limit, userId, orderId, status, startDate, endDate, search, sortBy, sortOrder
 */
router.get("/payments", authenticateToken, requireAdmin, getAllPayments);

/**
 * @route   GET /api/admin/payments/:id
 * @desc    Get payment by ID with complete details
 * @access  Admin only
 */
router.get("/payments/:id", authenticateToken, requireAdmin, getPaymentById);

/**
 * @route   GET /api/admin/payments/user/:userId
 * @desc    Get all payments for a specific user
 * @access  Admin only
 * @query   page, limit
 */
router.get(
  "/payments/user/:userId",
  authenticateToken,
  requireAdmin,
  getPaymentsByUser
);

/**
 * @route   GET /api/admin/payments/stats
 * @desc    Get payment statistics and metrics
 * @access  Admin only
 * @query   startDate, endDate, locationId
 */
router.get("/payments-stats", authenticateToken, requireAdmin, getPaymentStats);

// ==========================================
// SALES ROUTES
// ==========================================

/**
 * @route   GET /api/admin/sales
 * @desc    Get all sales with filtering and pagination
 * @access  Admin only
 * @query   page, limit, locationId, startDate, endDate, sortBy, sortOrder
 */
router.get("/sales", authenticateToken, requireAdmin, getAllSales);

/**
 * @route   GET /api/admin/sales/:id
 * @desc    Get sale by ID with complete details
 * @access  Admin only
 */
router.get("/sales/:id", authenticateToken, requireAdmin, getSaleById);

/**
 * @route   GET /api/admin/sales/location/:locationId
 * @desc    Get all sales for a specific location
 * @access  Admin only
 * @query   page, limit, startDate, endDate
 */
router.get(
  "/sales/location/:locationId",
  authenticateToken,
  requireAdmin,
  getSalesByLocation
);

/**
 * @route   GET /api/admin/sales/stats
 * @desc    Get sales statistics and metrics
 * @access  Admin only
 * @query   startDate, endDate, locationId
 */
router.get("/sales-stats", authenticateToken, requireAdmin, getSalesStats);

// ==========================================
// DASHBOARD METRICS ROUTES
// ==========================================

/**
 * @route   GET /api/admin/dashboard/metrics
 * @desc    Get comprehensive dashboard metrics (overview)
 * @access  Admin only
 * @query   startDate, endDate, locationId
 */
router.get(
  "/dashboard/metrics",
  authenticateToken,
  requireAdmin,
  getDashboardMetrics
);

/**
 * @route   GET /api/admin/dashboard/most-sold-items
 * @desc    Get most sold menu items
 * @access  Admin only
 * @query   startDate, endDate, locationId, limit
 */
router.get(
  "/dashboard/most-sold-items",
  authenticateToken,
  requireAdmin,
  getMostSoldItems
);

/**
 * @route   GET /api/admin/dashboard/revenue-trends
 * @desc    Get revenue trends over time
 * @access  Admin only
 * @query   startDate, endDate, locationId, groupBy (hour, day, week, month, year)
 */
router.get(
  "/dashboard/revenue-trends",
  authenticateToken,
  requireAdmin,
  getRevenueTrends
);

/**
 * @route   GET /api/admin/dashboard/sales-by-category
 * @desc    Get sales distribution by menu category
 * @access  Admin only
 * @query   startDate, endDate, locationId
 */
router.get(
  "/dashboard/sales-by-category",
  authenticateToken,
  requireAdmin,
  getSalesByCategory
);

/**
 * @route   GET /api/admin/dashboard/top-customers
 * @desc    Get top customers by total spending
 * @access  Admin only
 * @query   startDate, endDate, locationId, limit
 */
router.get(
  "/dashboard/top-customers",
  authenticateToken,
  requireAdmin,
  getTopCustomers
);

/**
 * @route   GET /api/admin/dashboard/order-status-distribution
 * @desc    Get order status distribution
 * @access  Admin only
 * @query   startDate, endDate, locationId
 */
router.get(
  "/dashboard/order-status-distribution",
  authenticateToken,
  requireAdmin,
  getOrderStatusDistribution
);

/**
 * @route   GET /api/admin/dashboard/location-performance
 * @desc    Get performance comparison across all locations
 * @access  Admin only
 * @query   startDate, endDate
 */
router.get(
  "/dashboard/location-performance",
  authenticateToken,
  requireAdmin,
  getLocationPerformance
);

export default router;
