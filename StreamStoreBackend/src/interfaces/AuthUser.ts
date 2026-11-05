import { Rol } from "./users/Usuario"

export interface AuthUser {
    id: number
    email: string
    nombre: string
    rol: Rol
}
