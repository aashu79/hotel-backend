import { Router } from "express";
import {
  getRestaurantConfig,
  updateRestaurantConfig,
  updateRestaurantStatus,
  updateRestaurantField,
} from "../controller/restaurantConfigController";

const router = Router();

// Get all restaurant config
router.get("/", getRestaurantConfig);
// Update all config fields
router.put("/", updateRestaurantConfig);
// Update status only
router.patch("/status", updateRestaurantStatus);
// Update a single field
router.patch("/:field", updateRestaurantField);

export default router;
