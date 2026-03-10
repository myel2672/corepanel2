import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

const staffGuard = (req: any, res: any, next: any) => {
  if (req.user.role === "STAFF") {
    return res.status(403).json({ message: "Personel bu işlemi yapamaz" });
  }
  next();
};

router.get("/", authenticate, staffGuard, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user as any;
    const where: any = {};
    if (user.role !== "MAIN_ADMIN") where.businessId = Number(user.businessId);
    const customers = await prisma.customer.findMany({
      where,
      include: { orders: { orderBy: { createdAt: "desc" }, take: 5 } },
      orderBy: { createdAt: "desc" },
    });
    res.json(customers);
  } catch {
    res.status(500).json({ error: "Müşteriler alınamadı" });
  }
});

router.post("/", authenticate, staffGuard, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user as any;
    const { name, phone, email } = req.body;
    if (!name) return res.status(400).json({ error: "İsim zorunludur" });
    const businessId = user.role === "MAIN_ADMIN" ? Number(req.body.businessId) : Number(user.businessId);
    if (!businessId) return res.status(403).json({ error: "İşletme gerekli" });
    const customer = await prisma.customer.create({
      data: { name, phone: phone || null, email: email || null, businessId },
    });
    res.status(201).json(customer);
  } catch {
    res.status(500).json({ error: "Müşteri oluşturulamadı" });
  }
});

router.put("/:id", authenticate, staffGuard, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user as any;
    const { name, phone, email } = req.body;
    const existing = await prisma.customer.findFirst({
      where: { id: Number(req.params.id), businessId: Number(user.businessId) },
    });
    if (!existing) return res.status(404).json({ error: "Müşteri bulunamadı" });
    const customer = await prisma.customer.update({
      where: { id: Number(req.params.id) },
      data: { name, phone, email },
    });
    res.json(customer);
  } catch {
    res.status(500).json({ error: "Müşteri güncellenemedi" });
  }
});

router.delete("/:id", authenticate, staffGuard, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user as any;
    const existing = await prisma.customer.findFirst({
      where: { id: Number(req.params.id), businessId: Number(user.businessId) },
    });
    if (!existing) return res.status(404).json({ error: "Müşteri bulunamadı" });
    await prisma.customer.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: "Müşteri silindi" });
  } catch {
    res.status(500).json({ error: "Müşteri silinemedi" });
  }
});

export default router;