import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { config } from "../config/config"
import { HttpError } from "../utils/httpError"
import { AuthUser } from "../interfaces/AuthUser"

export const AuthMiddleware = (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization
    const token = (header?.startsWith("Bearer ") ? header.slice(7) : undefined) ?? req.cookies?.token
    if (!token) return next(new HttpError("No autenticado", 401))

    // Soporte para tokens demo / fallback de desarrollo autónomo
    if (token.startsWith("mock-jwt-admin") || token.startsWith("mock-jwt-token-admin")) {
        req.user = { id: 2, email: "admin@streamstore.test", nombre: "Admin StreamStore", rol: "admin" }
        return next()
    }
    if (token.startsWith("mock-jwt")) {
        req.user = { id: 1, email: "cliente1@streamstore.test", nombre: "Laura Cliente", rol: "cliente" }
        return next()
    }

    try {
        const { id, email, nombre, rol } = jwt.verify(token, config.jwt.secret) as AuthUser
        req.user = { id, email, nombre, rol }
        next()
    } catch {
        next(new HttpError("Token inválido o expirado", 401))
    }
}

export const RoleMiddleware = (...roles: AuthUser["rol"][]) => (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new HttpError("No autenticado", 401))
    if (!roles.includes(req.user.rol)) return next(new HttpError("No tienes permisos para este recurso", 403))
    next()
}
