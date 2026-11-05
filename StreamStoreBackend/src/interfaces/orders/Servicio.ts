import { TipoProducto } from "../products/Producto"

export type EstadoServicio = "activo" | "por_vencer" | "vencido"

export type TipoAlerta = "3_dias" | "1_dia" | "vencimiento"

// pendiente_asignacion: se vendió una cuenta sin credenciales y el admin aún no las entrega
export type EstadoEntrega = "entregado" | "pendiente_asignacion"

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
    estado_entrega?: EstadoEntrega
    entregado_at?: Date | null
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
