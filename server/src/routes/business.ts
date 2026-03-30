import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// POST /businesses/register — işletme + admin kullanıcı oluştur (public)
router.post("/register", async (req: any, res) => {
  try {
    const { name, sector, adminName, adminEmail, adminPassword } = req.body;
    if (!name || !sector || !adminEmail || !adminPassword) {
      return res.status(400).json({ message: "Tüm alanlar zorunludur" });
    }

    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (existing) return res.status(400).json({ message: "Bu e-posta zaten kullanımda" });

    const business = await prisma.business.create({
      data: { name, sector, isApproved: false },
    });

    const bcrypt = await import("bcrypt");
    const hashed = await bcrypt.hash(adminPassword, 10);

    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashed,
        role: "ADMIN",
        businessId: business.id,
      },
    });

    res.status(201).json({ message: "Kayıt başarılı, onay bekleniyor" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Kayıt başarısız" });
  }
});

router.use(authenticate);

// GET /businesses — tüm işletmeler (MAIN_ADMIN)
router.get("/", async (req: any, res) => {
  try {
    const businesses = await prisma.business.findMany({
      include: { users: true, products: true, orders: true, sales: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(businesses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "İşletmeler alınamadı" });
  }
});

// GET /businesses/me — kendi işletmesi
router.get("/me", async (req: any, res) => {
  try {
    const user = req.user;
    if (!user.businessId) return res.status(404).json({ message: "İşletme bulunamadı" });
    const business = await prisma.business.findUnique({ where: { id: Number(user.businessId) } });
    if (!business) return res.status(404).json({ message: "İşletme bulunamadı" });
    res.json(business);
  } catch {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// GET /businesses/me/users — işletmedeki tüm kullanıcılar (ADMIN)
router.get("/me/users", async (req: any, res) => {
  try {
    const user = req.user;
    if (!user.businessId) return res.status(404).json({ message: "İşletme bulunamadı" });
    const users = await prisma.user.findMany({
      where: { businessId: Number(user.businessId) },
      select: { id: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    res.json(users);
  } catch {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// POST /businesses — yeni işletme oluştur
router.post("/", async (req: any, res) => {
  try {
    const { name, sector } = req.body;
    if (!name || !sector) return res.status(400).json({ message: "Ad ve sektör zorunludur" });
    const business = await prisma.business.create({ data: { name, sector, isApproved: false } });
    res.status(201).json(business);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "İşletme oluşturulamadı" });
  }
});

// PUT /businesses/:id/approve
router.put("/:id/approve", async (req: any, res) => {
  try {
    if (req.user.role !== "MAIN_ADMIN") return res.status(403).json({ message: "Yetkisiz" });
    const business = await prisma.business.update({
      where: { id: Number(req.params.id) },
      data: { isApproved: true },
    });
    res.json(business);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Onaylama başarısız" });
  }
});

// DELETE /businesses/:id
router.delete("/:id", async (req: any, res) => {
  try {
    if (req.user.role !== "MAIN_ADMIN") return res.status(403).json({ message: "Yetkisiz" });
    const id = Number(req.params.id);
    await prisma.sale.deleteMany({ where: { businessId: id } });
    await prisma.order.deleteMany({ where: { businessId: id } });
    await prisma.product.deleteMany({ where: { businessId: id } });
    await prisma.customer.deleteMany({ where: { businessId: id } });
    await prisma.refreshToken.deleteMany({ where: { userId: { in: (await prisma.user.findMany({ where: { businessId: id }, select: { id: true } })).map(u => u.id) } } });
await prisma.user.deleteMany({ where: { businessId: id } });
    await prisma.business.delete({ where: { id } });
    res.json({ message: "İşletme silindi" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ message: "Silme başarısız" });
  }
});

export default router;