import { api } from './api'
import type { AgregarCarritoPayload, Carrito } from '@/types'

export const cartService = {
  async get(): Promise<Carrito> {
    const { data } = await api.get<Carrito>('/carrito')
    return data
  },

  async add(payload: AgregarCarritoPayload): Promise<Carrito> {
    const { data } = await api.post<Carrito>('/carrito', payload)
    return data
  },

  async update(itemId: number, cantidad: number): Promise<Carrito> {
    const { data } = await api.patch<Carrito>(`/carrito/${itemId}`, { cantidad })
    return data
  },

  async remove(itemId: number): Promise<Carrito> {
    const { data } = await api.delete<Carrito>(`/carrito/${itemId}`)
    return data
  },

  async clear(): Promise<void> {
    await api.delete('/carrito')
  },
}
