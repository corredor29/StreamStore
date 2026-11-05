import { WhereOptions } from "sequelize"
import { Producto } from "../../models/products/Producto"
import { PlataformaRepository } from "../../repositories/products/PlataformaRepository"
import { ProductoRepository } from "../../repositories/products/ProductoRepository"
import { HttpError } from "../../utils/httpError"
import { CreateProductoInput, ListProductosQuery, UpdateProductoInput } from "../../validators/products/ProductoValidators"

export class ProductoService {
    constructor(
        private readonly repository: ProductoRepository,
        private readonly plataformaRepository: PlataformaRepository
    ) {}

    async conStock(productos: Producto[]) {
        const stock = await this.repository.stockMap(productos.map((p) => p.id))
        return productos.map((p) => {
            const s = stock.get(p.id) ?? 0
            return { ...p.toJSON(), precio: Number(p.precio), stock: s, stock_bajo: s <= p.stock_minimo, disponible: s > 0 }
        })
    }

    async list(filtros: ListProductosQuery, incluirInactivos = false) {
        let plataformaId = filtros.plataforma_id
        if (filtros.plataforma) {
            const plataforma = /^\d+$/.test(filtros.plataforma)
                ? await this.plataformaRepository.findById(Number(filtros.plataforma))
                : await this.plataformaRepository.findByNombre(filtros.plataforma)
            if (!plataforma) return []
            plataformaId = plataforma.id
        }
        const where: WhereOptions<Producto> = {
            ...(!incluirInactivos && { activo: true }),
            ...(plataformaId && { plataforma_id: plataformaId }),
            ...(filtros.tipo && { tipo: filtros.tipo })
        }
        return this.conStock(await this.repository.findAll(where))
    }

    async getById(id: number) {
        const producto = await this.repository.findById(id)
        if (!producto || !producto.activo) throw new HttpError("Producto no encontrado", 404)
        return (await this.conStock([producto]))[0]
    }

    async listStockBajo() {
        return (await this.list({})).filter((p) => p.stock_bajo)
    }

    async create(data: CreateProductoInput) {
        if (!(await this.plataformaRepository.findById(data.plataforma_id))) throw new HttpError("Plataforma no encontrada", 404)
        if (await this.repository.findByPlataformaTipo(data.plataforma_id, data.tipo))
            throw new HttpError("Ya existe un producto de ese tipo para la plataforma", 409)
        return this.repository.create(data)
    }

    async update(id: number, data: UpdateProductoInput) {
        const producto = await this.repository.findById(id)
        if (!producto) throw new HttpError("Producto no encontrado", 404)
        return this.repository.update(producto, data)
    }

    async desactivar(id: number) {
        const producto = await this.repository.findById(id)
        if (!producto) throw new HttpError("Producto no encontrado", 404)
        return this.repository.update(producto, { activo: false })
    }
}
