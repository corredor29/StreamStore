import { z } from "../../config/zod"

export const createPlataformaSchema = z.object({
    nombre: z.string().trim().min(2).max(80),
    descripcion: z.string().max(255).optional(),
    logo_url: z.url().max(255).optional(),
    max_pantallas: z.coerce.number().int().min(1).max(10).optional(),
    activo: z.boolean().optional()
})

export const updatePlataformaSchema = createPlataformaSchema.partial()
    .refine((data) => Object.keys(data).length > 0, { message: "Envía al menos un campo" })

export type CreatePlataformaInput = z.infer<typeof createPlataformaSchema>
export type UpdatePlataformaInput = z.infer<typeof updatePlataformaSchema>
