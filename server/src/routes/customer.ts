import { Router, Response } from "express";
import { authenticate, requireBusinessUser, AuthRequest } from "../middleware/auth";
import { staffGuard } from "../middleware/staffGuard";
import { validate } from "../middleware/validate";
import { createCustomerSchema } from "../schemas/order.schema";
import { paginate, paginateResponse, PaginatedRequest } from "../middleware/pagination";
import { checkUsageLimit } from "../middleware/usageLimit";
import { auditLog } from "../middleware/auditLog";
import prisma from "../prisma";

const router = Router();
router.use(authenticate);
router.use(requireBusinessUser);

router.get("/", paginate(), async (req: PaginatedRequest, res: Response) => {
  try {
    const user = req.user as any;
    const where: any = { deletedAt: null };
    if (user.role !== "MAIN_ADMIN") where.businessId = Number(user.businessId);

    if (req.pagination.search) {
      where.OR = [
        { name: { contains: req.pagination.search, mode: "insensitive" as any } },
        { email: { contains: req.pagination.search, mode: "insensitive" as any } },
        { phone: { contains: req.pagination.search, mode: "insensitive" as any } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          orders: {
            include: { product: true },
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
        orderBy: { [req.pagination.sortBy]: req.pagination.sortOrder },
        skip: req.pagination.skip,
        take: req.pagination.limit,
      }),
      prisma.customer.count({ where }),
    ]);

    return paginateResponse(res, customers, total, req.pagination.page, req.pagination.limit);
  } catch {
    res.status(500).json({ error: "Müşteriler alınamadı" });
  }
});

router.post("/", staffGuard, checkUsageLimit("customers"), validate(createCustomerSchema), auditLog("customer"), async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user as any;
    const { name, phone, email, address } = req.body;
    if (!name) return res.status(400).json({ error: "İsim zorunludur" });
    const businessId = user.role === "MAIN_ADMIN" ? Number(req.body.businessId) : Number(user.businessId);
    if (!businessId) return res.status(403).json({ error: "İşletme gerekli" });
    const customer = await prisma.customer.create({
      data: { name, phone: phone || null, email: email || null, address: address || null, businessId },
    });
    res.status(201).json(customer);
  } catch {
    res.status(500).json({ error: "Müşteri oluşturulamadı" });
  }
});

router.put("/:id", staffGuard, auditLog("customer"), async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user as any;
    const { name, phone, email, address } = req.body;
    const where: any = { id: Number(req.params.id), deletedAt: null };
    if (user.role !== "MAIN_ADMIN") where.businessId = Number(user.businessId);
    const existing = await prisma.customer.findFirst({ where });
    if (!existing) return res.status(404).json({ error: "Müşteri bulunamadı" });
    const customer = await prisma.customer.update({
      where: { id: Number(req.params.id) },
      data: { name, phone: phone || null, email: email || null, address: address || null },
    });
    res.json(customer);
  } catch {
    res.status(500).json({ error: "Müşteri güncellenemedi" });
  }
});

router.delete("/:id", staffGuard, auditLog("customer"), async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user as any;
    const where: any = { id: Number(req.params.id), deletedAt: null };
    if (user.role !== "MAIN_ADMIN") where.businessId = Number(user.businessId);
    const existing = await prisma.customer.findFirst({ where });
    if (!existing) return res.status(404).json({ error: "Müşteri bulunamadı" });

    await prisma.order.updateMany({
      where: { customerId: Number(req.params.id) },
      data: { customerId: null },
    });

    await prisma.customer.update({
      where: { id: Number(req.params.id) },
      data: { deletedAt: new Date() },
    });

    res.json({ message: "Müşteri silindi" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Müşteri silinemedi" });
  }
});

export default router;
