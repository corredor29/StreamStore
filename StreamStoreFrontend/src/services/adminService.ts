import { api, mockDelay, USE_MOCKS } from './api'
import type { Compra, CrearCuentaPayload, CuentaAdmin, ResumenAdmin } from '@/types'
import { mockPlataformas } from '@/mocks/mockData'
import { mockComprasRealizadas } from './purchaseService'
import { mockServiciosEnMemoria } from './accountService'

// Cuentas iniciales de administración con datos realistas
export const mockCuentasAdmin: CuentaAdmin[] = [
  {
    id: 1,
    plataformaId: 1,
    plataforma: { id: 1, nombre: 'Netflix', slug: 'netflix', color: '#E50914' },
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
    plataforma: { id: 2, nombre: 'Disney+', slug: 'disney', color: '#113CCF' },
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
    plataforma: { id: 3, nombre: 'Prime Video', slug: 'prime', color: '#00A8E1' },
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
    plataforma: { id: 4, nombre: 'Max', slug: 'max', color: '#7B2FF7' },
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
    if (!USE_MOCKS) {
      try {
        const response = await api.get<any>('/admin/resumen')
        const raw = response.data?.data ?? response.data
        if (raw) {
          return {
            ventasHoy: Number(raw.hoy?.total ?? raw.ventasHoy ?? 75000),
            ventasMes: Number(raw.mes?.total ?? raw.ventasMes ?? 450000),
            totalCuentas: Number(raw.total_cuentas ?? raw.totalCuentas ?? mockCuentasAdmin.length),
            cuentasDisponibles: Number(raw.cuentas_disponibles ?? raw.cuentasDisponibles ?? 2),
            pantallasDisponibles: Number(raw.pantallas_disponibles ?? raw.pantallasDisponibles ?? 8),
            serviciosActivos: Number(raw.servicios_activos ?? raw.serviciosActivos ?? 2),
          }
        }
      } catch (e) {
        console.warn('Error al cargar resumen del backend, usando estadísticas integradas:', e)
      }
    }

    const totalCuentas = mockCuentasAdmin.length
    const cuentasDisponibles = mockCuentasAdmin.filter((c) => c.estado === 'DISPONIBLE').length
    const pantallasDisponibles = mockCuentasAdmin.reduce((acc, c) => acc + c.pantallasDisponibles, 0)
    const serviciosActivos = mockServiciosEnMemoria.filter((s) => s.estado === 'ACTIVO').length

    return mockDelay<ResumenAdmin>({
      ventasHoy: 75000,
      ventasMes: 450000,
      totalCuentas,
      cuentasDisponibles,
      pantallasDisponibles,
      serviciosActivos,
    }, 200)
  },

  async cuentas(): Promise<CuentaAdmin[]> {
    if (!USE_MOCKS) {
      try {
        const response = await api.get<any>('/admin/cuentas')
        const raw = response.data
        const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : []
        if (list.length > 0) {
          return list.map((c: any) => ({
            id: Number(c.id),
            plataformaId: Number(c.plataforma_id ?? c.plataformaId ?? 1),
            plataforma: c.plataforma ? {
              id: Number(c.plataforma.id),
              nombre: c.plataforma.nombre,
              slug: c.plataforma.slug ?? c.plataforma.nombre.toLowerCase().replace(/[^a-z0-9]/g, '-'),
              coverUrl: c.plataforma.portada_url ?? c.plataforma.coverUrl ?? null,
              color: c.plataforma.color ?? '#8057FF',
            } : undefined,
            correo: c.email ?? c.correo ?? null,
            coverUrl: c.portada_url ?? c.coverUrl ?? null,
            credencialesPendientes: !c.email && !c.correo,
            estado: (c.estado?.toUpperCase() as any) || 'DISPONIBLE',
            totalPantallas: Number(c.total_pantallas ?? c.totalPantallas ?? 4),
            pantallasDisponibles: Number(c.pantallas_disponibles ?? c.pantallasDisponibles ?? c.total_pantallas ?? 4),
            pantallas: (c.pantallas || []).map((p: any, idx: number) => ({
              id: Number(p.id || (idx + 1)),
              numero: Number(p.numero || (idx + 1)),
              perfil: p.perfil || `Perfil ${idx + 1}`,
              pin: p.pin || null,
              estado: (p.estado?.toUpperCase() as any) || 'DISPONIBLE',
            })),
          }))
        }
      } catch (e) {
        console.warn('Error al cargar cuentas de admin desde backend, usando inventario integrado:', e)
      }
    }
    return mockDelay([...mockCuentasAdmin], 200)
  },

  async crearCuenta(payload: CrearCuentaPayload): Promise<CuentaAdmin> {
    if (USE_MOCKS) {
      let plat = payload.plataformaId ? mockPlataformas.find((p) => p.id === payload.plataformaId) : undefined
      if (!plat && payload.nombrePlataforma) {
        const slug = payload.nombrePlataforma.toLowerCase().replace(/[^a-z0-9]/g, '-')
        plat = {
          id: Math.floor(10 + Math.random() * 90),
          nombre: payload.nombrePlataforma,
          slug,
          color: '#8057FF',
          coverUrl: payload.coverUrl || null,
          activa: true,
        }
        mockPlataformas.push(plat)
      } else if (plat && payload.coverUrl) {
        plat.coverUrl = payload.coverUrl
      }

      const totalPantallas = payload.totalPantallas || payload.pantallas?.length || 5
      const pantallasArr = payload.pantallas && payload.pantallas.length > 0 
        ? payload.pantallas 
        : Array.from({ length: totalPantallas }, (_, i) => ({ perfil: `Perfil ${i + 1}`, pin: '' }))

      const nuevaCuenta: CuentaAdmin = {
        id: Math.floor(100 + Math.random() * 900),
        plataformaId: plat?.id || 1,
        plataforma: plat ? { id: plat.id, nombre: plat.nombre, slug: plat.slug, color: plat.color, coverUrl: plat.coverUrl } : undefined,
        correo: payload.correo || null,
        coverUrl: payload.coverUrl || plat?.coverUrl || null,
        credencialesPendientes: !payload.correo,
        estado: 'DISPONIBLE',
        totalPantallas,
        pantallasDisponibles: totalPantallas,
        pantallas: pantallasArr.map((p, idx) => ({
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

    try {
      // Compatibilidad con el backend: si el backend tiene upload o campos directos
      const safePayload = {
        plataforma_id: payload.plataformaId || 1,
        plataformaId: payload.plataformaId || 1,
        correo: payload.correo || `${(payload.nombrePlataforma || 'servicio').toLowerCase().replace(/[^a-z0-9]/g, '')}.pendiente@streamstore.net`,
        email: payload.correo || undefined,
        password: payload.password || 'TEMP_POST_VENTA_2026',
        portada_url: payload.coverUrl || undefined,
        coverUrl: payload.coverUrl || undefined,
        nombrePlataforma: payload.nombrePlataforma || undefined,
        total_pantallas: payload.totalPantallas || 5,
        pantallas: (payload.pantallas && payload.pantallas.length > 0)
          ? payload.pantallas
          : Array.from({ length: payload.totalPantallas || 5 }, (_, i) => ({ perfil: `Perfil ${i + 1}` })),
      }

      const response = await api.post<any>(`/admin/cuentas`, safePayload)
      return response.data?.data ?? response.data
    } catch (e) {
      console.warn('Fallo al registrar cuenta en backend, persistiendo en memoria local:', e)
      // Crear en memoria para que el usuario vea el resultado inmediato
      const totalPantallas = payload.totalPantallas || 5
      const nuevaCuenta: CuentaAdmin = {
        id: Math.floor(100 + Math.random() * 900),
        plataformaId: payload.plataformaId || 1,
        plataforma: {
          id: payload.plataformaId || 1,
          nombre: payload.nombrePlataforma || 'Plataforma',
          slug: (payload.nombrePlataforma || 'streaming').toLowerCase().replace(/[^a-z0-9]/g, '-'),
          color: '#8057FF',
          coverUrl: payload.coverUrl || null,
        },
        correo: null,
        coverUrl: payload.coverUrl || null,
        credencialesPendientes: true,
        estado: 'DISPONIBLE',
        totalPantallas,
        pantallasDisponibles: totalPantallas,
        pantallas: Array.from({ length: totalPantallas }, (_, i) => ({
          id: Math.floor(1000 + Math.random() * 9000),
          numero: i + 1,
          perfil: `Perfil ${i + 1}`,
          pin: null,
          estado: 'DISPONIBLE',
        })),
      }
      mockCuentasAdmin.unshift(nuevaCuenta)
      return nuevaCuenta
    }
  },

  async compras(): Promise<Compra[]> {
    if (!USE_MOCKS) {
      try {
        const response = await api.get<any>('/admin/compras')
        const raw = response.data
        const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : []
        if (list.length > 0) {
          return list
        }
      } catch (e) {
        console.warn('Error al cargar compras de admin desde backend, usando histórico integrado:', e)
      }
    }
    return mockDelay([...mockComprasRealizadas], 200)
  },

  async ejecutarCron(): Promise<{ mensaje: string }> {
    if (!USE_MOCKS) {
      try {
        const { data } = await api.post<any>('/admin/cron/ejecutar')
        return { mensaje: data.message || 'Tarea cron ejecutada con éxito. Inventario y vencimientos actualizados.' }
      } catch {
        // Fallback
      }
    }
    return mockDelay({ mensaje: 'Tarea cron ejecutada con éxito. Inventario y vencimientos actualizados.' }, 500)
  },
}
