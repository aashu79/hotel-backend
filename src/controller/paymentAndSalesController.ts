import { Request, Response } from "express";
import prisma from "../config/db";
import { AuthenticatedRequest } from "../middleware/auth";

// ==========================================
// PAYMENT CONTROLLERS
// ==========================================

/**
 * Get all payments with filtering and pagination
 */
export const getAllPayments = async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "10",
      userId,
      orderId,
      status,
      startDate,
      endDate,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (orderId) {
      where.orderId = orderId;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    // Search by user phone number, name, or order number
    if (search) {
      where.OR = [
        {
          user: {
            phoneNumber: {
              equals: !isNaN(Number(search))
                ? BigInt(search as string)
                : undefined,
            },
          },
        },
        {
          user: {
            name: {
              contains: search as string,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            email: {
              contains: search as string,
              mode: "insensitive",
            },
          },
        },
        {
          order: {
            orderNumber: {
              contains: search as string,
              mode: "insensitive",
            },
          },
        },
      ];
    }

    // Determine sort field
    const orderBy: any = {};
    if (sortBy === "amount" || sortBy === "createdAt" || sortBy === "status") {
      orderBy[sortBy as string] = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    // Fetch payments with user and order details
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true,
              role: true,
            },
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
              totalAmount: true,
              status: true,
              specialNotes: true,
              createdAt: true,
              location: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  city: true,
                },
              },
              items: {
                include: {
                  menuItem: {
                    select: {
                      id: true,
                      name: true,
                      imageUrl: true,
                      category: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.payment.count({ where }),
    ]);

    // Convert BigInt values to string recursively
    function convertBigIntToString(obj: any): any {
      if (Array.isArray(obj)) {
        return obj.map(convertBigIntToString);
      } else if (obj && typeof obj === "object") {
        return Object.fromEntries(
          Object.entries(obj).map(([key, value]) => [
            key,
            convertBigIntToString(value),
          ])
        );
      } else if (typeof obj === "bigint") {
        return obj.toString();
      }
      return obj;
    }

    res.status(200).json({
      success: true,
      data: convertBigIntToString(payments),
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(Number(total) / limitNum),
        totalItems: Number(total),
        itemsPerPage: limitNum,
      },
    });
  } catch (error: any) {
    console.error("Error fetching payments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payments",
      error: error.message,
    });
  }
};

/**
 * Get payment by ID with complete details
 */
export const getPaymentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            role: true,
          },
        },
        order: {
          include: {
            location: {
              select: {
                id: true,
                name: true,
                address: true,
                city: true,
                state: true,
                phoneNumber: true,
                email: true,
              },
            },
            items: {
              include: {
                menuItem: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    imageUrl: true,
                    category: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Convert BigInt values to string recursively
    function convertBigIntToString(obj: any): any {
      if (Array.isArray(obj)) {
        return obj.map(convertBigIntToString);
      } else if (obj && typeof obj === "object") {
        return Object.fromEntries(
          Object.entries(obj).map(([key, value]) => [
            key,
            convertBigIntToString(value),
          ])
        );
      } else if (typeof obj === "bigint") {
        return obj.toString();
      }
      return obj;
    }

    return res.status(200).json({
      success: true,
      data: convertBigIntToString(payment),
    });
  } catch (error: any) {
    console.error("Error fetching payment:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching payment",
      error: error.message,
    });
  }
};

/**
 * Get payments by user with complete order details
 */
export const getPaymentsByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = "1", limit = "10" } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: { userId },
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true,
            },
          },
          order: {
            include: {
              location: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  city: true,
                },
              },
              items: {
                include: {
                  menuItem: {
                    select: {
                      id: true,
                      name: true,
                      imageUrl: true,
                      category: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.payment.count({ where: { userId } }),
    ]);

    // Convert BigInt values to string recursively
    function convertBigIntToString(obj: any): any {
      if (Array.isArray(obj)) {
        return obj.map(convertBigIntToString);
      } else if (obj && typeof obj === "object") {
        return Object.fromEntries(
          Object.entries(obj).map(([key, value]) => [
            key,
            convertBigIntToString(value),
          ])
        );
      } else if (typeof obj === "bigint") {
        return obj.toString();
      }
      return obj;
    }

    res.status(200).json({
      success: true,
      data: convertBigIntToString(payments),
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(Number(total) / limitNum),
        totalItems: Number(total),
        itemsPerPage: limitNum,
      },
    });
  } catch (error: any) {
    console.error("Error fetching user payments:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user payments",
      error: error.message,
    });
  }
};

