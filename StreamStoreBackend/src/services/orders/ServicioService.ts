import { Servicio } from "../../models/orders/Servicio"
import { ServicioRepository } from "../../repositories/orders/ServicioRepository"
import { decrypt } from "../../utils/crypto"
import { HttpError } from "../../utils/httpError"
import { EstadoServicio } from "../../interfaces/orders/Servicio"

const DAY = 24 * 60 * 60 * 1000

export const estadoServicio = (s: Servicio): EstadoServicio => {
    const restante = new Date(s.fecha_vencimiento).getTime() - Date.now()
    if (s.estado === "vencido" || restante <= 0) return "vencido"
    return restante <= 3 * DAY ? "por_vencer" : "activo"
}

const resumen = (s: Servicio) => ({
    id: s.id, compra_id: s.compra_id, tipo: s.tipo, estado: estadoServicio(s), renovacion_de_id: s.renovacion_de_id,
    fecha_inicio: s.fecha_inicio, fecha_vencimiento: s.fecha_vencimiento,
    dias_restantes: Math.max(0, Math.ceil((new Date(s.fecha_vencimiento).getTime() - Date.now()) / DAY)),
    producto: s.producto ? { id: s.producto.id, nombre: s.producto.nombre } : undefined,
    plataforma: s.cuenta?.plataforma?.nombre,
    usuario: s.usuario ? { id: s.usuario.id, nombre: s.usuario.nombre, email: s.usuario.email } : undefined
})

const credenciales = (s: Servicio) => {
    if (estadoServicio(s) === "vencido") return null
    const pantallas = s.pantalla_id ? [s.pantalla] : [...(s.cuenta.pantallas ?? [])].sort((a, b) => a.numero - b.numero)
    return {
        email: s.cuenta.email,
        password: decrypt(s.cuenta.password_cifrada),
        pantallas: pantallas.map((p) => ({ numero: p.numero, perfil: p.perfil, pin: p.pin }))
    }
}

const detalle = (s: Servicio, renovado: boolean) => ({ ...resumen(s), renovado, credenciales: credenciales(s) })

export class ServicioService {
    constructor(private readonly repository: ServicioRepository) {}

    async listMios(usuarioId: number) {
        const servicios = await this.repository.findByUsuarioConCredenciales(usuarioId)
        const renovados = new Set(servicios.map((s) => s.renovacion_de_id).filter((id) => id !== null))
        return servicios.map((s) => detalle(s, renovados.has(s.id)))
    }

    async listTodos() {
        return (await this.repository.findAllConUsuario()).map(resumen)
    }

    async getById(usuarioId: number, id: number, esAdmin: boolean) {
        const servicio = await this.repository.findConCredenciales(id, esAdmin ? undefined : usuarioId)
        if (!servicio) throw new HttpError("Servicio no encontrado", 404)
        return detalle(servicio, Boolean(await this.repository.findRenovacionDe(servicio.id)))
    }
}
