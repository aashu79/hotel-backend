"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMenuCategory = exports.toggleMenuCategoryStatus = exports.updateMenuCategory = exports.getMenuCategoryById = exports.getMenuCategories = exports.createMenuCategory = void 0;
const client_1 = require("@prisma/client");
const errors_1 = require("../types/errors");
const prisma = new client_1.PrismaClient();
const createMenuCategory = async (req, res, next) => {
    try {
        const { name, description, sortOrder, isActive } = req.body;
        if (!name || name.trim() === "") {
            throw new errors_1.ValidationError("Category name is required");
        }
        const category = await prisma.menuCategory.create({
            data: {
                name: name.trim(),
                description: description?.trim() || null,
                sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
                isActive: isActive !== undefined ? Boolean(isActive) : true,
            },
        });
        res.status(201).json({
            success: true,
            message: "Menu category created successfully",
            data: category,
        });
    }
    catch (err) {
        console.error("Error creating menu category:", err);
        next(err);
    }
};
exports.createMenuCategory = createMenuCategory;
const getMenuCategories = async (req, res, next) => {
    try {
        const { includeInactive } = req.query;
        const where = includeInactive === "true" ? {} : { isActive: true };
        const categories = await prisma.menuCategory.findMany({
            where,
            orderBy: { sortOrder: "asc" },
            include: {
                _count: {
                    select: { items: true },
                },
            },
        });
        res.json({
            success: true,
            data: categories,
        });
    }
    catch (err) {
        console.error("Error fetching menu categories:", err);
        next(err);
    }
};
exports.getMenuCategories = getMenuCategories;
const getMenuCategoryById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await prisma.menuCategory.findUnique({
            where: { id: Number(id) },
            include: {
                items: {
                    orderBy: { sortOrder: "asc" },
                },
            },
        });
        if (!category) {
            throw new errors_1.NotFoundError("Menu category not found");
        }
        res.json({
            success: true,
            data: category,
        });
    }
    catch (err) {
        console.error("Error fetching menu category:", err);
        next(err);
    }
};
exports.getMenuCategoryById = getMenuCategoryById;
const updateMenuCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, sortOrder, isActive } = req.body;
        const existingCategory = await prisma.menuCategory.findUnique({
            where: { id: Number(id) },
        });
        if (!existingCategory) {
            throw new errors_1.NotFoundError("Menu category not found");
        }
        const data = {};
        if (name !== undefined && name.trim() !== "") {
            data.name = name.trim();
        }
        if (description !== undefined) {
            data.description = description?.trim() || null;
        }
        if (sortOrder !== undefined) {
            data.sortOrder = Number(sortOrder);
        }
        if (isActive !== undefined) {
            data.isActive = Boolean(isActive);
        }
        const updated = await prisma.menuCategory.update({
            where: { id: Number(id) },
            data,
        });
        res.json({
            success: true,
            message: "Menu category updated successfully",
            data: updated,
        });
    }
    catch (err) {
        console.error("Error updating menu category:", err);
        next(err);
    }
};
exports.updateMenuCategory = updateMenuCategory;
const toggleMenuCategoryStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await prisma.menuCategory.findUnique({
            where: { id: Number(id) },
        });
        if (!category) {
            throw new errors_1.NotFoundError("Menu category not found");
        }
        const updated = await prisma.menuCategory.update({
            where: { id: Number(id) },
            data: { isActive: !category.isActive },
        });
        res.json({
            success: true,
            message: `Category ${updated.isActive ? "activated" : "deactivated"} successfully`,
            data: updated,
        });
    }
    catch (err) {
        console.error("Error toggling menu category status:", err);
        next(err);
    }
};
exports.toggleMenuCategoryStatus = toggleMenuCategoryStatus;
const deleteMenuCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await prisma.menuCategory.findUnique({
            where: { id: Number(id) },
            include: {
                _count: {
                    select: { items: true },
                },
            },
        });
        if (!category) {
            throw new errors_1.NotFoundError("Menu category not found");
        }
        if (category._count.items > 0) {
            throw new errors_1.ValidationError(`Cannot delete category with ${category._count.items} menu items. Please delete or reassign the items first.`);
        }
        await prisma.menuCategory.delete({ where: { id: Number(id) } });
        res.json({
            success: true,
            message: "Category deleted successfully",
        });
    }
    catch (err) {
        console.error("Error deleting menu category:", err);
        next(err);
    }
};
exports.deleteMenuCategory = deleteMenuCategory;
//# sourceMappingURL=menuCategoryController.js.map