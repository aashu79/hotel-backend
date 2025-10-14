import { Request, Response } from "express";
import prisma from "../config/db";

export const createOrder = async (req: Request, res: Response) => {
  const { orderArray, totalAmount } = req.body;
  const userId = req.userId;
  
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

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: { userId, totalAmount },
      });

      // Create all order items
      const orderItems = await Promise.all(
        orderArray.map(async (item) => {
          const { name, price, quantity, total } = item;
          return await tx.orderItems.create({
            data: { 
              orderId: order.id, 
              itemName: name, 
              price, 
              quantity, 
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
        orderDate: result.order.orderDate,
        totalAmount: result.order.totalAmount,
        items: result.orderItems.map(item => ({
          id: item.id,
          itemName: item.itemName,
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
  const userId = req.userId
  try {
    if(!userId){
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Get orders with their items grouped by order ID
    const orders = await prisma.order.findMany({ 
      where: { userId },
      include: {
        orderItems: true
      },
      orderBy: {
        orderDate: 'desc' // Most recent orders first
      }
    });

    // Group orders with their items
    const groupedOrders = orders.map(order => ({
      orderId: order.id,
      orderDate: order.orderDate,
      totalAmount: order.totalAmount,
      items: order.orderItems.map(item => ({
        id: item.id,
        itemName: item.itemName,
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