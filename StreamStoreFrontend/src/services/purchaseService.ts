import { api, mockDelay, USE_MOCKS } from './api'
import type { Compra, MetodoPago, PagoPayload, PagoResultado, CarritoItem } from '@/types'

/** Métodos de pago disponibles en la demostración. Daviplata es independiente. */
export const METODOS_PAGO: ReadonlyArray<{ id: MetodoPago; label: string; descripcion: string }> = [
  { id: 'TARJETA', label: 'Tarjeta débito / crédito', descripcion: 'Visa, Mastercard o American Express (solo números de prueba)' },
  { id: 'DAVIPLATA', label: 'Daviplata', descripcion: 'Billetera digital (simulada)' },
]

// Almacén en memoria de compras creadas durante la sesión para modo mock
export const mockComprasRealizadas: Compra[] = []

export const purchaseService = {
  /** Crea una compra PENDIENTE a partir del carrito del usuario. */
  async crear(items?: CarritoItem[]): Promise<Compra> {
    if (USE_MOCKS) {
      const itemsList = items || []
      const total = itemsList.reduce((acc, i) => acc + i.subtotal, 0)
      const nuevaCompra: Compra = {
        id: Math.floor(100000 + Math.random() * 900000),
        usuarioId: 1,
        fecha: new Date().toISOString(),
        total,
        estado: 'PENDIENTE',
        detalles: itemsList.map((item, idx) => ({
          id: idx + 1,
          productoId: item.productoId,
          producto: item.producto,
          cantidad: item.cantidad,
          precioUnitario: item.producto.precio,
          subtotal: item.subtotal,
        })),
      }
      mockComprasRealizadas.unshift(nuevaCompra)
      return mockDelay(nuevaCompra, 400)
    }

    const { data } = await api.post<Compra>('/compras')
    return data
  },

  /**
   * Paga una compra (simulado). El payload nunca contiene número completo,
   * CVV ni fecha de vencimiento: solo metadatos no sensibles.
   */
  async pagar(compraId: number, payload: PagoPayload): Promise<PagoResultado> {
    if (USE_MOCKS) {
      const compra = mockComprasRealizadas.find((c) => c.id === compraId)
      if (!compra) {
        throw { status: 404, message: 'La orden de compra no existe o expiró.' }
      }

      // Simulación de rechazo opcional si los últimos 4 dígitos son 0000
      if (payload.ultimos4 === '0000') {
        compra.estado = 'RECHAZADA'
        return mockDelay<PagoResultado>({
          compra,
          aprobado: false,
          mensaje: 'Transacción rechazada por el banco emisor de prueba (código 0000).',
        }, 600)
      }

      compra.estado = 'PAGADA'
      compra.fechaPago = new Date().toISOString()

      return mockDelay<PagoResultado>({
        compra,
        aprobado: true,
        mensaje: 'Pago aprobado exitosamente.',
      }, 700)
    }

    const { data } = await api.post<PagoResultado>(`/compras/${compraId}/pagar`, payload)
    return data
  },

  async mias(): Promise<Compra[]> {
    if (USE_MOCKS) {
      return mockDelay([...mockComprasRealizadas], 300)
    }
    const { data } = await api.get<Compra[]>('/compras/mias')
    return data
  },

  async get(id: number): Promise<Compra> {
    if (USE_MOCKS) {
      const compra = mockComprasRealizadas.find((c) => c.id === id)
      if (!compra) throw { status: 404, message: 'Compra no encontrada.' }
      return mockDelay(compra, 200)
    }
    const { data } = await api.get<Compra>(`/compras/${id}`)
    return data
  },
}
