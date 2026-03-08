import { Request, Response } from "express"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, price, stock, businessId } = req.body

    if (!businessId) {
      return res.status(400).json({ message: "Business ID gerekli" })
    }

    const product = await prisma.product.create({
      data: {
        name,
        price,
        stock,
        businessId
      }
    })

    res.json(product)

  } catch (error) {
    res.status(500).json({ message: "Product oluşturulamadı" })
  }
}

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany()

    res.json(products)

  } catch (error) {
    res.status(500).json({ message: "Products alınamadı" })
  }
}