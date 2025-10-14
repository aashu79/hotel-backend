import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { validationResult } from "express-validator";
import cloudinary from "../config/cloudinary";
import { MulterRequest } from "../types/multerRequest";

const prisma = new PrismaClient();

export const createMenuItem = async (req: MulterRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    let imageUrl: string | undefined = undefined;
    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "menu_items",
      });
      imageUrl = upload.secure_url;
    }
    const {
      name,
      description,
      price,
      isVegetarian,
      isAvailable,
      prepTimeMins,
      sortOrder,
      categoryId,
    } = req.body;
    const data: any = {
      name,
      description,
      price: Number(price),
      isVegetarian: isVegetarian !== undefined ? Boolean(isVegetarian) : true,
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      prepTimeMins: prepTimeMins ? Number(prepTimeMins) : null,
      sortOrder: sortOrder ? Number(sortOrder) : 0,
      categoryId: Number(categoryId),
    };
    if (imageUrl) data.imageUrl = imageUrl;
    const item = await prisma.menuItem.create({ data });
    return res.status(201).json(item);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err });
  }
};

export const getMenuItems = async (req: MulterRequest, res: Response) => {
  try {
    const items = await prisma.menuItem.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err });
  }
};

export const updateMenuItem = async (req: MulterRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { id } = req.params;
    let imageUrl: string | undefined = undefined;
    if (req.file) {
      const upload = await cloudinary.uploader.upload(req.file.path, {
        folder: "menu_items",
      });
      imageUrl = upload.secure_url;
    }
    const {
      name,
      description,
      price,
      isVegetarian,
      isAvailable,
      prepTimeMins,
      sortOrder,
      categoryId,
    } = req.body;
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (price !== undefined) data.price = Number(price);
    if (isVegetarian !== undefined) data.isVegetarian = Boolean(isVegetarian);
    if (isAvailable !== undefined) data.isAvailable = Boolean(isAvailable);
    if (prepTimeMins !== undefined) data.prepTimeMins = Number(prepTimeMins);
    if (sortOrder !== undefined) data.sortOrder = Number(sortOrder);
    if (categoryId !== undefined) data.categoryId = Number(categoryId);
    if (imageUrl) data.imageUrl = imageUrl;
    const updated = await prisma.menuItem.update({
      where: { id: Number(id) },
      data,
    });
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err });
  }
};

export const deleteMenuItem = async (req: MulterRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.menuItem.delete({ where: { id: Number(id) } });
    return res.json({ message: "Menu item deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Server error", error: err });
  }
};
