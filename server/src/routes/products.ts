import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, requireAdmin, AuthRequest } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

router.get("/", authenticate, async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});

router.post("/", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  const { name, description, price, stock, imageUrl } = req.body;
  const product = await prisma.product.create({
    data: { name, description, price, stock, imageUrl },
  });
  res.json(product);
});

router.put("/:id", authenticate, requireAdmin, async (req, res) => {
  const { name, description, price, stock, imageUrl } = req.body;
  const product = await prisma.product.update({
    where: { id: req.params.id as string },
    data: { name, description, price, stock, imageUrl },
  });
  res.json(product);
});

router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  await prisma.product.delete({ where: { id: req.params.id as string } });
  res.json({ message: "Product deleted" });
});

export default router;