/**
 * Get payment statistics/metrics
 */
export const getPaymentStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, locationId } = req.query;

    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    if (locationId) {
      where.order = {
        locationId: locationId as string,
      };
    }

    const [
      totalPayments,
      successfulPayments,
      totalRevenue,
      averageOrderValue,
      paymentsByStatus,
    ] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.count({
        where: { ...where, status: "paid" },
      }),
      prisma.payment.aggregate({
        where: { ...where, status: "paid" },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { ...where, status: "paid" },
        _avg: { amount: true },
      }),
      prisma.payment.groupBy({
        by: ["status"],
        where,
        _count: { id: true },
        _sum: { amount: true },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalPayments,
        successfulPayments,
        failedPayments: totalPayments - successfulPayments,
        totalRevenue: totalRevenue._sum.amount || 0,
        averageOrderValue: averageOrderValue._avg.amount || 0,
        paymentsByStatus: paymentsByStatus.map((item) => ({
          status: item.status,
          count: item._count.id,
          totalAmount: item._sum.amount || 0,
        })),
      },
    });
  } catch (error: any) {
    console.error("Error fetching payment stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching payment statistics",
      error: error.message,
    });
  }
};

// ==========================================
// SALES CONTROLLERS
// ==========================================

/**
 * Get all sales with filtering and pagination
 */
export const getAllSales = async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "10",
      locationId,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    if (locationId) {
      where.order = {
        locationId: locationId as string,
      };
    }

    // Determine sort field
    const orderBy: any = {};
    if (sortBy === "amount" || sortBy === "createdAt") {
      orderBy[sortBy as string] = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    // Fetch sales with order details
    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          order: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phoneNumber: true,
                },
              },
              location: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  city: true,
                  state: true,
                },
              },
              items: {
                include: {
                  menuItem: {
                    select: {
                      id: true,
                      name: true,
                      imageUrl: true,
                      category: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.sale.count({ where }),
    ]);

    // Convert BigInt values to string recursively
    function convertBigIntToString(obj: any): any {
      if (Array.isArray(obj)) {
        return obj.map(convertBigIntToString);
      } else if (obj && typeof obj === "object") {
        return Object.fromEntries(
          Object.entries(obj).map(([key, value]) => [
            key,
            convertBigIntToString(value),
          ])
        );
      } else if (typeof obj === "bigint") {
        return obj.toString();
      }
      return obj;
    }

    res.status(200).json({
      success: true,
      data: convertBigIntToString(sales),
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(Number(total) / limitNum),
        totalItems: Number(total),
        itemsPerPage: limitNum,
      },
    });
  } catch (error: any) {
    console.error("Error fetching sales:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching sales",
      error: error.message,
    });
  }
};

/**
 * Get sale by ID with complete details
 */
export const getSaleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
              },
            },
            location: {
              select: {
                id: true,
                name: true,
                address: true,
                city: true,
                state: true,
                phoneNumber: true,
                email: true,
              },
            },
            items: {
              include: {
                menuItem: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                    imageUrl: true,
                    category: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: sale,
    });
  } catch (error: any) {
    console.error("Error fetching sale:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching sale",
      error: error.message,
    });
  }
};

/**
 * Get sales by location
 */
