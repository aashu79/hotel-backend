import { Request, Response } from "express";
import prisma from "../config/db";

// Get restaurant config (singleton)
export const getRestaurantConfig = async (_req: Request, res: Response) => {
  const config = await prisma.restaurantConfig.findFirst();
  if (!config)
    return res
      .status(404)
      .json({ success: false, message: "Config not found" });
  return res.json({ success: true, config });
};

// Update all restaurant config fields
export const updateRestaurantConfig = async (req: Request, res: Response) => {
  const data = req.body;
  try {
    const config = await prisma.restaurantConfig.findFirst();
    if (!config)
      return res
        .status(404)
        .json({ success: false, message: "Config not found" });
    const updated = await prisma.restaurantConfig.update({
      where: { id: config.id },
      data,
    });
    return res.json({ success: true, config: updated });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: (error as Error).message });
  }
};

// Toggle or set status (OPEN, CLOSED, BUSY, MAINTENANCE)
export const updateRestaurantStatus = async (req: Request, res: Response) => {
  const { status } = req.body;
  if (!status)
    return res.status(400).json({ success: false, message: "Status required" });
  try {
    const config = await prisma.restaurantConfig.findFirst();
    if (!config)
      return res
        .status(404)
        .json({ success: false, message: "Config not found" });
    const updated = await prisma.restaurantConfig.update({
      where: { id: config.id },
      data: { status },
    });
    return res.json({ success: true, config: updated });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: (error as Error).message });
  }
};

// Update a single field (PATCH /api/restaurant/:field)
export const updateRestaurantField = async (req: Request, res: Response) => {
  const { field } = req.params;
  const { value } = req.body;
  if (!field)
    return res.status(400).json({ success: false, message: "Field required" });
  try {
    const config = await prisma.restaurantConfig.findFirst();
    if (!config)
      return res
        .status(404)
        .json({ success: false, message: "Config not found" });
    const updated = await prisma.restaurantConfig.update({
      where: { id: config.id },
      data: { [field]: value },
    });
    return res.json({ success: true, config: updated });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: (error as Error).message });
  }
};
