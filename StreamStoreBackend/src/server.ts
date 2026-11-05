import "reflect-metadata"
import "./config/zod"
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import { config } from "./config/config"
import { sequelize } from "./config/database"
import { router } from "./routes"
import { docsRouter } from "./routes/docs"
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

const swaggerHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>StreamStore API - Swagger UI</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css" />
</head>
<body style="margin:0; background:#fafafa;">
  <div id="swagger-ui"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.min.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/api/docs.json',
        dom_id: '#swagger-ui',
        deepLinking: true
      });
    };
  </script>
</body>
</html>`

app.get(["/swagger", "/Swagger", "/api-docs"], (_req, res) => {
    res.setHeader("Content-Type", "text/html")
    res.send(swaggerHtml)
})

app.use("/api", docsRouter)
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
    app.listen(config.port, "0.0.0.0", () => logger.info(`StreamStore API en http://localhost:${config.port}/api`))
}

start()
