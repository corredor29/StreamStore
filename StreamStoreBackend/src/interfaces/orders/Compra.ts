export type EstadoCompra = "pendiente" | "pagada" | "cancelada"

export type NuevaCompra = {
    usuario_id: number
    total: number
    metodo_pago: string
}

export type NuevaLineaCompra = {
    producto_id: number
    cantidad: number
    precio_unitario: string
    subtotal: number
    servicio_id: number | null
}

export interface ResumenProducto {
    producto_id: number
    nombre: string
    tipo: string
    stock: number
    stock_minimo: number
    unidades_vendidas: number
    total_ventas: number
}

export interface ResumenPlataforma {
    plataforma_id: number
    plataforma: string
    unidades_vendidas: number
    total_ventas: number
    productos: ResumenProducto[]
}
