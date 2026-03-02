import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, requireAdmin, AuthRequest } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// Summary: total sales, total orders, low stock, top products
router.get("/summary", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const user = req.user as any;
    const orderWhere: any = {};
    if (user.role !== "MAIN_ADMIN") orderWhere.businessId = user.businessId;
    const totalOrders = await prisma.order.count({ where: orderWhere });

    const totalSalesResult = await prisma.orderItem.aggregate({
      _sum: { price: true },
    });
    // totalSales by summing price * quantity across items
    const items = await prisma.orderItem.findMany({ where: { order: { businessId: orderWhere.businessId } }, select: { price: true, quantity: true, productId: true } });
    const totalSales = items.reduce((s, it) => s + it.price * it.quantity, 0);
    // totalCost by summing product.costPrice * quantity
    const productIds = Array.from(new Set(items.map(i => i.productId)));
    const products = await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, costPrice: true } } as any);
    const costMap: Record<string, number> = {};
    (products as any[]).forEach(p => { costMap[p.id] = (p as any).costPrice ?? 0; });
    const totalCost = items.reduce((s, it) => s + (costMap[it.productId] || 0) * it.quantity, 0);
    const profit = totalSales - totalCost;

    const prodWhere: any = { stock: { lt: 5 } };
    if (user.role !== "MAIN_ADMIN") prodWhere.businessId = user.businessId;
    const lowStock = await prisma.product.findMany({ where: prodWhere, orderBy: { stock: 'asc' }, take: 10 });

    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: { order: { businessId: orderWhere.businessId } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });
    // fetch product names
    const top = await Promise.all(topProducts.map(async (t) => {
      const p = await prisma.product.findUnique({ where: { id: t.productId } });
      return { product: p, sold: t._sum.quantity || 0 };
    }));

    res.json({ totalOrders, totalSales, totalCost, profit, lowStock, top });
  } catch (err) {
    res.status(500).json({ message: 'Dashboard error', error: err });
  }
});

export default router;
