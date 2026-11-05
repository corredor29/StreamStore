import { TipoProducto } from "../products/Producto"

export interface CarritoLinea {
    id: number
    producto_id: number
    cantidad: number
    producto: { id: number; nombre: string; tipo: TipoProducto; plataforma?: string }
    renovacion: { servicio_id: number | null; vence: Date | null } | null
    precio_unitario: number
    subtotal: number
    stock_disponible: number
    stock_suficiente: boolean
}

export interface CarritoDetalle {
    id: number
    items: CarritoLinea[]
    total: number
    cantidad_items: number
}
