import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Önce Business oluştur
  const business = await prisma.business.create({
    data: {
      name: "Ana İşletme",
    },
  });
  console.log("✅ Business oluşturuldu:", business.id);

  // MAIN_ADMIN'i business'a bağlı oluştur
  const hashedPassword = await bcrypt.hash("123456", 10);
  await prisma.user.create({
    data: {
      email: "admin@corepanel.com",
      password: hashedPassword,
      role: Role.MAIN_ADMIN,
      businessId: business.id,
    },
  });
  console.log("✅ MAIN_ADMIN oluşturuldu");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
