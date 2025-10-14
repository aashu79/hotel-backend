import { Request, Response } from "express";
import prisma from "../config/db";

export const createOrder = async (req: Request, res: Response) => {
  const { orderArray, totalAmount } = req.body;
  const userId = req.user?.id;
  
  try {
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!orderArray || !Array.isArray(orderArray) || orderArray.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ message: "Valid total amount is required" });
    }

    const orderNumber = "ORD-" + Date.now();

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: { userId, orderNumber, totalAmount },
      });

      // Create all order items
      const orderItems = await Promise.all(
        orderArray.map(async (item: any) => {
          const { menuItemId, quantity, price, total } = item;
          return await tx.orderItem.create({
            data: { 
              orderId: order.id, 
              menuItemId, 
              quantity, 
              price, 
              total 
            },
          });
        })
      );

      return { order, orderItems };
    });

    // Return the created order with items
    return res.status(201).json({ 
      message: "Order created successfully",
      order: {
        orderId: result.order.id,
        orderDate: result.order.createdAt,
        totalAmount: result.order.totalAmount,
        items: result.orderItems.map((item: any) => ({
          id: item.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        }))
      }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  const userId = req.user?.id
  try {
    if(!userId){
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Get orders with their items grouped by order ID
    const orders = await prisma.order.findMany({ 
      where: { userId },
      include: {
        items: true
      },
      orderBy: {
        createdAt: 'desc' // Most recent orders first
      }
    });

    // Group orders with their items
    const groupedOrders = orders.map(order => ({
      orderId: order.id,
      orderDate: order.createdAt,
      totalAmount: order.totalAmount,
      items: order.items.map((item: any) => ({
        id: item.id,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      }))
    }));

    return res.status(200).json({ 
      message: "Orders fetched successfully", 
      orders: groupedOrders 
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ message: "Internal server error" });
  }
};