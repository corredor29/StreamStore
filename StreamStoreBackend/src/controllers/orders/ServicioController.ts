import { Request, Response } from "express"
import { CarritoRepository } from "../../repositories/cart/CarritoRepository"
import { ProductoRepository } from "../../repositories/products/ProductoRepository"
import { ServicioRepository } from "../../repositories/orders/ServicioRepository"
import { CarritoService } from "../../services/cart/CarritoService"
import { ServicioService } from "../../services/orders/ServicioService"
import { ApiResponse } from "../../utils/apiResponse"
import { CuentaRepository } from "../../repositories/products/CuentaRepository"
import { IdParam } from "../../validators/CommonValidators"
import { AsignarCredencialesInput, ListServiciosQuery } from "../../validators/orders/ServicioValidators"

const servicioRepository = new ServicioRepository()
const service = new ServicioService(servicioRepository, new CuentaRepository())
const carritoService = new CarritoService(new CarritoRepository(), new ProductoRepository(), servicioRepository)

export class ServicioController {
    static async listMios(req: Request, res: Response) {
        try {
            return ApiResponse.success(res, "Mis servicios", await service.listMios(req.user!.id))
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async getById(req: Request, res: Response) {
        try {
            const { id } = res.locals.params as IdParam
            return ApiResponse.success(res, "Servicio", await service.getById(req.user!.id, id, req.user!.rol === "admin"))
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async renovar(req: Request, res: Response) {
        try {
            const { id } = res.locals.params as IdParam
            return ApiResponse.created(res, "Renovación agregada al carrito", await carritoService.agregarRenovacion(req.user!.id, id))
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async listTodos(_req: Request, res: Response) {
        try {
            const { entrega } = res.locals.query as ListServiciosQuery
            return ApiResponse.success(res, "Servicios", await service.listTodos(entrega))
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }

    static async asignarCredenciales(req: Request, res: Response) {
        try {
            const { id } = res.locals.params as IdParam
            const data = await service.asignarCredenciales(id, req.body as AsignarCredencialesInput)
            const mensaje = data.notificado ? "Credenciales asignadas y enviadas al cliente" : "Credenciales asignadas"
            return ApiResponse.success(res, mensaje, data)
        } catch (error) {
            return ApiResponse.error(res, error)
        }
    }
}
