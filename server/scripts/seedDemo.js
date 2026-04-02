import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const DEMO_EMAIL = "demo@corepanel.com";
const DEMO_PASSWORD = "demo1234";
const DEMO_BUSINESS_NAME = "Demo Isletme";

const daysAgo = (days, hour = 12) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, 0, 0, 0);
  return date;
};

const monthsAgo = (months, day, hour = 12) => {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  date.setDate(day);
  date.setHours(hour, 0, 0, 0);
  return date;
};

async function main() {
  console.log("Seeding demo business data...");

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  const existingDemoUser = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
    include: { business: true },
  });

  let demoBusiness =
    existingDemoUser?.business ||
    (await prisma.business.findFirst({
      where: { name: DEMO_BUSINESS_NAME },
    }));

  if (!demoBusiness) {
    demoBusiness = await prisma.business.create({
      data: {
        name: DEMO_BUSINESS_NAME,
        sector: "Kafe",
        isApproved: true,
      },
    });
  } else {
    demoBusiness = await prisma.business.update({
      where: { id: demoBusiness.id },
      data: {
        name: DEMO_BUSINESS_NAME,
        sector: "Kafe",
        isApproved: true,
      },
    });
  }

  const demoUser = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {
      password: hashedPassword,
      role: "DEMO",
      businessId: demoBusiness.id,
      isEmailVerified: true,
    },
    create: {
      email: DEMO_EMAIL,
      password: hashedPassword,
      role: "DEMO",
      businessId: demoBusiness.id,
      isEmailVerified: true,
    },
  });

  await prisma.refreshToken.deleteMany({ where: { userId: demoUser.id } });
  await prisma.order.deleteMany({ where: { businessId: demoBusiness.id } });
  await prisma.sale.deleteMany({ where: { businessId: demoBusiness.id } });
  await prisma.customer.deleteMany({ where: { businessId: demoBusiness.id } });
  await prisma.product.deleteMany({ where: { businessId: demoBusiness.id } });

  const products = await Promise.all([
    prisma.product.create({
      data: { name: "Espresso", price: 95, costPrice: 36, stock: 18, businessId: demoBusiness.id },
    }),
    prisma.product.create({
      data: { name: "Filtre Kahve", price: 80, costPrice: 30, stock: 4, businessId: demoBusiness.id },
    }),
    prisma.product.create({
      data: { name: "Tavuk Sandvic", price: 135, costPrice: 58, stock: 3, businessId: demoBusiness.id },
    }),
    prisma.product.create({
      data: { name: "Cheesecake", price: 120, costPrice: 48, stock: 9, businessId: demoBusiness.id },
    }),
    prisma.product.create({
      data: { name: "Limonata", price: 55, costPrice: 16, stock: 14, businessId: demoBusiness.id },
    }),
  ]);

  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: "Aylin Demir",
        email: "aylin@demo.com",
        phone: "05551112233",
        address: "Ataturk Mah. Park Sok. No:12 Kadikoy / Istanbul",
        businessId: demoBusiness.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: "Mert Kaya",
        email: "mert@demo.com",
        phone: "05552223344",
        address: "Bagdat Cad. No:48 Daire 5 Suadiye / Istanbul",
        businessId: demoBusiness.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: "Selin Acar",
        email: "selin@demo.com",
        phone: "05553334455",
        address: "Mimar Sinan Cad. No:7 Bornova / Izmir",
        businessId: demoBusiness.id,
      },
    }),
    prisma.customer.create({
      data: {
        name: "Kerem Yildiz",
        email: "kerem@demo.com",
        phone: "05554445566",
        address: "Lale Sok. No:21 Nilufer / Bursa",
        businessId: demoBusiness.id,
      },
    }),
  ]);

  const productMap = Object.fromEntries(products.map((product) => [product.name, product]));
  const customerMap = Object.fromEntries(customers.map((customer) => [customer.name, customer]));

  const orderSeed = [
    { product: "Espresso", customer: "Aylin Demir", quantity: 4, createdAt: monthsAgo(5, 6, 10) },
    { product: "Cheesecake", customer: "Mert Kaya", quantity: 2, createdAt: monthsAgo(4, 14, 13) },
    { product: "Espresso", customer: "Selin Acar", quantity: 6, createdAt: monthsAgo(3, 9, 11) },
    { product: "Tavuk Sandvic", customer: "Kerem Yildiz", quantity: 3, createdAt: monthsAgo(2, 21, 14) },
    { product: "Filtre Kahve", customer: "Aylin Demir", quantity: 2, createdAt: monthsAgo(1, 11, 9) },
    { product: "Espresso", customer: "Mert Kaya", quantity: 3, createdAt: daysAgo(6, 10) },
    { product: "Tavuk Sandvic", customer: "Selin Acar", quantity: 1, createdAt: daysAgo(4, 12) },
    { product: "Cheesecake", customer: "Kerem Yildiz", quantity: 2, createdAt: daysAgo(2, 15) },
    { product: "Espresso", customer: "Aylin Demir", quantity: 2, createdAt: daysAgo(0, 16) },
  ];

  const saleSeed = [
    { product: "Limonata", quantity: 5, createdAt: monthsAgo(5, 18, 15) },
    { product: "Filtre Kahve", quantity: 4, createdAt: monthsAgo(4, 24, 16) },
    { product: "Cheesecake", quantity: 3, createdAt: monthsAgo(3, 16, 12) },
    { product: "Espresso", quantity: 5, createdAt: monthsAgo(2, 5, 17) },
    { product: "Limonata", quantity: 6, createdAt: monthsAgo(1, 23, 18) },
    { product: "Espresso", quantity: 4, createdAt: daysAgo(5, 11) },
    { product: "Limonata", quantity: 3, createdAt: daysAgo(3, 13) },
    { product: "Cheesecake", quantity: 2, createdAt: daysAgo(1, 17) },
  ];

  await prisma.order.createMany({
    data: orderSeed.map((order) => ({
      productId: productMap[order.product].id,
      businessId: demoBusiness.id,
      customerId: customerMap[order.customer].id,
      quantity: order.quantity,
      status: "COMPLETED",
      createdAt: order.createdAt,
    })),
  });

  await prisma.sale.createMany({
    data: saleSeed.map((sale) => {
      const product = productMap[sale.product];
      const total = sale.quantity * product.price;

      return {
        businessId: demoBusiness.id,
        productId: product.id,
        description: product.name,
        quantity: sale.quantity,
        unitPrice: product.price,
        unitCost: product.costPrice || 0,
        total,
        amount: total,
        date: sale.createdAt,
        createdAt: sale.createdAt,
      };
    }),
  });

  console.log("Demo data ready.");
  console.log(`Login: ${DEMO_EMAIL}`);
  console.log(`Password: ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error("Demo seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
