<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { 
  AlertCircle, 
  CheckCircle2, 
  ChevronDown, 
  Clock, 
  CreditCard, 
  Package, 
  Receipt 
} from '@lucide/vue'
import type { Compra } from '@/types'
import { formatDate, formatPrice } from '@/composables/useFormat'

const props = defineProps<{
  compras: Compra[]
}>()

const expandedOrders = ref<Record<number, boolean>>({})

function toggleOrder(id: number) {
  expandedOrders.value[id] = !expandedOrders.value[id]
}

function getStatusBadge(estado: Compra['estado']) {
  switch (estado) {
    case 'PAGADA':
      return { label: 'PAGADA', cls: 'bg-success/15 text-success border-success/30', icon: CheckCircle2 }
    case 'PENDIENTE':
      return { label: 'PENDIENTE', cls: 'bg-warning/20 text-warning border-warning/40', icon: Clock }
    case 'RECHAZADA':
      return { label: 'RECHAZADA', cls: 'bg-danger/15 text-danger border-danger/30', icon: AlertCircle }
    default:
      return { label: estado, cls: 'bg-surface-2 text-muted border-line', icon: Clock }
  }
}
</script>

<template>
  <div class="space-y-4">
    <div
      v-for="compra in compras"
      :key="compra.id"
      class="card overflow-hidden border border-line transition-all duration-200 hover:border-line/80"
    >
      <!-- Cabecera de la Orden -->
      <div
        class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 cursor-pointer bg-surface/50 hover:bg-surface-2/40 transition-colors"
        @click="toggleOrder(compra.id)"
      >
        <div class="flex items-center gap-3.5">
          <div class="grid size-11 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
            <Receipt class="size-5" aria-hidden="true" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-fg text-sm">#{{ compra.id }}</span>
              <span
                class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                :class="getStatusBadge(compra.estado).cls"
              >
                <component :is="getStatusBadge(compra.estado).icon" class="size-3" aria-hidden="true" />
                {{ getStatusBadge(compra.estado).label }}
              </span>
            </div>
            <p class="mt-0.5 text-xs text-muted">
              {{ formatDate(compra.fecha) }}
              <span v-if="compra.fechaPago" class="text-success ml-1">· Pagado el {{ formatDate(compra.fechaPago) }}</span>
            </p>
          </div>
        </div>

        <div class="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-line/60 pt-3 sm:pt-0">
          <div class="text-left sm:text-right">
            <span class="block text-[11px] text-muted">Total pedido</span>
            <span class="font-display text-base font-extrabold text-fg">
              {{ formatPrice(compra.total) }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="text-xs text-brand-300 font-semibold hidden sm:inline"
              :aria-expanded="!!expandedOrders[compra.id]"
            >
              {{ expandedOrders[compra.id] ? 'Ocultar detalle' : 'Ver detalle' }}
            </button>
            <ChevronDown
              class="size-5 text-muted transition-transform duration-200"
              :class="{ 'rotate-180 text-brand-300': expandedOrders[compra.id] }"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      <!-- Detalle Desplegable de Productos -->
      <div
        v-if="expandedOrders[compra.id]"
        class="border-t border-line/60 bg-surface-2/30 p-5 space-y-3"
      >
        <h4 class="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
          <Package class="size-3.5" aria-hidden="true" />
          Productos adquiridos en este pedido
        </h4>

        <div class="divide-y divide-line/40 rounded-xl border border-line bg-surface p-3 text-xs">
          <div
            v-for="det in compra.detalles"
            :key="det.id"
            class="py-2.5 flex items-center justify-between first:pt-1 last:pb-1"
          >
            <div>
              <p class="font-bold text-fg">
                {{ det.producto?.nombre || `Producto #${det.productoId}` }}
              </p>
              <p class="text-muted text-[11px]">
                {{ det.cantidad }} unidad(es) x {{ formatPrice(det.precioUnitario) }}
              </p>
            </div>
            <span class="font-mono font-bold text-fg text-xs">
              {{ formatPrice(det.subtotal) }}
            </span>
          </div>
        </div>

        <!-- Acciones según estado -->
        <div class="flex items-center justify-between pt-2">
          <span class="text-xs text-muted">
            {{ compra.detalles.length }} ítem(s) en la transacción
          </span>

          <RouterLink
            v-if="compra.estado === 'PENDIENTE'"
            to="/checkout"
            class="btn-primary text-xs py-1.5 px-3"
          >
            <CreditCard class="size-3.5" aria-hidden="true" />
            <span>Completar pago pendiente</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
