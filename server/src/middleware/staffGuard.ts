import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

export const staffGuard = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role === "STAFF" || req.user?.role === "DEMO") {
    return res.status(403).json({ message: "Personel bu işlemi yapamaz" });
  }
  next();
};
