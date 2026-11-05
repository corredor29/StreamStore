import { Transaction } from "sequelize"
import { Carrito } from "../../models/cart/Carrito"
import { CarritoItem } from "../../models/cart/CarritoItem"
import { Plataforma } from "../../models/products/Plataforma"
import { Producto } from "../../models/products/Producto"
import { Servicio } from "../../models/orders/Servicio"

export class CarritoRepository {
    async getOrCreate(usuarioId: number) {
        const [carrito] = await Carrito.findOrCreate({ where: { usuario_id: usuarioId } })
        return carrito
    }

    lockByUsuario(usuarioId: number, t: Transaction) {
        return Carrito.findOne({ where: { usuario_id: usuarioId }, transaction: t, lock: t.LOCK.UPDATE })
    }

    findItems(carritoId: number, t?: Transaction) {
        return CarritoItem.findAll({
            where: { carrito_id: carritoId },
            include: [
                { model: Producto, include: [{ model: Plataforma, attributes: ["id", "nombre"] }] },
                { model: Servicio, attributes: ["id", "fecha_vencimiento"] }
            ],
            order: [["id", "ASC"]],
            transaction: t
        })
    }

    findItemByProducto(carritoId: number, productoId: number) {
        return CarritoItem.findOne({ where: { carrito_id: carritoId, producto_id: productoId, servicio_id: null } })
    }

    findItemRenovacion(carritoId: number, servicioId: number) {
        return CarritoItem.findOne({ where: { carrito_id: carritoId, servicio_id: servicioId } })
    }

    findItemById(carritoId: number, itemId: number) {
        return CarritoItem.findOne({ where: { id: itemId, carrito_id: carritoId } })
    }

    createItem(carritoId: number, productoId: number, cantidad: number, servicioId: number | null = null) {
        return CarritoItem.create({ carrito_id: carritoId, producto_id: productoId, cantidad, servicio_id: servicioId })
    }

    updateCantidad(item: CarritoItem, cantidad: number) {
        return item.update({ cantidad })
    }

    destroyItem(item: CarritoItem) {
        return item.destroy()
    }

    vaciar(carritoId: number, t?: Transaction) {
        return CarritoItem.destroy({ where: { carrito_id: carritoId }, transaction: t })
    }
}
