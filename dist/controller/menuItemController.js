"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMenuItem = exports.updateMenuItem = exports.getMenuItems = exports.createMenuItem = void 0;
const client_1 = require("@prisma/client");
const express_validator_1 = require("express-validator");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const prisma = new client_1.PrismaClient();
const createMenuItem = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        let imageUrl = undefined;
        if (req.file) {
            const upload = await cloudinary_1.default.uploader.upload(req.file.path, {
                folder: "menu_items",
            });
            imageUrl = upload.secure_url;
        }
        const { name, description, price, isVegetarian, isAvailable, prepTimeMins, sortOrder, categoryId, } = req.body;
        const data = {
            name,
            description,
            price: Number(price),
            isVegetarian: isVegetarian !== undefined ? Boolean(isVegetarian) : true,
            isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
            prepTimeMins: prepTimeMins ? Number(prepTimeMins) : null,
            sortOrder: sortOrder ? Number(sortOrder) : 0,
            categoryId: Number(categoryId),
        };
        if (imageUrl)
            data.imageUrl = imageUrl;
        const item = await prisma.menuItem.create({ data });
        return res.status(201).json(item);
    }
    catch (err) {
        return res.status(500).json({ message: "Server error", error: err });
    }
};
exports.createMenuItem = createMenuItem;
const getMenuItems = async (req, res) => {
    try {
        const items = await prisma.menuItem.findMany({
            orderBy: { sortOrder: "asc" },
        });
        return res.json(items);
    }
    catch (err) {
        return res.status(500).json({ message: "Server error", error: err });
    }
};
exports.getMenuItems = getMenuItems;
const updateMenuItem = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { id } = req.params;
        let imageUrl = undefined;
        if (req.file) {
            const upload = await cloudinary_1.default.uploader.upload(req.file.path, {
                folder: "menu_items",
            });
            imageUrl = upload.secure_url;
        }
        const { name, description, price, isVegetarian, isAvailable, prepTimeMins, sortOrder, categoryId, } = req.body;
        const data = {};
        if (name !== undefined)
            data.name = name;
        if (description !== undefined)
            data.description = description;
        if (price !== undefined)
            data.price = Number(price);
        if (isVegetarian !== undefined)
            data.isVegetarian = Boolean(isVegetarian);
        if (isAvailable !== undefined)
            data.isAvailable = Boolean(isAvailable);
        if (prepTimeMins !== undefined)
            data.prepTimeMins = Number(prepTimeMins);
        if (sortOrder !== undefined)
            data.sortOrder = Number(sortOrder);
        if (categoryId !== undefined)
            data.categoryId = Number(categoryId);
        if (imageUrl)
            data.imageUrl = imageUrl;
        const updated = await prisma.menuItem.update({
            where: { id: Number(id) },
            data,
        });
        return res.json(updated);
    }
    catch (err) {
        return res.status(500).json({ message: "Server error", error: err });
    }
};
exports.updateMenuItem = updateMenuItem;
const deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.menuItem.delete({ where: { id: Number(id) } });
        return res.json({ message: "Menu item deleted" });
    }
    catch (err) {
        return res.status(500).json({ message: "Server error", error: err });
    }
};
exports.deleteMenuItem = deleteMenuItem;
//# sourceMappingURL=menuItemController.js.map