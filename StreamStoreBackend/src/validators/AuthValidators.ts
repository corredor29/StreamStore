import { z } from "../config/zod"

const email = z.email().max(150).transform((v) => v.toLowerCase())
const password = z.string().min(6).max(72)

export const loginSchema = z.object({
    email,
    password: z.string().min(6)
})

export const registerSchema = z.object({
    nombre: z.string().trim().min(2).max(120),
    email,
    password,
    telefono: z.string().trim().regex(/^\+?[0-9 ]{7,20}$/, "Teléfono inválido").optional()
})

export const recuperarSchema = z.object({ email })

export const restablecerSchema = z.object({
    token: z.string().regex(/^[a-f0-9]{64}$/, "Token inválido"),
    password
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type RecuperarInput = z.infer<typeof recuperarSchema>
export type RestablecerInput = z.infer<typeof restablecerSchema>
