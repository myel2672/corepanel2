import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import productRoutes from "./routes/products";
import authRoutes from "./routes/auth";
import orderRoutes from "./routes/orders";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", (req, res) => {
  res.send("API is running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(errorHandler); // En sona ekle