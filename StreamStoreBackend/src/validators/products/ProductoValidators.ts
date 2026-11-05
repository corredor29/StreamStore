import { z } from "../../config/zod"
import { tipoProductoSchema } from "../CommonValidators"

const productoFields = {
    plataforma_id: z.coerce.number().int().positive(),
    nombre: z.string().trim().min(2).max(150),
    tipo: tipoProductoSchema,
    precio: z.coerce.number().positive(),
    duracion_dias: z.coerce.number().int().min(1).max(365),
    stock_minimo: z.coerce.number().int().min(0),
    activo: z.boolean()
}

export const createProductoSchema = z.object({
    ...productoFields,
    duracion_dias: productoFields.duracion_dias.default(30),
    stock_minimo: productoFields.stock_minimo.default(2),
    activo: productoFields.activo.optional()
})

export const updateProductoSchema = z.object(productoFields).partial()
    .refine((data) => Object.keys(data).length > 0, { message: "Envía al menos un campo" })

export const listProductosQuerySchema = z.object({
    plataforma: z.string().trim().min(1).max(80).optional(),
    plataforma_id: z.coerce.number().int().positive().optional(),
    tipo: tipoProductoSchema.optional()
})

export type CreateProductoInput = z.infer<typeof createProductoSchema>
export type UpdateProductoInput = z.infer<typeof updateProductoSchema>
export type ListProductosQuery = z.infer<typeof listProductosQuerySchema>
