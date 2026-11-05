import { QueryTypes, WhereOptions } from "sequelize"
import { sequelize } from "../../config/database"
import { Plataforma } from "../../models/products/Plataforma"
import { Producto } from "../../models/products/Producto"
import { TipoProducto } from "../../interfaces/products/Producto"
import { CreateProductoInput, UpdateProductoInput } from "../../validators/products/ProductoValidators"

const includePlataforma = [{ model: Plataforma, attributes: ["id", "nombre", "logo_url", "portada_url"] }]

export class ProductoRepository {
    findAll(where: WhereOptions<Producto>) {
        return Producto.findAll({ where, include: includePlataforma, order: [["plataforma_id", "ASC"], ["tipo", "ASC"]] })
    }

    findById(id: number) {
        return Producto.findByPk(id, { include: includePlataforma })
    }

    findByPlataformaTipo(plataformaId: number, tipo: TipoProducto) {
        return Producto.findOne({ where: { plataforma_id: plataformaId, tipo } })
    }

    create(data: CreateProductoInput) {
        return Producto.create(data)
    }

    update(producto: Producto, data: UpdateProductoInput) {
        return producto.update(data)
    }

    desactivarPorPlataforma(plataformaId: number) {
        return Producto.update({ activo: false }, { where: { plataforma_id: plataformaId } })
    }

    async stockMap(productoIds?: number[]) {
        const where = productoIds?.length ? "WHERE producto_id IN (:ids)" : ""
        const rows = await sequelize.query<{ producto_id: number; stock: number }>(
            `SELECT producto_id, CAST(stock AS UNSIGNED) AS stock FROM v_stock_productos ${where}`,
            { type: QueryTypes.SELECT, replacements: { ids: productoIds } }
        )
        return new Map(rows.map((r) => [Number(r.producto_id), Number(r.stock)]))
    }
}
