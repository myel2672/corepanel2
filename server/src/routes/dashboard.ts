import express from "express"
import { getSummary } from "../controllers/dashboardController"
import { authenticate } from "../middleware/auth"

const router = express.Router()

router.get("/summary", authenticate, getSummary)

export default router