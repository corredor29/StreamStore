import { withTransaction } from "../../config/database"
import { Combo } from "../../models/promos/Combo"
import { ComboRepository } from "../../repositories/promos/ComboRepository"
import { PlataformaRepository } from "../../repositories/products/PlataformaRepository"
import { HttpError } from "../../utils/httpError"
import { CreateComboInput, UpdateComboInput } from "../../validators/promos/ComboValidators"

export class ComboService {
    constructor(
        private readonly repository: ComboRepository,
        private readonly plataformaRepository: PlataformaRepository
    ) {}

    list() {
        return this.repository.findAll()
    }

    listActivos() {
        return this.repository.findAllActivos()
    }

    async create({ plataforma_ids, ...datos }: CreateComboInput) {
        await this.validarPlataformas(plataforma_ids)
        const id = await withTransaction(async (t) => {
            const combo = await this.repository.create(datos, t)
            await this.repository.setPlataformas(combo, plataforma_ids, t)
            return combo.id
        })
        return this.repository.findById(id)
    }

    async update(id: number, { plataforma_ids, ...datos }: UpdateComboInput) {
        const combo = await this.buscar(id)
        const promo = datos.precio_promo ?? Number(combo.precio_promo)
        const regular = datos.precio_regular ?? Number(combo.precio_regular)
        if (promo > regular) throw new HttpError("El precio promo no puede ser mayor al precio regular", 400)
        if (plataforma_ids) await this.validarPlataformas(plataforma_ids)
        await withTransaction(async (t) => {
            if (Object.keys(datos).length > 0) await this.repository.update(combo, datos, t)
            if (plataforma_ids) await this.repository.setPlataformas(combo, plataforma_ids, t)
        })
        return this.repository.findById(id)
    }

    async alternarActivo(id: number) {
        const combo = await this.buscar(id)
        return this.update(id, { activo: !combo.activo })
    }

    async delete(id: number) {
        await this.repository.delete(await this.buscar(id))
    }

    private async buscar(id: number): Promise<Combo> {
        const combo = await this.repository.findById(id)
        if (!combo) throw new HttpError("Combo no encontrado", 404)
        return combo
    }

    private async validarPlataformas(ids: number[]) {
        const plataformas = await Promise.all(ids.map((id) => this.plataformaRepository.findById(id)))
        const invalidas = ids.filter((_, i) => !plataformas[i]?.activo)
        if (invalidas.length > 0) throw new HttpError("Hay plataformas que no existen o están inactivas", 400, { plataforma_ids: invalidas })
    }
}
