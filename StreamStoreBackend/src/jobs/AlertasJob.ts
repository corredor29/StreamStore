import cron from "node-cron"
import { config } from "../config/config"
import { ServicioRepository } from "../repositories/orders/ServicioRepository"
import { AlertaService } from "../services/orders/AlertaService"
import { logger } from "../utils/logger"

const service = new AlertaService(new ServicioRepository())

export const startAlertasJob = () => {
    if (!config.cron.enabled) return logger.info("[cron] deshabilitado (CRON_ENABLED=false)")
    cron.schedule(config.cron.schedule, () => {
        service.ejecutar().catch((e) => logger.error(`[cron] error: ${e instanceof Error ? e.message : e}`))
    }, { timezone: config.appTimezone })
    logger.info(`[cron] alertas programadas: "${config.cron.schedule}" (${config.appTimezone})`)
}
