import { z } from "../../config/zod"

export const createCuentaSchema = z.object({
    plataforma_id: z.coerce.number().int().positive(),
    email: z.email().max(150),
    password: z.string().min(4).max(120)
})

export const listCuentasQuerySchema = z.object({
    plataforma_id: z.coerce.number().int().positive().optional()
})

export type CreateCuentaInput = z.infer<typeof createCuentaSchema>
export type ListCuentasQuery = z.infer<typeof listCuentasQuerySchema>
