import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, requireAdmin, AuthRequest } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

router.get("/", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const user = req.user as any;
    const where: any = {};
    if (user.role !== "MAIN_ADMIN") where.businessId = user.businessId;
    const orders = await prisma.order.findMany({
      where,
      include: { items: { include: { product: true } }, createdBy: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "List orders failed" });
  }
});

router.post("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user as any;
    const { customer, items } = req.body;
    if (!items || items.length === 0)
      return res.status(400).json({ message: "Order must contain items" });

    const businessId = user.role === "MAIN_ADMIN" ? req.body.businessId : user.businessId;
    if (!businessId) return res.status(403).json({ message: "Business required" });

    const order = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error("Product not found");
        if (user.role !== "MAIN_ADMIN" && product.businessId !== businessId)
          throw new Error("Product does not belong to your business");
        if (product.stock < item.quantity)
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
      }

      const total = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

      const newOrder = await tx.order.create({
        data: {
          customer,
          userId: user.id,
          businessId,
          status: "COMPLETED",
          total,
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
            businessId,
          },
        });
      }

      return newOrder;
    });

    res.json(order);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Order failed" });
  }
});


// Siparis durumu guncelle
router.put("/:id/status", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const user = req.user as any;
    const { id } = req.params;
    const { status } = req.body;
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (user.role !== "MAIN_ADMIN" && order.businessId !== user.businessId)
      return res.status(403).json({ message: "Forbidden" });
    if (status === "CANCELLED" && order.status !== "CANCELLED") {
      const items = await prisma.orderItem.findMany({ where: { orderId: id } });
      for (const item of items) {
        await prisma.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
        await prisma.stockLog.create({ data: { productId: item.productId, change: item.quantity, reason: `Order ${id} cancelled`, businessId: order.businessId } });
      }
    }
    const updated = await prisma.order.update({ where: { id }, data: { status }, include: { items: { include: { product: true } } } });
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: "Status update failed" });
  }
});

export default router;
