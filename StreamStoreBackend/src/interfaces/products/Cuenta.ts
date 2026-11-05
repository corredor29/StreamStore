export type EstadoCuenta = "disponible" | "vendida_completa" | "inactiva"

export type EstadoPantalla = "disponible" | "vendida"

export type NuevaCuenta = {
    plataforma_id: number
    email: string | null
    password_cifrada: string | null
    total_pantallas: number
}

export type NuevaPantalla = {
    numero: number
    perfil: string
    pin: string
}

export type CambiosPantalla = {
    perfil?: string
    pin?: string
}
