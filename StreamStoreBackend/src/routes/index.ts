import { Router } from "express"
import { sequelize } from "../config/database"
import { success } from "../utils/apiResponse"
import { authRoutes } from "./AuthRoutes"

export const router = Router()

router.get("/health", async (_req, res) => {
    let database = "conectada"
    try {
        await sequelize.authenticate()
    } catch {
        database = "desconectada"
    }
    return success(res, "StreamStore API operativa", { status: "ok", database, timestamp: new Date().toISOString() })
})

router.use("/auth", authRoutes)
