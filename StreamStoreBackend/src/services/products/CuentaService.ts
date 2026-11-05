import { withTransaction } from "../../config/database"
import { CuentaRepository } from "../../repositories/products/CuentaRepository"
import { PlataformaRepository } from "../../repositories/products/PlataformaRepository"
import { encrypt } from "../../utils/crypto"
import { HttpError } from "../../utils/httpError"
import { CreateCuentaInput } from "../../validators/products/CuentaValidators"

const generarPin = () => String(Math.floor(1000 + Math.random() * 9000))

export class CuentaService {
    constructor(
        private readonly repository: CuentaRepository,
        private readonly plataformaRepository: PlataformaRepository
    ) {}

    list(plataformaId?: number) {
        return this.repository.findAll(plataformaId)
    }

    async getById(id: number) {
        const cuenta = await this.repository.findById(id)
        if (!cuenta) throw new HttpError("Cuenta no encontrada", 404)
        return cuenta
    }

    async create(data: CreateCuentaInput) {
        const plataforma = await this.plataformaRepository.findById(data.plataforma_id)
        if (!plataforma) throw new HttpError("Plataforma no encontrada", 404)
        if (await this.repository.findByPlataformaEmail(data.plataforma_id, data.email))
            throw new HttpError("Ya existe esa cuenta en la plataforma", 409)
        const total = plataforma.max_pantallas
        const pantallas = Array.from({ length: total }, (_, i) => ({ numero: i + 1, perfil: `Perfil ${i + 1}`, pin: generarPin() }))
        const id = await withTransaction((t) => this.repository.createConPantallas({
            plataforma_id: data.plataforma_id, email: data.email, password_cifrada: encrypt(data.password), total_pantallas: total
        }, pantallas, t))
        return this.getById(id)
    }
}
