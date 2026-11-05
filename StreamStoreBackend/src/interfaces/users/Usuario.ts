export type Rol = "cliente" | "admin"

export type NuevoUsuario = {
    nombre: string
    email: string
    password: string
    telefono: string | null
    rol: Rol
}
