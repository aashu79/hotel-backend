import { Response, NextFunction, Request } from "express";
import { PrismaClient } from "@prisma/client";
import cloudinary from "../config/cloudinary";
import { MulterRequest } from "../types/multerRequest";
import { ValidationError, NotFoundError } from "../types/errors";

const prisma = new PrismaClient();

export const createMenuItem = async (
  req: MulterRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
      categoryId,
    } = req.body;

    // Validate required fields
    if (!name || name.trim() === "") {
      throw new ValidationError("Menu item name is required");
    }
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      throw new ValidationError("Valid price is required");
    }
    if (!categoryId || typeof categoryId !== "string") {
      throw new ValidationError("Valid category ID is required");
    }

    // Verify category exists
    const categoryExists = await prisma.menuCategory.findUnique({
      where: { id: categoryId },
    });

    if (!categoryExists) {
      throw new NotFoundError("Category not found");
    }

    const item = await prisma.menuItem.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        price: Number(price),
        isVegetarian: isVegetarian !== undefined ? Boolean(isVegetarian) : true,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
        prepTimeMins: prepTimeMins ? Number(prepTimeMins) : null,
        categoryId: categoryId,
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
  } catch (err) {
    console.error("Error creating menu item:", err);
    next(err);
  }
};

export const getMenuItems = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { categoryId, isVegetarian, isAvailable } = req.query;

    // Build filter conditions
    const where: any = {};
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (isVegetarian !== undefined) {
      where.isVegetarian = isVegetarian === "true";
    }
    if (isAvailable !== undefined) {
      where.isAvailable = isAvailable === "true";
    }

    const items = await prisma.menuItem.findMany({
      where,
      orderBy: { name: "asc" },
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
  } catch (err) {
    console.error("Error fetching menu items:", err);
    next(err);
  }
};

export const getMenuItemById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const item = await prisma.menuItem.findUnique({
      where: { id },
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
      throw new NotFoundError("Menu item not found");
    }

    res.json({
      success: true,
      data: item,
    });
  } catch (err) {
    console.error("Error fetching menu item:", err);
    next(err);
  }
};

export const updateMenuItem = async (
  req: MulterRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if item exists
    const existingItem = await prisma.menuItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      throw new NotFoundError("Menu item not found");
    }

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

    // Build update data
    const data: any = {};
    if (name !== undefined && name.trim() !== "") {
      data.name = name.trim();
    }
    if (description !== undefined) {
      data.description = description?.trim() || null;
    }
    if (price !== undefined) {
      if (isNaN(Number(price)) || Number(price) <= 0) {
        throw new ValidationError("Valid price is required");
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
    // sortOrder removed
    if (categoryId !== undefined) {
      const categoryExists = await prisma.menuCategory.findUnique({
        where: { id: categoryId },
      });
      if (!categoryExists) {
        throw new NotFoundError("Category not found");
      }
      data.categoryId = categoryId;
    }
    if (imageUrl) {
      data.imageUrl = imageUrl;
    }

    const updated = await prisma.menuItem.update({
      where: { id },
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
  } catch (err) {
    console.error("Error updating menu item:", err);
    next(err);
  }
};

export const toggleMenuItemAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const item = await prisma.menuItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundError("Menu item not found");
    }

    const updated = await prisma.menuItem.update({
      where: { id },
      data: { isAvailable: !item.isAvailable },
    });

    res.json({
      success: true,
      message: `Menu item ${
        updated.isAvailable ? "is now available" : "is now unavailable"
      }`,
      data: updated,
    });
  } catch (err) {
    console.error("Error toggling menu item availability:", err);
    next(err);
  }
};

export const toggleMenuItemVegetarian = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const item = await prisma.menuItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundError("Menu item not found");
    }

    const updated = await prisma.menuItem.update({
      where: { id },
      data: { isVegetarian: !item.isVegetarian },
    });

    res.json({
      success: true,
      message: `Menu item marked as ${
        updated.isVegetarian ? "vegetarian" : "non-vegetarian"
      }`,
      data: updated,
    });
  } catch (err) {
    console.error("Error toggling menu item vegetarian status:", err);
    next(err);
  }
};

export const deleteMenuItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const item = await prisma.menuItem.findUnique({
      where: { id },
    });

    if (!item) {
      throw new NotFoundError("Menu item not found");
    }

    await prisma.menuItem.delete({ where: { id } });

    res.json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting menu item:", err);
    next(err);
  }
};
