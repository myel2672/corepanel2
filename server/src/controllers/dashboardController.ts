import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/auth";

const prisma = new PrismaClient();

const getLastDays = (count: number) =>
  Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (count - 1 - index));
    date.setHours(0, 0, 0, 0);
    return date;
  });

const getLastMonths = (count: number) =>
  Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (count - 1 - index));
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    return date;
  });

const toMonthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

const toCurrency = (value: number) => parseFloat(value.toFixed(2));

export const getSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.id);
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const isMainAdmin = user.role === "MAIN_ADMIN";
    const businessId = user.businessId || null;

    if (isMainAdmin) {
      const [businesses, totalUsers, payments] = await Promise.all([
        prisma.business.findMany({
          include: {
            users: {
              select: { id: true },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.user.count({
          where: {
            role: { not: "MAIN_ADMIN" },
          },
        }),
        prisma.payment.findMany({
          where: { status: "PAID" },
          orderBy: { paidAt: "desc" },
        }),
      ]);

      const totalBusinesses = businesses.length;
      const approvedBusinesses = businesses.filter((business) => business.isApproved).length;
      const pendingBusinesses = businesses.filter((business) => !business.isApproved).length;
      const activeSubscriptions = businesses.filter(
        (business) =>
          business.isApproved &&
          business.subscriptionStatus === "ACTIVE" &&
          (business.monthlyFee || 0) > 0
      ).length;
      const monthlyRecurringRevenue = toCurrency(
        businesses.reduce((sum, business) => {
          if (!business.isApproved || business.subscriptionStatus !== "ACTIVE") {
            return sum;
          }

          return sum + (business.monthlyFee || 0);
        }, 0)
      );

      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const collectedThisMonth = toCurrency(
        payments.reduce((sum, payment) => {
          if (!payment.paidAt) {
            return sum;
          }

          if (payment.paidAt >= currentMonthStart && payment.paidAt < nextMonthStart) {
            return sum + payment.amount;
          }

          return sum;
        }, 0)
      );

      const overdueSubscriptions = businesses.filter((business) => {
        if (!business.isApproved || business.subscriptionStatus !== "ACTIVE") {
          return false;
        }

        if ((business.monthlyFee || 0) <= 0 || !business.nextBillingDate) {
          return false;
        }

        return business.nextBillingDate < now;
      }).length;

      const last6Months = getLastMonths(6);
      const monthlyBusinessMap = new Map<string, number>();
      const monthlyCollectionMap = new Map<string, number>();

      last6Months.forEach((month) => {
        monthlyBusinessMap.set(toMonthKey(month), 0);
        monthlyCollectionMap.set(toMonthKey(month), 0);
      });

      businesses.forEach((business) => {
        const key = toMonthKey(new Date(business.createdAt));
        if (monthlyBusinessMap.has(key)) {
          monthlyBusinessMap.set(key, (monthlyBusinessMap.get(key) || 0) + 1);
        }
      });

      payments.forEach((payment) => {
        if (!payment.paidAt) {
          return;
        }

        const key = toMonthKey(new Date(payment.paidAt));
        if (monthlyCollectionMap.has(key)) {
          monthlyCollectionMap.set(key, toCurrency((monthlyCollectionMap.get(key) || 0) + payment.amount));
        }
      });

      const monthlyBusinesses = last6Months.map((month) => ({
        date: month.toLocaleDateString("tr-TR", { month: "short" }),
        total: monthlyBusinessMap.get(toMonthKey(month)) || 0,
      }));

      const monthlyCollections = last6Months.map((month) => ({
        date: month.toLocaleDateString("tr-TR", { month: "short" }),
        total: monthlyCollectionMap.get(toMonthKey(month)) || 0,
      }));

      const recentBusinesses = businesses.slice(0, 6).map((business) => ({
        id: business.id,
        name: business.name,
        sector: business.sector,
        createdAt: business.createdAt,
        isApproved: business.isApproved,
        planName: business.planName,
        monthlyFee: business.monthlyFee,
        subscriptionStatus: business.subscriptionStatus,
        nextBillingDate: business.nextBillingDate,
        trialEndsAt: business.trialEndsAt,
        userCount: business.users.length,
      }));

      return res.json({
        isMainAdmin: true,
        totalBusinesses,
        approvedBusinesses,
        pendingBusinesses,
        totalUsers,
        activeSubscriptions,
        monthlyRecurringRevenue,
        collectedThisMonth,
        overdueSubscriptions,
        monthlyBusinesses,
        monthlyCollections,
        recentBusinesses,
      });
    }

    if (!businessId) {
      return res.json({
        totalOrders: 0,
        totalSales: 0,
        totalCost: 0,
        profit: 0,
        orderRevenue: 0,
        saleRevenue: 0,
        top: [],
        lowStock: [],
        dailySales: [],
        monthlySales: [],
      });
    }

    const numericBusinessId = Number(businessId);

    const totalOrders = await prisma.order.count({
      where: {
        businessId: numericBusinessId,
        status: { not: "CANCELLED" },
      },
    });

    const totalSalesCount = await prisma.sale.count({
      where: { businessId: numericBusinessId },
    });

    const orders = await prisma.order.findMany({
      where: {
        businessId: numericBusinessId,
        status: { not: "CANCELLED" },
      },
      include: { product: true },
    });

    const sales = await prisma.sale.findMany({
      where: { businessId: numericBusinessId },
      include: { product: true },
    });

    const orderRevenue = orders.reduce((sum, order) => {
      return sum + order.quantity * (order.product?.price || 0);
    }, 0);

    const saleRevenue = sales.reduce((sum, sale) => {
      return sum + (sale.total || 0);
    }, 0);

    const saleCost = sales.reduce((sum, sale) => {
      return sum + (sale.unitCost || 0) * (sale.quantity || 0);
    }, 0);

    const totalSales = orderRevenue + saleRevenue;
    const totalCost = saleCost + orderRevenue * 0.6;
    const profit = (saleRevenue - saleCost) + orderRevenue * 0.4;

    const topMap: Record<number, { product: { id?: number; name: string }; sold: number }> = {};

    orders.forEach((order) => {
      const product = order.product;
      if (!product) {
        return;
      }

      if (!topMap[order.productId]) {
        topMap[order.productId] = {
          product: { id: product.id, name: product.name },
          sold: 0,
        };
      }

      topMap[order.productId].sold += order.quantity;
    });

    sales.forEach((sale) => {
      if (!sale.productId) {
        return;
      }

      if (!topMap[sale.productId]) {
        topMap[sale.productId] = {
          product: {
            id: sale.product?.id,
            name: sale.product?.name || sale.description || "—",
          },
          sold: 0,
        };
      }

      topMap[sale.productId].sold += sale.quantity || 0;
    });

    const top = Object.values(topMap)
      .sort((left, right) => right.sold - left.sold)
      .slice(0, 5);

    const lowStock = await prisma.product.findMany({
      where: {
        businessId: numericBusinessId,
        stock: { lt: 5 },
      },
    });

    const dailySales = await Promise.all(
      getLastDays(7).map(async (day) => {
        const nextDay = new Date(day);
        nextDay.setDate(nextDay.getDate() + 1);

        const [dayOrders, daySalesRows] = await Promise.all([
          prisma.order.findMany({
            where: {
              businessId: numericBusinessId,
              status: { not: "CANCELLED" },
              createdAt: { gte: day, lt: nextDay },
            },
            include: { product: true },
          }),
          prisma.sale.findMany({
            where: {
              businessId: numericBusinessId,
              date: { gte: day, lt: nextDay },
            },
          }),
        ]);

        const total =
          dayOrders.reduce((sum, order) => sum + order.quantity * (order.product?.price || 0), 0) +
          daySalesRows.reduce((sum, sale) => sum + (sale.total || 0), 0);

        return {
          date: day.toLocaleDateString("tr-TR", { weekday: "short", day: "numeric" }),
          total: toCurrency(total),
        };
      })
    );

    const monthlySales = await Promise.all(
      getLastMonths(6).map(async (month) => {
        const nextMonth = new Date(month);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const [monthOrders, monthSalesRows] = await Promise.all([
          prisma.order.findMany({
            where: {
              businessId: numericBusinessId,
              status: { not: "CANCELLED" },
              createdAt: { gte: month, lt: nextMonth },
            },
            include: { product: true },
          }),
          prisma.sale.findMany({
            where: {
              businessId: numericBusinessId,
              date: { gte: month, lt: nextMonth },
            },
          }),
        ]);

        const total =
          monthOrders.reduce((sum, order) => sum + order.quantity * (order.product?.price || 0), 0) +
          monthSalesRows.reduce((sum, sale) => sum + (sale.total || 0), 0);

        return {
          date: month.toLocaleDateString("tr-TR", { month: "short" }),
          total: toCurrency(total),
        };
      })
    );

    return res.json({
      totalOrders,
      totalSalesCount,
      totalSales: toCurrency(totalSales),
      totalCost: toCurrency(totalCost),
      profit: toCurrency(profit),
      orderRevenue: toCurrency(orderRevenue),
      saleRevenue: toCurrency(saleRevenue),
      top,
      lowStock,
      dailySales,
      monthlySales,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Dashboard data error" });
  }
};
