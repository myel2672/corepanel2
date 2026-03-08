import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();
async function main() {
  console.log('Seed basliyor...');
  await prisma.sale.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.business.deleteMany();
  const password = await bcrypt.hash('123456', 10);
  const t = await prisma.business.create({ data: { name: 'Teknoloji AS', sector: 'Teknoloji', isApproved: true } });
  const g = await prisma.business.create({ data: { name: 'Gida Ltd', sector: 'Gida', isApproved: true } });
  await prisma.user.create({ data: { email: 'admin@corepanel.com', password, role: 'MAIN_ADMIN' } });
  await prisma.user.create({ data: { email: 'tech@corepanel.com', password, role: 'ADMIN', businessId: t.id } });
  await prisma.user.create({ data: { email: 'gida@corepanel.com', password, role: 'ADMIN', businessId: g.id } });
  console.log('Seed tamamlandi! Sifre: 123456');
}
main().catch(console.error).finally(() => prisma[String.fromCharCode(36)+'disconnect']());
