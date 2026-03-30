import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

const staffGuard = (req: any, res: any, next: any) => {
  if (req.user.role === "STAFF" || req.user.role === "DEMO" || req.user.role === "DEMO") {
    return res.status(403).json({ message: "Personel bu iÅŸlemi yapamaz" });
  }
  next();
};

router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
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
    res.status(500).json({ error: "MÃ¼ÅŸteriler alÄ±namadÄ±" });
  }
});

router.post("/", authenticate, staffGuard, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user as any;
    const { name, phone, email, address } = req.body;
    if (!name) return res.status(400).json({ error: "Ä°sim zorunludur" });
    const businessId = user.role === "MAIN_ADMIN" ? Number(req.body.businessId) : Number(user.businessId);
    if (!businessId) return res.status(403).json({ error: "Ä°ÅŸletme gerekli" });
    const customer = await prisma.customer.create({
      data: { name, phone: phone || null, email: email || null, address: address || null, businessId },
    });
    res.status(201).json(customer);
  } catch {
    res.status(500).json({ error: "MÃ¼ÅŸteri oluÅŸturulamadÄ±" });
  }
});

router.put("/:id", authenticate, staffGuard, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user as any;
    const { name, phone, email, address } = req.body;
    const where: any = { id: Number(req.params.id) };
    if (user.role !== "MAIN_ADMIN") where.businessId = Number(user.businessId);
    const existing = await prisma.customer.findFirst({ where });
    if (!existing) return res.status(404).json({ error: "MÃ¼ÅŸteri bulunamadÄ±" });
    const customer = await prisma.customer.update({
      where: { id: Number(req.params.id) },
      data: { name, phone: phone || null, email: email || null, address: address || null },
    });
    res.json(customer);
  } catch {
    res.status(500).json({ error: "MÃ¼ÅŸteri gÃ¼ncellenemedi" });
  }
});

router.delete("/:id", authenticate, staffGuard, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user as any;
    const where: any = { id: Number(req.params.id) };
    if (user.role !== "MAIN_ADMIN") where.businessId = Number(user.businessId);
    const existing = await prisma.customer.findFirst({ where });
    if (!existing) return res.status(404).json({ error: "MÃ¼ÅŸteri bulunamadÄ±" });

    // Ä°liÅŸkili sipariÅŸlerdeki customerId'yi null yap, sonra mÃ¼ÅŸteriyi sil
    await prisma.order.updateMany({
      where: { customerId: Number(req.params.id) },
      data: { customerId: null },
    });

    await prisma.customer.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: "MÃ¼ÅŸteri silindi" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "MÃ¼ÅŸteri silinemedi" });
  }
});

export default router;


