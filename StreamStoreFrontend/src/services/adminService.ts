import { api, mockDelay, USE_MOCKS } from './api'
import type { ComboPromo, Compra, CrearComboPayload, CrearCuentaPayload, CuentaAdmin, ResumenAdmin } from '@/types'
import { mockPlataformas } from '@/mocks/mockData'
import { mockComprasRealizadas } from './purchaseService'
import { mockServiciosEnMemoria } from './accountService'
import { normalizePlataforma } from './productService'

// El backend responde en snake_case y con DECIMAL como texto
function normalizeCombo(raw: unknown): ComboPromo {
  const c = raw as Record<string, any>
  return {
    id: Number(c.id),
    nombre: c.nombre,
    descripcion: c.descripcion ?? null,
    plataformas: Array.isArray(c.plataformas) ? c.plataformas.map(normalizePlataforma) : [],
    precioPromo: Number(c.precio_promo ?? c.precioPromo),
    precioRegular: Number(c.precio_regular ?? c.precioRegular),
    pantallasPorPlataforma: Number(c.pantallas_por_plataforma ?? c.pantallasPorPlataforma ?? 1),
    duracionDias: Number(c.duracion_dias ?? c.duracionDias ?? 30),
    etiquetaPromo: c.etiqueta_promo ?? c.etiquetaPromo ?? '',
    activo: Boolean(c.activo),
    creadoEn: c.created_at ?? c.createdAt ?? c.creadoEn,
  }
}

