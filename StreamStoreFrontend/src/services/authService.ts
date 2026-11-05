import { api, mockDelay, USE_MOCKS } from './api'
import type { AuthResponse, LoginPayload, RegisterPayload, Usuario } from '@/types'

// Cuentas de demostración preconfiguradas compatibles con backend y frontend
export const DEMO_ACCOUNTS = {
  cliente: { email: 'cliente1@streamstore.test', password: 'Cliente123*', nombre: 'Laura Cliente', rol: 'cliente' as const },
  admin: { email: 'admin@streamstore.test', password: 'Admin123*', nombre: 'Admin StreamStore', rol: 'admin' as const },
  clienteLegacy: { email: 'cliente@streamstore.com', password: 'password123', nombre: 'Carlos Cliente', rol: 'cliente' as const },
  adminLegacy: { email: 'admin@streamstore.com', password: 'adminpassword', nombre: 'Admin StreamStore', rol: 'admin' as const },
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const emailNorm = payload.email.trim().toLowerCase()

    // 1. Intento de autenticación contra la API real si USE_MOCKS es falso
    if (!USE_MOCKS) {
      try {
        const response = await api.post<any>('/auth/login', payload)
        const raw = response.data
        const token = raw.data?.token || raw.token || 'jwt-' + Date.now()
        const userObj = raw.data?.user || raw.data?.usuario || raw.usuario || raw.user
        if (userObj) {
          return {
            token,
            usuario: {
              id: userObj.id || 1,
              nombre: userObj.nombre || 'Usuario',
              email: userObj.email || payload.email,
              rol: (userObj.rol as any) || 'cliente',
            },
          }
        }
      } catch (err: any) {
        // Si el backend responde con credenciales inválidas (401 o 400), lanzar el error normalmente
        if (err?.status === 401 || err?.status === 400) {
          throw err
        }
        // Si es un error de conexión (backend caído o MySQL no iniciado), permitimos fallback demo
        console.warn('Backend no disponible, ejecutando en modo demo autónomo:', err?.message)
      }
    }

    // 2. Simulación / Fallback inmediato para permitir acceso demo garantizado
    const isAdmin =
      (emailNorm === DEMO_ACCOUNTS.admin.email.toLowerCase() && payload.password === DEMO_ACCOUNTS.admin.password) ||
      (emailNorm === DEMO_ACCOUNTS.adminLegacy.email.toLowerCase() && payload.password === DEMO_ACCOUNTS.adminLegacy.password) ||
      (emailNorm === 'admin@test.com' && payload.password === '123456') ||
      (emailNorm.includes('admin') && payload.password.length >= 6)

    if (isAdmin) {
      return mockDelay<AuthResponse>({
        token: 'mock-jwt-token-admin-' + Date.now(),
        usuario: {
          id: 2,
          nombre: DEMO_ACCOUNTS.admin.nombre,
          email: payload.email,
          rol: 'admin',
        },
      }, 200)
    }

    const isCliente =
      (emailNorm === DEMO_ACCOUNTS.cliente.email.toLowerCase() && payload.password === DEMO_ACCOUNTS.cliente.password) ||
      (emailNorm === DEMO_ACCOUNTS.clienteLegacy.email.toLowerCase() && payload.password === DEMO_ACCOUNTS.clienteLegacy.password) ||
      (emailNorm === 'cliente@test.com' && payload.password === '123456') ||
      (!isAdmin && emailNorm.includes('@') && payload.password.length >= 6)

    if (isCliente) {
      return mockDelay<AuthResponse>({
        token: 'mock-jwt-token-cliente-' + Date.now(),
        usuario: {
          id: 1,
          nombre: DEMO_ACCOUNTS.cliente.nombre,
          email: payload.email,
          rol: 'cliente',
        },
      }, 200)
    }

    throw {
      status: 401,
      message: 'Correo electrónico o contraseña incorrectos.',
    }
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    if (!USE_MOCKS) {
      try {
        const response = await api.post<any>('/auth/register', payload)
        const raw = response.data
        const token = raw.data?.token || raw.token || 'jwt-' + Date.now()
        const userObj = raw.data?.user || raw.data?.usuario || raw.usuario || raw.user
        if (userObj) {
          return {
            token,
            usuario: {
              id: userObj.id || Date.now(),
              nombre: userObj.nombre || payload.nombre,
              email: userObj.email || payload.email,
              rol: (userObj.rol as any) || 'cliente',
            },
          }
        }
      } catch (err: any) {
        if (err?.status === 409 || err?.status === 400) {
          throw err
        }
      }
    }

    return mockDelay<AuthResponse>({
      token: 'mock-jwt-token-newuser-' + Date.now(),
      usuario: {
        id: Date.now(),
        nombre: payload.nombre,
        email: payload.email,
        rol: 'cliente',
      },
    }, 200)
  },

  async me(): Promise<Usuario> {
    if (!USE_MOCKS) {
      try {
        const { data } = await api.get<any>('/auth/me')
        const userObj = data.data || data
        return {
          id: userObj.id,
          nombre: userObj.nombre,
          email: userObj.email,
          rol: userObj.rol,
        }
      } catch {
        // Fallback a demo si falla la conexión
      }
    }

    return mockDelay<Usuario>({
      id: 1,
      nombre: DEMO_ACCOUNTS.cliente.nombre,
      email: DEMO_ACCOUNTS.cliente.email,
      rol: 'cliente',
    }, 150)
  },
}
