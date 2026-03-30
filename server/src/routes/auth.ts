import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { authenticate } from "../middleware/auth";

const router = Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || "corepanel-secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "corepanel-refresh-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Transporter bağlantısını başlangıçta test et
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Gmail SMTP bağlantı hatası:", error);
  } else {
    console.log("✅ Gmail SMTP bağlantısı başarılı");
  }
});

const sendVerificationEmail = async (email: string, token: string) => {
  const link = `${FRONTEND_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: `"CorePanel" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "E-posta Adresinizi Doğrulayın",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #6366f1;">CorePanel'e Hoş Geldiniz!</h2>
        <p>E-posta adresinizi doğrulamak için aşağıdaki butona tıklayın:</p>
        <a href="${link}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: #fff; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
          E-postayı Doğrula
        </a>
        <p style="color: #999; font-size: 12px;">Bu link 24 saat geçerlidir.</p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (email: string, token: string) => {
  console.log("📧 Mail gönderiliyor:", email);
  console.log("📧 GMAIL_USER:", process.env.GMAIL_USER);
  const link = `${FRONTEND_URL}/reset-password?token=${token}`;
  try {
    const info = await transporter.sendMail({
      from: `"CorePanel" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Şifre Sıfırlama",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #6366f1;">Şifre Sıfırlama</h2>
          <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
          <a href="${link}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: #fff; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 16px 0;">
            Şifremi Sıfırla
          </a>
          <p style="color: #999; font-size: 12px;">Bu link 1 saat geçerlidir.</p>
        </div>
      `,
    });
    console.log("✅ Mail gönderildi:", info.messageId);
  } catch (err) {
    console.error("❌ Mail gönderilemedi:", err);
    throw err;
  }
};

// ─── LOGIN ───────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "E-posta ve şifre zorunludur" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "E-posta veya şifre hatalı" });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: "E-posta veya şifre hatalı" });

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, businessId: user.businessId },
      JWT_SECRET,
      { expiresIn: "15m" } as any
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN } as any
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });

    res.json({
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        businessId: user.businessId,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// ─── REFRESH TOKEN ───────────────────────────────────────
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: "Refresh token gerekli" });

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({ message: "Geçersiz veya süresi dolmuş token" });
    }

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as any;
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) return res.status(401).json({ message: "Kullanıcı bulunamadı" });

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, businessId: user.businessId },
      JWT_SECRET,
      { expiresIn: "15m" } as any
    );

    res.json({ token: accessToken });
  } catch {
    res.status(401).json({ message: "Geçersiz token" });
  }
});

// ─── LOGOUT ──────────────────────────────────────────────
router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    res.json({ message: "Çıkış yapıldı" });
  } catch {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// ─── EMAIL DOĞRULAMA GÖNDER ──────────────────────────────
router.post("/send-verification", authenticate, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    if (user.isEmailVerified) return res.status(400).json({ message: "E-posta zaten doğrulanmış" });

    const token = crypto.randomBytes(32).toString("hex");
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifyToken: token },
    });

    await sendVerificationEmail(user.email, token);
    res.json({ message: "Doğrulama e-postası gönderildi" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "E-posta gönderilemedi" });
  }
});

// ─── EMAIL DOĞRULA ───────────────────────────────────────
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: "Token gerekli" });

    const user = await prisma.user.findFirst({
      where: { emailVerifyToken: String(token) },
    });
    if (!user) return res.status(400).json({ message: "Geçersiz token" });

    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true, emailVerifyToken: null },
    });

    res.redirect(`${FRONTEND_URL}/login?verified=true`);
  } catch {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// ─── ŞİFRE SIFIRLAMA İSTEĞİ ─────────────────────────────
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "E-posta zorunludur" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.json({ message: "E-posta gönderildi (eğer hesap varsa)" });

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: token, resetPasswordExpiry: expiry },
    });

    await sendPasswordResetEmail(user.email, token);
    res.json({ message: "Şifre sıfırlama e-postası gönderildi" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "E-posta gönderilemedi" });
  }
});

// ─── ŞİFRE SIFIRLA ───────────────────────────────────────
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ message: "Token ve şifre zorunludur" });
    if (password.length < 6) return res.status(400).json({ message: "Şifre en az 6 karakter olmalıdır" });

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiry: { gt: new Date() },
      },
    });
    if (!user) return res.status(400).json({ message: "Geçersiz veya süresi dolmuş token" });

    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, resetPasswordToken: null, resetPasswordExpiry: null },
    });

    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    res.json({ message: "Şifre başarıyla sıfırlandı" });
  } catch {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// ─── ME ──────────────────────────────────────────────────
router.get("/me", authenticate, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, role: true, businessId: true, isEmailVerified: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    res.json(user);
  } catch {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});
// Demo login
router.post("/demo-login", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { email: "demo@corepanel.com" } });
    if (!user) return res.status(404).json({ message: "Demo hesap bulunamadi" });
    const token = jwt.sign(
      { id: user.id, role: user.role, businessId: user.businessId },
      JWT_SECRET,
      { expiresIn: "15m" }
    );
    res.json({
      token,
      refreshToken: token,
      user: { id: user.id, email: user.email, role: user.role, businessId: user.businessId, name: "Demo Kullanıcı" }
    });
  } catch {
    res.status(500).json({ message: "Demo giris basarisiz" });
  }
});
export default router;