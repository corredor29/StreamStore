import { api } from './api'
import type { Compra, CrearCuentaPayload, CuentaAdmin, ResumenAdmin } from '@/types'

export const adminService = {
  async resumen(): Promise<ResumenAdmin> {
    const { data } = await api.get<ResumenAdmin>('/admin/resumen')
    return data
  },

  async cuentas(): Promise<CuentaAdmin[]> {
    const { data } = await api.get<CuentaAdmin[]>('/admin/cuentas')
    return data
  },

  async crearCuenta(payload: CrearCuentaPayload): Promise<CuentaAdmin> {
    const { data } = await api.post<CuentaAdmin>('/admin/cuentas', payload)
    return data
  },

  async compras(): Promise<Compra[]> {
    const { data } = await api.get<Compra[]>('/admin/compras')
    return data
  },

  async ejecutarCron(): Promise<void> {
    await api.post('/admin/cron/ejecutar')
  },
}
