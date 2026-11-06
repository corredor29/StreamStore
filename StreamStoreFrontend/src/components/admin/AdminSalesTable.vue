<script setup lang="ts">
import { computed, ref } from 'vue'
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Copy, 
  CreditCard, 
  DollarSign, 
  Receipt, 
  Search, 
  Smartphone, 
  X, 
  XCircle 
} from '@lucide/vue'
import type { Compra } from '@/types'
import { formatDate, formatPrice } from '@/composables/useFormat'

const props = defineProps<{
  compras: Compra[]
}>()

const searchQuery = ref('')
const estadoFiltro = ref<string>('TODOS')
const metodoFiltro = ref<string>('TODOS')
const copiedNotice = ref<string | null>(null)

function getStatusBadge(estado: Compra['estado']) {
  switch (estado) {
    case 'PAGADA':
      return { 
        label: 'Pagada', 
        cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30', 
        icon: CheckCircle2 
      }
    case 'PENDIENTE':
      return { 
        label: 'Pendiente', 
        cls: 'bg-amber-500/15 text-amber-400 border border-amber-500/30', 
        icon: Clock 
      }
    case 'RECHAZADA':
      return { 
        label: 'Rechazada', 
        cls: 'bg-red-500/15 text-red-400 border border-red-500/30', 
        icon: XCircle 
      }
    default:
      return { 
        label: estado, 
        cls: 'bg-surface-2 text-muted border border-line', 
        icon: AlertCircle 
      }
  }
}

function getMetodoBadge(metodo?: string | null) {
  const m = (metodo || '').toUpperCase()
  if (m.includes('NEQUI')) {
    return { label: 'Nequi', cls: 'bg-purple-950/60 text-purple-300 border-purple-500/30', icon: Smartphone }
  }
  if (m.includes('DAVI')) {
    return { label: 'Daviplata', cls: 'bg-red-950/60 text-red-300 border-red-500/30', icon: Smartphone }
  }
  return { label: 'Tarjeta Débito', cls: 'bg-cyan-950/60 text-cyan-300 border-cyan-500/30', icon: CreditCard }
}

const comprasFiltradas = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()

  return props.compras.filter((c) => {
    const matchesEstado = estadoFiltro.value === 'TODOS' || c.estado === estadoFiltro.value
    const matchesMetodo = metodoFiltro.value === 'TODOS' || (c.metodoPago || '').toUpperCase().includes(metodoFiltro.value)

    const matchesSearch =
      !q ||
      c.id.toString().includes(q) ||
      c.detalles?.some((d) => d.producto?.nombre?.toLowerCase().includes(q))

    return matchesEstado && matchesMetodo && matchesSearch
  })
})

const stats = computed(() => {
  const totalRecaudado = props.compras
    .filter((c) => c.estado === 'PAGADA')
    .reduce((acc, c) => acc + c.total, 0)

  const exitosas = props.compras.filter((c) => c.estado === 'PAGADA').length
  const pendientes = props.compras.filter((c) => c.estado === 'PENDIENTE').length

  return { totalRecaudado, exitosas, pendientes, total: props.compras.length }
})

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    copiedNotice.value = '¡ID de orden copiado!'
    setTimeout(() => {
      copiedNotice.value = null
    }, 2000)
  } catch (err) {}
}
</script>

