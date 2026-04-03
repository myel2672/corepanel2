import { Router } from "express";
import { authenticate, requireBusinessUser } from "../middleware/auth";
import { staffGuard } from "../middleware/staffGuard";
import { validate } from "../middleware/validate";
import { createProductSchema } from "../schemas/order.schema";
import { paginate, paginateResponse, PaginatedRequest } from "../middleware/pagination";
import { checkUsageLimit } from "../middleware/usageLimit";
import { auditLog } from "../middleware/auditLog";
import prisma from "../prisma";

const router = Router();

router.use(authenticate);
router.use(requireBusinessUser);

// GET PRODUCTS with pagination
router.get("/", paginate(), async (req: PaginatedRequest, res) => {
  try {
    const user = req.user as any;
    let where: any = { deletedAt: null };

    if (user.role === "MAIN_ADMIN") {
      where.businessId = null;
    } else {
      where.businessId = Number(user.businessId);
    }

    if (req.pagination.search) {
      where.name = { contains: req.pagination.search, mode: "insensitive" as any };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { [req.pagination.sortBy]: req.pagination.sortOrder },
        skip: req.pagination.skip,
        take: req.pagination.limit,
      }),
      prisma.product.count({ where }),
    ]);

    return paginateResponse(res, products, total, req.pagination.page, req.pagination.limit);
  } catch {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// CREATE PRODUCT
router.post("/", staffGuard, checkUsageLimit("products"), validate(createProductSchema), auditLog("product"), async (req: any, res) => {
  try {
    const user = req.user;
    const { name, description, price, costPrice, stock } = req.body;

    const finalBusinessId = user.role === "MAIN_ADMIN" ? null : Number(user.businessId);

    if (user.role !== "MAIN_ADMIN" && !finalBusinessId) {
      return res.status(400).json({ message: "Business ID gerekli" });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        costPrice: costPrice ? Number(costPrice) : null,
        stock: Number(stock),
        businessId: finalBusinessId,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ürün oluşturulamadı" });
  }
});

// UPDATE PRODUCT
router.put("/:id", staffGuard, auditLog("product"), async (req: any, res) => {
  try {
    const user = req.user;
    const productId = Number(req.params.id);
    const { name, description, price, costPrice, stock } = req.body;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ message: "Ürün bulunamadı" });

    if (user.role === "MAIN_ADMIN" && product.businessId !== null) {
      return res.status(403).json({ message: "Yetkisiz işlem" });
    }
    if (user.role === "ADMIN" && product.businessId !== Number(user.businessId)) {
      return res.status(403).json({ message: "Yetkisiz işlem" });
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        price: Number(price),
        costPrice: costPrice ? Number(costPrice) : null,
        stock: Number(stock),
      },
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ürün güncellenemedi" });
  }
});

// DELETE PRODUCT (soft delete)
router.delete("/:id", staffGuard, auditLog("product"), async (req: any, res) => {
  try {
    const user = req.user;
    const productId = Number(req.params.id);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ message: "Ürün bulunamadı" });

    if (user.role === "MAIN_ADMIN" && product.businessId !== null) {
      return res.status(403).json({ message: "Yetkisiz işlem" });
    }
    if (user.role === "ADMIN" && product.businessId !== Number(user.businessId)) {
      return res.status(403).json({ message: "Yetkisiz işlem" });
    }

    await prisma.product.update({
      where: { id: productId },
      data: { deletedAt: new Date() },
    });

    res.json({ message: "Ürün silindi" });
  } catch (error: any) {
    if (error.code === "P2003") {
      return res.status(400).json({ message: "Bu ürün siparişlerde kullanıldığı için silinemez." });
    }
    console.error(error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

export default router;
