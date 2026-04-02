import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const addMonths = (months: number) => {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return date;
};

const addDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

async function main() {
  console.log("Seed basliyor...");

  await prisma.payment.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.business.deleteMany();

  const password = await bcrypt.hash("123456", 10);

  const tech = await prisma.business.create({
    data: {
      name: "Teknoloji AS",
      sector: "Teknoloji",
      isApproved: true,
      planName: "Growth",
      monthlyFee: 2499,
      subscriptionStatus: "ACTIVE",
      nextBillingDate: addMonths(1),
    },
  });

  const food = await prisma.business.create({
    data: {
      name: "Gida Ltd",
      sector: "Gida",
      isApproved: true,
      planName: "Starter",
      monthlyFee: 1499,
      subscriptionStatus: "ACTIVE",
      nextBillingDate: addMonths(1),
    },
  });

  const pending = await prisma.business.create({
    data: {
      name: "Yeni Basvuru Magazasi",
      sector: "Perakende",
      isApproved: false,
      planName: "Starter",
      monthlyFee: 0,
      subscriptionStatus: "PENDING_APPROVAL",
      trialEndsAt: addDays(14),
    },
  });

  await prisma.user.create({
    data: {
      email: "admin@corepanel.com",
      password,
      role: "MAIN_ADMIN",
      isEmailVerified: true,
    },
  });

  await prisma.user.create({
    data: {
      email: "tech@corepanel.com",
      password,
      role: "ADMIN",
      businessId: tech.id,
      isEmailVerified: true,
    },
  });

  await prisma.user.create({
    data: {
      email: "gida@corepanel.com",
      password,
      role: "ADMIN",
      businessId: food.id,
      isEmailVerified: true,
    },
  });

  await prisma.user.create({
    data: {
      email: "yeni@corepanel.com",
      password,
      role: "ADMIN",
      businessId: pending.id,
      isEmailVerified: true,
    },
  });

  await prisma.payment.createMany({
    data: [
      {
        businessId: tech.id,
        amount: 2499,
        status: "PAID",
        note: "Mart paket tahsilati",
        paidAt: addDays(-10),
      },
      {
        businessId: food.id,
        amount: 1499,
        status: "PAID",
        note: "Mart paket tahsilati",
        paidAt: addDays(-7),
      },
    ],
  });

  console.log("Seed tamamlandi. Sifre: 123456");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
