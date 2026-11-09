import { api, mockDelay, normalizeError, USE_MOCKS } from './api'
import { mockPlataformas, mockProductos } from '@/mocks/mockData'
import type { Plataforma, Producto, ProductoFiltros } from '@/types'

export function normalizePlataforma(p: any): Plataforma {
  const rawSlug = p.slug || p.nombre || 'streaming'
  const slug = rawSlug.toLowerCase().replace(/[^a-z0-9]/g, '-')
  const colors: Record<string, string> = {
    netflix: '#E50914',
    nf: '#E50914',
    disney: '#113CCF',
    dp: '#113CCF',
    prime: '#00A8E1',
    pv: '#00A8E1',
    max: '#7B2FF7',
    mx: '#7B2FF7',
    spotify: '#1DB954',
    crunchyroll: '#F47521',
    paramount: '#0064FF',
    paramont: '#0064FF',
    apple: '#FFFFFF',
    appletv: '#FFFFFF',
  }
  const logos: Record<string, string> = {
    max: '/hbomax.png',
    mx: '/hbomax.png',
    hbo: '/hbomax.png',
    prime: '/primevideo.jpg',
    pv: '/primevideo.jpg',
    netflix: '/netflix.webp',
    nf: '/netflix.webp',
    disney: '/disne.png',
    dp: '/disne.png',
    spotify: '/spotify.png',
    crunchyroll: '/crunchiroll.png',
    paramount: '/paramont.png',
    paramont: '/paramont.png',
    apple: '/appletv.webp',
    appletv: '/appletv.webp',
  }
  return {
    id: Number(p.id),
    nombre: p.nombre,
    slug,
    logoUrl: p.logo_url ?? p.logoUrl ?? logos[slug] ?? null,
    coverUrl: p.portada_url ?? p.portadaUrl ?? p.coverUrl ?? null,
    color: p.color ?? colors[slug] ?? '#8057FF',
    activa: p.activo ?? p.activa ?? true,
  }
}

function normalizeProducto(p: any): Producto {
  const tipoUpper = (p.tipo || '').toUpperCase().includes('COMPLETA') ? 'CUENTA_COMPLETA' : 'PANTALLA'
  const plat = p.plataforma ? normalizePlataforma(p.plataforma) : undefined
  return {
    id: Number(p.id),
    plataformaId: Number(p.plataforma_id ?? p.plataformaId ?? plat?.id ?? 1),
    plataforma: plat,
    nombre: p.nombre,
    tipo: tipoUpper,
    duracionDias: Number(p.duracion_dias ?? p.duracionDias ?? 30),
    precio: Number(p.precio ?? 0),
    stock: Number(p.stock ?? p.stock_actual ?? 5),
    activo: p.activo ?? true,
  }
}

export const productService = {
  async getPlataformas(): Promise<Plataforma[]> {
    if (!USE_MOCKS) {
      try {
        const response = await api.get<any>('/plataformas')
        const raw = response.data
        const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : []
        return list.map(normalizePlataforma)
      } catch (e) {
        const norm = normalizeError(e)
        // Fallback offline resiliente si el servidor o la DB no responden
        if (norm.status === 0 || norm.status >= 500) {
          console.warn('Backend no disponible para plataformas. Cargando catálogo offline.')
          return mockDelay(mockPlataformas.map(normalizePlataforma), 200)
        }
        throw norm
      }
    }
    return mockDelay(mockPlataformas.map(normalizePlataforma))
  },

  async getProductos(filtros: ProductoFiltros = {}): Promise<Producto[]> {
    if (!USE_MOCKS) {
      try {
        const response = await api.get<any>('/productos', { params: filtros })
        const raw = response.data
        const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : []
        return list.map(normalizeProducto)
      } catch (e) {
        const norm = normalizeError(e)
        // Fallback offline resiliente si el servidor o la DB no responden
        if (norm.status === 0 || norm.status >= 500) {
          console.warn('Backend no disponible para productos. Cargando productos offline.')
          return this.getProductosMock(filtros)
        }
        throw norm
      }
    }

    return this.getProductosMock(filtros)
  },

  getProductosMock(filtros: ProductoFiltros = {}): Promise<Producto[]> {
    const result = mockProductos.filter((p) => {
      const okPlat =
        filtros.plataforma === undefined ||
        p.plataforma?.slug === filtros.plataforma ||
        p.plataformaId === Number(filtros.plataforma)
      const okTipo = !filtros.tipo || p.tipo === filtros.tipo
      return okPlat && okTipo
    })
    return mockDelay(result.map(normalizeProducto), 200)
  },

  async getProducto(id: number): Promise<Producto> {
    if (!USE_MOCKS) {
      try {
        const response = await api.get<any>(`/productos/${id}`)
        const raw = response.data
        const item = raw?.data ?? raw
        if (item && item.id) return normalizeProducto(item)
        throw { status: 404, message: 'Producto no encontrado.' }
      } catch (e) {
        const norm = normalizeError(e)
        if (norm.status === 0 || norm.status >= 500) {
          const p = mockProductos.find((x) => x.id === id)
          if (p) return mockDelay(normalizeProducto(p), 150)
        }
        throw norm
      }
    }
    const p = mockProductos.find((x) => x.id === id)
    if (!p) throw { status: 404, message: 'Producto no encontrado.' }
    return mockDelay(normalizeProducto(p))
  },
}
