import { Router, Request, Response } from "express";
import crypto from "crypto";
import prisma from "../prisma";

const router = Router();

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";

// Stripe webhook - POST /stripe/webhook
router.post("/webhook", async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  let event: any;

  try {
    const stripe = require("stripe")(STRIPE_SECRET_KEY);
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        await prisma.business.updateMany({
          where: { stripeCustomerId: customerId },
          data: {
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: "ACTIVE",
          },
        });
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const business = await prisma.business.findFirst({
          where: { stripeCustomerId: subscription.customer },
        });

        if (business) {
          await prisma.business.update({
            where: { id: business.id },
            data: {
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items?.data?.[0]?.price?.id || null,
              currentPeriodEnd: subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000)
                : null,
              cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
              subscriptionStatus: subscription.status === "active" ? "ACTIVE" : subscription.status === "trialing" ? "TRIAL" : subscription.status === "canceled" ? "CANCELLED" : "PAST_DUE",
              nextBillingDate: subscription.current_period_end
                ? new Date(subscription.current_period_end * 1000)
                : null,
            },
          });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const business = await prisma.business.findFirst({
          where: { stripeCustomerId: subscription.customer },
        });

        if (business) {
          await prisma.business.update({
            where: { id: business.id },
            data: {
              stripeSubscriptionId: null,
              subscriptionStatus: "CANCELLED",
              cancelAtPeriodEnd: false,
            },
          });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const business = await prisma.business.findFirst({
          where: { stripeCustomerId: invoice.customer },
        });

        if (business && invoice.amount_paid) {
          await prisma.payment.create({
            data: {
              businessId: business.id,
              amount: invoice.amount_paid / 100,
              status: "PAID",
              note: `Stripe otomatik ödeme - ${invoice.id}`,
              paidAt: new Date(),
            },
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const business = await prisma.business.findFirst({
          where: { stripeCustomerId: invoice.customer },
        });

        if (business) {
          await prisma.business.update({
            where: { id: business.id },
            data: { subscriptionStatus: "PAST_DUE" },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    res.status(500).json({ error: "Webhook handler failed" });
  }
});

// POST /stripe/create-checkout-session
router.post("/create-checkout-session", async (req: any, res: Response) => {
  try {
    const stripe = require("stripe")(STRIPE_SECRET_KEY);
    const { priceId, successUrl, cancelUrl } = req.body;

    if (!priceId) {
      return res.status(400).json({ message: "priceId gerekli" });
    }

    let business = await prisma.business.findUnique({
      where: { id: Number(req.user.businessId) },
      include: { users: { where: { id: Number(req.user.id) } } },
    });

    if (!business) {
      return res.status(404).json({ message: "İşletme bulunamadı" });
    }

    let stripeCustomerId = business.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: business.users[0]?.email,
        metadata: { businessId: business.id.toString() },
      });
      stripeCustomerId = customer.id;

      await prisma.business.update({
        where: { id: business.id },
        data: { stripeCustomerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${process.env.FRONTEND_URL}/business?subscription=success`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/business?subscription=cancelled`,
      metadata: { businessId: business.id.toString() },
    });

    res.json({ url: session.url });
  } catch (err: any) {
    console.error("Create checkout session error:", err);
    res.status(500).json({ message: "Ödeme sayfası oluşturulamadı" });
  }
});

// POST /stripe/create-portal-session
router.post("/create-portal-session", async (req: any, res: Response) => {
  try {
    const stripe = require("stripe")(STRIPE_SECRET_KEY);

    const business = await prisma.business.findUnique({
      where: { id: Number(req.user.businessId) },
    });

    if (!business?.stripeCustomerId) {
      return res.status(400).json({ message: "Stripe müşteri kaydı bulunamadı" });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: business.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/business`,
    });

    res.json({ url: session.url });
  } catch (err: any) {
    console.error("Create portal session error:", err);
    res.status(500).json({ message: "Portal oturumu oluşturulamadı" });
  }
});

// POST /stripe/cancel-subscription
router.post("/cancel-subscription", async (req: any, res: Response) => {
  try {
    const stripe = require("stripe")(STRIPE_SECRET_KEY);

    const business = await prisma.business.findUnique({
      where: { id: Number(req.user.businessId) },
    });

    if (!business?.stripeSubscriptionId) {
      return res.status(400).json({ message: "Aktif abonelik bulunamadı" });
    }

    await stripe.subscriptions.update(business.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await prisma.business.update({
      where: { id: business.id },
      data: { cancelAtPeriodEnd: true },
    });

    res.json({ message: "Abonelik dönem sonunda iptal edilecek" });
  } catch (err: any) {
    console.error("Cancel subscription error:", err);
    res.status(500).json({ message: "Abonelik iptal edilemedi" });
  }
});

export default router;
