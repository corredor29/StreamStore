import { Request, Response } from "express"
import { CarritoRepository } from "../../repositories/cart/CarritoRepository"
import { CompraRepository } from "../../repositories/orders/CompraRepository"
import { CuentaRepository } from "../../repositories/products/CuentaRepository"
import { PlataformaRepository } from "../../repositories/products/PlataformaRepository"
import { ProductoRepository } from "../../repositories/products/ProductoRepository"
import { ServicioRepository } from "../../repositories/orders/ServicioRepository"
import { CompraService } from "../../services/orders/CompraService"
import { ApiResponse } from "../../utils/apiResponse"
import { IdParam } from "../../validators/CommonValidators"
import { ListComprasQuery } from "../../validators/orders/CompraValidators"

const service = new CompraService(
    new CompraRepository(), new CarritoRepository(), new CuentaRepository(),
    new PlataformaRepository(), new ServicioRepository(), new ProductoRepository()
)

export class CompraController {
    static async create(req: Request, res: Response) {
        try {
            return ApiResponse.created(res, "Compra creada en estado pendiente", await service.crearPendiente(req.user!.id, req.body.metodo_pago))
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async pagar(req: Request, res: Response) {
        try {
            const { id } = res.locals.params as IdParam
            return ApiResponse.success(res, "Pago aprobado (simulado). Servicios activados", await service.pagar(req.user!.id, id, req.body.metodo_pago))
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async listMias(req: Request, res: Response) {
        try {
            return ApiResponse.success(res, "Mis compras", await service.listMias(req.user!.id))
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async getById(req: Request, res: Response) {
        try {
            const { id } = res.locals.params as IdParam
            return ApiResponse.success(res, "Compra", await service.getById(req.user!.id, id, req.user!.rol === "admin"))
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async listTodas(_req: Request, res: Response) {
        try {
            return ApiResponse.success(res, "Compras", await service.listTodas(res.locals.query as ListComprasQuery))
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async resumen(_req: Request, res: Response) {
        try {
            return ApiResponse.success(res, "Resumen de ventas y stock", await service.resumen())
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }
}
