"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrders = exports.createOrder = void 0;
const db_1 = __importDefault(require("../config/db"));
const createOrder = async (req, res) => {
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
        const result = await db_1.default.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: { userId, totalAmount },
            });
            const orderItems = await Promise.all(orderArray.map(async (item) => {
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
            }));
            return { order, orderItems };
        });
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
    }
    catch (error) {
        console.error('Error creating order:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.createOrder = createOrder;
const getOrders = async (req, res) => {
    const userId = req.userId;
    try {
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const orders = await db_1.default.order.findMany({
            where: { userId },
            include: {
                orderItems: true
            },
            orderBy: {
                orderDate: 'desc'
            }
        });
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
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.getOrders = getOrders;
//# sourceMappingURL=orderController.js.map