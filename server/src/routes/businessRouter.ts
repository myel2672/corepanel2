import { Router } from "express";
import {
  getBusinesses,
  createBusiness,
  updateBusiness,
  deleteBusiness,
} from "../controllers/businessController";

const router = Router();

// İşletme CRUD endpointleri
router.get("/", getBusinesses);        // Tüm işletmeleri getir
router.post("/", createBusiness);      // Yeni işletme ekle
router.put("/:id", updateBusiness);    // İşletme güncelle
router.delete("/:id", deleteBusiness); // İşletme sil

export default router;