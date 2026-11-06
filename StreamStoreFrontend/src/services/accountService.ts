import { api, mockDelay, USE_MOCKS } from './api'
import type { Servicio, TipoProducto, Compra } from '@/types'

function normalizeServicio(s: any): Servicio {
  const estadoRaw = (s.estado || '').toUpperCase()
  let estado: 'ACTIVO' | 'POR_VENCER' | 'VENCIDO' = 'ACTIVO'
  if (estadoRaw.includes('VENCID')) estado = 'VENCIDO'
  else if (estadoRaw.includes('VENCER')) estado = 'POR_VENCER'
  else estado = 'ACTIVO'

  const platNombre = typeof s.plataforma === 'string'
    ? s.plataforma
    : (s.plataforma?.nombre || s.producto?.nombre?.split(' ')[0] || 'Streaming')
  
  const slug = (s.plataforma?.slug || platNombre).toLowerCase().replace(/[^a-z0-9]/g, '-')
  const platColor = s.plataforma?.color || (
    slug.includes('net') ? '#E50914' :
    slug.includes('dis') ? '#113CCF' :
    slug.includes('max') ? '#7B2FF7' :
    slug.includes('prime') ? '#00A8E1' :
    slug.includes('spot') ? '#1DB954' :
    slug.includes('crunch') ? '#F47521' : '#8057FF'
  )
  const platLogo = (
    slug.includes('net') ? '/netflix.webp' :
    slug.includes('dis') ? '/disne.png' :
    slug.includes('max') ? '/hbomax.png' :
    slug.includes('prime') ? '/primevideo.png' :
    slug.includes('spot') ? '/spotify.png' :
    slug.includes('crunch') ? '/crunchiroll.png' : null
  )

  const creds = s.credenciales
  const pantalla0 = creds?.pantallas?.[0]

  return {
    id: Number(s.id),
    compraId: Number(s.compra_id ?? s.compraId ?? 1),
    tipo: (s.tipo || '').toUpperCase().includes('COMPLETA') ? 'CUENTA_COMPLETA' : 'PANTALLA',
    plataforma: {
      id: typeof s.plataforma === 'object' ? s.plataforma.id : 1,
      nombre: platNombre,
      slug,
      color: platColor,
      logoUrl: platLogo,
    },
    correoAcceso: creds?.email || s.correoAcceso || s.cuenta?.email || 'Pendiente de entrega',
    passwordAcceso: creds?.password || s.passwordAcceso || '••••••••',
    perfil: pantalla0?.perfil || s.perfil || (s.tipo === 'pantalla' ? `Pantalla ${pantalla0?.numero || 1}` : 'Cuenta Completa (Todas las pantallas)'),
    pin: pantalla0?.pin || s.pin || null,
    fechaCompra: s.fecha_inicio || s.fechaCompra || new Date().toISOString(),
    fechaVencimiento: s.fecha_vencimiento || s.fechaVencimiento || new Date().toISOString(),
    diasRestantes: Number(s.dias_restantes ?? s.diasRestantes ?? 0),
    estado,
  }
}

// Mocks iniciales realistas con los 3 estados del negocio
export const mockServiciosIniciales: Servicio[] = [
  {
    id: 101,
    compraId: 5001,
    plataforma: { id: 1, nombre: 'Netflix', slug: 'netflix', color: '#E50914', logoUrl: '/netflix.webp' },
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
    plataforma: { id: 2, nombre: 'Disney+', slug: 'disney', color: '#113CCF', logoUrl: '/disne.png' },
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
    plataforma: { id: 4, nombre: 'Max', slug: 'max', color: '#7B2FF7', logoUrl: '/hbomax.png' },
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

export const mockServiciosEnMemoria: Servicio[] = [...mockServiciosIniciales]

export const accountService = {
  async misServicios(): Promise<Servicio[]> {
    if (USE_MOCKS) {
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

    try {
      const response = await api.get<any>('/servicios/mios')
      const raw = response.data
      const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : [])
      return list.map(normalizeServicio)
    } catch (e) {
      console.warn('Fallo al obtener servicios del backend, usando datos en memoria:', e)
      return mockServiciosEnMemoria
    }
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
