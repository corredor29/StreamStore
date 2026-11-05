import { Response } from "express"
import { ForeignKeyConstraintError, UniqueConstraintError } from "sequelize"
import { HttpError } from "./httpError"
import { logger } from "./logger"

const esJsonInvalido = (error: unknown) =>
    error instanceof SyntaxError && (error as SyntaxError & { type?: string }).type === "entity.parse.failed"

export class ApiResponse {
    static success(res: Response, message: string, data: unknown = null) {
        return res.status(200).json({ message, data })
    }

    static created(res: Response, message: string, data: unknown = null) {
        return res.status(201).json({ message, data })
    }

    static error(res: Response, error: unknown) {
        if (error instanceof HttpError) {
            return res.status(error.status).json(error.data === undefined ? { error: error.message } : { error: error.message, data: error.data })
        }
        if (esJsonInvalido(error)) return res.status(400).json({ error: "El cuerpo de la petición no es un JSON válido" })
        if (error instanceof UniqueConstraintError) return res.status(409).json({ error: "El registro ya existe" })
        if (error instanceof ForeignKeyConstraintError) return res.status(409).json({ error: "El registro está relacionado con otros datos" })
        logger.error(error instanceof Error ? error.stack ?? error.message : String(error))
        return res.status(500).json({ error: "Error interno del servidor" })
    }
}
