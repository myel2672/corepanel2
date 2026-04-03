import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";

// Router'lar
import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";
import salesRoutes from "./routes/sales";
import reportRoutes from "./routes/reports";
import businessRoutes from "./routes/business";
import orderRoutes from "./routes/orders";
import customerRoutes from "./routes/customer";
import dashboardRoutes from "./routes/dashboard";
import inviteRoutes from "./routes/invite";
import stripeRoutes from "./routes/stripe";
import notificationRoutes from "./routes/notifications";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

// CORS
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://corepanel2.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());

// Rate limit
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Çok fazla istek gönderildi. 15 dakika sonra tekrar deneyin." },
});
app.use(generalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: "Çok fazla giriş denemesi. 15 dakika sonra tekrar deneyin." },
});

// Test route
app.get("/", (_, res) => res.send("CorePanel API çalışıyor 🚀"));

// Auth rate limit
app.use("/auth/login", authLimiter);
app.use("/auth/forgot-password", authLimiter);
app.use("/auth/register", authLimiter);

// Router’lar
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/sales", salesRoutes);
app.use("/reports", reportRoutes);
app.use("/businesses", businessRoutes);
app.use("/orders", orderRoutes);
app.use("/customers", customerRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/invites", inviteRoutes); // inviteRoutes default export olmalı
app.use("/stripe", stripeRoutes);
app.use("/notifications", notificationRoutes);

// Error handler (en sona konulmalı)
app.use(errorHandler);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`SERVER RUNNING ON ${PORT}`));

export default app;