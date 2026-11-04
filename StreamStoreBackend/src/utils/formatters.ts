import { config } from "../config/config"

export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(value)
}

export const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-CO", { timeZone: config.appTimezone, dateStyle: "short", timeStyle: "short" }).format(date)
}
