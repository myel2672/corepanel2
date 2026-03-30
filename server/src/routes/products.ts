import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);

const staffGuard = (req: any, res: any, next: any) => {
  if (req.user.role === "STAFF" || req.user.role === "DEMO" || req.user.role === "DEMO") {
    return res.status(403).json({ message: "Personel bu işlemi yapamaz" });
  }
  next();
};

// GET PRODUCTS
router.get("/", async (req: any, res) => {
  try {
    const user = req.user;
    let where: any;

    if (user.role === "MAIN_ADMIN") {
      where = { businessId: null }; // Sadece MAIN_ADMIN'e ait ürünler
    } else {
      where = { businessId: Number(user.businessId) };
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    res.json(products);
  } catch {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// CREATE PRODUCT
router.post("/", staffGuard, async (req: any, res) => {
  try {
    const user = req.user;
    const { name, description, price, costPrice, stock } = req.body;

    // MAIN_ADMIN kendi ürünlerini ekler (businessId null)
    // ADMIN kendi işletmesine ekler
    const finalBusinessId = user.role === "MAIN_ADMIN" ? null : Number(user.businessId);

    if (user.role !== "MAIN_ADMIN" && !finalBusinessId) {
      return res.status(400).json({ message: "Business ID gerekli" });
    }

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

// UPDATE PRODUCT
router.put("/:id", staffGuard, async (req: any, res) => {
  try {
    const user = req.user;
    const productId = Number(req.params.id);
    const { name, description, price, costPrice, stock } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ message: "Ürün bulunamadı" });

    // MAIN_ADMIN sadece kendi (businessId null) ürünlerini düzenleyebilir
    if (user.role === "MAIN_ADMIN" && product.businessId !== null) {
      return res.status(403).json({ message: "Yetkisiz işlem" });
    }
    if (user.role === "ADMIN" && product.businessId !== Number(user.businessId)) {
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

// DELETE PRODUCT
router.delete("/:id", staffGuard, async (req: any, res) => {
  try {
    const user = req.user;
    const productId = Number(req.params.id);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ message: "Ürün bulunamadı" });

    if (user.role === "MAIN_ADMIN" && product.businessId !== null) {
      return res.status(403).json({ message: "Yetkisiz işlem" });
    }
    if (user.role === "ADMIN" && product.businessId !== Number(user.businessId)) {
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

