import { Request, Response } from "express"
import { PlataformaRepository } from "../../repositories/products/PlataformaRepository"
import { ProductoRepository } from "../../repositories/products/ProductoRepository"
import { PlataformaService } from "../../services/products/PlataformaService"
import { ProductoService } from "../../services/products/ProductoService"
import { ApiResponse } from "../../utils/apiResponse"
import { IdParam } from "../../validators/CommonValidators"

const plataformaRepository = new PlataformaRepository()
const productoRepository = new ProductoRepository()
const service = new PlataformaService(plataformaRepository, productoRepository, new ProductoService(productoRepository, plataformaRepository))

export class PlataformaController {
    static async listActivas(_req: Request, res: Response) {
        try {
            return ApiResponse.success(res, "Plataformas", await service.listActivas())
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async listTodas(_req: Request, res: Response) {
        try {
            return ApiResponse.success(res, "Plataformas", await service.listTodas())
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async getById(_req: Request, res: Response) {
        try {
            const { id } = res.locals.params as IdParam
            return ApiResponse.success(res, "Plataforma", await service.getById(id))
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async create(req: Request, res: Response) {
        try {
            return ApiResponse.created(res, "Plataforma creada", await service.create(req.body))
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const { id } = res.locals.params as IdParam
            return ApiResponse.success(res, "Plataforma actualizada", await service.update(id, req.body))
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async desactivar(_req: Request, res: Response) {
        try {
            const { id } = res.locals.params as IdParam
            return ApiResponse.success(res, "Plataforma desactivada", await service.desactivar(id))
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }
}
