import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { config } from "../config/config"
import { HttpError } from "../utils/httpError"
import { AuthUser } from "../interfaces/AuthUser"

export const AuthMiddleware = (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization
    const token = req.cookies?.token ?? (header?.startsWith("Bearer ") ? header.slice(7) : undefined)
    if (!token) return next(new HttpError(401, "No autenticado"))
    try {
        req.user = jwt.verify(token, config.jwt.secret) as AuthUser
        next()
    } catch {
        next(new HttpError(401, "Token inválido"))
    }
}
