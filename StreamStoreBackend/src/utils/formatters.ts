import { config } from "../config/config"

const DAY = 24 * 60 * 60 * 1000

export const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value)
}

export const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-CO", { timeZone: config.appTimezone, dateStyle: "long" }).format(date)
}

export const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("es-CO", { timeZone: config.appTimezone, dateStyle: "long", timeStyle: "short" }).format(date)
}

export const fechaLocal = (date: Date) => {
    return new Intl.DateTimeFormat("en-CA", { timeZone: config.appTimezone }).format(date)
}

export const diasCalendario = (desde: Date, hasta: Date) => {
    return Math.round((Date.parse(fechaLocal(hasta)) - Date.parse(fechaLocal(desde))) / DAY)
}
