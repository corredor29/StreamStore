import { api, mockDelay, USE_MOCKS } from './api'
import { mockPlataformas, mockProductos } from '@/mocks/mockData'
import type { Plataforma, Producto, ProductoFiltros } from '@/types'

export const productService = {
  async getPlataformas(): Promise<Plataforma[]> {
    if (USE_MOCKS) return mockDelay(mockPlataformas)
    const { data } = await api.get<Plataforma[]>('/plataformas')
    return data
  },

  async getProductos(filtros: ProductoFiltros = {}): Promise<Producto[]> {
    if (USE_MOCKS) {
      const result = mockProductos.filter((p) => {
        const okPlat =
          filtros.plataforma === undefined ||
          p.plataforma?.slug === filtros.plataforma ||
          p.plataformaId === Number(filtros.plataforma)
        const okTipo = !filtros.tipo || p.tipo === filtros.tipo
        return okPlat && okTipo
      })
      return mockDelay(result)
    }
    const { data } = await api.get<Producto[]>('/productos', { params: filtros })
    return data
  },

  async getProducto(id: number): Promise<Producto> {
    if (USE_MOCKS) {
      const p = mockProductos.find((x) => x.id === id)
      if (!p) throw { status: 404, message: 'Producto no encontrado.' }
      return mockDelay(p)
    }
    const { data } = await api.get<Producto>(`/productos/${id}`)
    return data
  },
}
