import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
export interface AuthRequest extends Request {
  user?: { id: string; role: string; businessId?: string };
}
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string; businessId?: string };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const allowed = ["MAIN_ADMIN", "ADMIN", "DEMO"];
  if (!allowed.includes(req.user?.role || "")) {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
};
export const requireMainAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "MAIN_ADMIN") return res.status(403).json({ message: "Main admin only" });
  next();
};
export const requireNotDemo = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role === "DEMO") {
    return res.status(403).json({ message: "Demo hesapta bu islem yapilamaz" });
  }
  next();
};

export const requireBusinessUser = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role === "MAIN_ADMIN") {
    return res.status(403).json({ message: "Bu alan sadece isletme hesaplari icindir" });
  }
  next();
};
