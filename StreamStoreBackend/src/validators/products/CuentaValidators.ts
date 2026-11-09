import { z } from "../../config/zod"

// Sin email/password la cuenta queda pendiente de asignación: se vende y el admin entrega las credenciales después
export const createCuentaSchema = z.object({
    plataforma_id: z.coerce.number().int().positive(),
    email: z.email().max(150).optional(),
    password: z.string().min(4).max(120).optional(),
    cantidad: z.coerce.number().int().min(1).max(50).optional(),
    // Perfiles de la cuenta en orden (#1, #2…). Sin esto se usan los de la plataforma con PIN aleatorio
    pantallas: z.array(z.object({
        perfil: z.string().trim().min(1).max(60).optional(),
        pin: z.string().trim().regex(/^\d{4,6}$/, "El PIN debe tener de 4 a 6 dígitos").optional()
    })).min(1).max(10).optional()
})
    .refine((d) => (d.email === undefined) === (d.password === undefined), {
        message: "Envía email y password juntos, o ninguno para dejar la cuenta pendiente de asignación", path: ["password"]
    })
    .refine((d) => d.email === undefined || (d.cantidad ?? 1) === 1, {
        message: "Solo puedes crear varias cuentas a la vez si no llevan credenciales", path: ["cantidad"]
    })

export const listCuentasQuerySchema = z.object({
    plataforma_id: z.coerce.number().int().positive().optional(),
    credenciales: z.enum(["asignadas", "pendientes"]).optional()
})

export type CreateCuentaInput = z.infer<typeof createCuentaSchema>
export type ListCuentasQuery = z.infer<typeof listCuentasQuerySchema>