export const getSalesByLocation = async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;
    const { page = "1", limit = "10", startDate, endDate } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      order: {
        locationId: locationId,
      },
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: "desc" },
        include: {
          order: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phoneNumber: true,
                },
              },
              location: {
                select: {
                  id: true,
                  name: true,
                  address: true,
                  city: true,
                },
              },
              items: {
                include: {
                  menuItem: {
                    select: {
                      id: true,
                      name: true,
                      imageUrl: true,
                      category: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
      prisma.sale.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: sales,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
      },
    });
  } catch (error: any) {
    console.error("Error fetching location sales:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching location sales",
      error: error.message,
    });
  }
};

/**
 * Get sales statistics/metrics
 */
export const getSalesStats = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, locationId } = req.query;

    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    if (locationId) {
      where.order = {
        locationId: locationId as string,
      };
    }

    const [totalSales, totalRevenue, averageSaleValue, salesByLocation] =
      await Promise.all([
        prisma.sale.count({ where }),
        prisma.sale.aggregate({
          where,
          _sum: { amount: true },
        }),
        prisma.sale.aggregate({
          where,
          _avg: { amount: true },
        }),
        prisma.sale.groupBy({
          by: ["orderId"],
          where,
          _sum: { amount: true },
        }),
      ]);

    // Get sales distribution by location
    const salesByLocationData = await prisma.order.groupBy({
      by: ["locationId"],
      where: {
        paid: true,
        ...(startDate || endDate
          ? {
              createdAt: {
                ...(startDate ? { gte: new Date(startDate as string) } : {}),
                ...(endDate ? { lte: new Date(endDate as string) } : {}),
              },
            }
          : {}),
        ...(locationId ? { locationId: locationId as string } : {}),
      },
      _count: { id: true },
      _sum: { totalAmount: true },
    });

    // Get location details
    const locationsData = await Promise.all(
      salesByLocationData.map(async (item) => {
        if (!item.locationId) return null;
        const location = await prisma.location.findUnique({
          where: { id: item.locationId },
          select: { id: true, name: true, city: true },
        });
        return {
          location,
          count: item._count.id,
          totalRevenue: item._sum.totalAmount || 0,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        totalSales,
        totalRevenue: totalRevenue._sum.amount || 0,
        averageSaleValue: averageSaleValue._avg.amount || 0,
        salesByLocation: locationsData.filter((item) => item !== null),
      },
    });
  } catch (error: any) {
    console.error("Error fetching sales stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching sales statistics",
      error: error.message,
    });
  }
};

// ==========================================
// DASHBOARD METRICS CONTROLLERS
// ==========================================

/**
 * Get comprehensive dashboard metrics
 */
export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, locationId } = req.query;

    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        dateFilter.createdAt.lte = new Date(endDate as string);
      }
    }

    const locationFilter = locationId
      ? { locationId: locationId as string }
      : {};

    // Get overall statistics
    const [
      totalRevenue,
      totalOrders,
      totalCustomers,
      averageOrderValue,
      paymentStats,
    ] = await Promise.all([
      prisma.sale.aggregate({
        where: {
          ...dateFilter,
          ...(locationId ? { order: locationFilter } : {}),
        },
        _sum: { amount: true },
      }),
      prisma.order.count({
        where: {
          ...dateFilter,
          ...locationFilter,
          paid: true,
        },
      }),
      prisma.user.count({
        where: {
          role: "CUSTOMER",
          ...(dateFilter.createdAt ? dateFilter : {}),
        },
      }),
      prisma.order.aggregate({
        where: {
          ...dateFilter,
          ...locationFilter,
          paid: true,
        },
        _avg: { totalAmount: true },
      }),
      prisma.payment.groupBy({
        by: ["status"],
        where: {
          ...dateFilter,
          ...(locationId ? { order: locationFilter } : {}),
        },
        _count: { id: true },
        _sum: { amount: true },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalRevenue: totalRevenue._sum.amount || 0,
          totalOrders,
          totalCustomers,
          averageOrderValue: averageOrderValue._avg.totalAmount || 0,
        },
        payments: {
          byStatus: paymentStats.map((stat) => ({
            status: stat.status,
            count: stat._count.id,
            totalAmount: stat._sum.amount || 0,
          })),
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching dashboard metrics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard metrics",
      error: error.message,
    });
  }
};

