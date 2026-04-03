import { Router } from "express"
import { authenticate, requireAdmin, requireBusinessUser, requireNotDemo, AuthRequest } from "../middleware/auth"
import { validate } from "../middleware/validate"
import { createOrderSchema, updateOrderStatusSchema } from "../schemas/order.schema"
import prisma from "../prisma"

const router = Router()
router.use(authenticate)
router.use(requireBusinessUser)

router.get("/", async (req: AuthRequest, res) => {
  try {
    const user = req.user as any
    const where: any = {}
    if (user.role !== "MAIN_ADMIN") where.businessId = Number(user.businessId)
    const orders = await prisma.order.findMany({
      where,
      include: { product: true, customer: true },
      orderBy: { createdAt: "desc" },
    })
    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: "Siparişler yüklenemedi" })
  }
})

router.post("/", requireNotDemo, validate(createOrderSchema), async (req: AuthRequest, res) => {
  try {
    const user = req.user as any
    const { productId, quantity, customerId } = req.body
    if (!productId || !quantity) return res.status(400).json({ message: "Ürün ve adet zorunludur" })

    const businessId = user.role === "MAIN_ADMIN" ? Number(req.body.businessId) : Number(user.businessId)
    if (!businessId) return res.status(403).json({ message: "İşletme gerekli" })

    const product = await prisma.product.findUnique({ where: { id: Number(productId) } })
    if (!product) return res.status(404).json({ message: "Ürün bulunamadı" })
    if (product.stock < quantity) return res.status(400).json({ message: `Stok yetersiz. Mevcut: ${product.stock}` })

    const order = await prisma.order.create({
      data: {
        productId: Number(productId),
        businessId,
        customerId: customerId ? Number(customerId) : null,
        quantity: Number(quantity),
        status: "COMPLETED",
      },
      include: { product: true, customer: true },
    })

    await prisma.product.update({
      where: { id: Number(productId) },
      data: { stock: { decrement: Number(quantity) } },
    })

    res.json(order)
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Sipariş oluşturulamadı" })
  }
})

router.put("/:id/status", requireNotDemo, validate(updateOrderStatusSchema), async (req: AuthRequest, res) => {
  try {
    const user = req.user as any
    const { status } = req.body
    const order = await prisma.order.findUnique({ where: { id: Number(req.params.id) } })
    if (!order) return res.status(404).json({ message: "Sipariş bulunamadı" })
    if (user.role !== "MAIN_ADMIN" && order.businessId !== Number(user.businessId))
      return res.status(403).json({ message: "Yetkisiz" })
    const updated = await prisma.order.update({
      where: { id: Number(req.params.id) },
      data: { status },
      include: { product: true, customer: true },
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ message: "Durum güncellenemedi" })
  }
})

router.delete("/:id", requireNotDemo, async (req: AuthRequest, res) => {
  try {
    const user = req.user as any
    const order = await prisma.order.findUnique({ where: { id: Number(req.params.id) } })
    if (!order) return res.status(404).json({ message: "Sipariş bulunamadı" })
    if (user.role !== "MAIN_ADMIN" && order.businessId !== Number(user.businessId))
      return res.status(403).json({ message: "Yetkisiz" })
    await prisma.order.delete({ where: { id: Number(req.params.id) } })
    res.json({ message: "Sipariş silindi" })
  } catch (err) {
    res.status(500).json({ message: "Sipariş silinemedi" })
  }
})

export default router



