import { Request, Response } from "express"
import { UsuarioRepository } from "../../repositories/users/UsuarioRepository"
import { UsuarioService } from "../../services/users/UsuarioService"
import { ApiResponse } from "../../utils/apiResponse"

const service = new UsuarioService(new UsuarioRepository())

export class UsuarioController {
    static async list(_req: Request, res: Response) {
        try {
            return ApiResponse.success(res, "Usuarios", await service.list())
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }
}
