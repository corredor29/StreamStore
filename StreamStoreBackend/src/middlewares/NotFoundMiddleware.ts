import { Request, Response } from "express"

export const NotFoundMiddleware = (req: Request, res: Response) => {
    res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` })
}
