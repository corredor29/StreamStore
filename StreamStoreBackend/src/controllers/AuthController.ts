import { Request, Response } from "express"
import { AuthRepository } from "../repositories/AuthRepository"
import { AuthService } from "../services/AuthService"
import { ApiResponse } from "../utils/apiResponse"

const service = new AuthService(new AuthRepository())
const cookieOpts = { httpOnly: true, sameSite: "lax" as const }

export class AuthController {
    static async register(req: Request, res: Response) {
        try {
            const result = await service.register(req.body)
            res.cookie("token", result.token, cookieOpts)
            return ApiResponse.created(res, "Usuario registrado", result)
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async login(req: Request, res: Response) {
        try {
            const result = await service.login(req.body)
            res.cookie("token", result.token, cookieOpts)
            return ApiResponse.success(res, "Inicio de sesión exitoso", result)
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async me(req: Request, res: Response) {
        try {
            return ApiResponse.success(res, "Usuario autenticado", await service.me(req.user!.id))
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async recuperar(req: Request, res: Response) {
        try {
            await service.recuperar(req.body)
            return ApiResponse.success(res, "Si el correo está registrado, te enviamos un enlace para restablecer la contraseña")
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async restablecer(req: Request, res: Response) {
        try {
            await service.restablecer(req.body)
            return ApiResponse.success(res, "Contraseña actualizada. Ya puedes iniciar sesión")
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static logout(_req: Request, res: Response) {
        res.clearCookie("token")
        return ApiResponse.success(res, "Sesión cerrada")
    }
}
