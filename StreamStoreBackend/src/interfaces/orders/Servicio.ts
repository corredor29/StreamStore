import { TipoProducto } from "../products/Producto"

export type EstadoServicio = "activo" | "por_vencer" | "vencido"

export type TipoAlerta = "3_dias" | "1_dia" | "vencimiento"

export type NuevoServicio = {
    usuario_id: number
    compra_id: number
    producto_id: number
    cuenta_id: number
    pantalla_id: number | null
    tipo: TipoProducto
    fecha_inicio: Date
    fecha_vencimiento: Date
    renovacion_de_id?: number | null
}

export interface FlagsAlerta {
    alerta_3d_enviada?: boolean
    alerta_1d_enviada?: boolean
    alerta_vencido_enviada?: boolean
}

export interface ResultadoAlerta {
    encontrados: number
    enviados: number
    errores: { servicio_id: number; error: string }[]
}
