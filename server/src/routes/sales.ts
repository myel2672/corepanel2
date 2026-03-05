import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = Router();
const prisma = new PrismaClient();

// Basit authenticate middleware
const authenticate = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    // Kullanıcıyı DB’den bul
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!dbUser) {
      return res.status(401).json({ error: "User not found" });
    }

    // req.user içine businessId dahil et
    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      businessId: dbUser.businessId,
    };

    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
};

router.get("/stats", authenticate, async (req: any, res) => {
  try {
    const user = req.user;
    const businessId = user.businessId;

    if (!businessId) {
      return res.json({
        todaySales: 0,
        monthSales: 0,
        ordersCount: 0,
        productsCount: 0,
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todaySales = await prisma.sale.aggregate({
      _sum: { total: true },
      where: {
        businessId: businessId,
        createdAt: {
          gte: today,
        },
      },
    });

    const monthSales = await prisma.sale.aggregate({
      _sum: { total: true },
      where: {
        businessId: businessId,
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    const ordersCount = await prisma.order.count({
      where: { businessId: businessId },
    });

    const productsCount = await prisma.product.count({
      where: { businessId: businessId },
    });

    res.json({
      todaySales: todaySales._sum.total || 0,
      monthSales: monthSales._sum.total || 0,
      ordersCount,
      productsCount,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ error: "Dashboard stats error" });
  }
});

export default router;