<template>
  <div class="space-y-4">
    <!-- Notificación de copiado -->
    <div
      v-if="copiedNotice"
      class="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-[#0B1528] px-4 py-2.5 text-xs font-bold text-emerald-300 shadow-xl"
    >
      <CheckCircle2 class="size-4 text-emerald-400" />
      <span>{{ copiedNotice }}</span>
    </div>

    <!-- Mini Banner Resumen de Ventas -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="rounded-xl border border-line/70 bg-surface/60 p-3.5 flex items-center justify-between">
        <div>
          <span class="text-[10px] uppercase font-bold text-muted">Recaudado (Aprobado)</span>
          <p class="font-display text-lg font-black text-emerald-400 mt-0.5">
            {{ formatPrice(stats.totalRecaudado) }}
          </p>
        </div>
        <div class="size-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
          <DollarSign class="size-4" />
        </div>
      </div>

      <div class="rounded-xl border border-line/70 bg-surface/60 p-3.5 flex items-center justify-between">
        <div>
          <span class="text-[10px] uppercase font-bold text-muted">Órdenes Exitosas</span>
          <p class="font-display text-lg font-black text-fg mt-0.5">
            {{ stats.exitosas }} <span class="text-xs text-muted font-normal">de {{ stats.total }}</span>
          </p>
        </div>
        <div class="size-8 rounded-lg bg-brand-500/15 flex items-center justify-center text-brand-300">
          <CheckCircle2 class="size-4" />
        </div>
      </div>

      <div class="rounded-xl border border-line/70 bg-surface/60 p-3.5 flex items-center justify-between">
        <div>
          <span class="text-[10px] uppercase font-bold text-muted">Pendientes de Pago</span>
          <p class="font-display text-lg font-black text-amber-400 mt-0.5">
            {{ stats.pendientes }}
          </p>
        </div>
        <div class="size-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400">
          <Clock class="size-4" />
        </div>
      </div>
    </div>

    <!-- Barra de Filtros de Ventas -->
    <div class="rounded-2xl border border-line/80 bg-surface/80 backdrop-blur p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-md">
      <!-- Filtro Estado Pastillas -->
      <div class="flex items-center gap-1.5 overflow-x-auto">
        <button
          type="button"
          class="px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          :class="estadoFiltro === 'TODOS' ? 'bg-surface-2 text-fg font-bold' : 'text-muted hover:text-fg'"
          @click="estadoFiltro = 'TODOS'"
        >
          Todas ({{ props.compras.length }})
        </button>
        <button
          type="button"
          class="px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer text-emerald-400 transition-colors"
          :class="estadoFiltro === 'PAGADA' ? 'bg-emerald-500/20 font-bold border border-emerald-500/30' : 'hover:bg-surface-2/60'"
          @click="estadoFiltro = 'PAGADA'"
        >
          Pagadas
        </button>
        <button
          type="button"
          class="px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer text-amber-400 transition-colors"
          :class="estadoFiltro === 'PENDIENTE' ? 'bg-amber-500/20 font-bold border border-amber-500/30' : 'hover:bg-surface-2/60'"
          @click="estadoFiltro = 'PENDIENTE'"
        >
          Pendientes
        </button>
      </div>

      <!-- Buscador y Filtro Pasarela -->
      <div class="flex items-center gap-2">
        <select
          v-model="metodoFiltro"
          class="rounded-xl border border-line bg-surface-2 px-2.5 py-1.5 text-xs text-fg focus:border-brand-400 focus:outline-none cursor-pointer"
          aria-label="Filtrar por pasarela"
        >
          <option value="TODOS">Todas las pasarelas</option>
          <option value="TARJETA">Tarjeta Débito</option>
          <option value="NEQUI">Nequi</option>
          <option value="DAVI">Daviplata</option>
        </select>

        <div class="relative sm:w-56">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por ID de orden..."
            class="w-full rounded-xl border border-line bg-surface-2 pl-8 pr-7 py-1.5 text-xs text-fg placeholder:text-muted/60 focus:border-brand-400 focus:outline-none"
          />
          <Search class="absolute left-2.5 top-2 size-3.5 text-muted" />
          <button
            v-if="searchQuery"
            type="button"
            class="absolute right-2 top-2 text-muted hover:text-fg"
            @click="searchQuery = ''"
          >
            <X class="size-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla Profesional de Transacciones -->
    <div class="rounded-2xl border border-line/70 bg-[#12172D] overflow-hidden shadow-lg">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="border-b border-line/60 bg-[#0C1022] text-muted uppercase tracking-wider font-semibold text-[10px]">
            <tr>
              <th class="p-4">Orden</th>
              <th class="p-4">Fecha & Hora</th>
              <th class="p-4">Ítems / Suscripciones</th>
              <th class="p-4">Método de Pago</th>
              <th class="p-4 text-right">Total (COP)</th>
              <th class="p-4 text-center">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-line/40">
            <tr
              v-for="c in comprasFiltradas"
              :key="c.id"
              class="hover:bg-surface-2/30 transition-colors"
            >
              <!-- ID Orden -->
              <td class="p-4 font-mono font-bold text-fg whitespace-nowrap">
                <div class="flex items-center gap-1.5">
                  <span class="text-brand-300">#{{ c.id }}</span>
                  <button
                    type="button"
                    class="text-muted hover:text-fg transition-colors"
                    title="Copiar ID de orden"
                    @click="copyText(c.id.toString())"
                  >
                    <Copy class="size-3" />
                  </button>
                </div>
              </td>

              <!-- Fecha -->
              <td class="p-4 text-muted whitespace-nowrap">
                {{ formatDate(c.fecha) }}
              </td>

              <!-- Productos -->
              <td class="p-4 text-fg min-w-[200px]">
                <div class="space-y-1">
                  <div
                    v-for="det in c.detalles"
                    :key="det.id"
                    class="flex items-center gap-1.5"
                  >
                    <span class="rounded bg-surface-2 px-1.5 py-0.2 text-[10px] font-mono text-muted">
                      x{{ det.cantidad }}
                    </span>
                    <span class="font-medium text-xs text-fg">
                      {{ det.producto?.nombre || `Producto #${det.productoId}` }}
                    </span>
                  </div>
                </div>
              </td>

              <!-- Método -->
              <td class="p-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-semibold"
                  :class="getMetodoBadge(c.metodoPago).cls"
                >
                  <component :is="getMetodoBadge(c.metodoPago).icon" class="size-3" />
                  {{ getMetodoBadge(c.metodoPago).label }}
                </span>
              </td>

              <!-- Total -->
              <td class="p-4 font-mono font-bold text-fg text-right text-sm whitespace-nowrap">
                {{ formatPrice(c.total) }}
              </td>

              <!-- Estado -->
              <td class="p-4 text-center whitespace-nowrap">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  :class="getStatusBadge(c.estado).cls"
                >
                  <component :is="getStatusBadge(c.estado).icon" class="size-3" />
                  {{ getStatusBadge(c.estado).label }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Estado Vacío -->
      <div
        v-if="comprasFiltradas.length === 0"
        class="p-10 text-center space-y-2 text-muted"
      >
        <Receipt class="size-8 mx-auto text-muted/60" />
        <p class="text-sm font-semibold text-fg">No se encontraron ventas registradas</p>
        <p class="text-xs">Ajusta los filtros o realiza compras de prueba en la tienda.</p>
      </div>
    </div>
  </div>
</template>
