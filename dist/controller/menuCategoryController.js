"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMenuCategory = exports.updateMenuCategory = exports.getMenuCategories = exports.createMenuCategory = void 0;
const client_1 = require("@prisma/client");
const express_validator_1 = require("express-validator");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const prisma = new client_1.PrismaClient();
const createMenuCategory = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        let imageUrl = undefined;
        if (req.file) {
            const upload = await cloudinary_1.default.uploader.upload(req.file.path, {
                folder: "menu_categories",
            });
            imageUrl = upload.secure_url;
        }
        const { name, description, sortOrder, isActive } = req.body;
        const data = {
            name,
            description,
            sortOrder: sortOrder ? Number(sortOrder) : 0,
            isActive: isActive !== undefined ? Boolean(isActive) : true,
        };
        if (imageUrl)
            data.imageUrl = imageUrl;
        const category = await prisma.menuCategory.create({ data });
        return res.status(201).json(category);
    }
    catch (err) {
        return res.status(500).json({ message: "Server error", error: err });
    }
};
exports.createMenuCategory = createMenuCategory;
const getMenuCategories = async (req, res) => {
    try {
        const categories = await prisma.menuCategory.findMany({
            orderBy: { sortOrder: "asc" },
        });
        return res.json(categories);
    }
    catch (err) {
        return res.status(500).json({ message: "Server error", error: err });
    }
};
exports.getMenuCategories = getMenuCategories;
const updateMenuCategory = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { id } = req.params;
        let imageUrl = undefined;
        if (req.file) {
            const upload = await cloudinary_1.default.uploader.upload(req.file.path, {
                folder: "menu_categories",
            });
            imageUrl = upload.secure_url;
        }
        const { name, description, sortOrder, isActive } = req.body;
        const data = {};
        if (name !== undefined)
            data.name = name;
        if (description !== undefined)
            data.description = description;
        if (sortOrder !== undefined)
            data.sortOrder = Number(sortOrder);
        if (isActive !== undefined)
            data.isActive = Boolean(isActive);
        if (imageUrl)
            data.imageUrl = imageUrl;
        const updated = await prisma.menuCategory.update({
            where: { id: Number(id) },
            data,
        });
        return res.json(updated);
    }
    catch (err) {
        return res.status(500).json({ message: "Server error", error: err });
    }
};
exports.updateMenuCategory = updateMenuCategory;
const deleteMenuCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.menuCategory.delete({ where: { id: Number(id) } });
        return res.json({ message: "Category deleted" });
    }
    catch (err) {
        return res.status(500).json({ message: "Server error", error: err });
    }
};
exports.deleteMenuCategory = deleteMenuCategory;
//# sourceMappingURL=menuCategoryController.js.map