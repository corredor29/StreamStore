import { z } from "../../config/zod"

export const addCarritoItemSchema = z.object({
    producto_id: z.coerce.number().int().positive(),
    cantidad: z.coerce.number().int().min(1).max(20).default(1)
})

export const updateCarritoItemSchema = z.object({
    cantidad: z.coerce.number().int().min(1).max(20)
})

export const itemIdParamSchema = z.object({ itemId: z.coerce.number().int().positive() })

export type AddCarritoItemInput = z.infer<typeof addCarritoItemSchema>
export type UpdateCarritoItemInput = z.infer<typeof updateCarritoItemSchema>
export type ItemIdParam = z.infer<typeof itemIdParamSchema>
