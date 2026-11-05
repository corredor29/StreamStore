import { api, mockDelay, USE_MOCKS } from './api'
import type { Compra, CrearCuentaPayload, CuentaAdmin, ResumenAdmin } from '@/types'
import { mockPlataformas } from '@/mocks/mockData'
import { mockComprasRealizadas } from './purchaseService'
import { mockServiciosEnMemoria } from './accountService'

// Cuentas iniciales de administración con datos de prueba realistas
export const mockCuentasAdmin: CuentaAdmin[] = [
  {
    id: 1,
    plataformaId: 1,
    plataforma: { id: 1, nombre: 'Netflix', slug: 'netflix' },
    correo: 'netflix.premium.01@streamstore.net',
    estado: 'DISPONIBLE',
    totalPantallas: 5,
    pantallasDisponibles: 5,
    pantallas: [
      { id: 101, numero: 1, perfil: 'Perfil 1 (Principal)', pin: null, estado: 'DISPONIBLE' },
      { id: 102, numero: 2, perfil: 'Perfil 2', pin: '1122', estado: 'DISPONIBLE' },
      { id: 103, numero: 3, perfil: 'Perfil 3', pin: '3344', estado: 'DISPONIBLE' },
      { id: 104, numero: 4, perfil: 'Perfil 4', pin: '5566', estado: 'DISPONIBLE' },
      { id: 105, numero: 5, perfil: 'Perfil 5 (Kids)', pin: null, estado: 'DISPONIBLE' },
    ],
  },
  {
    id: 2,
    plataformaId: 2,
    plataforma: { id: 2, nombre: 'Disney+', slug: 'disney' },
    correo: 'disney.plus.corp@streamstore.net',
    estado: 'PARCIAL',
    totalPantallas: 4,
    pantallasDisponibles: 2,
    pantallas: [
      { id: 201, numero: 1, perfil: 'Perfil Disney 1', pin: '1010', estado: 'VENDIDA' },
      { id: 202, numero: 2, perfil: 'Perfil Disney 2', pin: '2020', estado: 'VENDIDA' },
      { id: 203, numero: 3, perfil: 'Perfil Disney 3', pin: '3030', estado: 'DISPONIBLE' },
      { id: 204, numero: 4, perfil: 'Perfil Disney 4 (Kids)', pin: null, estado: 'DISPONIBLE' },
    ],
  },
  {
    id: 3,
    plataformaId: 3,
    plataforma: { id: 3, nombre: 'Prime Video', slug: 'prime' },
    correo: 'prime.amazon.01@streamstore.net',
    estado: 'VENDIDA',
    totalPantallas: 3,
    pantallasDisponibles: 0,
    pantallas: [
      { id: 301, numero: 1, perfil: 'Amazon 1', pin: '9876', estado: 'VENDIDA' },
      { id: 302, numero: 2, perfil: 'Amazon 2', pin: '5432', estado: 'VENDIDA' },
      { id: 303, numero: 3, perfil: 'Amazon 3', pin: '1234', estado: 'VENDIDA' },
    ],
  },
  {
    id: 4,
    plataformaId: 4,
    plataforma: { id: 4, nombre: 'Max', slug: 'max' },
    correo: 'max.ultra.hbo@streamstore.net',
    estado: 'DISPONIBLE',
    totalPantallas: 3,
    pantallasDisponibles: 3,
    pantallas: [
      { id: 401, numero: 1, perfil: 'Max 1', pin: '4455', estado: 'DISPONIBLE' },
      { id: 402, numero: 2, perfil: 'Max 2', pin: '6677', estado: 'DISPONIBLE' },
      { id: 403, numero: 3, perfil: 'Max 3', pin: '8899', estado: 'DISPONIBLE' },
    ],
  },
]

export const adminService = {
  async resumen(): Promise<ResumenAdmin> {
    if (USE_MOCKS) {
      const totalCuentas = mockCuentasAdmin.length
      const cuentasDisponibles = mockCuentasAdmin.filter((c) => c.estado === 'DISPONIBLE').length
      const pantallasDisponibles = mockCuentasAdmin.reduce((acc, c) => acc + c.pantallasDisponibles, 0)
      const serviciosActivos = mockServiciosEnMemoria.filter((s) => s.estado === 'ACTIVO').length

      // Ventas
      const ventasMes = mockComprasRealizadas
        .filter((c) => c.estado === 'PAGADA')
        .reduce((acc, c) => acc + c.total, 0)
      
      const hoyStr = new Date().toISOString().slice(0, 10)
      const ventasHoy = mockComprasRealizadas
        .filter((c) => c.estado === 'PAGADA' && (c.fechaPago || c.fecha).startsWith(hoyStr))
        .reduce((acc, c) => acc + c.total, 0)

      return mockDelay<ResumenAdmin>({
        ventasHoy: ventasHoy > 0 ? ventasHoy : 75000,
        ventasMes: ventasMes > 0 ? ventasMes : 450000,
        totalCuentas,
        cuentasDisponibles,
        pantallasDisponibles,
        serviciosActivos,
      }, 300)
    }

    const { data } = await api.get<ResumenAdmin>('/admin/resumen')
    return data
  },

  async cuentas(): Promise<CuentaAdmin[]> {
    if (USE_MOCKS) {
      return mockDelay([...mockCuentasAdmin], 300)
    }
    const { data } = await api.get<CuentaAdmin[]>('/admin/cuentas')
    return data
  },

  async crearCuenta(payload: CrearCuentaPayload): Promise<CuentaAdmin> {
    if (USE_MOCKS) {
      const plat = mockPlataformas.find((p) => p.id === payload.plataformaId)
      const totalPantallas = payload.pantallas.length
      const nuevaCuenta: CuentaAdmin = {
        id: Math.floor(100 + Math.random() * 900),
        plataformaId: payload.plataformaId,
        plataforma: plat ? { id: plat.id, nombre: plat.nombre, slug: plat.slug } : undefined,
        correo: payload.correo,
        estado: 'DISPONIBLE',
        totalPantallas,
        pantallasDisponibles: totalPantallas,
        pantallas: payload.pantallas.map((p, idx) => ({
          id: Math.floor(1000 + Math.random() * 9000),
          numero: idx + 1,
          perfil: p.perfil || `Perfil ${idx + 1}`,
          pin: p.pin || null,
          estado: 'DISPONIBLE',
        })),
      }
      mockCuentasAdmin.unshift(nuevaCuenta)
      return mockDelay(nuevaCuenta, 400)
    }

    const { data } = await api.post<CuentaAdmin>(`/admin/cuentas`, payload)
    return data
  },

  async compras(): Promise<Compra[]> {
    if (USE_MOCKS) {
      return mockDelay([...mockComprasRealizadas], 300)
    }
    const { data } = await api.get<Compra[]>('/admin/compras')
    return data
  },

  async ejecutarCron(): Promise<{ mensaje: string }> {
    if (USE_MOCKS) {
      return mockDelay({ mensaje: 'Tarea cron ejecutada con éxito. Inventario y vencimientos actualizados.' }, 600)
    }
    const { data } = await api.post<{ mensaje: string }>('/admin/cron/ejecutar')
    return data
  },
}
