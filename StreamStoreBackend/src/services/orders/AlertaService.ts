import { config } from "../../config/config"
import { Servicio } from "../../models/orders/Servicio"
import { ServicioRepository } from "../../repositories/orders/ServicioRepository"
import { FlagsAlerta, ResultadoAlerta, TipoAlerta } from "../../interfaces/orders/Servicio"
import { diasCalendario, formatDateTime } from "../../utils/formatters"
import { logger } from "../../utils/logger"
import { escapeHtml, sendMail } from "../../utils/mailer"

const DAY = 24 * 60 * 60 * 1000

const FLAGS: Record<TipoAlerta, FlagsAlerta> = {
    "3_dias": { alerta_3d_enviada: true },
    "1_dia": { alerta_1d_enviada: true, alerta_3d_enviada: true },
    vencimiento: { alerta_vencido_enviada: true, alerta_1d_enviada: true, alerta_3d_enviada: true }
}

const clasificar = (s: Servicio, ahora: Date): TipoAlerta | null => {
    const dias = diasCalendario(ahora, new Date(s.fecha_vencimiento))
    if (dias <= 0) return "vencimiento"
    if (dias === 1) return s.alerta_1d_enviada ? null : "1_dia"
    if (dias <= 3) return s.alerta_3d_enviada ? null : "3_dias"
    return null
}

export const correoAlerta = (s: Servicio, tipo: TipoAlerta, ahora: Date) => {
    const vence = new Date(s.fecha_vencimiento)
    const dias = diasCalendario(ahora, vence)
    const yaVencio = vence.getTime() <= ahora.getTime()
    const plataforma = s.cuenta?.plataforma?.nombre ?? "streaming"
    const modalidad = s.tipo === "pantalla" ? "pantalla" : "cuenta completa"
    const cuando = tipo === "vencimiento"
        ? (yaVencio ? "venció" : "vence hoy")
        : `vence en ${dias} ${dias === 1 ? "día" : "días"}`
    const asunto = `Tu ${modalidad} de ${plataforma} ${cuando}`
    const renovarUrl = `${config.clientUrl}/mi-cuenta?renovar=${s.id}`
    const nota = yaVencio
        ? "Las credenciales ya no están disponibles. Renuévalo para volver a tener acceso."
        : "Renuévalo antes de la fecha para no perder el acceso."
    const cuerpo = `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#1f2937">
  <h2 style="color:#1e1b4b">${escapeHtml(asunto)}</h2>
  <p>Hola ${escapeHtml(s.usuario?.nombre ?? "")},</p>
  <table style="border-collapse:collapse;width:100%;margin:16px 0">
    <tr><td style="padding:6px 0;color:#6b7280">Plataforma</td><td><b>${escapeHtml(plataforma)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280">Modalidad</td><td><b>${modalidad}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280">Servicio</td><td>${escapeHtml(s.producto?.nombre ?? "")} (#${s.id})</td></tr>
    <tr><td style="padding:6px 0;color:#6b7280">Vencimiento</td><td><b>${formatDateTime(vence)}</b></td></tr>
  </table>
  <p>${nota}</p>
  <p><a href="${renovarUrl}" style="display:inline-block;background:#6d28d9;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Renovar</a></p>
  <p style="color:#6b7280;font-size:12px">StreamStore</p>
</div>`
    return { asunto, cuerpo }
}

export class AlertaService {
    constructor(private readonly servicioRepository: ServicioRepository) {}

    async ejecutar(ahora = new Date()) {
        const candidatos = await this.servicioRepository.findPendientesDeAviso(new Date(ahora.getTime() + 4 * DAY))
        const resultados: Record<TipoAlerta, ResultadoAlerta> = {
            "3_dias": { encontrados: 0, enviados: 0, errores: [] },
            "1_dia": { encontrados: 0, enviados: 0, errores: [] },
            vencimiento: { encontrados: 0, enviados: 0, errores: [] }
        }
        for (const s of candidatos) {
            const tipo = clasificar(s, ahora)
            if (!tipo) continue
            const r = resultados[tipo]
            r.encontrados++
            try {
                const { asunto, cuerpo } = correoAlerta(s, tipo, ahora)
                await sendMail(s.usuario.email, asunto, cuerpo)
                await this.servicioRepository.marcarAlerta(s, FLAGS[tipo])
                r.enviados++
            } catch (e) {
                r.errores.push({ servicio_id: s.id, error: e instanceof Error ? e.message : String(e) })
            }
        }
        const [marcadosVencidos] = await this.servicioRepository.marcarVencidos(ahora)
        logger.info(`[cron] alertas: 3_dias=${resultados["3_dias"].enviados} 1_dia=${resultados["1_dia"].enviados} vencimiento=${resultados.vencimiento.enviados}`)
        return { ejecutado_en: ahora.toISOString(), marcados_vencidos: marcadosVencidos, ...resultados }
    }
}
