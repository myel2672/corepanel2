// server/prisma/seed.ts
// Çalıştırmak için: npx ts-node prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@corepanel.com' },
    update: {},
    create: {
      name: 'Ana Admin',
      email: 'admin@corepanel.com',
      password,
      role: 'MAIN_ADMIN',
    },
  });

  console.log('✅ Admin kullanıcı oluşturuldu:', admin.email);
  console.log('📧 Email: admin@corepanel.com');
  console.log('🔑 Şifre: admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
