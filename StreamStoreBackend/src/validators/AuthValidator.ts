import { z } from "../config/zod"

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(6)
})
