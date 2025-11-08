import { Router, Request, Response } from "express";
import prisma from "../config/db";
import { authenticateToken } from "../middleware/auth";
import { requireAdmin } from "../middleware/role";

const router = Router();

// Get all tax/service rates
router.get("/", authenticateToken, async (req: Request, res: Response) => {
  const rates = await prisma.taxServiceRate.findMany();
  res.json(rates);
});

// Get a single rate by id
router.get("/:id", authenticateToken, async (req: Request, res: Response) => {
  const rate = await prisma.taxServiceRate.findUnique({
    where: { id: req.params.id },
  });
  if (!rate) {
    return res.status(404).json({ error: "Not found" });
  }
  return res.json(rate);
});

// Create a new rate (admin only)
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    const { name, rate, isActive } = req.body;
    const created = await prisma.taxServiceRate.create({
      data: { name, rate, isActive },
    });
    res.status(201).json(created);
  }
);

// Update a rate (admin only)
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    const { name, rate, isActive } = req.body;
    const updated = await prisma.taxServiceRate.update({
      where: { id: req.params.id },
      data: { name, rate, isActive },
    });
    res.json(updated);
  }
);

// Delete a rate (admin only)
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  async (req: Request, res: Response) => {
    await prisma.taxServiceRate.delete({ where: { id: req.params.id } });
    res.status(204).send();
  }
);

export default router;
