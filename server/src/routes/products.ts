import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

const staffGuard = (req: any, res: any, next: any) => {
  if (req.user.role === "STAFF") {
    return res.status(403).json({ message: "Personel bu işlemi yapamaz" });
  }
  next();
};

// GET PRODUCTS
router.get("/", async (req: any, res) => {
  try {
    const user = req.user;
    const where = user.role === "MAIN_ADMIN" ? {} : { businessId: Number(user.businessId) };
    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    res.json(products);
  } catch {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// CREATE PRODUCT — STAFF erişemez
router.post("/", staffGuard, async (req: any, res) => {
  try {
    const user = req.user;
    const { name, description, price, costPrice, stock, businessId: bodyBusinessId } = req.body;
    const finalBusinessId = user.role === "MAIN_ADMIN" ? Number(bodyBusinessId) : Number(user.businessId);
    if (!finalBusinessId) return res.status(400).json({ message: "Business ID gerekli" });

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        costPrice: costPrice ? Number(costPrice) : null,
        stock: Number(stock),
        businessId: finalBusinessId,
      },
    });
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ürün oluşturulamadı" });
  }
});

// UPDATE PRODUCT — STAFF erişemez
router.put("/:id", staffGuard, async (req: any, res) => {
  try {
    const user = req.user;
    const productId = Number(req.params.id);
    const { name, description, price, costPrice, stock } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ message: "Ürün bulunamadı" });

    if (user.role !== "MAIN_ADMIN" && product.businessId !== Number(user.businessId)) {
      return res.status(403).json({ message: "Yetkisiz işlem" });
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        price: Number(price),
        costPrice: costPrice ? Number(costPrice) : null,
        stock: Number(stock),
      },
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ürün güncellenemedi" });
  }
});

// DELETE PRODUCT — STAFF erişemez
router.delete("/:id", staffGuard, async (req: any, res) => {
  try {
    const user = req.user;
    const productId = Number(req.params.id);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ message: "Ürün bulunamadı" });

    if (user.role !== "MAIN_ADMIN" && product.businessId !== Number(user.businessId)) {
      return res.status(403).json({ message: "Yetkisiz işlem" });
    }

    await prisma.sale.deleteMany({ where: { productId } });
    await prisma.product.delete({ where: { id: productId } });
    res.json({ message: "Ürün silindi" });
  } catch (error: any) {
    if (error.code === "P2003") {
      return res.status(400).json({ message: "Bu ürün siparişlerde kullanıldığı için silinemez." });
    }
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

export default router;