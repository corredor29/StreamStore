import { Request, Response, NextFunction } from "express"
import { HttpError } from "../utils/httpError"
import { logger } from "../utils/logger"

export const ErrorMiddleware = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) return res.status(err.statusCode).json({ error: err.message })
    logger.error(err instanceof Error ? err.stack ?? err.message : String(err))
    res.status(500).json({ error: "Error interno del servidor" })
}
