import { z } from "../config/zod"

export const idParamSchema = z.object({ id: z.coerce.number().int().positive() })

export const tipoProductoSchema = z.enum(["cuenta_completa", "pantalla"])

export const metodoPagoSchema = z.enum(["simulado", "tarjeta", "pse", "nequi"])

export type IdParam = z.infer<typeof idParamSchema>
