import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password, role, businessId } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "STAFF",
        businessId: businessId ?? null,
      },
    });
    res.status(201).json({ message: "User created" });
  } catch (error) {
    res.status(500).json({ message: "Register failed", error });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ message: "Invalid password" });

    // ✅ businessId token'a eklendi (middleware zaten yapıyor ama login'de de olmalı)
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,        // ✅ name eklendi → sidebar'da ? sorunu çözüldü
        email: user.email,      // ✅ email eklendi → fallback için
        role: user.role,
        businessId: user.businessId,  // ✅ businessId eklendi
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessId: user.businessId,  // ✅ frontend setAuth için businessId eklendi
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
});

export default router;
