import { Router } from "express";
import stripe from "../config/stripe";
import prisma from "../config/db";
import { PrismaClient } from "@prisma/client";
const router = Router();

// Create Stripe Checkout Session
router.post("/create-checkout-session", async (req, res) => {
  const {
    orderId,
    items,
    currency,
    userId,
    locationId,
    tableNumber,
    specialInstructions,
  } = req.body;

  if (!orderId || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "orderId and items are required" });
  } else {
    try {
      const line_items = items.map((item: any) => ({
        price_data: {
          currency,
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      }));

      // Pass orderId in metadata
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items,
        mode: "payment",
        success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/cancel`,
        metadata: {
          userId,
          orderId,
          locationId,
          tableNumber: tableNumber || "",
          specialInstructions: specialInstructions || "",
        },
      });

      return res.json({ url: session.url });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
});

// Verify Stripe Payment and Create Order
router.post("/verify-payment", async (req, res) => {
  const { session_id } = req.body;

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ error: "Payment not completed" });
    }

    // Get orderId from metadata
    const { orderId } = session.metadata as any;
    if (!orderId) {
      return res
        .status(400)
        .json({ error: "Order ID not found in session metadata" });
    }

    // Update the order's paid status
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { paid: true },
      include: { items: true },
    });

    return res.json({ order });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
