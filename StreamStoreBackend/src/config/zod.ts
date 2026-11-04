import { z } from "zod"

z.config({
    customError: (issue) => {
        if (issue.code === "invalid_type") {
            return issue.input === undefined ? "El campo es obligatorio" : "Tipo de dato inválido"
        }
        if (issue.code === "too_small") return `Debe tener mínimo ${issue.minimum}`
        if (issue.code === "too_big") return `Debe tener máximo ${issue.maximum}`
        if (issue.code === "invalid_format") return "Formato inválido"
        return "Valor inválido"
    }
})

export { z }
