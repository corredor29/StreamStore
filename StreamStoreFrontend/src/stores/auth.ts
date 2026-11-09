import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { setTokenProvider, setUnauthorizedHandler } from '@/services/api'
import { authService } from '@/services/authService'
import type { LoginPayload, RegisterPayload, Usuario } from '@/types'

const TOKEN_KEY = 'streamstore_token'
const USER_KEY = 'streamstore_user'

function getSavedToken(): string | null {
  try {
    if (typeof localStorage !== 'undefined') {
      const local = localStorage.getItem(TOKEN_KEY)
      if (local) return local
    }
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem(TOKEN_KEY)
    }
    return null
  } catch {
    return null
  }
}

function getSavedUser(): Usuario | null {
  try {
    let saved: string | null = null
    if (typeof localStorage !== 'undefined') {
      saved = localStorage.getItem(USER_KEY)
    }
    if (!saved && typeof sessionStorage !== 'undefined') {
      saved = sessionStorage.getItem(USER_KEY)
    }
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  // Inicialización persistente desde localStorage y sessionStorage
  const token = ref<string | null>(getSavedToken())
  const usuario = ref<Usuario | null>(getSavedUser())

  const isAuthenticated = computed(() => !!token.value && !!usuario.value)
  const isAdmin = computed(() => usuario.value?.rol === 'admin')

  function setSession(newToken: string, user: Usuario): void {
    token.value = newToken
    usuario.value = user
    try {
      localStorage.setItem(TOKEN_KEY, newToken)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
    } catch {
      // Manejo silencioso en caso de bloqueo de storage
    }
    try {
      sessionStorage.setItem(TOKEN_KEY, newToken)
      sessionStorage.setItem(USER_KEY, JSON.stringify(user))
    } catch {
      // Manejo silencioso
    }
  }

  function logout(): void {
    token.value = null
    usuario.value = null
    try {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    } catch {
      // Ignorar
    }
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
