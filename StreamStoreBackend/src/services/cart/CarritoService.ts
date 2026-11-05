import { CarritoRepository } from "../../repositories/cart/CarritoRepository"
import { ProductoRepository } from "../../repositories/products/ProductoRepository"
import { ServicioRepository } from "../../repositories/orders/ServicioRepository"
import { HttpError } from "../../utils/httpError"
import { CarritoDetalle, CarritoLinea } from "../../interfaces/cart/Carrito"
import { AddCarritoItemInput } from "../../validators/cart/CarritoValidators"

export class CarritoService {
    constructor(
        private readonly repository: CarritoRepository,
        private readonly productoRepository: ProductoRepository,
        private readonly servicioRepository: ServicioRepository
    ) {}

    async get(usuarioId: number): Promise<CarritoDetalle> {
        const carrito = await this.repository.getOrCreate(usuarioId)
        const items = await this.repository.findItems(carrito.id)
        const stock = await this.productoRepository.stockMap(items.map((i) => i.producto_id))
        const detalle = items.map((i): CarritoLinea => {
            const precio = Number(i.producto.precio)
            const disponible = stock.get(i.producto_id) ?? 0
            const esRenovacion = i.servicio_id !== null
            return {
                id: i.id, producto_id: i.producto_id, cantidad: i.cantidad,
                producto: { id: i.producto.id, nombre: i.producto.nombre, tipo: i.producto.tipo, plataforma: i.producto.plataforma?.nombre },
                renovacion: esRenovacion ? { servicio_id: i.servicio_id, vence: i.servicio?.fecha_vencimiento ?? null } : null,
                precio_unitario: precio, subtotal: precio * i.cantidad,
                stock_disponible: disponible, stock_suficiente: esRenovacion || disponible >= i.cantidad
            }
        })
        return {
            id: carrito.id,
            items: detalle,
            total: detalle.reduce((a, i) => a + i.subtotal, 0),
            cantidad_items: detalle.reduce((a, i) => a + i.cantidad, 0)
        }
    }

    private async validarStock(productoId: number, cantidad: number) {
        const producto = await this.productoRepository.findById(productoId)
        if (!producto || !producto.activo) throw new HttpError("Producto no encontrado", 404)
        const stock = (await this.productoRepository.stockMap([productoId])).get(productoId) ?? 0
        if (cantidad > stock) throw new HttpError(`Stock insuficiente para "${producto.nombre}" (disponible: ${stock})`, 409)
    }

    async addItem(usuarioId: number, data: AddCarritoItemInput) {
        const carrito = await this.repository.getOrCreate(usuarioId)
        const existente = await this.repository.findItemByProducto(carrito.id, data.producto_id)
        const cantidad = (existente?.cantidad ?? 0) + data.cantidad
        await this.validarStock(data.producto_id, cantidad)
        if (existente) await this.repository.updateCantidad(existente, cantidad)
        else await this.repository.createItem(carrito.id, data.producto_id, cantidad)
        return this.get(usuarioId)
    }

    async agregarRenovacion(usuarioId: number, servicioId: number) {
        const servicio = await this.servicioRepository.findDelUsuario(servicioId, usuarioId)
        if (!servicio) throw new HttpError("Servicio no encontrado", 404)
        if (await this.servicioRepository.findRenovacionDe(servicio.id)) throw new HttpError("Este servicio ya fue renovado", 409)
        const producto = await this.productoRepository.findById(servicio.producto_id)
        if (!producto || !producto.activo) throw new HttpError("Este producto ya no está a la venta, no se puede renovar", 409)
        const carrito = await this.repository.getOrCreate(usuarioId)
        if (!(await this.repository.findItemRenovacion(carrito.id, servicio.id))) {
            await this.repository.createItem(carrito.id, servicio.producto_id, 1, servicio.id)
        }
        return this.get(usuarioId)
    }

    private async findItem(usuarioId: number, itemId: number) {
        const carrito = await this.repository.getOrCreate(usuarioId)
        const item = await this.repository.findItemById(carrito.id, itemId)
        if (!item) throw new HttpError("El ítem no está en el carrito", 404)
        return item
    }

    async updateItem(usuarioId: number, itemId: number, cantidad: number) {
        const item = await this.findItem(usuarioId, itemId)
        if (item.servicio_id !== null) {
            if (cantidad !== 1) throw new HttpError("Una renovación es de una sola unidad", 400)
        } else {
            await this.validarStock(item.producto_id, cantidad)
        }
        await this.repository.updateCantidad(item, cantidad)
        return this.get(usuarioId)
    }

    async removeItem(usuarioId: number, itemId: number) {
        await this.repository.destroyItem(await this.findItem(usuarioId, itemId))
        return this.get(usuarioId)
    }

    async vaciar(usuarioId: number) {
        const carrito = await this.repository.getOrCreate(usuarioId)
        await this.repository.vaciar(carrito.id)
        return this.get(usuarioId)
    }
}
