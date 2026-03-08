import { Response } from "express"
import { PrismaClient } from "@prisma/client"
import { AuthRequest } from "../middleware/auth"

const prisma = new PrismaClient()

export const getSummary = async (req: AuthRequest, res: Response) => {
  try {
    const userId = Number(req.user?.id)
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return res.status(401).json({ error: "User not found" })

    const isMainAdmin = user.role === "MAIN_ADMIN"
    const businessId = user.businessId || null

    if (isMainAdmin) {
      const totalBusinesses = await prisma.business.count()
      const totalCustomers = await prisma.customer.count()
      const totalProducts = await prisma.product.count()
      const totalOrders = await prisma.order.count()

      const orders = await prisma.order.findMany({
        where: { status: { not: "CANCELLED" } },
        include: { product: true },
      })

      let totalSales = 0
      orders.forEach((o: any) => { totalSales += o.quantity * o.product.price })
      const profit = totalSales * 0.4

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        d.setHours(0, 0, 0, 0)
        return d
      })

      const dailySales = await Promise.all(last7Days.map(async (day) => {
        const nextDay = new Date(day)
        nextDay.setDate(nextDay.getDate() + 1)
        const dayOrders = await prisma.order.findMany({
          where: { status: { not: "CANCELLED" }, createdAt: { gte: day, lt: nextDay } },
          include: { product: true },
        })
        let total = 0
        dayOrders.forEach((o: any) => { total += o.quantity * o.product.price })
        return { date: day.toLocaleDateString("tr-TR", { weekday: "short", day: "numeric" }), total: parseFloat(total.toFixed(2)) }
      }))

      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date()
        d.setMonth(d.getMonth() - (5 - i))
        d.setDate(1)
        d.setHours(0, 0, 0, 0)
        return d
      })

      const monthlySales = await Promise.all(last6Months.map(async (month) => {
        const nextMonth = new Date(month)
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        const monthOrders = await prisma.order.findMany({
          where: { status: { not: "CANCELLED" }, createdAt: { gte: month, lt: nextMonth } },
          include: { product: true },
        })
        let total = 0
        monthOrders.forEach((o: any) => { total += o.quantity * o.product.price })
        return { date: month.toLocaleDateString("tr-TR", { month: "short" }), total: parseFloat(total.toFixed(2)) }
      }))

      return res.json({
        isMainAdmin: true,
        totalBusinesses,
        totalCustomers,
        totalProducts,
        totalOrders,
        totalSales: parseFloat(totalSales.toFixed(2)),
        profit: parseFloat(profit.toFixed(2)),
        dailySales,
        monthlySales,
        top: [],
        lowStock: [],
      })
    }

    if (!businessId) return res.json({
      totalOrders: 0, totalSales: 0, totalCost: 0, profit: 0,
      top: [], lowStock: [], dailySales: [], monthlySales: [],
    })

    const totalOrders = await prisma.order.count({ where: { businessId: Number(businessId), status: { not: "CANCELLED" } } })

    const orders = await prisma.order.findMany({
      where: { businessId: Number(businessId), status: { not: "CANCELLED" } },
      include: { product: true },
    })

    let totalSales = 0
    orders.forEach((o: any) => { totalSales += o.quantity * o.product.price })
    const totalCost = totalSales * 0.6
    const profit = totalSales - totalCost

    const topMap: Record<number, { product: any; sold: number }> = {}
    orders.forEach((o: any) => {
      if (!topMap[o.productId]) topMap[o.productId] = { product: o.product, sold: 0 }
      topMap[o.productId].sold += o.quantity
    })
    const top = Object.values(topMap).sort((a, b) => b.sold - a.sold).slice(0, 5)

    const lowStock = await prisma.product.findMany({ where: { businessId: Number(businessId), stock: { lt: 5 } } })

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      d.setHours(0, 0, 0, 0)
      return d
    })

    const dailySales = await Promise.all(last7Days.map(async (day) => {
      const nextDay = new Date(day)
      nextDay.setDate(nextDay.getDate() + 1)
      const dayOrders = await prisma.order.findMany({
        where: { businessId: Number(businessId), status: { not: "CANCELLED" }, createdAt: { gte: day, lt: nextDay } },
        include: { product: true },
      })
      let total = 0
      dayOrders.forEach((o: any) => { total += o.quantity * o.product.price })
      return { date: day.toLocaleDateString("tr-TR", { weekday: "short", day: "numeric" }), total: parseFloat(total.toFixed(2)) }
    }))

    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - (5 - i))
      d.setDate(1)
      d.setHours(0, 0, 0, 0)
      return d
    })

    const monthlySales = await Promise.all(last6Months.map(async (month) => {
      const nextMonth = new Date(month)
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      const monthOrders = await prisma.order.findMany({
        where: { businessId: Number(businessId), status: { not: "CANCELLED" }, createdAt: { gte: month, lt: nextMonth } },
        include: { product: true },
      })
      let total = 0
      monthOrders.forEach((o: any) => { total += o.quantity * o.product.price })
      return { date: month.toLocaleDateString("tr-TR", { month: "short" }), total: parseFloat(total.toFixed(2)) }
    }))

    res.json({
      totalOrders,
      totalSales: parseFloat(totalSales.toFixed(2)),
      totalCost: parseFloat(totalCost.toFixed(2)),
      profit: parseFloat(profit.toFixed(2)),
      top,
      lowStock,
      dailySales,
      monthlySales,
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Dashboard data error" })
  }
}