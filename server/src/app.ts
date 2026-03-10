import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";
import salesRoutes from "./routes/sales";
import reportRoutes from "./routes/reports";
import businessRoutes from "./routes/business";
import orderRoutes from "./routes/orders";
import customerRoutes from "./routes/customer";
import dashboardRoutes from "./routes/dashboard";

const app = express();

app.use(cors());
app.use(express.json());

// Genel rate limit — tüm istekler
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100,
  message: { message: "Çok fazla istek gönderildi. 15 dakika sonra tekrar deneyin." },
});

// Auth rate limit — login/register için daha sıkı
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Çok fazla giriş denemesi. 15 dakika sonra tekrar deneyin." },
});

app.use(generalLimiter);

app.get("/", (req, res) => {
  res.send("CorePanel API çalışıyor 🚀");
});

app.use("/auth/login", authLimiter);
app.use("/auth/forgot-password", authLimiter);
app.use("/auth/register", authLimiter);

app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/sales", salesRoutes);
app.use("/reports", reportRoutes);
app.use("/businesses", businessRoutes);
app.use("/orders", orderRoutes);
app.use("/customers", customerRoutes);
app.use("/dashboard", dashboardRoutes);

app.listen(5000, () => {
  console.log("SERVER RUNNING ON 5000");
});

export default app;