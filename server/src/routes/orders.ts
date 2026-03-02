import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

router.get("/", authenticate, async (req, res) => {
  const orders = await prisma.order.findMany({
    include: { items: { include: { product: true } }, createdBy: true },
  });
  res.json(orders);
});

router.post("/", authenticate, async (req: AuthRequest, res) => {
  const { customer, items } = req.body;
  try {
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          customer,
          userId: req.user!.id,
          items: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: { items: true },
      });
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
        await tx.stockLog.create({
          data: {
            productId: item.productId,
            change: -item.quantity,
            reason: `Order ${newOrder.id}`,
          },
        });
      }
      return newOrder;
    });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: "Order failed", error: err });
  }
});

router.put("/:id/status", authenticate, async (req, res) => {
  const { status } = req.body;
  const order = await prisma.order.update({
    where: { id: req.params.id as string },
    data: { status },
  });
  res.json(order);
});

export default router;