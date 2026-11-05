import { config } from "../../config/config"
import { Servicio } from "../../models/orders/Servicio"
import { formatDateTime } from "../../utils/formatters"
import { escapeHtml } from "../../utils/mailer"
import type { CredencialesServicio } from "./ServicioService"

export const correoCredenciales = (s: Servicio, datos: CredencialesServicio) => {
    const plataforma = s.cuenta?.plataforma?.nombre ?? "streaming"
    const modalidad = s.tipo === "pantalla" ? "pantalla" : "cuenta completa"
    const asunto = `Tus datos de acceso a ${plataforma} están listos`
    const filas = datos.pantallas.map((p) => `<tr>
      <td style="padding:6px;border-bottom:1px solid #e5e7eb">${p.numero}</td>
      <td style="padding:6px;border-bottom:1px solid #e5e7eb">${escapeHtml(p.perfil)}</td>
      <td style="padding:6px;border-bottom:1px solid #e5e7eb"><b>${escapeHtml(p.pin)}</b></td>
    </tr>`).join("")
    const cuerpo = `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#1f2937">
  <h2 style="color:#1e1b4b">${escapeHtml(asunto)}</h2>
  <p>Hola ${escapeHtml(s.usuario?.nombre ?? "")}, ya verificamos tu compra y te asignamos tu ${modalidad}.</p>
  <table style="border-collapse:collapse;width:100%;margin:16px 0">
    <tr><td style="padding:6px 0;color:#6b7280">Servicio</td><td>${escapeHtml(s.producto?.nombre ?? "")} (#${s.id})</td></tr>
    <tr><td style="padding:6px 0;color:#6b7280">Correo</td><td><b>${escapeHtml(datos.email)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280">Contraseña</td><td><b>${escapeHtml(datos.password)}</b></td></tr>
    <tr><td style="padding:6px 0;color:#6b7280">Vence</td><td>${formatDateTime(new Date(s.fecha_vencimiento))}</td></tr>
  </table>
  <table style="border-collapse:collapse;width:100%;margin:16px 0">
    <thead><tr style="background:#f3f4f6"><th style="padding:6px;text-align:left">Pantalla</th><th style="padding:6px;text-align:left">Perfil</th><th style="padding:6px;text-align:left">PIN</th></tr></thead>
    <tbody>${filas}</tbody>
  </table>
  <p>No compartas estos datos. También los encuentras en <b>Mis servicios</b>.</p>
  <p><a href="${config.clientUrl}/mi-cuenta" style="display:inline-block;background:#6d28d9;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Ver mis servicios</a></p>
  <p style="color:#6b7280;font-size:12px">StreamStore</p>
</div>`
    return { asunto, cuerpo }
}
