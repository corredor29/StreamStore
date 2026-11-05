import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { setTokenProvider, setUnauthorizedHandler } from '@/services/api'
import { authService } from '@/services/authService'
import type { LoginPayload, RegisterPayload, Usuario } from '@/types'

const TOKEN_KEY = 'streamstore_token'
const USER_KEY = 'streamstore_user'

function getSavedUser(): Usuario | null {
  try {
    const saved = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(USER_KEY) : null
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  // Inicialización desde sessionStorage para persistir navegación de pestaña activa
  const token = ref<string | null>(typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(TOKEN_KEY) : null)
  const usuario = ref<Usuario | null>(getSavedUser())

  const isAuthenticated = computed(() => !!token.value && !!usuario.value)
  const isAdmin = computed(() => usuario.value?.rol === 'admin')

  function setSession(newToken: string, user: Usuario): void {
    token.value = newToken
    usuario.value = user
    try {
      sessionStorage.setItem(TOKEN_KEY, newToken)
      sessionStorage.setItem(USER_KEY, JSON.stringify(user))
    } catch {
      // Manejo silencioso en caso de bloqueo de storage
    }
  }

  function logout(): void {
    token.value = null
    usuario.value = null
    try {
      sessionStorage.removeItem(TOKEN_KEY)
      sessionStorage.removeItem(USER_KEY)
    } catch {
      // Ignorar
    }
  }

  async function login(payload: LoginPayload): Promise<Usuario> {
    const res = await authService.login(payload)
    setSession(res.token, res.usuario)
    return res.usuario
  }

  async function register(payload: RegisterPayload): Promise<Usuario> {
    const res = await authService.register(payload)
    setSession(res.token, res.usuario)
    return res.usuario
  }

  setTokenProvider(() => token.value)
  setUnauthorizedHandler(logout)

  return {
    token,
    usuario,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    setSession,
  }
})
