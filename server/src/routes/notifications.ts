import { Router } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import prisma from "../prisma";

const router = Router();
router.use(authenticate);

// GET /notifications
router.get("/", async (req: AuthRequest, res) => {
  try {
    const user = req.user as any;
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: Number(user.id) },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.notification.count({
        where: { userId: Number(user.id), read: false },
      }),
    ]);

    res.json({ notifications, unreadCount });
  } catch {
    res.status(500).json({ message: "Bildirimler alınamadı" });
  }
});

// POST /notifications/:id/read
router.post("/:id/read", async (req: AuthRequest, res) => {
  try {
    await prisma.notification.updateMany({
      where: { id: Number(req.params.id), userId: Number(req.user?.id) },
      data: { read: true },
    });
    res.json({ message: "Okundu" });
  } catch {
    res.status(500).json({ message: "İşlem başarısız" });
  }
});

// POST /notifications/read-all
router.post("/read-all", async (req: AuthRequest, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: Number(req.user?.id), read: false },
      data: { read: true },
    });
    res.json({ message: "Tümü okundu" });
  } catch {
    res.status(500).json({ message: "İşlem başarısız" });
  }
});

// DELETE /notifications/:id
router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    await prisma.notification.delete({
      where: { id: Number(req.params.id), userId: Number(req.user?.id) },
    });
    res.json({ message: "Silindi" });
  } catch {
    res.status(500).json({ message: "İşlem başarısız" });
  }
});

export default router;
