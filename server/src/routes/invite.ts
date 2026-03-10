import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { authenticate } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// ─── DAVET GÖNDER (ADMIN only) ───────────────────────────
router.post("/send", authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== "ADMIN" && req.user.role !== "MAIN_ADMIN") {
      return res.status(403).json({ message: "Yetersiz yetki" });
    }

    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "E-posta zorunludur" });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: "Bu e-posta zaten kayıtlı" });

    const existingInvite = await prisma.invite.findFirst({
      where: { email, used: false, expiresAt: { gt: new Date() } },
    });
    if (existingInvite) return res.status(400).json({ message: "Bu e-postaya zaten davet gönderildi" });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 2);

    await prisma.invite.create({
      data: {
        email,
        token,
        businessId: req.user.businessId,
        role: "STAFF",
        expiresAt,
      },
    });

    const link = `${FRONTEND_URL}/accept-invite?token=${token}`;
    await transporter.sendMail({
      from: `"CorePanel" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "CorePanel'e Davet Edildiniz",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Takımınıza Katılın!</h2>
          <p>CorePanel'de bir işletme hesabına personel olarak davet edildiniz.</p>
          <p>Hesabınızı oluşturmak için aşağıdaki butona tıklayın:</p>
          <a href="${link}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: #fff; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
            Daveti Kabul Et
          </a>
          <p style="color: #999; font-size: 12px;">Bu link 48 saat geçerlidir.</p>
        </div>
      `,
    });

    res.json({ message: "Davet gönderildi" });
  } catch (err) {
    console.error("Invite error:", err);
    res.status(500).json({ message: "Davet gönderilemedi" });
  }
});

// ─── DAVETİ KONTROL ET (public) ──────────────────────────
router.get("/check/:token", async (req, res) => {
  try {
    const invite = await prisma.invite.findUnique({
      where: { token: req.params.token },
      include: { business: true },
    });

    if (!invite || invite.used || invite.expiresAt < new Date()) {
      return res.status(400).json({ message: "Geçersiz veya süresi dolmuş davet" });
    }

    res.json({
      email: invite.email,
      businessName: invite.business.name,
      role: invite.role,
    });
  } catch {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// ─── DAVETİ KABUL ET (public) ────────────────────────────
router.post("/accept", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: "Token ve şifre zorunludur" });
    if (password.length < 6) return res.status(400).json({ message: "Şifre en az 6 karakter olmalıdır" });

    const invite = await prisma.invite.findUnique({ where: { token } });
    if (!invite || invite.used || invite.expiresAt < new Date()) {
      return res.status(400).json({ message: "Geçersiz veya süresi dolmuş davet" });
    }

    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email: invite.email,
        password: hashed,
        role: invite.role,
        businessId: invite.businessId,
        isEmailVerified: true,
      },
    });

    await prisma.invite.update({ where: { token }, data: { used: true } });
    res.json({ message: "Hesap oluşturuldu, giriş yapabilirsiniz" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Hesap oluşturulamadı" });
  }
});

// ─── DAVETLERİ LİSTELE (ADMIN) ───────────────────────────
router.get("/list", authenticate, async (req: any, res) => {
  try {
    if (req.user.role !== "ADMIN" && req.user.role !== "MAIN_ADMIN") {
      return res.status(403).json({ message: "Yetersiz yetki" });
    }

    const invites = await prisma.invite.findMany({
      where: { businessId: req.user.businessId },
      orderBy: { createdAt: "desc" },
    });

    res.json(invites);
  } catch {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

export default router;