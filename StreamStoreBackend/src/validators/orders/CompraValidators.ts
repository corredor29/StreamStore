import { z } from "../../config/zod"
import { metodoPagoSchema } from "../CommonValidators"

export const createCompraSchema = z.object({
    metodo_pago: metodoPagoSchema.default("simulado")
})

export const pagarCompraSchema = z.object({
    metodo_pago: metodoPagoSchema.optional()
})

export const listComprasQuerySchema = z.object({
    estado: z.enum(["pendiente", "pagada", "cancelada"]).optional(),
    desde: z.coerce.date().optional(),
    hasta: z.coerce.date().optional()
})

export type CreateCompraInput = z.infer<typeof createCompraSchema>
export type PagarCompraInput = z.infer<typeof pagarCompraSchema>
export type ListComprasQuery = z.infer<typeof listComprasQuerySchema>
