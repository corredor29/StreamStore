import { withTransaction } from "../../config/database"
import { Cuenta } from "../../models/products/Cuenta"
import { CuentaRepository } from "../../repositories/products/CuentaRepository"
import { PlataformaRepository } from "../../repositories/products/PlataformaRepository"
import { encrypt } from "../../utils/crypto"
import { HttpError } from "../../utils/httpError"
import { CreateCuentaInput, ListCuentasQuery } from "../../validators/products/CuentaValidators"

const generarPin = () => String(Math.floor(1000 + Math.random() * 9000))

const conEstadoCredenciales = (c: Cuenta) => ({ ...c.toJSON(), credenciales_asignadas: c.email !== null })

export class CuentaService {
    constructor(
        private readonly repository: CuentaRepository,
        private readonly plataformaRepository: PlataformaRepository
    ) {}

    async list(filtros: ListCuentasQuery = {}) {
        return (await this.repository.findAll(filtros.plataforma_id, filtros.credenciales)).map(conEstadoCredenciales)
    }

    async getById(id: number) {
        const cuenta = await this.repository.findById(id)
        if (!cuenta) throw new HttpError("Cuenta no encontrada", 404)
        return conEstadoCredenciales(cuenta)
    }

    // Una cuenta con credenciales, o `cantidad` cuentas pendientes de asignación
    async create(data: CreateCuentaInput) {
        const plataforma = await this.plataformaRepository.findById(data.plataforma_id)
        if (!plataforma) throw new HttpError("Plataforma no encontrada", 404)
        if (data.email && await this.repository.findByPlataformaEmail(data.plataforma_id, data.email))
            throw new HttpError("Ya existe esa cuenta en la plataforma", 409)
        const total = data.pantallas?.length ?? plataforma.max_pantallas
        const cantidad = data.cantidad ?? 1
        const ids = await withTransaction(async (t) => {
            const creadas: number[] = []
            for (let n = 0; n < cantidad; n++) {
                const pantallas = Array.from({ length: total }, (_, i) => ({
                    numero: i + 1,
                    perfil: data.pantallas?.[i]?.perfil ?? `Perfil ${i + 1}`,
                    pin: data.pantallas?.[i]?.pin ?? generarPin()
                }))
                creadas.push(await this.repository.createConPantallas({
                    plataforma_id: data.plataforma_id,
                    email: data.email ?? null,
                    password_cifrada: data.password ? encrypt(data.password) : null,
                    total_pantallas: total
                }, pantallas, t))
            }
            return creadas
        })
        if (data.cantidad === undefined) return this.getById(ids[0])
        return Promise.all(ids.map((id) => this.getById(id)))
    }
}
