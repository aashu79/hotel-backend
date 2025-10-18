"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrders = exports.createOrder = void 0;
const db_1 = __importDefault(require("../config/db"));
const errors_1 = require("../types/errors");
const createOrder = async (req, res) => {
    try {
        const { orderArray, totalAmount } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            throw new errors_1.AuthenticationError("User authentication required");
        }
        if (!orderArray || !Array.isArray(orderArray) || orderArray.length === 0) {
            throw new errors_1.ValidationError("Order items are required");
        }
        if (!totalAmount || totalAmount <= 0) {
            throw new errors_1.ValidationError("Valid total amount is required");
        }
        const orderNumber = `ORD-${Date.now()}-${userId}`;
        const result = await db_1.default.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    userId,
                    totalAmount,
                    orderNumber,
                },
            });
            const orderItems = await Promise.all(orderArray.map(async (item) => {
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
            }));
            return { order, orderItems };
        });
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
    }
    catch (error) {
        console.error("Error creating order:", error);
        throw error;
    }
};
exports.createOrder = createOrder;
const getOrders = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new errors_1.AuthenticationError("User authentication required");
        }
        const orders = await db_1.default.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        menuItem: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });
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
    }
    catch (error) {
        console.error("Error fetching orders:", error);
        throw error;
    }
};
exports.getOrders = getOrders;
//# sourceMappingURL=orderController.js.map