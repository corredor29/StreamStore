export type EstadoCuenta = "disponible" | "vendida_completa" | "inactiva"

export type EstadoPantalla = "disponible" | "vendida"

export type NuevaCuenta = {
    plataforma_id: number
    email: string
    password_cifrada: string
    total_pantallas: number
}

export type NuevaPantalla = {
    numero: number
    perfil: string
    pin: string
}
