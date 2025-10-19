import { body, param } from "express-validator";

export const createMenuItemValidator = [
  body("name").isString().notEmpty().withMessage("Name is required"),
  body("description").optional().isString(),
  body("price")
    .isFloat({ gt: 0 })
    .withMessage("Price must be a positive number"),
  body("isVegetarian").optional().isBoolean(),
  body("isAvailable").optional().isBoolean(),
  body("prepTimeMins").optional().isInt({ min: 0 }),
  body("categoryId").isUUID().withMessage("Valid categoryId required"),
];

export const updateMenuItemValidator = [
  param("id").isUUID().withMessage("Valid menu item id required"),
  body("name").optional().isString(),
  body("description").optional().isString(),
  body("price").optional().isFloat({ gt: 0 }),
  body("isVegetarian").optional().isBoolean(),
  body("isAvailable").optional().isBoolean(),
  body("prepTimeMins").optional().isInt({ min: 0 }),
  body("categoryId").optional().isUUID(),
];
