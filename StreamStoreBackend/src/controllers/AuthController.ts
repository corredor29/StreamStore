import { Request, Response } from "express"
import { login } from "../services/AuthService"
import { success } from "../utils/apiResponse"

export const loginController = async (req: Request, res: Response) => {
    const result = await login(req.body.email, req.body.password)
    res.cookie("token", result.token, { httpOnly: true, sameSite: "lax" })
    return success(res, "Inicio de sesión exitoso", result)
}

export const meController = (req: Request, res: Response) => {
    return success(res, "Usuario autenticado", req.user)
}
