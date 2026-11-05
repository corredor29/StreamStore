import { ref, shallowRef } from 'vue'
import { normalizeError } from '@/services/api'
import type { ApiError } from '@/types'

/** Gestiona estados de carga/error de una operación asíncrona. */
export function useAsync<T, A extends unknown[] = []>(fn: (...args: A) => Promise<T>) {
  const data = shallowRef<T | null>(null)
  const loading = ref(false)
  const error = ref<ApiError | null>(null)

  async function run(...args: A): Promise<T | null> {
    loading.value = true
    error.value = null
    try {
      data.value = await fn(...args)
      return data.value
    } catch (e) {
      error.value = normalizeError(e)
      return null
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, run }
}
