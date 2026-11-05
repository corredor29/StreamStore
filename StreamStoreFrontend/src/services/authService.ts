import { api, mockDelay, USE_MOCKS } from './api'
import type { AuthResponse, LoginPayload, RegisterPayload, Usuario } from '@/types'

// Cuentas de demostración preconfiguradas para pruebas
export const DEMO_ACCOUNTS = {
  cliente: { email: 'cliente@streamstore.com', password: 'password123', nombre: 'Carlos Cliente', rol: 'cliente' as const },
  admin: { email: 'admin@streamstore.com', password: 'adminpassword', nombre: 'Admin StreamStore', rol: 'admin' as const },
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    if (USE_MOCKS) {
      // Simulación de autenticación
      if (
        (payload.email === DEMO_ACCOUNTS.cliente.email && payload.password === DEMO_ACCOUNTS.cliente.password) ||
        (payload.email === 'cliente@test.com' && payload.password === '123456')
      ) {
        return mockDelay<AuthResponse>({
          token: 'mock-jwt-token-cliente-' + Date.now(),
          usuario: {
            id: 1,
            nombre: DEMO_ACCOUNTS.cliente.nombre,
            email: payload.email,
            rol: 'cliente',
          },
        })
      }

      if (
        (payload.email === DEMO_ACCOUNTS.admin.email && payload.password === DEMO_ACCOUNTS.admin.password) ||
        (payload.email === 'admin@test.com' && payload.password === '123456')
      ) {
        return mockDelay<AuthResponse>({
          token: 'mock-jwt-token-admin-' + Date.now(),
          usuario: {
            id: 2,
            nombre: DEMO_ACCOUNTS.admin.nombre,
            email: payload.email,
            rol: 'admin',
          },
        })
      }

      // Si ingresa credenciales genéricas válidas para pruebas rápidas
      if (payload.email.includes('@') && payload.password.length >= 6) {
        const isAdminEmail = payload.email.toLowerCase().includes('admin')
        return mockDelay<AuthResponse>({
          token: 'mock-jwt-token-' + Date.now(),
          usuario: {
            id: 3,
            nombre: payload.email.split('@')[0],
            email: payload.email,
            rol: isAdminEmail ? 'admin' : 'cliente',
          },
        })
      }

      throw {
        status: 401,
        message: 'Correo electrónico o contraseña incorrectos.',
      }
    }

    const { data } = await api.post<AuthResponse>('/auth/login', payload)
    return data
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    if (USE_MOCKS) {
      return mockDelay<AuthResponse>({
        token: 'mock-jwt-token-newuser-' + Date.now(),
        usuario: {
          id: Date.now(),
          nombre: payload.nombre,
          email: payload.email,
          rol: 'cliente',
        },
      })
    }

    const { data } = await api.post<AuthResponse>('/auth/register', payload)
    return data
  },

  async me(): Promise<Usuario> {
    if (USE_MOCKS) {
      return mockDelay<Usuario>({
        id: 1,
        nombre: DEMO_ACCOUNTS.cliente.nombre,
        email: DEMO_ACCOUNTS.cliente.email,
        rol: 'cliente',
      })
    }

    const { data } = await api.get<Usuario>('/auth/me')
    return data
  },
}
