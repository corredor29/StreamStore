import "reflect-metadata"
import "./config/zod"
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import { config } from "./config/config"
import { sequelize } from "./config/database"
import { router } from "./routes"
import { NotFoundMiddleware } from "./middlewares/NotFoundMiddleware"
import { ErrorMiddleware } from "./middlewares/ErrorMiddleware"
import { startAlertasJob } from "./jobs/AlertasJob"
import { logger } from "./utils/logger"

process.env.TZ = config.appTimezone

const app = express()

app.use(cors({ origin: config.corsOrigin, credentials: true }))
app.use(express.json())
app.use(cookieParser())
app.use(morgan("dev"))
app.use("/api", router)
app.use(NotFoundMiddleware)
app.use(ErrorMiddleware)

const start = async () => {
    try {
        await sequelize.authenticate()
        logger.info(`Conectado a MySQL: ${config.db.name}`)
        startAlertasJob()
    } catch (error) {
        logger.error(`No se pudo conectar a MySQL (${config.db.name}): ${error instanceof Error ? error.message : error}`)
    }
    app.listen(config.port, () => logger.info(`StreamStore API en http://localhost:${config.port}/api`))
}

start()
