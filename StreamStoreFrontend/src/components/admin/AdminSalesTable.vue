<script setup lang="ts">
import { computed, ref } from 'vue'
import { Receipt, Search, X } from '@lucide/vue'
import type { Compra } from '@/types'
import { formatPrice } from '@/composables/useFormat'

const props = defineProps<{ compras: Compra[] }>()

type FiltroEstado = 'TODOS' | Compra['estado']

const searchQuery = ref('')
const estadoFiltro = ref<FiltroEstado>('TODOS')

const ESTADOS: Record<string, { label: string; dot: string; text: string }> = {
  PAGADA: { label: 'Pagada', dot: 'bg-ad-ok', text: 'text-ad-text' },
  PENDIENTE: { label: 'Pendiente', dot: 'bg-ad-warn', text: 'text-ad-text' },
  RECHAZADA: { label: 'Rechazada', dot: 'bg-ad-err', text: 'text-ad-text' },
  CANCELADA: { label: 'Cancelada', dot: 'bg-ad-faint', text: 'text-ad-dim' },
}

const METODOS: Record<string, string> = { TARJETA: 'Tarjeta débito', NEQUI: 'Nequi', DAVIPLATA: 'Daviplata', SIMULADO: 'Pago simulado' }
const metodo = (m?: string | null) => METODOS[(m || '').toUpperCase()] ?? (m || '—')

const fecha = (iso?: string | null) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const productos = (c: Compra) =>
  c.detalles.map((d) => (d.cantidad > 1 ? `${d.cantidad}× ` : '') + (d.producto?.nombre ?? 'Producto')).join(', ')

const resumen = computed(() => {
  const pagadas = props.compras.filter((c) => c.estado === 'PAGADA')
  return {
    recaudado: pagadas.reduce((acc, c) => acc + c.total, 0),
    pagadas: pagadas.length,
    pendientes: props.compras.filter((c) => c.estado === 'PENDIENTE').length,
  }
})

const comprasFiltradas = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  return props.compras.filter((c) => {
    const okEstado = estadoFiltro.value === 'TODOS' || c.estado === estadoFiltro.value
    const okBusqueda =
      !q ||
      `#${c.id}`.includes(q) ||
      String(c.id) === q ||
      c.cliente?.nombre.toLowerCase().includes(q) ||
      c.cliente?.email.toLowerCase().includes(q) ||
      c.detalles.some((d) => d.producto?.nombre?.toLowerCase().includes(q))
    return okEstado && okBusqueda
  })
})
</script>

<template>
  <div class="space-y-3">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <p class="text-[13px] text-ad-dim">
        <span class="font-medium text-ad-text tabular-nums">{{ formatPrice(resumen.recaudado) }}</span> recaudado en
        {{ resumen.pagadas }} {{ resumen.pagadas === 1 ? 'venta pagada' : 'ventas pagadas' }}<template v-if="resumen.pendientes">
          · <span class="text-ad-warn">{{ resumen.pendientes }} sin pagar</span></template>
      </p>
      <div class="flex items-center gap-2">
        <div class="relative w-full md:w-72">
          <Search class="absolute left-2.5 top-2 size-4 text-ad-faint" />
          <input
            v-model="searchQuery"
            type="search"
            aria-label="Buscar ventas"
            placeholder="Buscar por #, cliente o producto"
            class="w-full rounded-md border border-ad-line bg-ad-raised py-1.5 pl-8 pr-7 text-[13px] text-ad-text placeholder:text-ad-faint focus:border-ad-accent focus:outline-none"
          />
          <button v-if="searchQuery" type="button" aria-label="Limpiar búsqueda" class="absolute right-2 top-2 text-ad-faint hover:text-ad-text" @click="searchQuery = ''">
            <X class="size-3.5" />
          </button>
        </div>
        <select
          v-model="estadoFiltro"
          aria-label="Filtrar por estado"
          class="rounded-md border border-ad-line bg-ad-raised px-2.5 py-1.5 text-[13px] text-ad-text focus:border-ad-accent focus:outline-none cursor-pointer"
        >
          <option value="TODOS">Todos los estados</option>
          <option value="PAGADA">Pagadas</option>
          <option value="PENDIENTE">Pendientes</option>
          <option value="RECHAZADA">Rechazadas</option>
          <option value="CANCELADA">Canceladas</option>
        </select>
      </div>
    </div>

    <div class="hud-panel">
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-left text-[13px]">
          <thead class="border-b border-ad-line bg-ad-raised/40 font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-ad-dim">
            <tr>
              <th class="px-4 py-2.5 font-medium">Venta</th>
              <th class="px-4 py-2.5 font-medium">Cliente</th>
              <th class="px-4 py-2.5 font-medium">Productos</th>
              <th class="px-4 py-2.5 font-medium">Método</th>
              <th class="px-4 py-2.5 font-medium">Estado</th>
              <th class="px-4 py-2.5 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-ad-line">
            <tr v-for="c in comprasFiltradas" :key="c.id" class="hover:bg-ad-raised">
              <td class="px-4 py-3 whitespace-nowrap">
                <span class="font-medium text-ad-text tabular-nums">#{{ c.id }}</span>
                <span class="block text-xs text-ad-dim">{{ fecha(c.fechaPago || c.fecha) }}</span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <template v-if="c.cliente">
                  <span class="block text-ad-text">{{ c.cliente.nombre }}</span>
                  <span class="text-xs text-ad-dim">{{ c.cliente.email }}</span>
                </template>
                <span v-else class="text-ad-faint">—</span>
              </td>
              <td class="px-4 py-3 text-ad-text max-w-sm">
                <span class="line-clamp-2">{{ productos(c) }}</span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-ad-dim">{{ metodo(c.metodoPago) }}</td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span class="inline-flex items-center gap-1.5" :class="(ESTADOS[c.estado] ?? ESTADOS.CANCELADA).text">
                  <span class="size-1.5 rounded-full" :class="(ESTADOS[c.estado] ?? ESTADOS.CANCELADA).dot" />
                  {{ (ESTADOS[c.estado] ?? { label: c.estado }).label }}
                </span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-right font-medium text-ad-text tabular-nums">{{ formatPrice(c.total) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="comprasFiltradas.length === 0" class="px-6 py-14 text-center">
        <Receipt class="mx-auto size-6 text-ad-faint" />
        <p class="mt-2 text-[13px] font-medium text-ad-text">
          {{ props.compras.length ? 'Ninguna venta coincide con la búsqueda' : 'Aún no hay ventas' }}
        </p>
        <p class="mt-0.5 text-xs text-ad-dim">
          {{ props.compras.length ? 'Prueba con otro número, cliente o estado.' : 'Las compras de los clientes aparecerán aquí.' }}
        </p>
      </div>
    </div>
  </div>
</template>
