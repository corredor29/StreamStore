import { api, mockDelay, normalizeError, USE_MOCKS } from './api'
import type { AuthResponse, LoginPayload, RegisterPayload, Usuario } from '@/types'

// Con backend (lo normal) la sesión SOLO la da el servidor: si falla, se muestra el error.
// Nunca se fabrica una sesión local, y menos de administrador.

function sesionDesdeRespuesta(raw: any, fallbackEmail: string, fallbackNombre = 'Usuario'): AuthResponse {
  const token = raw?.data?.token || raw?.token
  const userObj = raw?.data?.user || raw?.data?.usuario || raw?.usuario || raw?.user
  if (!token || !userObj) throw { status: 502, message: 'El servidor respondió sin una sesión válida. Intenta de nuevo.' }
  return {
    token,
    usuario: {
      id: userObj.id,
      nombre: userObj.nombre || fallbackNombre,
      email: userObj.email || fallbackEmail,
      rol: userObj.rol === 'admin' ? 'admin' : 'cliente',
    },
  }
}

// Modo demo SIN servidor (solo si VITE_USE_MOCKS=true): el rol depende del correo exacto del seed
const ADMIN_DEMO = 'admin@streamstore.test'

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    if (!USE_MOCKS) {
      try {
        const response = await api.post<any>('/auth/login', payload)
        return sesionDesdeRespuesta(response.data, payload.email)
      } catch (err) {
        throw normalizeError(err)
      }
    }

    const email = payload.email.trim().toLowerCase()
    if (!email.includes('@') || payload.password.length < 6) {
      throw { status: 401, message: 'Correo electrónico o contraseña incorrectos.' }
    }
    const esAdmin = email === ADMIN_DEMO
    return mockDelay<AuthResponse>({
      token: `mock-jwt-${esAdmin ? 'admin' : 'cliente'}-${Date.now()}`,
      usuario: { id: esAdmin ? 2 : 1, nombre: esAdmin ? 'Admin StreamStore' : 'Cliente Demo', email, rol: esAdmin ? 'admin' : 'cliente' },
    }, 200)
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    if (!USE_MOCKS) {
      try {
        const response = await api.post<any>('/auth/register', payload)
        return sesionDesdeRespuesta(response.data, payload.email, payload.nombre)
      } catch (err) {
        throw normalizeError(err)
      }
    }

    return mockDelay<AuthResponse>({
      token: 'mock-jwt-nuevo-' + Date.now(),
      usuario: { id: Date.now(), nombre: payload.nombre, email: payload.email, rol: 'cliente' },
    }, 200)
  },

  async me(): Promise<Usuario> {
    if (!USE_MOCKS) {
      try {
        const { data } = await api.get<any>('/auth/me')
        const userObj = data.data || data
        return { id: userObj.id, nombre: userObj.nombre, email: userObj.email, rol: userObj.rol === 'admin' ? 'admin' : 'cliente' }
      } catch (err) {
        throw normalizeError(err)
      }
    }

    return mockDelay<Usuario>({ id: 1, nombre: 'Cliente Demo', email: 'cliente@demo.local', rol: 'cliente' }, 150)
  },
}
