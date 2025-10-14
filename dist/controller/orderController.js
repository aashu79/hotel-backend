"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrders = exports.createOrder = void 0;
const db_1 = __importDefault(require("../config/db"));
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const result = yield db_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Create the order
            const order = yield tx.order.create({
                data: { userId, totalAmount },
            });
            // Create all order items
            const orderItems = yield Promise.all(orderArray.map((item) => __awaiter(void 0, void 0, void 0, function* () {
                const { name, price, quantity, total } = item;
                return yield tx.orderItems.create({
                    data: {
                        orderId: order.id,
                        itemName: name,
                        price,
                        quantity,
                        total
                    },
                });
            })));
            return { order, orderItems };
        }));
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
    }
    catch (error) {
        console.error('Error creating order:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.createOrder = createOrder;
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    try {
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        // Get orders with their items grouped by order ID
        const orders = yield db_1.default.order.findMany({
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
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getOrders = getOrders;
