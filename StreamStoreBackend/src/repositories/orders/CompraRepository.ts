import { Op, QueryTypes, Transaction, WhereOptions } from "sequelize"
import { sequelize } from "../../config/database"
import { Compra } from "../../models/orders/Compra"
import { EstadoCompra, NuevaCompra, NuevaLineaCompra } from "../../interfaces/orders/Compra"
import { CompraItem } from "../../models/orders/CompraItem"
import { Plataforma } from "../../models/products/Plataforma"
import { Producto } from "../../models/products/Producto"
import { Servicio } from "../../models/orders/Servicio"
import { Usuario } from "../../models/users/Usuario"
import { ListComprasQuery } from "../../validators/orders/CompraValidators"

const includeDetalle = [
    { model: Usuario, attributes: ["id", "nombre", "email"] },
    { model: CompraItem, include: [{ model: Producto, attributes: ["id", "nombre", "tipo"], include: [{ model: Plataforma, attributes: ["id", "nombre"] }] }] },
    { model: Servicio, attributes: ["id", "producto_id", "tipo", "fecha_inicio", "fecha_vencimiento", "estado"] }
]

export class CompraRepository {
    cancelarPendientes(usuarioId: number, t: Transaction) {
        return Compra.update({ estado: "cancelada" }, { where: { usuario_id: usuarioId, estado: "pendiente" }, transaction: t })
    }

    async createConItems(
        compra: NuevaCompra,
        items: NuevaLineaCompra[],
        t: Transaction
    ) {
        const creada = await Compra.create({ ...compra, estado: "pendiente" }, { transaction: t })
        await CompraItem.bulkCreate(items.map((i) => ({ ...i, compra_id: creada.id })), { transaction: t })
        return creada.id
    }

    lockDelUsuario(id: number, usuarioId: number, t: Transaction) {
        return Compra.findOne({ where: { id, usuario_id: usuarioId }, transaction: t, lock: t.LOCK.UPDATE })
    }

    findItemsConProducto(compraId: number, t: Transaction) {
        return CompraItem.findAll({ where: { compra_id: compraId }, include: [Producto], transaction: t })
    }

    marcarPagada(compra: Compra, data: { metodo_pago: string; referencia_pago: string; pagada_at: Date }, t: Transaction) {
        return compra.update({ ...data, estado: "pagada" }, { transaction: t })
    }

    findAll(usuarioId?: number, filtros: ListComprasQuery = {}) {
        const where: WhereOptions<Compra> = {
            ...(usuarioId && { usuario_id: usuarioId }),
            ...(filtros.estado && { estado: filtros.estado }),
            ...((filtros.desde || filtros.hasta) && {
                created_at: { ...(filtros.desde && { [Op.gte]: filtros.desde }), ...(filtros.hasta && { [Op.lte]: filtros.hasta }) }
            })
        }
        return Compra.findAll({ where, include: includeDetalle, order: [["created_at", "DESC"]] })
    }

    findById(id: number, usuarioId?: number) {
        return Compra.findOne({ where: usuarioId ? { id, usuario_id: usuarioId } : { id }, include: includeDetalle })
    }

    async totalPagadas(desde?: Date) {
        const where: WhereOptions<Compra> = desde ? { estado: "pagada", pagada_at: { [Op.gte]: desde } } : { estado: "pagada" }
        const [total, compras] = await Promise.all([Compra.sum("total", { where }), Compra.count({ where })])
        return { total: Number(total ?? 0), compras }
    }

    contarPorEstado(estado: EstadoCompra) {
        return Compra.count({ where: { estado } })
    }

    ventasPorProducto() {
        return sequelize.query<{ producto_id: number; unidades: string; total: string }>(
            `SELECT ci.producto_id, SUM(ci.cantidad) AS unidades, SUM(ci.subtotal) AS total
             FROM compra_items ci JOIN compras c ON c.id = ci.compra_id WHERE c.estado = 'pagada' GROUP BY ci.producto_id`,
            { type: QueryTypes.SELECT }
        )
    }
}
