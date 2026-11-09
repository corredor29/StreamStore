import { api, mockDelay, normalizeError, USE_MOCKS } from './api'
import type { Compra, MetodoPago, PagoPayload, PagoResultado, CarritoItem } from '@/types'
import { accountService } from './accountService'

/** Métodos de pago disponibles en la tienda. Nequi y Tarjeta Débito. */
export const METODOS_PAGO: ReadonlyArray<{ id: MetodoPago; label: string; descripcion: string }> = [
  { id: 'TARJETA', label: 'Tarjeta Débito', descripcion: 'Visa, Mastercard o American Express (solo débito)' },
  { id: 'NEQUI', label: 'Nequi', descripcion: 'Billetera digital Nequi Colombia' },
  { id: 'DAVIPLATA', label: 'Daviplata', descripcion: 'Billetera digital (simulada)' },
]

export function normalizeCompra(c: any): Compra {
  const items = c.items || c.detalles || []
  return {
    referenciaPago: c.referencia_pago ?? c.referenciaPago ?? null,
    cliente: c.usuario ? { nombre: c.usuario.nombre, email: c.usuario.email } : (c.cliente ?? null),
    id: Number(c.id),
    usuarioId: Number(c.usuario_id ?? c.usuarioId ?? 1),
    fecha: c.createdAt || c.fecha || new Date().toISOString(),
    fechaPago: c.pagada_at || c.fecha_pago || c.fechaPago || null,
    total: Number(c.total ?? 0),
    estado: (c.estado || 'PENDIENTE').toUpperCase(),
    metodoPago: c.metodo_pago ?? c.metodoPago ?? 'TARJETA',
    detalles: items.map((d: any, idx: number) => ({
      id: Number(d.id ?? idx + 1),
      productoId: Number(d.producto_id ?? d.productoId ?? 1),
      producto: d.producto ? {
        id: Number(d.producto.id),
        plataformaId: Number(d.producto.plataforma?.id ?? 1),
        plataforma: d.producto.plataforma ? {
          id: Number(d.producto.plataforma.id),
          nombre: d.producto.plataforma.nombre,
          slug: (d.producto.plataforma.nombre || '').toLowerCase(),
          color: d.producto.plataforma.color || '#8057FF',
        } : undefined,
        nombre: d.producto.nombre,
        tipo: (d.producto.tipo || '').toUpperCase().includes('COMPLETA') ? 'CUENTA_COMPLETA' : 'PANTALLA',
        duracionDias: Number(d.producto.duracion_dias ?? d.producto.duracionDias ?? 30),
        precio: Number(d.precio_unitario ?? d.precioUnitario ?? 0),
        stock: 5,
        activo: true,
      } : {
        id: Number(d.producto_id ?? 1),
        plataformaId: 1,
        nombre: d.nombre_producto || 'Suscripción',
        tipo: 'CUENTA_COMPLETA',
        duracionDias: 30,
        precio: Number(d.precio_unitario ?? 0),
        stock: 5,
        activo: true,
      },
      cantidad: Number(d.cantidad ?? 1),
      precioUnitario: Number(d.precio_unitario ?? d.precioUnitario ?? 0),
      subtotal: Number(d.subtotal ?? 0),
    })),
  }
}

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
]

export const mockComprasRealizadas: Compra[] = [...mockComprasIniciales]

export const purchaseService = {
  /** Crea una compra PENDIENTE a partir del carrito del usuario. */
  async crear(items?: CarritoItem[]): Promise<Compra> {
    const itemsList = items || []

    if (USE_MOCKS) {
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

    // Backend real MySQL:
    // 1. Sincronizar los ítems del carrito local en el backend para poblar la tabla 'carrito_items'
    if (itemsList.length > 0) {
      try {
        await api.delete('/carrito').catch(() => {})
        for (const it of itemsList) {
          const prodId = it.productoId || it.producto?.id
          if (prodId) {
            await api.post('/carrito', {
              producto_id: Number(prodId),
              cantidad: Number(it.cantidad || 1),
            })
          }
        }
      } catch (syncErr: any) {
        console.warn('Aviso sincronizando carrito previo a compra:', syncErr?.response?.data || syncErr?.message)
      }
    }

    // 2. Crear la orden de compra pendiente
    try {
      const { data } = await api.post<any>('/compras', { metodo_pago: 'simulado' })
      const raw = data?.data || data
      return normalizeCompra(raw)
    } catch (err: any) {
      const backendMsg = err?.response?.data?.message || err?.message || 'Error al crear la orden de compra.'
      console.error('Error al crear orden en backend:', backendMsg)
      throw new Error(backendMsg)
    }
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
      accountService.activarServiciosDeCompra(compra)

      return mockDelay<PagoResultado>({
        compra,
        aprobado: true,
        mensaje: 'Pago aprobado exitosamente.',
      }, 700)
    }

    try {
      const metodoLimpio = payload.metodo ? String(payload.metodo).toLowerCase() : 'simulado'
      const metodoValido = ['tarjeta', 'nequi', 'pse', 'simulado'].includes(metodoLimpio) ? metodoLimpio : 'simulado'

      const { data } = await api.post<any>(`/compras/${compraId}/pagar`, {
        metodo_pago: metodoValido,
      })
      const raw = data?.data || data
      const compraNormalizada = normalizeCompra(raw.compra || raw)

      // Sincronizar en el servicio de cuenta del cliente
      accountService.activarServiciosDeCompra(compraNormalizada)

      return {
        compra: compraNormalizada,
        aprobado: true,
        mensaje: data?.message || 'Pago aprobado exitosamente.',
      }
    } catch (err: any) {
      const backendMsg = err?.response?.data?.message || err?.message || 'Error al procesar el pago.'
      console.error('Error en pago en backend:', backendMsg)
      throw new Error(backendMsg)
    }
  },

  async mias(): Promise<Compra[]> {
    if (USE_MOCKS) {
      return mockDelay([...mockComprasRealizadas], 300)
    }
    try {
      const response = await api.get<any>('/compras/mias')
      const raw = response.data
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : [])
      return list.map(normalizeCompra)
    } catch (e) {
      // Nunca mostrar compras de ejemplo como si fueran del cliente
      throw normalizeError(e)
    }
  },

  async get(id: number): Promise<Compra> {
    if (USE_MOCKS) {
      const compra = mockComprasRealizadas.find((c) => c.id === id)
      if (!compra) throw { status: 404, message: 'Compra no encontrada.' }
      return mockDelay(compra, 200)
    }
    const response = await api.get<any>(`/compras/${id}`)
    const raw = response.data?.data || response.data
    return normalizeCompra(raw)
  },
}
