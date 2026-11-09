import { withTransaction } from "../../config/database"
import { Servicio } from "../../models/orders/Servicio"
import { ServicioRepository } from "../../repositories/orders/ServicioRepository"
import { CuentaRepository } from "../../repositories/products/CuentaRepository"
import { decrypt, encrypt } from "../../utils/crypto"
import { HttpError } from "../../utils/httpError"
import { logger } from "../../utils/logger"
import { sendMail } from "../../utils/mailer"
import { EstadoEntrega, EstadoServicio } from "../../interfaces/orders/Servicio"
import { AsignarCredencialesInput } from "../../validators/orders/ServicioValidators"
import { correoCredenciales } from "./CorreoServicio"

const DAY = 24 * 60 * 60 * 1000

export const estadoServicio = (s: Servicio): EstadoServicio => {
    const restante = new Date(s.fecha_vencimiento).getTime() - Date.now()
    if (s.estado === "vencido" || restante <= 0) return "vencido"
    return restante <= 3 * DAY ? "por_vencer" : "activo"
}

const resumen = (s: Servicio) => ({
    id: s.id, compra_id: s.compra_id, tipo: s.tipo, estado: estadoServicio(s), renovacion_de_id: s.renovacion_de_id,
    estado_entrega: s.estado_entrega, entregado_at: s.entregado_at,
    fecha_inicio: s.fecha_inicio, fecha_vencimiento: s.fecha_vencimiento,
    dias_restantes: Math.max(0, Math.ceil((new Date(s.fecha_vencimiento).getTime() - Date.now()) / DAY)),
    producto: s.producto ? { id: s.producto.id, nombre: s.producto.nombre } : undefined,
    plataforma: s.cuenta?.plataforma?.nombre,
    usuario: s.usuario ? { id: s.usuario.id, nombre: s.usuario.nombre, email: s.usuario.email } : undefined
})

export type CredencialesServicio = {
    email: string
    password: string
    pantallas: { numero: number; perfil: string; pin: string }[]
}

const credenciales = (s: Servicio): CredencialesServicio | null => {
    if (estadoServicio(s) === "vencido" || s.estado_entrega !== "entregado") return null
    if (!s.cuenta.email || !s.cuenta.password_cifrada) return null
    const pantallas = s.pantalla_id ? [s.pantalla] : [...(s.cuenta.pantallas ?? [])].sort((a, b) => a.numero - b.numero)
    return {
        email: s.cuenta.email,
        password: decrypt(s.cuenta.password_cifrada),
        pantallas: pantallas.map((p) => ({ numero: p.numero, perfil: p.perfil, pin: p.pin }))
    }
}

const detalle = (s: Servicio, renovado: boolean) => ({ ...resumen(s), renovado, credenciales: credenciales(s) })

// Vista del admin: credenciales si ya se entregaron, y lo que hace falta saber para entregarlas
const detalleAdmin = (s: Servicio) => ({
    ...resumen(s),
    cuenta_id: s.cuenta_id,
    cuenta_tiene_credenciales: Boolean(s.cuenta?.email && s.cuenta?.password_cifrada),
    pantallas_cuenta: s.pantalla_id
        ? (s.pantalla ? [{ numero: s.pantalla.numero, perfil: s.pantalla.perfil, pin: s.pantalla.pin }] : [])
        : [...(s.cuenta?.pantallas ?? [])].sort((a, b) => a.numero - b.numero).map((p) => ({ numero: p.numero, perfil: p.perfil, pin: p.pin })),
    credenciales: credenciales(s)
})

export class ServicioService {
    constructor(
        private readonly repository: ServicioRepository,
        private readonly cuentaRepository: CuentaRepository
    ) {}

    async listMios(usuarioId: number) {
        const servicios = await this.repository.findByUsuarioConCredenciales(usuarioId)
        const renovados = new Set(servicios.map((s) => s.renovacion_de_id).filter((id) => id !== null))
        return servicios.map((s) => detalle(s, renovados.has(s.id)))
    }

    async listTodos(entrega?: EstadoEntrega) {
        return (await this.repository.findAllConUsuario(entrega)).map(detalleAdmin)
    }

    async getById(usuarioId: number, id: number, esAdmin: boolean) {
        const servicio = await this.repository.findConCredenciales(id, esAdmin ? undefined : usuarioId)
        if (!servicio) throw new HttpError("Servicio no encontrado", 404)
        return detalle(servicio, Boolean(await this.repository.findRenovacionDe(servicio.id)))
    }

    // El admin entrega (o corrige) las credenciales de un servicio ya pagado y se le avisan al cliente por correo
    async asignarCredenciales(id: number, data: AsignarCredencialesInput) {
        await withTransaction(async (t) => {
            const servicio = await this.repository.lockById(id, t)
            if (!servicio) throw new HttpError("Servicio no encontrado", 404)
            if (estadoServicio(servicio) === "vencido") throw new HttpError("El servicio está vencido; no se pueden entregar credenciales", 409)
            const cuenta = await this.cuentaRepository.lockConPantallas(servicio.cuenta_id, t)
            if (!cuenta) throw new HttpError("La cuenta del servicio no existe", 404)

            if (data.email && data.password) {
                if (await this.cuentaRepository.existeEmailEnPlataforma(cuenta.plataforma_id, data.email, cuenta.id, t))
                    throw new HttpError("Ya existe otra cuenta con ese correo en la plataforma", 409)
                await this.cuentaRepository.guardarCredenciales(cuenta, data.email, encrypt(data.password), t)
            } else if (!cuenta.email || !cuenta.password_cifrada) {
                throw new HttpError("La cuenta aún no tiene credenciales: envía email y password", 400)
            }

            if (servicio.tipo === "pantalla") {
                if (data.pantallas) throw new HttpError("Para un servicio de pantalla envía pin y perfil, no pantallas[]", 400)
                const pantalla = cuenta.pantallas.find((p) => p.id === servicio.pantalla_id)
                if (!pantalla) throw new HttpError("La pantalla del servicio no existe", 404)
                if (data.pin || data.perfil) await this.cuentaRepository.actualizarPantalla(pantalla, { pin: data.pin, perfil: data.perfil }, t)
            } else {
                if (data.pin || data.perfil) throw new HttpError("Para una cuenta completa envía los PIN en pantallas[] con su número", 400)
                for (const cambio of data.pantallas ?? []) {
                    const pantalla = cuenta.pantallas.find((p) => p.numero === cambio.numero)
                    if (!pantalla) throw new HttpError(`La cuenta no tiene la pantalla ${cambio.numero}`, 400)
                    await this.cuentaRepository.actualizarPantalla(pantalla, { pin: cambio.pin, perfil: cambio.perfil }, t)
                }
            }
            await this.repository.marcarEntregado(servicio, t)
        })

        const servicio = await this.repository.findConCredencialesYUsuario(id)
        if (!servicio) throw new HttpError("Servicio no encontrado", 404)
        const resultado = detalle(servicio, Boolean(await this.repository.findRenovacionDe(servicio.id)))
        const notificado = data.notificar && Boolean(servicio.usuario?.email) && resultado.credenciales !== null
        if (notificado) this.enviarCredenciales(servicio, resultado.credenciales!)
        return { ...resultado, notificado }
    }

    private enviarCredenciales(servicio: Servicio, datos: CredencialesServicio) {
        const { asunto, cuerpo } = correoCredenciales(servicio, datos)
        sendMail(servicio.usuario.email, asunto, cuerpo)
            .catch((e) => logger.error(`No se pudieron enviar las credenciales del servicio #${servicio.id}: ${e instanceof Error ? e.message : e}`))
    }
}
