import { Router } from "express";
import stripe from "../config/stripe";
import prisma from "../config/db";
import express from "express";

const router = Router();

// Stripe webhook endpoint
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"] as string;
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const { orderId, userId } = session.metadata;
      try {
        await prisma.payment.create({
          data: {
            userId,
            orderId,
            stripePaymentId: session.payment_intent,
            amount: session.amount_total / 100,
            currency: session.currency,
            status: session.payment_status,
          },
        });
        await prisma.sale.create({
          data: {
            orderId,
            amount: session.amount_total / 100,
          },
        });
        // Mark order as paid
        await prisma.order.update({
          where: { id: orderId },
          data: { paid: true },
        });
      } catch (err) {
        // Optionally log error
      }
    }
    return res.json({ received: true });
  }
);

export default router;