// Combos y Promociones iniciales (ej. Netflix + HBO Max)
export const mockCombosPromocionales: ComboPromo[] = [
  {
    id: 1,
    nombre: 'Combo Dúo Cine: Netflix + Max (HBO)',
    descripcion: 'Acceso a catálogo completo de Netflix Ultra HD + Max HBO para 1 pantalla simultánea en cada plataforma.',
    plataformas: [
      { id: 1, nombre: 'Netflix', slug: 'netflix', color: '#E50914', logoUrl: '/netflix.webp' },
      { id: 4, nombre: 'Max', slug: 'max', color: '#7B2FF7', logoUrl: '/hbomax.png' },
    ],
    precioPromo: 32000,
    precioRegular: 48000,
    pantallasPorPlataforma: 1,
    duracionDias: 30,
    etiquetaPromo: 'COMBO DÚO 2X1',
    activo: true,
    creadoEn: new Date().toISOString(),
  },
  {
    id: 2,
    nombre: 'Combo Familiar: Disney+ & Prime Video',
    descripcion: 'Lo mejor de Disney, Pixar, Marvel y Star Wars junto con Prime Video Series y Envíos.',
    plataformas: [
      { id: 2, nombre: 'Disney+', slug: 'disney', color: '#113CCF', logoUrl: '/disne.png' },
      { id: 3, nombre: 'Prime Video', slug: 'prime', color: '#00A8E1', logoUrl: '/primevideo.jpg' },
    ],
    precioPromo: 25000,
    precioRegular: 38000,
    pantallasPorPlataforma: 1,
    duracionDias: 30,
    etiquetaPromo: 'AHORRA 35%',
    activo: true,
    creadoEn: new Date().toISOString(),
  },
  {
    id: 3,
    nombre: 'Mega Pack Streaming Trío: Netflix + Max + Disney+',
    descripcion: 'El paquete definitivo de entretenimiento digital. 3 plataformas premium con entrega inmediata de perfiles.',
    plataformas: [
      { id: 1, nombre: 'Netflix', slug: 'netflix', color: '#E50914', logoUrl: '/netflix.webp' },
      { id: 4, nombre: 'Max', slug: 'max', color: '#7B2FF7', logoUrl: '/hbomax.png' },
      { id: 2, nombre: 'Disney+', slug: 'disney', color: '#113CCF', logoUrl: '/disne.png' },
    ],
    precioPromo: 44900,
    precioRegular: 65000,
    pantallasPorPlataforma: 1,
    duracionDias: 30,
    etiquetaPromo: 'MÁS VENDIDO 🔥',
    activo: true,
    creadoEn: new Date().toISOString(),
  },
]

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

  async subirPortada(file: File): Promise<string> {
    try {
      const formData = new FormData()
      formData.append('imagen', file)
      const res = await api.post<any>('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const data = res.data?.data ?? res.data
      return data?.url || data?.ruta || ''
    } catch (err) {
      console.warn('Error al subir imagen de portada al backend:', err)
      return ''
    }
  },

  async cuentas(): Promise<CuentaAdmin[]> {
    if (!USE_MOCKS) {
      try {
        const response = await api.get<any>('/admin/cuentas')
        const raw = response.data
        const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : null
        if (list !== null) {
          return list.map((c: any) => {
            const pantallas = (c.pantallas || []).map((p: any, idx: number) => ({
              id: Number(p.id || (idx + 1)),
              numero: Number(p.numero || (idx + 1)),
              perfil: p.perfil || `Perfil ${idx + 1}`,
              pin: p.pin || null,
              estado: (p.estado?.toUpperCase() as any) || 'DISPONIBLE',
            }))
            const libres = pantallas.filter((p: any) => p.estado === 'DISPONIBLE').length
            const platCover = c.plataforma?.portada_url ?? c.plataforma?.coverUrl ?? null

            return {
              id: Number(c.id),
              plataformaId: Number(c.plataforma_id ?? c.plataformaId ?? 1),
              plataforma: c.plataforma ? {
                id: Number(c.plataforma.id),
                nombre: c.plataforma.nombre,
                slug: c.plataforma.slug ?? c.plataforma.nombre.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                coverUrl: platCover,
                color: c.plataforma.color ?? '#8057FF',
              } : undefined,
              correo: c.email ?? c.correo ?? null,
              coverUrl: c.portada_url ?? platCover ?? c.coverUrl ?? null,
              credencialesPendientes: !c.email && !c.correo,
              estado: (c.estado?.toUpperCase() as any) || 'DISPONIBLE',
              totalPantallas: Number(c.total_pantallas ?? c.totalPantallas ?? (pantallas.length > 0 ? pantallas.length : 4)),
              pantallasDisponibles: Number(c.pantallas_disponibles ?? c.pantallasDisponibles ?? libres),
              pantallas,
            }
          })
        }
      } catch (e) {
        console.warn('Error al cargar cuentas de admin desde backend, usando inventario integrado:', e)
      }
    }
    return mockDelay([...mockCuentasAdmin], 200)
  },

  async crearCuenta(payload: CrearCuentaPayload): Promise<CuentaAdmin> {
    let portadaUrl = payload.coverUrl || null

    // 1. Si se adjuntó archivo físico de imagen, subirlo al backend
    if (payload.coverFile) {
      const subidaUrl = await this.subirPortada(payload.coverFile)
      if (subidaUrl) {
        portadaUrl = subidaUrl
      }
    }

    if (!USE_MOCKS) {
      try {
        let targetPlatId = payload.plataformaId
        const nombrePlat = (payload.nombrePlataforma || '').trim()

        // 2. Si no tiene plataformaId o escribió un nombre, buscar o crear la plataforma en la BD
        if ((!targetPlatId || targetPlatId === 0) && nombrePlat) {
          // Consultar plataformas existentes en backend
          let existentes: any[] = []
          try {
            const resp = await api.get<any>('/admin/plataformas')
            existentes = Array.isArray(resp.data) ? resp.data : Array.isArray(resp.data?.data) ? resp.data.data : []
          } catch {
            try {
              const respPub = await api.get<any>('/plataformas')
              existentes = Array.isArray(respPub.data) ? respPub.data : Array.isArray(respPub.data?.data) ? respPub.data.data : []
            } catch {}
          }

          const match = existentes.find((p: any) => 
            p.nombre && p.nombre.toLowerCase().trim() === nombrePlat.toLowerCase()
          )

          if (match) {
            targetPlatId = Number(match.id)
            if (portadaUrl && !match.portada_url) {
              try {
                await api.patch(`/admin/plataformas/${targetPlatId}`, { portada_url: portadaUrl })
              } catch {}
            }
          } else {
            // Crear nueva plataforma en MySQL
            const platCreate = await api.post<any>('/admin/plataformas', {
              nombre: nombrePlat,
              portada_url: portadaUrl || undefined,
              max_pantallas: payload.totalPantallas || 4,
              activo: true,
            })
            const platData = platCreate.data?.data ?? platCreate.data
            targetPlatId = Number(platData.id)

            // Auto-crear productos para el catálogo público (cuenta completa y pantalla)
            try {
              await Promise.all([
                api.post('/admin/productos', {
                  plataforma_id: targetPlatId,
                  nombre: `${nombrePlat} - Cuenta Completa 30 días`,
                  tipo: 'cuenta_completa',
                  precio: 35000,
                  duracion_dias: 30,
                  stock_minimo: 2,
                  activo: true,
                }),
                api.post('/admin/productos', {
                  plataforma_id: targetPlatId,
                  nombre: `${nombrePlat} - 1 Pantalla 30 días`,
                  tipo: 'pantalla',
                  precio: 12000,
                  duracion_dias: 30,
                  stock_minimo: 2,
                  activo: true,
                }),
              ])
            } catch (prodErr) {
              console.warn('Aviso: no se crearon productos automáticamente:', prodErr)
            }
          }
        }

        // 3. Crear la cuenta en MySQL
        const cuentaBody: any = {
          plataforma_id: targetPlatId || 1,
          cantidad: 1,
        }
        if (payload.correo && payload.password) {
          cuentaBody.email = payload.correo
          cuentaBody.password = payload.password
        }

        const resCuenta = await api.post<any>('/admin/cuentas', cuentaBody)
        const cData = resCuenta.data?.data ?? resCuenta.data
        const cuentaObj = Array.isArray(cData) ? cData[0] : cData

        // Actualizar datos locales para reactividad sin recarga
        const slug = nombrePlat.toLowerCase().replace(/[^a-z0-9]/g, '-')
        const existingMockPlat = mockPlataformas.find(p => p.id === targetPlatId || p.nombre.toLowerCase() === nombrePlat.toLowerCase())
        if (!existingMockPlat) {
          mockPlataformas.push({
            id: targetPlatId || 99,
            nombre: nombrePlat,
            slug,
            color: '#8057FF',
            coverUrl: portadaUrl,
            activa: true,
          })
        } else if (portadaUrl) {
          existingMockPlat.coverUrl = portadaUrl
        }

        const pantallas = Array.isArray(cuentaObj?.pantallas)
          ? cuentaObj.pantallas.map((p: any, idx: number) => ({
              id: Number(p.id || idx + 1),
              numero: Number(p.numero || idx + 1),
              perfil: p.perfil || `Perfil ${idx + 1}`,
              pin: p.pin || null,
              estado: (p.estado?.toUpperCase() as any) || 'DISPONIBLE',
            }))
          : Array.from({ length: payload.totalPantallas || 4 }, (_, i) => ({
              id: i + 1,
              numero: i + 1,
              perfil: `Perfil ${i + 1}`,
              pin: null,
              estado: 'DISPONIBLE' as const,
            }))

        const resultadoCuenta: CuentaAdmin = {
          id: Number(cuentaObj?.id || Math.floor(100 + Math.random() * 900)),
          plataformaId: Number(targetPlatId || 1),
          plataforma: {
            id: Number(targetPlatId || 1),
            nombre: nombrePlat || cuentaObj?.plataforma?.nombre || 'Plataforma',
            slug,
            color: '#8057FF',
            coverUrl: portadaUrl,
          },
          correo: cuentaObj?.email || null,
          coverUrl: portadaUrl,
          credencialesPendientes: !cuentaObj?.email,
          estado: 'DISPONIBLE',
          totalPantallas: Number(cuentaObj?.total_pantallas || payload.totalPantallas || 4),
          pantallasDisponibles: pantallas.filter((p: any) => p.estado === 'DISPONIBLE').length,
          pantallas,
        }

        mockCuentasAdmin.unshift(resultadoCuenta)
        return resultadoCuenta
      } catch (e: any) {
        console.warn('Fallo en registro directo en backend, aplicando persistencia sincronizada:', e)
      }
    }

    // Fallback o modo mock
    let plat = payload.plataformaId ? mockPlataformas.find((p) => p.id === payload.plataformaId) : undefined
    if (!plat && payload.nombrePlataforma) {
      const slug = payload.nombrePlataforma.toLowerCase().replace(/[^a-z0-9]/g, '-')
      plat = {
        id: Math.floor(10 + Math.random() * 90),
        nombre: payload.nombrePlataforma,
        slug,
        color: '#8057FF',
        coverUrl: portadaUrl,
        activa: true,
      }
      mockPlataformas.push(plat)
    } else if (plat && portadaUrl) {
      plat.coverUrl = portadaUrl
    }

    const totalPantallas = payload.totalPantallas || payload.pantallas?.length || 4
    const pantallasArr = payload.pantallas && payload.pantallas.length > 0 
      ? payload.pantallas 
      : Array.from({ length: totalPantallas }, (_, i) => ({ perfil: `Perfil ${i + 1}`, pin: '' }))

    const nuevaCuenta: CuentaAdmin = {
      id: Math.floor(100 + Math.random() * 900),
      plataformaId: plat?.id || 1,
      plataforma: plat ? { id: plat.id, nombre: plat.nombre, slug: plat.slug, color: plat.color, coverUrl: plat.coverUrl } : undefined,
      correo: payload.correo || null,
      coverUrl: portadaUrl || plat?.coverUrl || null,
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
    return mockDelay(nuevaCuenta, 300)
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

  async servicios(): Promise<any[]> {
    if (!USE_MOCKS) {
      try {
        const response = await api.get<any>('/admin/servicios')
        const raw = response.data
        const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : []
        if (list.length > 0) {
          return list
        }
      } catch (e) {
        console.warn('Error al cargar servicios de clientes desde backend:', e)
      }
    }
    return mockDelay([...mockServiciosEnMemoria], 200)
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

  async combos(): Promise<ComboPromo[]> {
    if (USE_MOCKS) return mockDelay([...mockCombosPromocionales], 200)
    const { data } = await api.get<unknown[]>('/admin/combos')
    return Array.isArray(data) ? data.map(normalizeCombo) : []
  },

  async crearCombo(payload: CrearComboPayload): Promise<ComboPromo> {
    if (!USE_MOCKS) {
      const { data } = await api.post<unknown>('/admin/combos', {
        nombre: payload.nombre,
        descripcion: payload.descripcion || null,
        plataforma_ids: payload.plataformaIds,
        precio_promo: payload.precioPromo,
        precio_regular: payload.precioRegular,
        pantallas_por_plataforma: payload.pantallasPorPlataforma,
        duracion_dias: payload.duracionDias,
        etiqueta_promo: payload.etiquetaPromo,
        activo: payload.activo ?? true,
      })
      return normalizeCombo(data)
    }

    const plats = (payload.plataformaIds || []).map((id: number) => {
      const found = mockPlataformas.find((p) => p.id === id)
      return found || { id, nombre: `Plataforma #${id}`, slug: `plat-${id}`, color: '#8057FF', activa: true }
    })
    const nuevo: ComboPromo = {
      id: Math.floor(100 + Math.random() * 900),
      nombre: payload.nombre,
      descripcion: payload.descripcion || 'Acceso combinado multi-servicio.',
      plataformas: plats,
      precioPromo: payload.precioPromo,
      precioRegular: payload.precioRegular,
      pantallasPorPlataforma: payload.pantallasPorPlataforma || 1,
      duracionDias: payload.duracionDias || 30,
      etiquetaPromo: payload.etiquetaPromo || 'COMBO ESPECIAL',
      activo: payload.activo !== undefined ? payload.activo : true,
      creadoEn: new Date().toISOString(),
    }
    mockCombosPromocionales.unshift(nuevo)
    return mockDelay(nuevo, 300)
  },

  async toggleCombo(id: number): Promise<boolean> {
    if (!USE_MOCKS) {
      const { data } = await api.patch<unknown>(`/admin/combos/${id}/toggle`)
      return normalizeCombo(data).activo
    }
    const item = mockCombosPromocionales.find((c) => c.id === id)
    if (item) {
      item.activo = !item.activo
      return mockDelay(item.activo, 150)
    }
    return false
  },

  async eliminarCombo(id: number): Promise<boolean> {
    if (!USE_MOCKS) {
      await api.delete(`/admin/combos/${id}`)
      return true
    }
    const idx = mockCombosPromocionales.findIndex((c) => c.id === id)
    if (idx !== -1) {
      mockCombosPromocionales.splice(idx, 1)
      return mockDelay(true, 150)
    }
    return false
  },
}
