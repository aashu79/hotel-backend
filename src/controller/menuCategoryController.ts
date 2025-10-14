import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { validationResult } from "express-validator";
import cloudinary from "../config/cloudinary";
import { MulterRequest } from "../types/multerRequest";

const prisma = new PrismaClient();

export const createMenuCategory = async (req: MulterRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    let imageUrl: string | undefined = undefined;
    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "menu_categories",
      });
      imageUrl = upload.secure_url;
    }
    const { name, description, sortOrder, isActive } = req.body;
    const data: any = {
      name,
      description,
      sortOrder: sortOrder ? Number(sortOrder) : 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    };
    if (imageUrl) data.imageUrl = imageUrl;
    const category = await prisma.menuCategory.create({ data });
    return res.status(201).json(category);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err });
  }
};

export const getMenuCategories = async (req: MulterRequest, res: Response) => {
  try {
    const categories = await prisma.menuCategory.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return res.json(categories);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err });
  }
};

export const updateMenuCategory = async (req: MulterRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { id } = req.params;
    let imageUrl: string | undefined = undefined;
    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "menu_categories",
      });
      imageUrl = upload.secure_url;
    }
    const { name, description, sortOrder, isActive } = req.body;
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (sortOrder !== undefined) data.sortOrder = Number(sortOrder);
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    if (imageUrl) data.imageUrl = imageUrl;
    const updated = await prisma.menuCategory.update({
      where: { id: Number(id) },
      data,
    });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err });
  }
};

export const deleteMenuCategory = async (req: MulterRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.menuCategory.delete({ where: { id: Number(id) } });
    return res.json({ message: "Category deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err });
  }
};
