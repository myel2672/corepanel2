import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, AuthRequest } from "../middleware/auth";
import XLSX from "xlsx";


const router = Router();
const prisma = new PrismaClient();

// Tarih aralığı yardımcısı
const getDateRange = (startDate?: string, endDate?: string) => {
  const end = endDate ? new Date(endDate) : new Date();
  end.setHours(23, 59, 59, 999);
  const start = startDate ? new Date(startDate) : new Date();
  start.setDate(start.getDate() - 30);
  start.setHours(0, 0, 0, 0);
  return { start, end };
};

// GET /reports/summary?startDate=2024-01-01&endDate=2024-01-31
router.get('/summary', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user as any;
    const { start, end } = getDateRange(
      req.query.startDate as string,
      req.query.endDate as string
    );

    const businessFilter = user.role !== 'MAIN_ADMIN'
      ? { businessId: Number(user.businessId) }
      : {};

    // Manuel satışlar
    const sales = await prisma.sale.findMany({
      where: { ...businessFilter, date: { gte: start, lte: end } },
      include: { product: true },
      orderBy: { date: 'asc' },
    });

    // Siparişler
    const orders = await prisma.order.findMany({
      where: { ...businessFilter, status: { not: 'CANCELLED' }, createdAt: { gte: start, lte: end } },
      include: { product: true, customer: true },
      orderBy: { createdAt: 'asc' },
    });

    // Satış toplamları
    const saleRevenue = sales.reduce((a, s) => a + (s.total || 0), 0);
    const saleCost = sales.reduce((a, s) => a + (s.unitCost || 0) * (s.quantity || 1), 0);
    const saleProfit = saleRevenue - saleCost;

    // Sipariş toplamları
    const orderRevenue = orders.reduce((a, o) => a + o.quantity * (o.product?.price || 0), 0);
    const orderProfit = orderRevenue * 0.4;

    // Günlük grafik verisi
    const dailyMap: Record<string, { saleTotal: number; orderTotal: number }> = {};
    sales.forEach(s => {
      const key = new Date(s.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
      if (!dailyMap[key]) dailyMap[key] = { saleTotal: 0, orderTotal: 0 };
      dailyMap[key].saleTotal += s.total || 0;
    });
    orders.forEach(o => {
      const key = new Date(o.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
      if (!dailyMap[key]) dailyMap[key] = { saleTotal: 0, orderTotal: 0 };
      dailyMap[key].orderTotal += o.quantity * (o.product?.price || 0);
    });
    const dailySeries = Object.entries(dailyMap).map(([date, v]) => ({
      date,
      total: parseFloat((v.saleTotal + v.orderTotal).toFixed(2)),
      saleTotal: parseFloat(v.saleTotal.toFixed(2)),
      orderTotal: parseFloat(v.orderTotal.toFixed(2)),
    }));

    res.json({
      period: { start: start.toISOString(), end: end.toISOString() },
      sales: {
        count: sales.length,
        revenue: parseFloat(saleRevenue.toFixed(2)),
        cost: parseFloat(saleCost.toFixed(2)),
        profit: parseFloat(saleProfit.toFixed(2)),
      },
      orders: {
        count: orders.length,
        revenue: parseFloat(orderRevenue.toFixed(2)),
        profit: parseFloat(orderProfit.toFixed(2)),
      },
      total: {
        revenue: parseFloat((saleRevenue + orderRevenue).toFixed(2)),
        profit: parseFloat((saleProfit + orderProfit).toFixed(2)),
      },
      dailySeries,
      salesList: sales,
      ordersList: orders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Rapor alınamadı' });
  }
});

// GET /reports/export?startDate=...&endDate=...&type=sales|orders|all
router.get('/export', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user as any;
    const { start, end } = getDateRange(
      req.query.startDate as string,
      req.query.endDate as string
    );
    const type = (req.query.type as string) || 'all';

    const businessFilter = user.role !== 'MAIN_ADMIN'
      ? { businessId: Number(user.businessId) }
      : {};

    const rows: string[][] = [];
    const header = ['Tür', 'Tarih', 'Ürün', 'Müşteri', 'Adet', 'Birim Fiyat', 'Maliyet', 'Toplam', 'Kâr'];
    rows.push(header);

    if (type === 'sales' || type === 'all') {
      const sales = await prisma.sale.findMany({
        where: { ...businessFilter, date: { gte: start, lte: end } },
        include: { product: true },
        orderBy: { date: 'asc' },
      });
      sales.forEach(s => {
        const profit = (s.total || 0) - (s.unitCost || 0) * (s.quantity || 1);
        rows.push([
          'Satış',
          new Date(s.date).toLocaleDateString('tr-TR'),
          s.product?.name || s.description || '—',
          '—',
          String(s.quantity || 0),
          String(s.unitPrice || 0),
          String(s.unitCost || 0),
          String(s.total || 0),
          profit.toFixed(2),
        ]);
      });
    }

    if (type === 'orders' || type === 'all') {
      const orders = await prisma.order.findMany({
        where: { ...businessFilter, status: { not: 'CANCELLED' }, createdAt: { gte: start, lte: end } },
        include: { product: true, customer: true },
        orderBy: { createdAt: 'asc' },
      });
      orders.forEach(o => {
        const total = o.quantity * (o.product?.price || 0);
        rows.push([
          'Sipariş',
          new Date(o.createdAt).toLocaleDateString('tr-TR'),
          o.product?.name || '—',
          o.customer?.name || '—',
          String(o.quantity),
          String(o.product?.price || 0),
          '—',
          total.toFixed(2),
          (total * 0.4).toFixed(2),
        ]);
      });
    }

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Rapor");

    const excelBuffer = Buffer.from(XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    }));

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="corepanel_rapor_${new Date().toISOString().slice(0, 10)}.xlsx"`
    );
    res.send(excelBuffer);


  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Export başarısız' });
  }
});

export default router;
