import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { authenticate, requireMainAdmin, AuthRequest } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// Business registration (creates business + admin user, pending approval)
router.post("/register", async (req, res) => {
  const { name, sector, adminName, adminEmail, adminPassword } = req.body;
  try {
    const existing = await prisma.business.findFirst({ where: { name } });
    if (existing) return res.status(400).json({ message: "Business already exists" });

    const business = await prisma.business.create({ data: { name, sector } });

    const hashed = await bcrypt.hash(adminPassword, 10);
    const user = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashed,
        role: "BUSINESS_ADMIN",
        businessId: business.id,
      },
    });

    res.status(201).json({ business, admin: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: "Business registration failed", error });
  }
});

// List all businesses (main admin only)
router.get("/", authenticate, requireMainAdmin, async (req: AuthRequest, res) => {
  try {
    const list = await prisma.business.findMany({ include: { users: true } });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch businesses", error });
  }
});

// Approve a business (main admin)
router.put("/:id/approve", authenticate, requireMainAdmin, async (req, res) => {
  const id = req.params.id as string;
  try {
    const updated = await prisma.business.update({ where: { id }, data: { isApproved: true } });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Approve failed", error });
  }
});

// Get current business for business admin
router.get("/me", authenticate, async (req: AuthRequest, res) => {
  const businessId = req.user?.businessId;
  if (!businessId) return res.status(403).json({ message: "Not a business user" });
  try {
    const b = await prisma.business.findUnique({ where: { id: businessId }, include: { users: true, products: true } });
    res.json(b);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch business", error });
  }
});

export default router;
