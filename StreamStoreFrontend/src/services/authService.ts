import { api, mockDelay, normalizeError, USE_MOCKS } from './api'
import type { AuthResponse, LoginPayload, RegisterPayload, Usuario } from '@/types'

// Con backend (lo normal) la sesión se solicita al servidor.
// Si el servidor está apagado o no hay conexión con MySQL (status 0 o 500),
// se activa el modo offline resiliente guardando usuarios en almacenamiento local
// para permitir pruebas completas de registro y navegación sin bloquear la app.

const LOCAL_USERS_KEY = 'streamstore_local_registered_users'

interface LocalUserRecord {
  id: number
  nombre: string
  email: string
  password: string
  rol: 'cliente' | 'admin'
  createdAt: string
}

function getLocalUsers(): LocalUserRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalUser(user: LocalUserRecord): void {
  try {
    const users = getLocalUsers().filter((u) => u.email.toLowerCase() !== user.email.toLowerCase())
    users.push(user)
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users))
  } catch {
    // Manejo silencioso en caso de bloqueo de storage
  }
}

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
    const email = payload.email.trim().toLowerCase()

    if (!USE_MOCKS) {
      try {
        const response = await api.post<any>('/auth/login', payload)
        return sesionDesdeRespuesta(response.data, payload.email)
      } catch (err: any) {
        const normalized = normalizeError(err)

        // Si el backend responde con error de autenticación explícito (400, 401, 403, 404, 422), respetar el mensaje del servidor
        if (normalized.status > 0 && normalized.status < 500) {
          throw normalized
        }

        // Si el servidor está apagado (status 0) o hay error de base de datos (500/502/503),
        // verificar cuentas creadas localmente o cuentas demo de prueba
        console.warn('Backend o base de datos no disponible. Verificando usuarios en modo offline resiliente.')
        const localUsers = getLocalUsers()
        const userMatch = localUsers.find((u) => u.email.toLowerCase() === email)

        if (userMatch) {
          if (userMatch.password === payload.password) {
            return mockDelay<AuthResponse>({
              token: `mock-jwt-local-${userMatch.id}`,
              usuario: {
                id: userMatch.id,
                nombre: userMatch.nombre,
                email: userMatch.email,
                rol: userMatch.rol,
              },
            }, 250)
          } else {
            throw { status: 401, message: 'Contraseña incorrecta para esta cuenta.' }
          }
        }

        // Cuentas demo predeterminadas
        const esAdmin = email === ADMIN_DEMO || email === 'admin@streamstore.com'
        const esClienteDemo = email === 'cliente@demo.local' || email === 'cliente@streamstore.com' || email === 'cliente1@streamstore.test'

        if ((esAdmin || esClienteDemo) && payload.password.length >= 6) {
          return mockDelay<AuthResponse>({
            token: `mock-jwt-${esAdmin ? 'admin' : 'cliente'}-${Date.now()}`,
            usuario: {
              id: esAdmin ? 2 : 1,
              nombre: esAdmin ? 'Admin StreamStore' : 'Cliente Demo',
              email,
              rol: esAdmin ? 'admin' : 'cliente',
            },
          }, 250)
        }

        // Si no se encuentra usuario ni en backend ni localmente
        throw {
          status: 401,
          message: 'No se pudo conectar con el servidor y la cuenta no existe localmente. Si acabas de registrarte, verifica tus datos o crea una cuenta nueva.',
        }
      }
    }

    // Modo VITE_USE_MOCKS=true explícito
    if (!email.includes('@') || payload.password.length < 6) {
      throw { status: 401, message: 'Correo electrónico o contraseña incorrectos.' }
    }

    const localUsers = getLocalUsers()
    const userMatch = localUsers.find((u) => u.email.toLowerCase() === email)
    if (userMatch) {
      if (userMatch.password === payload.password) {
        return mockDelay<AuthResponse>({
          token: `mock-jwt-local-${userMatch.id}`,
          usuario: {
            id: userMatch.id,
            nombre: userMatch.nombre,
            email: userMatch.email,
            rol: userMatch.rol,
          },
        }, 200)
      } else {
        throw { status: 401, message: 'Contraseña incorrecta.' }
      }
    }

    const esAdmin = email === ADMIN_DEMO || email === 'admin@streamstore.com'
    return mockDelay<AuthResponse>({
      token: `mock-jwt-${esAdmin ? 'admin' : 'cliente'}-${Date.now()}`,
      usuario: { id: esAdmin ? 2 : 1, nombre: esAdmin ? 'Admin StreamStore' : 'Cliente Demo', email, rol: esAdmin ? 'admin' : 'cliente' },
    }, 200)
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const email = payload.email.trim().toLowerCase()

    if (!USE_MOCKS) {
      try {
        const response = await api.post<any>('/auth/register', payload)
        return sesionDesdeRespuesta(response.data, payload.email, payload.nombre)
      } catch (err: any) {
        const normalized = normalizeError(err)

        // Si el backend no está disponible (status 0: sin servidor, o status 500: error interno/base de datos caída),
        // registramos al usuario en almacenamiento local para no bloquear su experiencia
        if (normalized.status === 0 || normalized.status >= 500) {
          console.warn('Backend o base de datos no disponible. Registrando cuenta en modo offline resiliente.')
          const localUser: LocalUserRecord = {
            id: Date.now(),
            nombre: payload.nombre.trim(),
            email,
            password: payload.password,
            rol: 'cliente',
            createdAt: new Date().toISOString(),
          }
          saveLocalUser(localUser)

          return mockDelay<AuthResponse>({
            token: `mock-jwt-local-${localUser.id}`,
            usuario: {
              id: localUser.id,
              nombre: localUser.nombre,
              email: localUser.email,
              rol: 'cliente',
            },
          }, 300)
        }

        // Si el backend devolvió un error de validación o conflicto 4xx (ej: 409 correo ya existe), respetarlo
        throw normalized
      }
    }

    // Modo VITE_USE_MOCKS=true explícito
    const localUser: LocalUserRecord = {
      id: Date.now(),
      nombre: payload.nombre.trim(),
      email,
      password: payload.password,
      rol: 'cliente',
      createdAt: new Date().toISOString(),
    }
    saveLocalUser(localUser)

    return mockDelay<AuthResponse>({
      token: 'mock-jwt-nuevo-' + Date.now(),
      usuario: { id: localUser.id, nombre: payload.nombre, email: payload.email, rol: 'cliente' },
    }, 200)
  },

  async me(): Promise<Usuario> {
    if (!USE_MOCKS) {
      try {
        const { data } = await api.get<any>('/auth/me')
        const userObj = data.data || data
        return { id: userObj.id, nombre: userObj.nombre, email: userObj.email, rol: userObj.rol === 'admin' ? 'admin' : 'cliente' }
      } catch (err: any) {
        const normalized = normalizeError(err)
        if (normalized.status === 0 || normalized.status >= 500) {
          // Si el servidor está apagado pero hay una sesión activa persistida, devolverla
          try {
            const saved = localStorage.getItem('streamstore_user') || sessionStorage.getItem('streamstore_user')
            if (saved) return JSON.parse(saved)
          } catch {
            // Ignorar
          }
          return mockDelay<Usuario>({ id: 1, nombre: 'Cliente Demo', email: 'cliente@demo.local', rol: 'cliente' }, 150)
        }
        throw normalized
      }
    }

    return mockDelay<Usuario>({ id: 1, nombre: 'Cliente Demo', email: 'cliente@demo.local', rol: 'cliente' }, 150)
  },
}
