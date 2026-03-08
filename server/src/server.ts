import express from "express";
import businessRouter from "./routes/businessRouter"; // ✅ yeni eklenen satır

const app = express();

app.use(express.json());

// Burada diğer routerların varsa onlar kalacak
// Örn: app.use("/users", userRouter);

// Yeni business routerı ekle
app.use("/business", businessRouter);

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});