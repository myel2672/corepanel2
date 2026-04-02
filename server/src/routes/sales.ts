import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, requireBusinessUser, requireNotDemo } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();
router.use(authenticate);
router.use(requireBusinessUser);

// GET /sales/me
router.get("/me", async (req: any, res) => {
  try {
    const user = req.user;
    const where = user.role === "MAIN_ADMIN" ? {} : { businessId: Number(user.businessId) };
    const sales = await prisma.sale.findMany({
      where,
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(sales);
  } catch {
    res.status(500).json({ message: "SatÄ±ÅŸlar yÃ¼klenemedi" });
  }
});

// POST /sales
router.post("/", requireNotDemo, async (req: any, res) => {
  try {
    const user = req.user;
    const { productId, quantity, unitPrice, unitCost, description } = req.body;

    if (!quantity || !unitPrice) {
      return res.status(400).json({ message: "Adet ve fiyat zorunludur" });
    }

    const businessId = Number(user.businessId);
    if (!businessId) {
      return res.status(400).json({ message: "Business ID bulunamadÄ±" });
    }

    const qty = Number(quantity);
    const price = Number(unitPrice);
    const cost = Number(unitCost) || 0;
    const total = qty * price;

    // Stok kontrolÃ¼ ve dÃ¼ÅŸme
    if (productId) {
      const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
      if (!product) return res.status(404).json({ message: "ÃœrÃ¼n bulunamadÄ±" });
      if (product.stock < qty) {
        return res.status(400).json({ message: `Stok yetersiz. Mevcut: ${product.stock}` });
      }
      await prisma.product.update({
        where: { id: Number(productId) },
        data: { stock: { decrement: qty } },
      });
    }

    const sale = await prisma.sale.create({
      data: {
        businessId,
        productId: productId ? Number(productId) : null,
        description: description || null,
        quantity: qty,
        unitPrice: price,
        unitCost: cost,
        total,
        amount: total,
        date: new Date(),
      },
      include: { product: true },
    });

    res.status(201).json(sale);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "SatÄ±ÅŸ kaydedilemedi" });
  }
});

export default router;



