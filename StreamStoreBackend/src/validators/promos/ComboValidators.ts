import { z } from "../../config/zod"

const camposCombo = {
    nombre: z.string().trim().min(3).max(120),
    descripcion: z.string().trim().max(255).nullable().optional(),
    imagen_url: z.string().trim().max(500).nullable().optional(),
    plantilla: z.string().trim().max(60).nullable().optional(),
    plataforma_ids: z.array(z.coerce.number().int().positive()).min(1).max(10)
        .refine((ids) => new Set(ids).size === ids.length, { message: "Las plataformas no se pueden repetir" }),
    precio_promo: z.coerce.number().positive(),
    precio_regular: z.coerce.number().positive(),
    pantallas_por_plataforma: z.coerce.number().int().min(1).max(10).optional(),
    duracion_dias: z.coerce.number().int().min(1).max(365).optional(),
    etiqueta_promo: z.string().trim().min(2).max(40),
    activo: z.boolean().optional()
}

const promoNoMayor = (data: { precio_promo?: number, precio_regular?: number }) =>
    data.precio_promo === undefined || data.precio_regular === undefined || data.precio_promo <= data.precio_regular

const mensajePromo = { message: "El precio promo no puede ser mayor al precio regular", path: ["precio_promo"] }

export const createComboSchema = z.object(camposCombo).refine(promoNoMayor, mensajePromo)

export const updateComboSchema = z.object(camposCombo).partial()
    .refine((data) => Object.keys(data).length > 0, { message: "Envía al menos un campo" })
    .refine(promoNoMayor, mensajePromo)

export type CreateComboInput = z.infer<typeof createComboSchema>
export type UpdateComboInput = z.infer<typeof updateComboSchema>
