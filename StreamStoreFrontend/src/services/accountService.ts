import { api } from './api'
import type { Servicio } from '@/types'

export const accountService = {
  async misServicios(): Promise<Servicio[]> {
    const { data } = await api.get<Servicio[]>('/servicios/mios')
    return data
  },
}
