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
            const { plataforma_id } = res.locals.query as ListCuentasQuery
            return ApiResponse.success(res, "Cuentas", await service.list(plataforma_id))
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
            return ApiResponse.created(res, "Cuenta creada con sus pantallas", await service.create(req.body))
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }
}
