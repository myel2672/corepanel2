import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../prisma";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET environment variable is required");

export const BUSINESS_APPROVAL_REQUIRED_MESSAGE =
  "Isletme onayi bekleniyor. MAIN_ADMIN onayi sonrasi giris yapabilirsiniz.";

export interface AuthRequest extends Request {
  user?: { id: string | number; role: string; businessId?: string | number };
}

export const getBusinessApprovalBlock = async (user?: {
  role?: string;
  businessId?: string | number | null;
}) => {
  if (!user?.role || user.role === "MAIN_ADMIN" || user.role === "DEMO") {
    return null;
  }

  if (!user.businessId) {
    return null;
  }

  const business = await prisma.business.findUnique({
    where: { id: Number(user.businessId) },
    select: { isApproved: true },
  });

  if (business && !business.isApproved) {
    return BUSINESS_APPROVAL_REQUIRED_MESSAGE;
  }

  return null;
};

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string | number;
      role: string;
      businessId?: string | number;
    };

    const user = await prisma.user.findUnique({
      where: { id: Number(decoded.id) },
      select: { id: true, role: true, businessId: true },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const businessBlockMessage = await getBusinessApprovalBlock(user);
    if (businessBlockMessage) {
      return res.status(403).json({ message: businessBlockMessage });
    }

    req.user = {
      id: user.id,
      role: user.role,
      businessId: user.businessId ?? undefined,
    };

    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  const allowed = ["MAIN_ADMIN", "ADMIN", "DEMO"];
  if (!allowed.includes(req.user?.role || "")) {
    return res.status(403).json({ message: "Admin only" });
  }
  return next();
};

export const requireMainAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "MAIN_ADMIN") {
    return res.status(403).json({ message: "Main admin only" });
  }
  return next();
};

export const requireNotDemo = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role === "DEMO") {
    return res.status(403).json({ message: "Demo hesapta bu islem yapilamaz" });
  }
  return next();
};

export const requireBusinessUser = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role === "MAIN_ADMIN") {
    return res.status(403).json({ message: "Bu alan sadece isletme hesaplari icindir" });
  }
  return next();
};
