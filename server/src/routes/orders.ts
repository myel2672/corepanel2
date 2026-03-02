import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, AuthRequest, requireAdmin } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

router.get("/", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  const user = req.user as any;
  const where: any = {};
  if (user.role !== "MAIN_ADMIN") where.businessId = user.businessId;
  const orders = await prisma.order.findMany({
    where,
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
          businessId: (req.user as any).businessId,
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
          // use any to avoid generated type mismatches across schemas
          data: {
            productId: item.productId,
            change: -item.quantity,
            reason: `Order ${newOrder.id}`,
            businessId: (req.user as any).businessId,
          } as any,
        });
      }
      return newOrder;
    });
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: "Order failed", error: err });
  }
});

router.put("/:id/status", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  const { status } = req.body;
  const id = req.params.id as string;
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return res.status(404).json({ message: 'Order not found' });

  const user = req.user as any;
  if (user.role !== "MAIN_ADMIN" && order.businessId !== user.businessId) return res.status(403).json({ message: 'Forbidden' });

  const allowed: Record<string, string[]> = {
    PENDING: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED'],
    DELIVERED: [],
    COMPLETED: [],
    CANCELLED: [],
  };

  if (!allowed[order.status].includes(status)) {
    return res.status(400).json({ message: `Invalid status transition from ${order.status} to ${status}` });
  }

  const updated = await prisma.order.update({ where: { id }, data: { status } });
  res.json(updated);
});

export default router;