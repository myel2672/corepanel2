import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./routes/products";
import dashboardRouter from './routes/dashboard';
import authRoutes from "./routes/auth";
import orderRoutes from "./routes/orders";
import businessRoutes from "./routes/businesses";
import { errorHandler } from "./middleware/errorHandler";
import salesRoutes from "./routes/sales";
import reportsRoutes from "./routes/reports";

dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use('/api/dashboard', dashboardRouter);
app.use("/api/orders", orderRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/reports", reportsRoutes);

app.get("/", (req, res) => {
  res.send("API is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(errorHandler); // En sona ekle