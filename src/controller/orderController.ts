import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import prisma from "../config/db";
import { ValidationError, AuthenticationError } from "../types/errors";

export const createOrder = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { orderArray, totalAmount } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new AuthenticationError("User authentication required");
    }

    if (!orderArray || !Array.isArray(orderArray) || orderArray.length === 0) {
      throw new ValidationError("Order items are required");
    }

    if (!totalAmount || totalAmount <= 0) {
      throw new ValidationError("Valid total amount is required");
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${userId}`;

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          userId,
          totalAmount,
          orderNumber,
        },
      });

      // Create all order items
      const orderItems = await Promise.all(
        orderArray.map(
          async (item: {
            menuItemId: number;
            name: string;
            price: number;
            quantity: number;
            total: number;
          }) => {
            const { menuItemId, price, quantity, total } = item;
            return await tx.orderItem.create({
              data: {
                orderId: order.id,
                menuItemId,
                price,
                quantity,
                total,
              },
            });
          }
        )
      );

      return { order, orderItems };
    });

    // Return the created order with items
    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: {
        orderId: result.order.id,
        orderNumber: result.order.orderNumber,
        orderDate: result.order.createdAt,
        totalAmount: result.order.totalAmount,
        status: result.order.status,
        items: result.orderItems.map((item) => ({
          id: item.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
          total: item.total,
        })),
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

export const getOrders = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AuthenticationError("User authentication required");
    }

    // Get orders with their items grouped by order ID
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Most recent orders first
      },
    });

    // Group orders with their items
    const groupedOrders = orders.map((order) => ({
      orderId: order.id,
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      totalAmount: order.totalAmount,
      status: order.status,
      specialNotes: order.specialNotes,
      items: order.items.map((item) => ({
        id: item.id,
        menuItemId: item.menuItemId,
        menuItemName: item.menuItem.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      })),
    }));

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      orders: groupedOrders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};
