import { api, mockDelay, USE_MOCKS } from './api'
import type { Compra, MetodoPago, PagoPayload, PagoResultado, CarritoItem } from '@/types'
import { accountService } from './accountService'

/** Métodos de pago disponibles en la tienda. Nequi y Tarjeta Débito. */
export const METODOS_PAGO: ReadonlyArray<{ id: MetodoPago; label: string; descripcion: string }> = [
  { id: 'TARJETA', label: 'Tarjeta Débito', descripcion: 'Visa, Mastercard o American Express (solo débito)' },
  { id: 'NEQUI', label: 'Nequi', descripcion: 'Billetera digital Nequi Colombia' },
  { id: 'DAVIPLATA', label: 'Daviplata', descripcion: 'Billetera digital (simulada)' },
]

// Historial inicial realista de compras para demostración
export const mockComprasIniciales: Compra[] = [
  {
    id: 5001,
    usuarioId: 1,
    fecha: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    fechaPago: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    total: 38000,
    estado: 'PAGADA',
    detalles: [
      {
        id: 1,
        productoId: 1,
        producto: { id: 1, plataformaId: 1, plataforma: { id: 1, nombre: 'Netflix', slug: 'netflix', color: '#E50914' }, nombre: 'Netflix Cuenta Completa', tipo: 'CUENTA_COMPLETA', duracionDias: 30, precio: 38000, stock: 3, activo: true },
        cantidad: 1,
        precioUnitario: 38000,
        subtotal: 38000,
      },
    ],
  },
  {
    id: 5002,
    usuarioId: 1,
    fecha: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    fechaPago: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    total: 9000,
    estado: 'PAGADA',
    detalles: [
      {
        id: 2,
        productoId: 4,
        producto: { id: 4, plataformaId: 2, plataforma: { id: 2, nombre: 'Disney+', slug: 'disney', color: '#113CCF' }, nombre: 'Disney+ Pantalla', tipo: 'PANTALLA', duracionDias: 30, precio: 9000, stock: 6, activo: true },
        cantidad: 1,
        precioUnitario: 9000,
        subtotal: 9000,
      },
    ],
  },
  {
    id: 5003,
    usuarioId: 1,
    fecha: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    fechaPago: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    total: 28000,
    estado: 'PAGADA',
    detalles: [
      {
        id: 3,
        productoId: 7,
        producto: { id: 7, plataformaId: 4, plataforma: { id: 4, nombre: 'Max', slug: 'max', color: '#7B2FF7' }, nombre: 'Max Cuenta Completa', tipo: 'CUENTA_COMPLETA', duracionDias: 30, precio: 28000, stock: 1, activo: true },
        cantidad: 1,
        precioUnitario: 28000,
        subtotal: 28000,
      },
    ],
  },
]

// Almacén en memoria de compras creadas durante la sesión para modo mock
export const mockComprasRealizadas: Compra[] = [...mockComprasIniciales]

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

    const { data } = await api.post<Compra>('/compras', { items })
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

      // ACTIVACIÓN AUTOMÁTICA DE LOS SERVICIOS DE LA COMPRA
      accountService.activarServiciosDeCompra(compra)

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
