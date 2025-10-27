import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import prisma from "../config/db";
import {
  ValidationError,
  AuthorizationError,
  NotFoundError,
} from "../types/errors";

// Get all locations (public)
export const getAllLocations = async (req: Request, res: Response) => {
  try {
    const { isActive } = req.query;

    const locations = await prisma.location.findMany({
      where: isActive !== undefined ? { isActive: isActive === "true" } : {},
      include: {
        _count: {
          select: {
            staff: true,
            orders: true,
            deliveryServices: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      locations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch locations",
    });
  }
};

// Get a single location by ID (public)
export const getLocationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        deliveryServices: {
          where: { isActive: true },
        },
        _count: {
          select: {
            staff: true,
            orders: true,
          },
        },
      },
    });

    if (!location) {
      throw new NotFoundError("Location not found");
    }

    res.json({
      success: true,
      location,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ success: false, message: error.message });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to fetch location",
      });
    }
  }
};

// Create a new location (ADMIN only)
export const createLocation = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      throw new AuthorizationError("Only admins can create locations");
    }

    const {
      name,
      address,
      city,
      state,
      country,
      postalCode,
      phoneNumber,
      email,
      openingHours,
      imageUrl,
      isActive,
    } = req.body;

    if (!name || !address || !city) {
      throw new ValidationError("Name, address, and city are required");
    }

    const location = await prisma.location.create({
      data: {
        name,
        address,
        city,
        state,
        country: country || "India",
        postalCode,
        phoneNumber,
        email,
        openingHours,
        imageUrl,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Location created successfully",
      location,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ success: false, message: error.message });
    } else if (error instanceof AuthorizationError) {
      res.status(403).json({ success: false, message: error.message });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to create location",
      });
    }
  }
};

// Update a location (ADMIN only)
export const updateLocation = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      throw new AuthorizationError("Only admins can update locations");
    }

    const { id } = req.params;
    const {
      name,
      address,
      city,
      state,
      country,
      postalCode,
      phoneNumber,
      email,
      openingHours,
      imageUrl,
      isActive,
    } = req.body;

    const existingLocation = await prisma.location.findUnique({
      where: { id },
    });

    if (!existingLocation) {
      throw new NotFoundError("Location not found");
    }

    const location = await prisma.location.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(address && { address }),
        ...(city && { city }),
        ...(state !== undefined && { state }),
        ...(country && { country }),
        ...(postalCode !== undefined && { postalCode }),
        ...(phoneNumber !== undefined && { phoneNumber }),
        ...(email !== undefined && { email }),
        ...(openingHours !== undefined && { openingHours }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({
      success: true,
      message: "Location updated successfully",
      location,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ success: false, message: error.message });
    } else if (error instanceof AuthorizationError) {
      res.status(403).json({ success: false, message: error.message });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update location",
      });
    }
  }
};

// Delete a location (ADMIN only)
export const deleteLocation = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      throw new AuthorizationError("Only admins can delete locations");
    }

    const { id } = req.params;

    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        _count: {
          select: { staff: true, orders: true },
        },
      },
    });

    if (!location) {
      throw new NotFoundError("Location not found");
    }

    // Check if location has associated staff or orders
    if (location._count.staff > 0 || location._count.orders > 0) {
      throw new ValidationError(
        "Cannot delete location with associated staff or orders. Consider deactivating it instead."
      );
    }

    await prisma.location.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Location deleted successfully",
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ success: false, message: error.message });
    } else if (error instanceof ValidationError) {
      res.status(400).json({ success: false, message: error.message });
    } else if (error instanceof AuthorizationError) {
      res.status(403).json({ success: false, message: error.message });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to delete location",
      });
    }
  }
};

// Get staff for a location (ADMIN only)
export const getLocationStaff = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      throw new AuthorizationError("Only admins can view location staff");
    }

    const { id } = req.params;

    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        staff: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    if (!location) {
      throw new NotFoundError("Location not found");
    }

    res.json({
      success: true,
      location: location.name,
      staff: location.staff.map((s) => ({
        ...s,
        phoneNumber: s.phoneNumber ? s.phoneNumber.toString() : null,
      })),
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ success: false, message: error.message });
    } else if (error instanceof AuthorizationError) {
      res.status(403).json({ success: false, message: error.message });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to fetch location staff",
      });
    }
  }
};
