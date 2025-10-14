import { body, param } from "express-validator";

export const createCategoryValidator = [
  body("name").isString().notEmpty().withMessage("Name is required"),
  body("description").optional().isString(),
  body("sortOrder").optional().isInt(),
  body("isActive").optional().isBoolean(),
];

export const updateCategoryValidator = [
  param("id").isInt().withMessage("Valid category id required"),
  body("name").optional().isString(),
  body("description").optional().isString(),
  body("sortOrder").optional().isInt(),
  body("isActive").optional().isBoolean(),
];
