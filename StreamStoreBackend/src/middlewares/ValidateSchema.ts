import { Request, Response, NextFunction } from "express"
import { ZodType } from "zod"

type Source = "body" | "params" | "query"

export const validateSchema = (schema: ZodType, source: Source = "body") => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source] ?? {})
    if (!result.success) {
        const errors: Record<string, string[]> = {}
        for (const issue of result.error.issues) {
            const campo = issue.path.join(".") || source
            errors[campo] = [...(errors[campo] ?? []), issue.message]
        }
        return res.status(400).json({ error: "Datos inválidos", errors })
    }
    if (source === "body") req.body = result.data
    else res.locals[source] = result.data
    next()
}
