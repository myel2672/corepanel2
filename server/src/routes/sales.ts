import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, AuthRequest, requireAdmin } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// List sales (MAIN_ADMIN sees all, business users see their own)
router.get("/", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const user = req.user as any;
    const where: any = {};
    if (user.role !== "MAIN_ADMIN") where.businessId = user.businessId;
    const sales = await prisma.sale.findMany({ where, orderBy: { date: 'desc' } });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: 'List sales failed', error: err });
  }
});

// Create sale (business users and staff)
router.post("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user as any;
    const { productId, description, category, quantity = 1, unitPrice, unitCost = 0, date } = req.body;
    const businessId = user.businessId;
    if (!businessId && user.role !== 'MAIN_ADMIN') return res.status(403).json({ message: 'Not a business user' });

    // If productId provided, validate product exists and belongs to business
    if (productId) {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) return res.status(404).json({ message: 'Product not found' });
      if (user.role !== 'MAIN_ADMIN' && product.businessId !== businessId) return res.status(403).json({ message: 'Product does not belong to your business' });
    }

    const total = (unitPrice || 0) * (quantity || 1);
    const data: any = {
      businessId: businessId || req.body.businessId,
      productId,
      description,
      category,
      quantity,
      unitPrice,
      unitCost,
      total,
      date: date || undefined,
    };

    const sale = await prisma.sale.create({ data } as any);
    res.json(sale);
  } catch (err) {
    res.status(500).json({ message: 'Create sale failed', error: err });
  }
});

// list sales for current business user (authenticated)
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user as any;
    const businessId = user.businessId;
    if (!businessId && user.role !== 'MAIN_ADMIN') return res.status(403).json({ message: 'Not a business user' });
    const sales = await prisma.sale.findMany({ where: { businessId }, orderBy: { date: 'desc' } });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ message: 'List my sales failed', error: err });
  }
});

// Update sale
router.put("/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  const id = req.params.id as string;
  try {
    const existing = await prisma.sale.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Not found' });
    const user = req.user as any;
    if (user.role !== 'MAIN_ADMIN' && existing.businessId !== user.businessId) return res.status(403).json({ message: 'Forbidden' });

    const { quantity, unitPrice, unitCost, description, category } = req.body;
    const total = (unitPrice ?? existing.unitPrice) * (quantity ?? existing.quantity);
    const updated = await prisma.sale.update({ where: { id }, data: { quantity, unitPrice, unitCost, description, category, total } as any });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Update sale failed', error: err });
  }
});

// Delete sale
router.delete("/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  const id = req.params.id as string;
  try {
    const existing = await prisma.sale.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: 'Not found' });
    const user = req.user as any;
    if (user.role !== 'MAIN_ADMIN' && existing.businessId !== user.businessId) return res.status(403).json({ message: 'Forbidden' });
    await prisma.sale.delete({ where: { id } });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete sale failed', error: err });
  }
});

export default router;
