import { api, mockDelay, USE_MOCKS } from './api'
import type { Servicio, TipoProducto, Compra } from '@/types'

// Mocks iniciales realistas con los 3 estados del negocio
export const mockServiciosIniciales: Servicio[] = [
  {
    id: 101,
    compraId: 5001,
    plataforma: { id: 1, nombre: 'Netflix', slug: 'netflix', color: '#E50914' },
    tipo: 'CUENTA_COMPLETA',
    correoAcceso: 'familia.netflix.demo@streamstore.net',
    passwordAcceso: 'StreamNet#2026',
    perfil: 'Todos los perfiles disponibles (5 pantallas)',
    pin: null,
    fechaCompra: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    fechaVencimiento: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000).toISOString(),
    diasRestantes: 26,
    estado: 'ACTIVO',
  },
  {
    id: 102,
    compraId: 5002,
    plataforma: { id: 2, nombre: 'Disney+', slug: 'disney', color: '#113CCF' },
    tipo: 'PANTALLA',
    correoAcceso: 'disney.vip.demo@streamstore.net',
    passwordAcceso: 'Mickey#Play99',
    perfil: 'Perfil 3 (Infantil / Series)',
    pin: '4821',
    fechaCompra: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    fechaVencimiento: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    diasRestantes: 2,
    estado: 'POR_VENCER',
  },
  {
    id: 103,
    compraId: 5003,
    plataforma: { id: 4, nombre: 'Max', slug: 'max', color: '#7B2FF7' },
    tipo: 'CUENTA_COMPLETA',
    correoAcceso: 'max.plus.demo@streamstore.net',
    passwordAcceso: 'MaxHboSecure!88',
    perfil: 'Cuenta completa (3 pantallas)',
    pin: null,
    fechaCompra: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    fechaVencimiento: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    diasRestantes: -5,
    estado: 'VENCIDO',
  },
]

// Array en memoria que combina los iniciales más los generados al pagar
export const mockServiciosEnMemoria: Servicio[] = [...mockServiciosIniciales]

export const accountService = {
  async misServicios(): Promise<Servicio[]> {
    if (USE_MOCKS) {
      // Recalcular estado y días restantes en tiempo real
      const ahora = Date.now()
      const calculados = mockServiciosEnMemoria.map((s) => {
        const diffMs = new Date(s.fechaVencimiento).getTime() - ahora
        const dias = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
        let estado: 'ACTIVO' | 'POR_VENCER' | 'VENCIDO' = 'ACTIVO'
        if (dias <= 0) {
          estado = 'VENCIDO'
        } else if (dias <= 3) {
          estado = 'POR_VENCER'
        }
        return {
          ...s,
          diasRestantes: dias,
          estado,
        }
      })
      return mockDelay(calculados, 300)
    }

    const { data } = await api.get<Servicio[]>('/servicios/mios')
    return data
  },

  /** Registra servicios activados tras una compra pagada */
  activarServiciosDeCompra(compra: Compra): void {
    compra.detalles.forEach((det) => {
      for (let i = 0; i < det.cantidad; i++) {
        const plat = det.producto?.plataforma || {
          id: det.productoId,
          nombre: det.producto?.nombre || 'Plataforma',
          slug: 'plataforma',
          color: '#7c4dff',
        }
        const tipo: TipoProducto = det.producto?.tipo || 'PANTALLA'
        const duracion = det.producto?.duracionDias || 30
        const fechaCompra = new Date().toISOString()
        const fechaVencimiento = new Date(Date.now() + duracion * 24 * 60 * 60 * 1000).toISOString()

        const nuevoServicio: Servicio = {
          id: Math.floor(10000 + Math.random() * 90000),
          compraId: compra.id,
          plataforma: plat,
          tipo,
          correoAcceso: `cuenta.${plat.slug || 'stream'}.${compra.id}.${i + 1}@streamstore.net`,
          passwordAcceso: `Pass${Math.random().toString(36).slice(-6)}!`,
          perfil: tipo === 'PANTALLA' ? `Perfil ${i + 1}` : 'Cuenta completa (todas las pantallas)',
          pin: tipo === 'PANTALLA' ? `${Math.floor(1000 + Math.random() * 9000)}` : null,
          fechaCompra,
          fechaVencimiento,
          diasRestantes: duracion,
          estado: 'ACTIVO',
        }
        mockServiciosEnMemoria.unshift(nuevoServicio)
      }
    })
  },
}
