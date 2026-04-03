import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { seedDemoData } from "../services/demoSeed";
import prisma from "../prisma";
import { getUsageInfo } from "../middleware/usageLimit";

const router = Router();

const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const addMonths = (months: number) => {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date;
};

const toOptionalDate = (value?: string | null) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeMoney = (value: unknown) => {
  const amount = Number(value);
  return Number.isFinite(amount) && amount >= 0 ? amount : 0;
};

// POST /businesses/register - public business signup
router.post("/register", async (req: any, res) => {
  try {
    const { name, sector, adminEmail, adminPassword, adminName } = req.body;

    if (!name || !sector || !adminEmail || !adminPassword) {
      return res.status(400).json({ message: "Tum alanlar zorunludur" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Bu e-posta zaten kullanimda" });
    }

    const business = await prisma.business.create({
      data: {
        name,
        sector,
        isApproved: false,
        planName: "Starter",
        monthlyFee: 0,
        subscriptionStatus: "PENDING_APPROVAL",
        trialEndsAt: addDays(14),
      },
    });

    const bcrypt = await import("bcrypt");
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
        businessId: business.id,
        name: adminName || null,
      },
    });

    return res.status(201).json({
      message: "Kayit basarili, onay bekleniyor",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Kayit basarisiz" });
  }
});

router.use(authenticate);

// GET /businesses - main admin business management list
router.get("/", async (req: any, res) => {
  try {
    if (req.user.role !== "MAIN_ADMIN") {
      return res.status(403).json({ message: "Yetkisiz" });
    }

    const businesses = await prisma.business.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        users: {
          select: {
            id: true,
          },
        },
        payments: {
          orderBy: { paidAt: "desc" },
          take: 1,
        },
      },
    });

    return res.json(
      businesses.map((business) => ({
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
        lastPayment: business.payments[0] || null,
      }))
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Isletmeler alinamadi" });
  }
});

// GET /businesses/me - own business profile
// GET /businesses/me - own business profile
router.get("/me", async (req: any, res) => {
  try {
    const user = req.user;

    if (!user.businessId) {
      return res.status(404).json({ message: "Isletme bulunamadi" });
    }

    const business = await prisma.business.findUnique({
      where: { id: Number(user.businessId) },
    });

    if (!business) {
      return res.status(404).json({ message: "Isletme bulunamadi" });
    }

    return res.json(business);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Sunucu hatasi" });
  }
});

// GET /businesses/me/usage - plan usage info
router.get("/me/usage", authenticate, getUsageInfo);

