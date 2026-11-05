import { config } from "../config/config"
import { escapeHtml } from "../utils/mailer"

export const MINUTOS_VIGENCIA_RESET = 60

export const correoRecuperacion = (nombre: string, token: string) => {
    const url = `${config.clientUrl}/restablecer?token=${token}`
    const asunto = "Restablece tu contraseña de StreamStore"
    const cuerpo = `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#1f2937">
  <h2 style="color:#1e1b4b">${asunto}</h2>
  <p>Hola ${escapeHtml(nombre)},</p>
  <p>Recibimos una solicitud para cambiar tu contraseña. El enlace sirve una sola vez y vence en ${MINUTOS_VIGENCIA_RESET} minutos.</p>
  <p><a href="${url}" style="display:inline-block;background:#6d28d9;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Cambiar contraseña</a></p>
  <p style="color:#6b7280;font-size:12px">Si no fuiste tú, ignora este correo: tu contraseña no cambia.</p>
</div>`
    return { asunto, cuerpo }
}
