import { PlataformaRepository } from "../../repositories/products/PlataformaRepository"
import { ProductoRepository } from "../../repositories/products/ProductoRepository"
import { HttpError } from "../../utils/httpError"
import { CreatePlataformaInput, UpdatePlataformaInput } from "../../validators/products/PlataformaValidators"
import { ProductoService } from "./ProductoService"

export class PlataformaService {
    constructor(
        private readonly repository: PlataformaRepository,
        private readonly productoRepository: ProductoRepository,
        private readonly productoService: ProductoService
    ) {}

    listActivas() {
        return this.repository.findActivas()
    }

    listTodas() {
        return this.repository.findAll()
    }

    async getById(id: number) {
        const plataforma = await this.repository.findByIdConProductosActivos(id)
        if (!plataforma) throw new HttpError("Plataforma no encontrada", 404)
        return { ...plataforma.toJSON(), productos: await this.productoService.conStock(plataforma.productos ?? []) }
    }

    async create(data: CreatePlataformaInput) {
        if (await this.repository.findByNombre(data.nombre)) throw new HttpError("La plataforma ya existe", 409)
        return this.repository.create(data)
    }

    async update(id: number, data: UpdatePlataformaInput) {
        const plataforma = await this.repository.findById(id)
        if (!plataforma) throw new HttpError("Plataforma no encontrada", 404)
        if (data.nombre && data.nombre !== plataforma.nombre && await this.repository.findByNombre(data.nombre))
            throw new HttpError("La plataforma ya existe", 409)
        if (data.activo === false) await this.productoRepository.desactivarPorPlataforma(id)
        return this.repository.update(plataforma, data)
    }

    desactivar(id: number) {
        return this.update(id, { activo: false })
    }
}
