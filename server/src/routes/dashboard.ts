import express from "express";
import { getSummary } from "../controllers/dashboardController";
import { authenticate } from "../middleware/auth";

const router = express.Router();

const staffGuard = (req: any, res: any, next: any) => {
  if (req.user.role === "STAFF") {
    return res.status(403).json({ message: "Personel bu sayfaya erisemez" });
  }
  next();
};

router.get("/summary", authenticate, staffGuard, getSummary);

export default router;
