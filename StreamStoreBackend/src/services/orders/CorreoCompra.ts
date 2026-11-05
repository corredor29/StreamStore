import { config } from "../../config/config"
import { Compra } from "../../models/orders/Compra"
import { formatCurrency, formatDateTime } from "../../utils/formatters"
import { escapeHtml } from "../../utils/mailer"

export const correoConfirmacionCompra = (compra: Compra) => {
    const filas = compra.items.map((i) => {
        const modalidad = i.producto?.tipo === "pantalla" ? "Pantalla" : "Cuenta completa"
        return `<tr>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb">${escapeHtml(i.producto?.plataforma?.nombre ?? "")}<br><span style="color:#6b7280;font-size:12px">${modalidad}</span></td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:center">${i.cantidad}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">${formatCurrency(Number(i.precio_unitario))}</td>
      <td style="padding:8px;border-bottom:1px solid #e5e7eb;text-align:right">${formatCurrency(Number(i.subtotal))}</td>
    </tr>`
    }).join("")
    const asunto = `Compra #${compra.id} confirmada`
    const cuerpo = `
<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#1f2937">
  <h2 style="color:#1e1b4b">¡Gracias por tu compra!</h2>
  <p>Hola ${escapeHtml(compra.usuario?.nombre ?? "")}, tu pago fue aprobado y tus servicios ya están activos.</p>
  <p style="color:#6b7280">Compra #${compra.id} · ${compra.pagada_at ? formatDateTime(new Date(compra.pagada_at)) : ""} · Ref. ${escapeHtml(compra.referencia_pago ?? "")}</p>
  <table style="border-collapse:collapse;width:100%;margin:16px 0">
    <thead><tr style="background:#f3f4f6">
      <th style="padding:8px;text-align:left">Producto</th><th style="padding:8px">Cant.</th>
      <th style="padding:8px;text-align:right">Precio</th><th style="padding:8px;text-align:right">Subtotal</th>
    </tr></thead>
    <tbody>${filas}</tbody>
    <tfoot><tr><td colspan="3" style="padding:8px;text-align:right"><b>Total</b></td><td style="padding:8px;text-align:right"><b>${formatCurrency(Number(compra.total))}</b></td></tr></tfoot>
  </table>
  <p>Tus datos de acceso (correo, contraseña, perfil y PIN) están en <b>Mis servicios</b>. Si algún servicio aparece como pendiente de asignación, te enviaremos sus datos por correo apenas el equipo los asigne.</p>
  <p><a href="${config.clientUrl}/mi-cuenta" style="display:inline-block;background:#6d28d9;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Ver mis servicios</a></p>
  <p style="color:#6b7280;font-size:12px">StreamStore</p>
</div>`
    return { asunto, cuerpo }
}
