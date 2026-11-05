import "reflect-metadata"
import "./config/zod"
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import { config } from "./config/config"
import { sequelize } from "./config/database"
import { router } from "./routes"
import { DocsRoutes } from "./routes/DocsRoutes"
import { NotFoundMiddleware } from "./middlewares/NotFoundMiddleware"
import { ErrorMiddleware } from "./middlewares/ErrorMiddleware"
import { uploadsDir } from "./middlewares/UploadMiddleware"
import { startAlertasJob } from "./jobs/AlertasJob"
import { logger } from "./utils/logger"

process.env.TZ = config.appTimezone

const app = express()

app.use(cors({ origin: config.corsOrigin, credentials: true }))
app.use(express.json())
app.use(cookieParser())
app.use(morgan("dev"))
app.use("/uploads", express.static(uploadsDir, {
    index: false,
    setHeaders: (res) => res.setHeader("X-Content-Type-Options", "nosniff")
}))
app.use(DocsRoutes)
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
    const listo = () => logger.info(`StreamStore API en http://localhost:${config.port}/api · Swagger en http://localhost:${config.port}/swagger`)
    // Sin HOST, Node escucha en todas las interfaces IPv4 e IPv6 (localhost funciona por ::1 y por 127.0.0.1)
    if (config.host) app.listen(config.port, config.host, listo)
    else app.listen(config.port, listo)
}

start()
