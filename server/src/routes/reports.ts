import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

// Sales summary: ?period=daily|monthly&range=30
router.get('/sales/summary', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user as any;
    const period = (req.query.period as string) || 'daily';
    const range = Number(req.query.range || 30);
    const where: any = {};
    if (user.role !== 'MAIN_ADMIN') where.businessId = user.businessId;

    const start = new Date();
    if (period === 'daily') start.setDate(start.getDate() - range);
    else { start.setMonth(start.getMonth() - Math.max(range, 1)); }
    where.date = { gte: start };

    const sales = await prisma.sale.findMany({ where, orderBy: { date: 'asc' } });

    const totalSales = sales.reduce((s, x) => s + (x.total || 0), 0);
    const totalCost = sales.reduce((s, x) => s + ((x.unitCost || 0) * (x.quantity || 1)), 0);
    const profit = totalSales - totalCost;

    // Build series grouped by day or month
    const seriesMap: Record<string, { total: number; cost: number; profit: number }> = {};
    sales.forEach(s => {
      const d = new Date(s.date);
      const key = period === 'daily' ? d.toISOString().slice(0,10) : `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      seriesMap[key] = seriesMap[key] || { total: 0, cost: 0, profit: 0 };
      const tot = s.total || 0;
      const cost = (s.unitCost || 0) * (s.quantity || 1);
      seriesMap[key].total += tot;
      seriesMap[key].cost += cost;
      seriesMap[key].profit += tot - cost;
    });

    const series = Object.keys(seriesMap).map(k => ({ label: k, ...seriesMap[k] }));

    res.json({ totalSales, totalCost, profit, series });
  } catch (err) {
    res.status(500).json({ message: 'Report failed', error: err });
  }
});

// CSV export of sales for period
router.get('/sales/export', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user as any;
    const period = (req.query.period as string) || 'daily';
    const range = Number(req.query.range || 30);
    const where: any = {};
    if (user.role !== 'MAIN_ADMIN') where.businessId = user.businessId;

    const start = new Date();
    if (period === 'daily') start.setDate(start.getDate() - range);
    else start.setMonth(start.getMonth() - Math.max(range, 1));
    where.date = { gte: start };

    const sales = await prisma.sale.findMany({ where, orderBy: { date: 'asc' } });

    const rows = sales.map(s => [
      s.date.toISOString(),
      s.description || '',
      s.category || '',
      s.productId || '',
      String(s.quantity || 0),
      String(s.unitPrice || 0),
      String(s.unitCost || 0),
      String(s.total || 0),
      s.businessId || '',
    ]);

    const header = ['date','description','category','productId','quantity','unitPrice','unitCost','total','businessId'];
    const csv = [header.join(','), ...rows.map(r => r.map(c => '"' + String(c).replace(/"/g,'""') + '"').join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="sales_${period}.csv"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: 'Export failed', error: err });
  }
});

export default router;
