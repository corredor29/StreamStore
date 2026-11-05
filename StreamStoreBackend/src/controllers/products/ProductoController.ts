import { Request, Response } from "express"
import { PlataformaRepository } from "../../repositories/products/PlataformaRepository"
import { ProductoRepository } from "../../repositories/products/ProductoRepository"
import { ProductoService } from "../../services/products/ProductoService"
import { ApiResponse } from "../../utils/apiResponse"
import { IdParam } from "../../validators/CommonValidators"
import { ListProductosQuery } from "../../validators/products/ProductoValidators"

const service = new ProductoService(new ProductoRepository(), new PlataformaRepository())

export class ProductoController {
    static async list(_req: Request, res: Response) {
        try {
            return ApiResponse.success(res, "Productos", await service.list(res.locals.query as ListProductosQuery))
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async listAdmin(_req: Request, res: Response) {
        try {
            return ApiResponse.success(res, "Productos", await service.list(res.locals.query as ListProductosQuery, true))
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async getById(_req: Request, res: Response) {
        try {
            const { id } = res.locals.params as IdParam
            return ApiResponse.success(res, "Producto", await service.getById(id))
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async listStockBajo(_req: Request, res: Response) {
        try {
            return ApiResponse.success(res, "Productos con stock bajo", await service.listStockBajo())
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async create(req: Request, res: Response) {
        try {
            return ApiResponse.created(res, "Producto creado", await service.create(req.body))
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const { id } = res.locals.params as IdParam
            return ApiResponse.success(res, "Producto actualizado", await service.update(id, req.body))
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async desactivar(_req: Request, res: Response) {
        try {
            const { id } = res.locals.params as IdParam
            return ApiResponse.success(res, "Producto desactivado", await service.desactivar(id))
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }
}
