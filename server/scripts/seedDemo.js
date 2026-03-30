import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("demo1234", 10);

  // Önce demo business oluştur (sector zorunlu!)
  let demoBusiness = await prisma.business.findFirst({
    where: { name: "Demo İşletme" }
  });

  if (!demoBusiness) {
    demoBusiness = await prisma.business.create({
      data: {
        name: "Demo İşletme",
        sector: "Genel",
        isApproved: true,  // onaylı olsun ki giriş yapabilsin
      }
    });
  }

  // Demo kullanıcı oluştur
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@corepanel.com" },
    update: {},
    create: {
      email: "demo@corepanel.com",
      password: hashedPassword,
      role: "DEMO",
      businessId: demoBusiness.id,
      isEmailVerified: true,
    }
  });

  console.log("Demo user created:", demoUser);

  // Business'a ownerId yoksa update etmeye gerek yok, businessId user'da
  
  // Örnek ürünler
  await prisma.product.createMany({
    skipDuplicates: true,
    data: [
      { name: "Örnek Ürün 1", price: 100, costPrice: 60, stock: 50, businessId: demoBusiness.id },
      { name: "Örnek Ürün 2", price: 200, costPrice: 120, stock: 30, businessId: demoBusiness.id },
      { name: "Örnek Ürün 3", price: 350, costPrice: 200, stock: 15, businessId: demoBusiness.id },
    ]
  });

  // Örnek müşteriler
  await prisma.customer.createMany({
    skipDuplicates: true,
    data: [
      { name: "Ahmet Yılmaz", email: "ahmet@example.com", phone: "0555 111 2233", businessId: demoBusiness.id },
      { name: "Ayşe Kaya", email: "ayse@example.com", phone: "0532 444 5566", businessId: demoBusiness.id },
    ]
  });

  console.log("✅ Demo veriler oluşturuldu");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());