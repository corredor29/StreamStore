<script setup lang="ts">
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Receipt 
} from '@lucide/vue'
import type { Compra } from '@/types'
import { formatDate, formatPrice } from '@/composables/useFormat'

defineProps<{
  compras: Compra[]
}>()

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
  <div class="card overflow-hidden border border-line">
    <div class="p-4 border-b border-line flex items-center justify-between">
      <h3 class="font-display text-sm font-bold text-fg flex items-center gap-2">
        <Receipt class="size-4 text-brand-300" />
        Registro Global de Transacciones
      </h3>
      <span class="text-xs text-muted">{{ compras.length }} órdenes registradas</span>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="border-b border-line bg-surface-2/60 text-muted uppercase tracking-wider font-semibold">
          <tr>
            <th class="p-3.5">ID Orden</th>
            <th class="p-3.5">Fecha</th>
            <th class="p-3.5">Productos</th>
            <th class="p-3.5 text-right">Total</th>
            <th class="p-3.5 text-center">Estado</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-line/60">
          <tr
            v-for="c in compras"
            :key="c.id"
            class="hover:bg-surface-2/30 transition-colors"
          >
            <td class="p-3.5 font-mono font-bold text-fg">#{{ c.id }}</td>
            <td class="p-3.5 text-muted">{{ formatDate(c.fecha) }}</td>
            <td class="p-3.5 text-fg">
              <span v-for="(det, i) in c.detalles" :key="det.id">
                {{ det.producto?.nombre || `Prod #${det.productoId}` }} (x{{ det.cantidad }}){{ i < c.detalles.length - 1 ? ', ' : '' }}
              </span>
            </td>
            <td class="p-3.5 font-mono font-bold text-fg text-right">
              {{ formatPrice(c.total) }}
            </td>
            <td class="p-3.5 text-center">
              <span
                class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
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
  </div>
</template>