/**
 * Get most sold items
 */
export const getMostSoldItems = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, locationId, limit = "10" } = req.query;

    const limitNum = parseInt(limit as string);

    const where: any = {};

    if (startDate || endDate) {
      where.order = {
        createdAt: {
          ...(startDate ? { gte: new Date(startDate as string) } : {}),
          ...(endDate ? { lte: new Date(endDate as string) } : {}),
        },
        paid: true,
      };
    } else {
      where.order = { paid: true };
    }

    if (locationId) {
      where.order = {
        ...where.order,
        locationId: locationId as string,
      };
    }

    // Get order items grouped by menu item
    const orderItems = await prisma.orderItem.groupBy({
      by: ["menuItemId"],
      where,
      _sum: {
        quantity: true,
        total: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: limitNum,
    });

    // Get menu item details
    const mostSoldItems = await Promise.all(
      orderItems.map(async (item) => {
        const menuItem = await prisma.menuItem.findUnique({
          where: { id: item.menuItemId },
          include: {
            category: {
              select: {
                name: true,
              },
            },
          },
        });

        return {
          menuItem,
          quantitySold: item._sum.quantity || 0,
          totalRevenue: item._sum.total || 0,
          orderCount: item._count.id,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: mostSoldItems,
    });
  } catch (error: any) {
    console.error("Error fetching most sold items:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching most sold items",
      error: error.message,
    });
  }
};

/**
 * Get revenue trends over time
 */
export const getRevenueTrends = async (req: Request, res: Response) => {
  try {
    const {
      startDate,
      endDate,
      locationId,
      groupBy = "day", // day, week, month, year
    } = req.query;

    const where: any = {
      order: {
        paid: true,
      },
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    if (locationId) {
      where.order = {
        ...where.order,
        locationId: locationId as string,
      };
    }

    // Fetch all sales within the date range
    const sales = await prisma.sale.findMany({
      where,
      select: {
        amount: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Group by specified time period
    const groupedData: { [key: string]: number } = {};

    sales.forEach((sale) => {
      let key: string;
      const date = new Date(sale.createdAt);

      switch (groupBy) {
        case "hour":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(date.getDate()).padStart(2, "0")} ${String(
            date.getHours()
          ).padStart(2, "0")}:00`;
          break;
        case "day":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(date.getDate()).padStart(2, "0")}`;
          break;
        case "week":
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = `${weekStart.getFullYear()}-W${String(
            Math.ceil(weekStart.getDate() / 7)
          ).padStart(2, "0")}`;
          break;
        case "month":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}`;
          break;
        case "year":
          key = `${date.getFullYear()}`;
          break;
        default:
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}-${String(date.getDate()).padStart(2, "0")}`;
      }

      groupedData[key] = (groupedData[key] || 0) + sale.amount;
    });

    // Convert to array format
    const trends = Object.entries(groupedData).map(([period, revenue]) => ({
      period,
      revenue,
    }));

    res.status(200).json({
      success: true,
      data: trends,
    });
  } catch (error: any) {
    console.error("Error fetching revenue trends:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching revenue trends",
      error: error.message,
    });
  }
};

/**
 * Get sales by category
 */
export const getSalesByCategory = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, locationId } = req.query;

    const where: any = {
      order: {
        paid: true,
      },
    };

    if (startDate || endDate) {
      where.order.createdAt = {};
      if (startDate) {
        where.order.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.order.createdAt.lte = new Date(endDate as string);
      }
    }

    if (locationId) {
      where.order.locationId = locationId as string;
    }

    // Get all order items with category info
    const orderItems = await prisma.orderItem.findMany({
      where,
      include: {
        menuItem: {
          include: {
            category: true,
          },
        },
      },
    });

    // Group by category
    const categoryData: {
      [key: string]: {
        categoryId: string;
        categoryName: string;
        totalQuantity: number;
        totalRevenue: number;
        itemCount: number;
      };
    } = {};

    orderItems.forEach((item) => {
      const categoryId = item.menuItem.category.id;
      const categoryName = item.menuItem.category.name;

      if (!categoryData[categoryId]) {
        categoryData[categoryId] = {
          categoryId,
          categoryName,
          totalQuantity: 0,
          totalRevenue: 0,
          itemCount: 0,
        };
      }

      categoryData[categoryId].totalQuantity += item.quantity;
      categoryData[categoryId].totalRevenue += item.total;
      categoryData[categoryId].itemCount += 1;
    });

    const salesByCategory = Object.values(categoryData);

    res.status(200).json({
      success: true,
      data: salesByCategory,
    });
  } catch (error: any) {
    console.error("Error fetching sales by category:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching sales by category",
      error: error.message,
    });
  }
};

