import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /business → tüm işletmeleri getir
export const getBusinesses = async (req: Request, res: Response) => {
  try {
    const businesses = await prisma.business.findMany({
      include: {
        users: true,
        products: true,
        customers: true,
        orders: true,
        sales: true,
      },
    });
    res.status(200).json(businesses);
  } catch (error) {
    console.error("GET BUSINESSES ERROR:", error);
    res.status(500).json({ message: "İşletmeler alınamadı" });
  }
};

// POST /business → yeni işletme oluştur
export const createBusiness = async (req: Request, res: Response) => {
  try {
    const { name, sector } = req.body;

    if (!name || !sector) {
      return res.status(400).json({ message: "Name ve sector zorunludur" });
    }

    const newBusiness = await prisma.business.create({
      data: {
        name,
        sector,
      },
    });

    res.status(201).json(newBusiness);
  } catch (error) {
    console.error("CREATE BUSINESS ERROR:", error);
    res.status(500).json({ message: "İşletme oluşturulamadı" });
  }
};