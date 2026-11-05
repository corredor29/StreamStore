import { Request, Response } from "express"
import { CarritoRepository } from "../../repositories/cart/CarritoRepository"
import { ProductoRepository } from "../../repositories/products/ProductoRepository"
import { ServicioRepository } from "../../repositories/orders/ServicioRepository"
import { CarritoService } from "../../services/cart/CarritoService"
import { ApiResponse } from "../../utils/apiResponse"
import { ItemIdParam } from "../../validators/cart/CarritoValidators"

const service = new CarritoService(new CarritoRepository(), new ProductoRepository(), new ServicioRepository())

export class CarritoController {
    static async get(req: Request, res: Response) {
        try {
            return ApiResponse.success(res, "Carrito", await service.get(req.user!.id))
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async addItem(req: Request, res: Response) {
        try {
            return ApiResponse.created(res, "Producto agregado al carrito", await service.addItem(req.user!.id, req.body))
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async updateItem(req: Request, res: Response) {
        try {
            const { itemId } = res.locals.params as ItemIdParam
            return ApiResponse.success(res, "Cantidad actualizada", await service.updateItem(req.user!.id, itemId, req.body.cantidad))
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async removeItem(req: Request, res: Response) {
        try {
            const { itemId } = res.locals.params as ItemIdParam
            return ApiResponse.success(res, "Producto eliminado del carrito", await service.removeItem(req.user!.id, itemId))
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async vaciar(req: Request, res: Response) {
        try {
            return ApiResponse.success(res, "Carrito vaciado", await service.vaciar(req.user!.id))
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }
}