/**
 * Get top customers
 */
export const getTopCustomers = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, locationId, limit = "10" } = req.query;

    const limitNum = parseInt(limit as string);

    const where: any = {
      paid: true,
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    if (locationId) {
      where.locationId = locationId as string;
    }

    // Get orders grouped by user
    const orders = await prisma.order.groupBy({
      by: ["userId"],
      where,
      _count: {
        id: true,
      },
      _sum: {
        totalAmount: true,
      },
      orderBy: {
        _sum: {
          totalAmount: "desc",
        },
      },
      take: limitNum,
    });

    // Get user details
    const topCustomers = await Promise.all(
      orders.map(async (order) => {
        const user = await prisma.user.findUnique({
          where: { id: order.userId },
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
          },
        });

        return {
          user,
          orderCount: order._count.id,
          totalSpent: order._sum.totalAmount || 0,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: topCustomers,
    });
  } catch (error: any) {
    console.error("Error fetching top customers:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching top customers",
      error: error.message,
    });
  }
};

/**
 * Get order status distribution
 */
export const getOrderStatusDistribution = async (
  req: Request,
  res: Response
) => {
  try {
    const { startDate, endDate, locationId } = req.query;

    const where: any = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    if (locationId) {
      where.locationId = locationId as string;
    }

    const statusDistribution = await prisma.order.groupBy({
      by: ["status"],
      where,
      _count: {
        id: true,
      },
      _sum: {
        totalAmount: true,
      },
    });

    res.status(200).json({
      success: true,
      data: statusDistribution.map((item) => ({
        status: item.status,
        count: item._count.id,
        totalAmount: item._sum.totalAmount || 0,
      })),
    });
  } catch (error: any) {
    console.error("Error fetching order status distribution:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order status distribution",
      error: error.message,
    });
  }
};

/**
 * Get location performance comparison
 */
export const getLocationPerformance = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {
      paid: true,
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    // Get orders grouped by location
    const locationStats = await prisma.order.groupBy({
      by: ["locationId"],
      where,
      _count: {
        id: true,
      },
      _sum: {
        totalAmount: true,
      },
      _avg: {
        totalAmount: true,
      },
    });

    // Get location details
    const locationPerformance = await Promise.all(
      locationStats.map(async (stat) => {
        if (!stat.locationId) return null;

        const location = await prisma.location.findUnique({
          where: { id: stat.locationId },
          select: {
            id: true,
            name: true,
            city: true,
            address: true,
          },
        });

        return {
          location,
          orderCount: stat._count.id,
          totalRevenue: stat._sum.totalAmount || 0,
          averageOrderValue: stat._avg.totalAmount || 0,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: locationPerformance.filter((item) => item !== null),
    });
  } catch (error: any) {
    console.error("Error fetching location performance:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching location performance",
      error: error.message,
    });
  }
};
