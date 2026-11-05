import { Request, Response } from "express"
import { CuentaRepository } from "../../repositories/products/CuentaRepository"
import { PlataformaRepository } from "../../repositories/products/PlataformaRepository"
import { CuentaService } from "../../services/products/CuentaService"
import { ApiResponse } from "../../utils/apiResponse"
import { IdParam } from "../../validators/CommonValidators"
import { ListCuentasQuery } from "../../validators/products/CuentaValidators"

const service = new CuentaService(new CuentaRepository(), new PlataformaRepository())

export class CuentaController {
    static async list(_req: Request, res: Response) {
        try {
            return ApiResponse.success(res, "Cuentas", await service.list(res.locals.query as ListCuentasQuery))
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async getById(_req: Request, res: Response) {
        try {
            const { id } = res.locals.params as IdParam
            return ApiResponse.success(res, "Cuenta", await service.getById(id))
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const creadas = await service.create(req.body)
            const mensaje = Array.isArray(creadas) ? `${creadas.length} cuenta(s) creada(s) con sus pantallas` : "Cuenta creada con sus pantallas"
            return ApiResponse.created(res, mensaje, creadas)
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }
}
