import { Request, Response } from "express"
import { ServicioRepository } from "../../repositories/orders/ServicioRepository"
import { AlertaService } from "../../services/orders/AlertaService"
import { ApiResponse } from "../../utils/apiResponse"

const service = new AlertaService(new ServicioRepository())

export class AlertaController {
    static async ejecutar(_req: Request, res: Response) {
        try {
            return ApiResponse.success(res, "Revisión de vencimientos ejecutada", await service.ejecutar())
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }
}
