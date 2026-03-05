import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// test route
app.get("/", (req, res) => {
  res.json({ message: "API çalışıyor" })
})

// login route
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body

  if (email !== "admin@mail.com" || password !== "123456") {
    return res.status(401).json({ message: "Invalid credentials" })
  }

  const token = jwt.sign(
    {
      id: "1",
      email: "admin@mail.com",
      role: "ADMIN",
    },
    "secret123",
    { expiresIn: "7d" }
  )

  res.json({ token })
})

// middleware
function auth(req: any, res: any, next: any) {
  const header = req.headers.authorization

  if (!header) {
    return res.status(401).json({ message: "No token" })
  }

  const token = header.split(" ")[1]

  try {
    const decoded = jwt.verify(token, "secret123")
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ message: "Invalid token" })
  }
}

// dashboard
app.get("/api/dashboard/stats", auth, (req, res) => {
  res.json({
    users: 10,
    businesses: 3,
    revenue: 25000
  })
})

app.listen(5000, () => {
  console.log("Server running on port 5000")
})