import { Response, NextFunction, Request } from "express";
import { PrismaClient } from "@prisma/client";
import { ValidationError, NotFoundError } from "../types/errors";

const prisma = new PrismaClient();

export const createMenuCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, isActive } = req.body;

    // Validate required fields
    if (!name || name.trim() === "") {
      throw new ValidationError("Category name is required");
    }

    const category = await prisma.menuCategory.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Menu category created successfully",
      data: category,
    });
  } catch (err) {
    console.error("Error creating menu category:", err);
    next(err);
  }
};

export const getMenuCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { includeInactive } = req.query;

    const where = includeInactive === "true" ? {} : { isActive: true };

    const categories = await prisma.menuCategory.findMany({
      where,
      orderBy: { name: "asc" },
      include: {
        items: true,
      },
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (err) {
    console.error("Error fetching menu categories:", err);
    next(err);
  }
};

export const getMenuCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await prisma.menuCategory.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!category) {
      throw new NotFoundError("Menu category not found");
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (err) {
    console.error("Error fetching menu category:", err);
    next(err);
  }
};

export const updateMenuCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, sortOrder, isActive } = req.body;

    // Check if category exists
    const existingCategory = await prisma.menuCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundError("Menu category not found");
    }

    // Build update data
    const data: any = {};
    if (name !== undefined && name.trim() !== "") {
      data.name = name.trim();
    }
    if (description !== undefined) {
      data.description = description?.trim() || null;
    }
    // sortOrder removed
    if (isActive !== undefined) {
      data.isActive = Boolean(isActive);
    }

    const updated = await prisma.menuCategory.update({
      where: { id },
      data,
    });

    res.json({
      success: true,
      message: "Menu category updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error("Error updating menu category:", err);
    next(err);
  }
};

export const toggleMenuCategoryStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await prisma.menuCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundError("Menu category not found");
    }

    const updated = await prisma.menuCategory.update({
      where: { id },
      data: { isActive: !category.isActive },
    });

    res.json({
      success: true,
      message: `Category ${
        updated.isActive ? "activated" : "deactivated"
      } successfully`,
      data: updated,
    });
  } catch (err) {
    console.error("Error toggling menu category status:", err);
    next(err);
  }
};

export const deleteMenuCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const category = await prisma.menuCategory.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!category) {
      throw new NotFoundError("Menu category not found");
    }

    if (category.items.length > 0) {
      throw new ValidationError(
        `Cannot delete category with ${category.items.length} menu items. Please delete or reassign the items first.`
      );
    }

    await prisma.menuCategory.delete({ where: { id } });

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting menu category:", err);
    next(err);
  }
};
