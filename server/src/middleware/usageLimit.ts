import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import { AuthRequest } from "./auth";

export interface PlanLimits {
  maxProducts: number;
  maxOrders: number;
  maxCustomers: number;
  maxUsers: number;
  maxStorage: number;
  features: string[];
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  Starter: {
    maxProducts: 50,
    maxOrders: 100,
    maxCustomers: 50,
    maxUsers: 1,
    maxStorage: 100,
    features: ["Temel raporlar", "E-posta desteği"],
  },
  Pro: {
    maxProducts: 500,
    maxOrders: 5000,
    maxCustomers: 500,
    maxUsers: 5,
    maxStorage: 1000,
    features: ["Gelişmiş raporlar", "Personel yönetimi", "Öncelikli destek", "API erişimi"],
  },
  Enterprise: {
    maxProducts: -1,
    maxOrders: -1,
    maxCustomers: -1,
    maxUsers: -1,
    maxStorage: -1,
    features: ["Sınırsız her şey", "Özel entegrasyonlar", "7/24 destek", "Özel eğitim", "SLA"],
  },
};

const getUsageCount = async (businessId: number, entity: string) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  switch (entity) {
    case "products":
      return prisma.product.count({
        where: { businessId, deletedAt: null },
      });
    case "orders":
      return prisma.order.count({
        where: { businessId, createdAt: { gte: monthStart } },
      });
    case "customers":
      return prisma.customer.count({
        where: { businessId, deletedAt: null },
      });
    case "users":
      return prisma.user.count({
        where: { businessId },
      });
    default:
      return 0;
  }
};

export const checkUsageLimit = async (entity: "products" | "orders" | "customers" | "users") => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user?.businessId || user.role === "MAIN_ADMIN" || user.role === "DEMO") {
        return next();
      }

      const business = await prisma.business.findUnique({
        where: { id: Number(user.businessId) },
        select: { planName: true },
      });

      if (!business) return res.status(404).json({ message: "İşletme bulunamadı" });

      const limits = PLAN_LIMITS[business.planName];
      if (!limits) return next();

      const limitKey = `max${entity.charAt(0).toUpperCase() + entity.slice(1)}` as keyof PlanLimits;
      const max = limits[limitKey] as number;

      if (max === -1) return next();

      const current = await getUsageCount(Number(user.businessId), entity);
      if (current >= max) {
        return res.status(403).json({
          message: `${entity} limitine ulaşıldı (${current}/${max}). Plan yükseltin.`,
          current,
          limit: max,
          plan: business.planName,
        });
      }

      next();
    } catch (err) {
      console.error("Usage limit check error:", err);
      next();
    }
  };
};

export const getUsageInfo = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user?.businessId || user.role === "MAIN_ADMIN") {
      return res.status(403).json({ message: "Yetkisiz" });
    }

    const business = await prisma.business.findUnique({
      where: { id: Number(user.businessId) },
      select: { planName: true, subscriptionStatus: true, trialEndsAt: true, nextBillingDate: true },
    });

    if (!business) return res.status(404).json({ message: "İşletme bulunamadı" });

    const limits = PLAN_LIMITS[business.planName];

    const [products, orders, customers, users] = await Promise.all([
      getUsageCount(Number(user.businessId), "products"),
      getUsageCount(Number(user.businessId), "orders"),
      getUsageCount(Number(user.businessId), "customers"),
      getUsageCount(Number(user.businessId), "users"),
    ]);

    res.json({
      plan: business.planName,
      status: business.subscriptionStatus,
      trialEndsAt: business.trialEndsAt,
      nextBillingDate: business.nextBillingDate,
      limits,
      usage: { products, orders, customers, users },
    });
  } catch (err) {
    console.error("Usage info error:", err);
    res.status(500).json({ message: "Kullanım bilgisi alınamadı" });
  }
};
