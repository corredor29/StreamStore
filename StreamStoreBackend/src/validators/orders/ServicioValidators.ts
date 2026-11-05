import { z } from "../../config/zod"

const pin = z.string().regex(/^\d{4,6}$/, "El PIN debe tener de 4 a 6 dígitos")
const perfil = z.string().trim().min(1).max(60)

export const listServiciosQuerySchema = z.object({
    entrega: z.enum(["entregado", "pendiente_asignacion"]).optional()
})

// email/password van a la cuenta; pin/perfil a la pantalla del servicio; pantallas[] a una cuenta completa
export const asignarCredencialesSchema = z.object({
    email: z.email().max(150).optional(),
    password: z.string().min(4).max(120).optional(),
    pin: pin.optional(),
    perfil: perfil.optional(),
    pantallas: z.array(z.object({
        numero: z.coerce.number().int().positive(),
        pin: pin.optional(),
        perfil: perfil.optional()
    })).min(1).max(10).optional(),
    notificar: z.boolean().default(true)
}).refine((d) => (d.email === undefined) === (d.password === undefined), {
    message: "Envía email y password juntos", path: ["password"]
})

export type ListServiciosQuery = z.infer<typeof listServiciosQuerySchema>
export type AsignarCredencialesInput = z.infer<typeof asignarCredencialesSchema>