router.get("/me/users", async (req: any, res) => {
  try {
    const user = req.user;

    if (!user.businessId) {
      return res.status(404).json({ message: "Isletme bulunamadi" });
    }

    const users = await prisma.user.findMany({
      where: { businessId: Number(user.businessId) },
      select: { id: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    return res.json(users);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Sunucu hatasi" });
  }
});

// POST /businesses - main admin creates approved business + admin user
router.post("/", async (req: any, res) => {
  try {
    if (req.user.role !== "MAIN_ADMIN") {
      return res.status(403).json({ message: "Yetkisiz" });
    }

    const {
      name,
      sector,
      adminEmail,
      adminPassword,
      planName,
      monthlyFee,
      subscriptionStatus,
      nextBillingDate,
      trialEndsAt,
    } = req.body;

    if (!name || !sector || !adminEmail || !adminPassword) {
      return res.status(400).json({ message: "Ad, sektor, e-posta ve sifre zorunludur" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Bu e-posta zaten kullanimda" });
    }

    const safeMonthlyFee = normalizeMoney(monthlyFee);
    const safeStatus = subscriptionStatus || (safeMonthlyFee > 0 ? "ACTIVE" : "TRIAL");

    const business = await prisma.business.create({
      data: {
        name,
        sector,
        isApproved: true,
        planName: planName || "Starter",
        monthlyFee: safeMonthlyFee,
        subscriptionStatus: safeStatus,
        nextBillingDate: toOptionalDate(nextBillingDate) || (safeMonthlyFee > 0 ? addMonths(1) : null),
        trialEndsAt: toOptionalDate(trialEndsAt) || (safeMonthlyFee > 0 ? null : addDays(14)),
      },
    });

    const bcrypt = await import("bcrypt");
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
        businessId: business.id,
        name: req.body.adminName || null,
      },
    });

    return res.status(201).json({
      message: "Isletme olusturuldu",
      business,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Isletme olusturulamadi" });
  }
});

// POST /businesses/seed-demo
router.post("/seed-demo", async (req: any, res) => {
  try {
    if (req.user.role !== "MAIN_ADMIN") {
      return res.status(403).json({ message: "Yetkisiz" });
    }

    const result = await seedDemoData(prisma);

    return res.json({
      message: "Demo verisi yenilendi",
      ...result,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Demo verisi yenilenemedi" });
  }
});

// PUT /businesses/:id/approve
router.put("/:id/approve", async (req: any, res) => {
  try {
    if (req.user.role !== "MAIN_ADMIN") {
      return res.status(403).json({ message: "Yetkisiz" });
    }

    const businessId = Number(req.params.id);
    const currentBusiness = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!currentBusiness) {
      return res.status(404).json({ message: "Isletme bulunamadi" });
    }

    const nextStatus =
      currentBusiness.subscriptionStatus === "PENDING_APPROVAL"
        ? currentBusiness.monthlyFee > 0
          ? "ACTIVE"
          : "TRIAL"
        : currentBusiness.subscriptionStatus;

    const business = await prisma.business.update({
      where: { id: businessId },
      data: {
        isApproved: true,
        subscriptionStatus: nextStatus,
        nextBillingDate:
          currentBusiness.nextBillingDate || (currentBusiness.monthlyFee > 0 ? addMonths(1) : null),
        trialEndsAt:
          currentBusiness.trialEndsAt || (currentBusiness.monthlyFee > 0 ? null : addDays(14)),
      },
    });

    return res.json(business);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Onaylama basarisiz" });
  }
});

// PUT /businesses/:id/billing
router.put("/:id/billing", async (req: any, res) => {
  try {
    if (req.user.role !== "MAIN_ADMIN") {
      return res.status(403).json({ message: "Yetkisiz" });
    }

    const businessId = Number(req.params.id);
    const { planName, monthlyFee, subscriptionStatus, nextBillingDate, trialEndsAt } = req.body;

    const business = await prisma.business.update({
      where: { id: businessId },
      data: {
        planName: planName || "Starter",
        monthlyFee: normalizeMoney(monthlyFee),
        subscriptionStatus: subscriptionStatus || "TRIAL",
        nextBillingDate: toOptionalDate(nextBillingDate),
        trialEndsAt: toOptionalDate(trialEndsAt),
      },
    });

    return res.json({
      message: "Paket bilgileri guncellendi",
      business,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Paket bilgileri guncellenemedi" });
  }
});

// POST /businesses/:id/payments
router.post("/:id/payments", async (req: any, res) => {
  try {
    if (req.user.role !== "MAIN_ADMIN") {
      return res.status(403).json({ message: "Yetkisiz" });
    }

    const businessId = Number(req.params.id);
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      return res.status(404).json({ message: "Isletme bulunamadi" });
    }

    const amount = normalizeMoney(req.body?.amount || business.monthlyFee);

    if (amount <= 0) {
      return res.status(400).json({ message: "Tahsilat tutari sifirdan buyuk olmali" });
    }

    const paidAt = new Date();

    const payment = await prisma.payment.create({
      data: {
        businessId,
        amount,
        status: "PAID",
        note: req.body?.note || "Manuel tahsilat kaydi",
        paidAt,
      },
    });

    const nextBillingBase =
      business.nextBillingDate && business.nextBillingDate > paidAt ? business.nextBillingDate : paidAt;
    const updatedNextBillingDate = new Date(nextBillingBase);
    updatedNextBillingDate.setMonth(updatedNextBillingDate.getMonth() + 1);

    await prisma.business.update({
      where: { id: businessId },
      data: {
        subscriptionStatus: business.subscriptionStatus === "CANCELLED" ? "ACTIVE" : business.subscriptionStatus,
        nextBillingDate: updatedNextBillingDate,
      },
    });

    return res.status(201).json({
      message: "Tahsilat kaydedildi",
      payment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Tahsilat kaydedilemedi" });
  }
});

// DELETE /businesses/:id
router.delete("/:id", async (req: any, res) => {
  try {
    if (req.user.role !== "MAIN_ADMIN") {
      return res.status(403).json({ message: "Yetkisiz" });
    }

    const businessId = Number(req.params.id);
    const businessUsers = await prisma.user.findMany({
      where: { businessId },
      select: { id: true },
    });

    await prisma.payment.deleteMany({ where: { businessId } });
    await prisma.sale.deleteMany({ where: { businessId } });
    await prisma.order.deleteMany({ where: { businessId } });
    await prisma.product.deleteMany({ where: { businessId } });
    await prisma.customer.deleteMany({ where: { businessId } });
    await prisma.refreshToken.deleteMany({
      where: {
        userId: {
          in: businessUsers.map((user) => user.id),
        },
      },
    });
    await prisma.user.deleteMany({ where: { businessId } });
    await prisma.business.delete({ where: { id: businessId } });

    return res.json({ message: "Isletme silindi" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Silme basarisiz" });
  }
});

export default router;
