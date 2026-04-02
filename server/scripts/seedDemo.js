import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { seedDemoData, DEMO_EMAIL, DEMO_PASSWORD } from "../src/services/demoSeed";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding demo business data...");
  const result = await seedDemoData(prisma);

  console.log("Demo data ready.");
  console.log(`Business ID: ${result.businessId}`);
  console.log(`Products: ${result.productCount}`);
  console.log(`Customers: ${result.customerCount}`);
  console.log(`Orders: ${result.orderCount}`);
  console.log(`Sales: ${result.saleCount}`);
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
