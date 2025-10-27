import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import prisma from "../config/db";
import {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
} from "../types/errors";

// Create a new order
export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { items, totalAmount, specialNotes, locationId } = req.body;
    const userId = req.user?.id;
    if (!userId) throw new AuthenticationError("User authentication required");
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ValidationError("Order items are required");
    }
    if (!totalAmount || typeof totalAmount !== "number" || totalAmount <= 0) {
      throw new ValidationError("Valid total amount is required");
    }
    if (!locationId) {
      throw new ValidationError("Location ID is required");
    }
    // Validate each item
    for (const item of items) {
      if (!item.menuItemId || typeof item.menuItemId !== "string") {
        throw new ValidationError(
          "Each item must have a valid menuItemId (string UUID)"
        );
      }
      if (
        !item.quantity ||
        typeof item.quantity !== "number" ||
        item.quantity <= 0
      ) {
        throw new ValidationError("Each item must have a valid quantity");
      }
    }
    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${userId}`;
    // Transaction: create order and items
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: userId,
          totalAmount,
          orderNumber,
          specialNotes,
          locationId,
        },
      });
      const orderItems = await Promise.all(
        items.map(async (item: { menuItemId: string; quantity: number }) => {
          // Fetch menu item price from DB
          const menuItem = await tx.menuItem.findUnique({
            where: { id: item.menuItemId },
            select: { price: true },
          });
          if (!menuItem) {
            throw new ValidationError(
              `Menu item not found: ${item.menuItemId}`
            );
          }
          const price = menuItem.price;
          const total = price * item.quantity;
          return await tx.orderItem.create({
            data: {
              orderId: order.id,
              menuItemId: item.menuItemId,
              price,
              quantity: item.quantity,
              total,
            },
          });
        })
      );
      return { order, orderItems };
    });
    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: {
        ...result.order,
        items: result.orderItems,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ success: false, message });
  }
};

// Get all orders for the logged-in user
export const getOrders = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AuthenticationError("User authentication required");
    const orders = await prisma.order.findMany({
      where: { userId: userId },
      include: {
        items: { include: { menuItem: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null && "message" in error
        ? (error as any).message
        : "Unknown error";
    res.status(400).json({ success: false, message });
  }
};

// Get all orders (admin/staff only)
export const getAllOrders = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const userLocationId = req.user?.locationId;

    if (!userId) throw new AuthenticationError("User authentication required");
    if (userRole !== "ADMIN" && userRole !== "STAFF") {
      throw new AuthorizationError(
        "Access denied: Admin or Staff role required"
      );
    }

    // Build the where clause based on role
    const whereClause: any = {};

    // Staff can only see orders from their assigned location
    if (userRole === "STAFF" && userLocationId) {
      whereClause.locationId = userLocationId;
    }
    // Admin can see all orders (no location filter)
    // Or if locationId query param is provided, filter by it
    const { locationId } = req.query;
    if (userRole === "ADMIN" && locationId) {
      whereClause.locationId = locationId as string;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
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
            city: true,
          },
        },
        items: { include: { menuItem: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Convert BigInt phoneNumber to string for JSON serialization
    const serializedOrders = orders.map((order) => ({
      ...order,
      user: {
        ...order.user,
        phoneNumber: order.user.phoneNumber
          ? order.user.phoneNumber.toString()
          : null,
      },
    }));

    res.status(200).json({ success: true, orders: serializedOrders });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null && "message" in error
        ? (error as any).message
        : "Unknown error";
    res.status(400).json({ success: false, message });
  }
};

// Get a single order by ID (only for the owner or admin/staff)
export const getOrderById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (!id) throw new ValidationError("Order ID required");
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { menuItem: true } } },
    });
    if (!order) throw new ValidationError("Order not found");
    if (
      order.userId !== userId &&
      userRole !== "ADMIN" &&
      userRole !== "STAFF"
    ) {
      throw new AuthorizationError("Not authorized to view this order");
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ success: false, message });
  }
};

// Update order status (admin/staff only)
export const updateOrderStatus = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userRole = req.user?.role;
    if (!id) throw new ValidationError("Order ID required");
    if (!status) throw new ValidationError("Order status required");

    // Validate status against allowed enum values
    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "READY",
      "COMPLETED",
      "CANCELLED",
    ];
    if (!validStatuses.includes(status)) {
      throw new ValidationError(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    if (userRole !== "ADMIN" && userRole !== "STAFF") {
      throw new AuthorizationError("Not authorized to update order status");
    }
    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });
    res.status(200).json({ success: true, order });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ success: false, message });
  }
};

// Delete an order (only by owner or admin)
export const deleteOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    if (!id) throw new ValidationError("Order ID required");
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new ValidationError("Order not found");
    if (order.userId !== userId && userRole !== "ADMIN") {
      throw new AuthorizationError("Not authorized to delete this order");
    }
    await prisma.order.delete({ where: { id } });
    res.status(200).json({ success: true, message: "Order deleted" });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : typeof error === "object" && error !== null && "message" in error
        ? (error as any).message
        : "Unknown error";
    res.status(400).json({ success: false, message });
  }
};
