import { Request, Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth";
import prisma from "../config/db";
import {
  ValidationError,
  AuthorizationError,
  NotFoundError,
} from "../types/errors";

// Get all delivery services (optionally filtered by location)
export const getAllDeliveryServices = async (req: Request, res: Response) => {
  try {
    const { locationId, isActive } = req.query;

    const deliveryServices = await prisma.deliveryService.findMany({
      where: {
        // ...(locationId && { locationId: locationId as string }),
        ...(isActive !== undefined && { isActive: isActive === "true" }),
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      deliveryServices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch delivery services",
    });
  }
};

// Get delivery services for a specific location (public)
export const getDeliveryServicesByLocation = async (
  req: Request,
  res: Response
) => {
  try {
    const { locationId } = req.params;

    const deliveryServices = await prisma.deliveryService.findMany({
      where: {
        locationId,
        isActive: true,
      },
    });

    res.json({
      success: true,
      deliveryServices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch delivery services",
    });
  }
};

// Get a single delivery service by ID
export const getDeliveryServiceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deliveryService = await prisma.deliveryService.findUnique({
      where: { id },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            city: true,
            address: true,
          },
        },
      },
    });

    if (!deliveryService) {
      throw new NotFoundError("Delivery service not found");
    }

    res.json({
      success: true,
      deliveryService,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ success: false, message: error.message });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to fetch delivery service",
      });
    }
  }
};

// Create a new delivery service (ADMIN only)
export const createDeliveryService = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      throw new AuthorizationError("Only admins can create delivery services");
    }

    const { name, serviceUrl, locationId, isActive } = req.body;

    if (!name || !serviceUrl || !locationId) {
      throw new ValidationError(
        "Name, service URL, and location ID are required"
      );
    }

    // Verify location exists
    const location = await prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      throw new NotFoundError("Location not found");
    }

    const deliveryService = await prisma.deliveryService.create({
      data: {
        name,
        serviceUrl,
        locationId,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Delivery service created successfully",
      deliveryService,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ success: false, message: error.message });
    } else if (error instanceof NotFoundError) {
      res.status(404).json({ success: false, message: error.message });
    } else if (error instanceof AuthorizationError) {
      res.status(403).json({ success: false, message: error.message });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to create delivery service",
      });
    }
  }
};

// Update a delivery service (ADMIN only)
export const updateDeliveryService = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      throw new AuthorizationError("Only admins can update delivery services");
    }

    const { id } = req.params;
    const { name, serviceUrl, isActive } = req.body;

    const existingService = await prisma.deliveryService.findUnique({
      where: { id },
    });

    if (!existingService) {
      throw new NotFoundError("Delivery service not found");
    }

    const deliveryService = await prisma.deliveryService.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(serviceUrl && { serviceUrl }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: "Delivery service updated successfully",
      deliveryService,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ success: false, message: error.message });
    } else if (error instanceof AuthorizationError) {
      res.status(403).json({ success: false, message: error.message });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update delivery service",
      });
    }
  }
};

// Delete a delivery service (ADMIN only)
export const deleteDeliveryService = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      throw new AuthorizationError("Only admins can delete delivery services");
    }

    const { id } = req.params;

    const deliveryService = await prisma.deliveryService.findUnique({
      where: { id },
    });

    if (!deliveryService) {
      throw new NotFoundError("Delivery service not found");
    }

    await prisma.deliveryService.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Delivery service deleted successfully",
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({ success: false, message: error.message });
    } else if (error instanceof AuthorizationError) {
      res.status(403).json({ success: false, message: error.message });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to delete delivery service",
      });
    }
  }
};
