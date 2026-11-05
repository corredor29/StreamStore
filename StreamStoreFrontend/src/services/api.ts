import axios, { AxiosError, type AxiosInstance } from 'axios'
import type { ApiError } from '@/types'

export const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'
export const USE_MOCKS: boolean = import.meta.env.VITE_USE_MOCKS === 'true'

// El token vive solo en memoria (no en localStorage). El store de auth lo registra aquí.
let tokenProvider: () => string | null = () => null
let onUnauthorized: () => void = () => {}

export function setTokenProvider(fn: () => string | null): void {
  tokenProvider = fn
}

export function setUnauthorizedHandler(fn: () => void): void {
  onUnauthorized = fn
}

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = tokenProvider()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ message?: string; error?: string; code?: string }>) => {
    const normalized = normalizeError(error)
    if (normalized.status === 401) onUnauthorized()
    return Promise.reject(normalized)
  },
)

const STATUS_MESSAGES: Record<number, string> = {
  0: 'No se pudo conectar con el servidor. Verifica tu conexión.',
  400: 'La solicitud contiene datos inválidos.',
  401: 'Tu sesión expiró o no has iniciado sesión.',
  403: 'No tienes permisos para realizar esta acción.',
  404: 'El recurso solicitado no existe.',
  409: 'Conflicto: el stock o el estado cambió. Intenta de nuevo.',
  422: 'Revisa los datos enviados.',
  500: 'Error interno del servidor. Intenta más tarde.',
}

export function normalizeError(error: unknown): ApiError {
  if (isApiError(error)) return error
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0
    const data = error.response?.data as { message?: string; error?: string; code?: string } | undefined
    return {
      status,
      message: data?.message ?? data?.error ?? STATUS_MESSAGES[status] ?? 'Ocurrió un error inesperado.',
      code: data?.code,
      details: data,
    }
  }
  return { status: -1, message: error instanceof Error ? error.message : 'Ocurrió un error inesperado.' }
}

export function isApiError(e: unknown): e is ApiError {
  return typeof e === 'object' && e !== null && 'status' in e && 'message' in e && !axios.isAxiosError(e)
}

/** Simula latencia de red en modo mock de forma segura sin problemas de proxies. */
export function mockDelay<T>(data: T, ms = 300): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        resolve(JSON.parse(JSON.stringify(data)))
      } catch {
        resolve(data)
      }
    }, ms)
  })
}
