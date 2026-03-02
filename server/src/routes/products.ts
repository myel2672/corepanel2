import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, requireAdmin, AuthRequest } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

router.get("/", authenticate, async (req: AuthRequest, res) => {
  const user = req.user as any;
  let where = {} as any;
  if (user?.role !== "MAIN_ADMIN") {
    // business scoped
    where.businessId = user?.businessId;
  }
  const products = await prisma.product.findMany({ where });
  res.json(products);
});

router.post("/", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  const { name, description, price, stock, imageUrl, costPrice } = req.body;
  const user = req.user as any;
  const businessId = user?.role === "MAIN_ADMIN" ? req.body.businessId : user?.businessId;
  const product = await prisma.product.create({
    data: { name, description, price, stock, imageUrl, costPrice, businessId } as any,
  });
  res.json(product);
});

router.put("/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  const { name, description, price, stock, imageUrl, costPrice } = req.body;
  const user = req.user as any;
  const existing = await prisma.product.findUnique({ where: { id: req.params.id as string } });
  if (!existing) return res.status(404).json({ message: "Not found" });
  if (user.role !== "MAIN_ADMIN" && existing.businessId !== user.businessId) return res.status(403).json({ message: "Forbidden" });
  const product = await prisma.product.update({
    where: { id: req.params.id as string },
    data: { name, description, price, stock, imageUrl, costPrice } as any,
  });
  res.json(product);
});

router.delete("/:id", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  const user = req.user as any;
  const existing = await prisma.product.findUnique({ where: { id: req.params.id as string } });
  if (!existing) return res.status(404).json({ message: "Not found" });
  if (user.role !== "MAIN_ADMIN" && existing.businessId !== user.businessId) return res.status(403).json({ message: "Forbidden" });
  await prisma.product.delete({ where: { id: req.params.id as string } });
  res.json({ message: "Product deleted" });
});

export default router;