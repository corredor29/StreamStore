import { Request, Response } from "express"
import { ComboRepository } from "../../repositories/promos/ComboRepository"
import { PlataformaRepository } from "../../repositories/products/PlataformaRepository"
import { ComboService } from "../../services/promos/ComboService"
import { ApiResponse } from "../../utils/apiResponse"
import { IdParam } from "../../validators/CommonValidators"

const service = new ComboService(new ComboRepository(), new PlataformaRepository())

export class ComboController {
    static async list(_req: Request, res: Response) {
        try {
            return ApiResponse.success(res, "Combos", await service.list())
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async listActivos(_req: Request, res: Response) {
        try {
            return ApiResponse.success(res, "Promociones y Combos activos", await service.listActivos())
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async create(req: Request, res: Response) {
        try {
            return ApiResponse.created(res, "Combo creado", await service.create(req.body))
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const { id } = res.locals.params as IdParam
            return ApiResponse.success(res, "Combo actualizado", await service.update(id, req.body))
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async alternarActivo(_req: Request, res: Response) {
        try {
            const { id } = res.locals.params as IdParam
            return ApiResponse.success(res, "Estado del combo actualizado", await service.alternarActivo(id))
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async delete(_req: Request, res: Response) {
        try {
            const { id } = res.locals.params as IdParam
            await service.delete(id)
            return ApiResponse.success(res, "Combo eliminado")
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }
}
