"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMenuItem = exports.toggleMenuItemVegetarian = exports.toggleMenuItemAvailability = exports.updateMenuItem = exports.getMenuItemById = exports.getMenuItems = exports.createMenuItem = void 0;
const client_1 = require("@prisma/client");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const errors_1 = require("../types/errors");
const prisma = new client_1.PrismaClient();
const createMenuItem = async (req, res, next) => {
    try {
        let imageUrl = undefined;
        if (req.file) {
            const upload = await cloudinary_1.default.uploader.upload(req.file.path, {
                folder: "menu_items",
            });
            imageUrl = upload.secure_url;
        }
        const { name, description, price, isVegetarian, isAvailable, prepTimeMins, sortOrder, categoryId, } = req.body;
        if (!name || name.trim() === "") {
            throw new errors_1.ValidationError("Menu item name is required");
        }
        if (!price || isNaN(Number(price)) || Number(price) <= 0) {
            throw new errors_1.ValidationError("Valid price is required");
        }
        if (!categoryId || isNaN(Number(categoryId))) {
            throw new errors_1.ValidationError("Valid category ID is required");
        }
        const categoryExists = await prisma.menuCategory.findUnique({
            where: { id: Number(categoryId) },
        });
        if (!categoryExists) {
            throw new errors_1.NotFoundError("Category not found");
        }
        const item = await prisma.menuItem.create({
            data: {
                name: name.trim(),
                description: description?.trim() || null,
                price: Number(price),
                isVegetarian: isVegetarian !== undefined ? Boolean(isVegetarian) : true,
                isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
                prepTimeMins: prepTimeMins ? Number(prepTimeMins) : null,
                sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
                categoryId: Number(categoryId),
                imageUrl: imageUrl || null,
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        res.status(201).json({
            success: true,
            message: "Menu item created successfully",
            data: item,
        });
    }
    catch (err) {
        console.error("Error creating menu item:", err);
        next(err);
    }
};
exports.createMenuItem = createMenuItem;
const getMenuItems = async (req, res, next) => {
    try {
        const { categoryId, isVegetarian, isAvailable } = req.query;
        const where = {};
        if (categoryId) {
            where.categoryId = Number(categoryId);
        }
        if (isVegetarian !== undefined) {
            where.isVegetarian = isVegetarian === "true";
        }
        if (isAvailable !== undefined) {
            where.isAvailable = isAvailable === "true";
        }
        const items = await prisma.menuItem.findMany({
            where,
            orderBy: { sortOrder: "asc" },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        res.json({
            success: true,
            count: items.length,
            data: items,
        });
    }
    catch (err) {
        console.error("Error fetching menu items:", err);
        next(err);
    }
};
exports.getMenuItems = getMenuItems;
const getMenuItemById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const item = await prisma.menuItem.findUnique({
            where: { id: Number(id) },
            include: {
                category: true,
                reviews: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
        if (!item) {
            throw new errors_1.NotFoundError("Menu item not found");
        }
        res.json({
            success: true,
            data: item,
        });
    }
    catch (err) {
        console.error("Error fetching menu item:", err);
        next(err);
    }
};
exports.getMenuItemById = getMenuItemById;
const updateMenuItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const existingItem = await prisma.menuItem.findUnique({
            where: { id: Number(id) },
        });
        if (!existingItem) {
            throw new errors_1.NotFoundError("Menu item not found");
        }
        let imageUrl = undefined;
        if (req.file) {
            const upload = await cloudinary_1.default.uploader.upload(req.file.path, {
                folder: "menu_items",
            });
            imageUrl = upload.secure_url;
        }
        const { name, description, price, isVegetarian, isAvailable, prepTimeMins, sortOrder, categoryId, } = req.body;
        const data = {};
        if (name !== undefined && name.trim() !== "") {
            data.name = name.trim();
        }
        if (description !== undefined) {
            data.description = description?.trim() || null;
        }
        if (price !== undefined) {
            if (isNaN(Number(price)) || Number(price) <= 0) {
                throw new errors_1.ValidationError("Valid price is required");
            }
            data.price = Number(price);
        }
        if (isVegetarian !== undefined) {
            data.isVegetarian = Boolean(isVegetarian);
        }
        if (isAvailable !== undefined) {
            data.isAvailable = Boolean(isAvailable);
        }
        if (prepTimeMins !== undefined) {
            data.prepTimeMins = prepTimeMins ? Number(prepTimeMins) : null;
        }
        if (sortOrder !== undefined) {
            data.sortOrder = Number(sortOrder);
        }
        if (categoryId !== undefined) {
            const categoryExists = await prisma.menuCategory.findUnique({
                where: { id: Number(categoryId) },
            });
            if (!categoryExists) {
                throw new errors_1.NotFoundError("Category not found");
            }
            data.categoryId = Number(categoryId);
        }
        if (imageUrl) {
            data.imageUrl = imageUrl;
        }
        const updated = await prisma.menuItem.update({
            where: { id: Number(id) },
            data,
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        res.json({
            success: true,
            message: "Menu item updated successfully",
            data: updated,
        });
    }
    catch (err) {
        console.error("Error updating menu item:", err);
        next(err);
    }
};
exports.updateMenuItem = updateMenuItem;
const toggleMenuItemAvailability = async (req, res, next) => {
    try {
        const { id } = req.params;
        const item = await prisma.menuItem.findUnique({
            where: { id: Number(id) },
        });
        if (!item) {
            throw new errors_1.NotFoundError("Menu item not found");
        }
        const updated = await prisma.menuItem.update({
            where: { id: Number(id) },
            data: { isAvailable: !item.isAvailable },
        });
        res.json({
            success: true,
            message: `Menu item ${updated.isAvailable ? "is now available" : "is now unavailable"}`,
            data: updated,
        });
    }
    catch (err) {
        console.error("Error toggling menu item availability:", err);
        next(err);
    }
};
exports.toggleMenuItemAvailability = toggleMenuItemAvailability;
const toggleMenuItemVegetarian = async (req, res, next) => {
    try {
        const { id } = req.params;
        const item = await prisma.menuItem.findUnique({
            where: { id: Number(id) },
        });
        if (!item) {
            throw new errors_1.NotFoundError("Menu item not found");
        }
        const updated = await prisma.menuItem.update({
            where: { id: Number(id) },
            data: { isVegetarian: !item.isVegetarian },
        });
        res.json({
            success: true,
            message: `Menu item marked as ${updated.isVegetarian ? "vegetarian" : "non-vegetarian"}`,
            data: updated,
        });
    }
    catch (err) {
        console.error("Error toggling menu item vegetarian status:", err);
        next(err);
    }
};
exports.toggleMenuItemVegetarian = toggleMenuItemVegetarian;
const deleteMenuItem = async (req, res, next) => {
    try {
        const { id } = req.params;
        const item = await prisma.menuItem.findUnique({
            where: { id: Number(id) },
        });
        if (!item) {
            throw new errors_1.NotFoundError("Menu item not found");
        }
        await prisma.menuItem.delete({ where: { id: Number(id) } });
        res.json({
            success: true,
            message: "Menu item deleted successfully",
        });
    }
    catch (err) {
        console.error("Error deleting menu item:", err);
        next(err);
    }
};
exports.deleteMenuItem = deleteMenuItem;
//# sourceMappingURL=menuItemController.js.map