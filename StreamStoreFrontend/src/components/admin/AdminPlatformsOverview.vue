<script setup lang="ts">
import { computed } from 'vue'
import { 
  AlertTriangle, 
  CheckCircle2, 
  Film, 
  Plus, 
  XCircle 
} from '@lucide/vue'
import type { CuentaAdmin, Plataforma } from '@/types'

const props = defineProps<{
  plataformas: Plataforma[]
  cuentas: CuentaAdmin[]
}>()

const emit = defineEmits<{
  cargarCuenta: [plataforma?: Plataforma]
}>()

const statsPorPlataforma = computed(() => {
  return props.plataformas.map((plat) => {
    const cuentasPlat = props.cuentas.filter(
      (c) => c.plataforma?.slug === plat.slug || c.plataformaId === plat.id || c.plataforma?.nombre === plat.nombre
    )
    const totalCuentas = cuentasPlat.length
    const totalPantallas = cuentasPlat.reduce((acc, c) => acc + c.totalPantallas, 0)
    const pantallasLibres = cuentasPlat.reduce((acc, c) => acc + c.pantallasDisponibles, 0)

    let estadoStock: 'OPTIMO' | 'BAJO' | 'AGOTADO' = 'OPTIMO'
    if (pantallasLibres === 0) estadoStock = 'AGOTADO'
    else if (pantallasLibres <= 2) estadoStock = 'BAJO'

    return {
      plat,
      totalCuentas,
      totalPantallas,
      pantallasLibres,
      estadoStock,
    }
  })
})
</script>

<template>
  <div class="space-y-4">
    <!-- Encabezado de Catálogo -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-line/70 bg-surface/60">
      <div>
        <h3 class="font-display text-sm font-bold text-fg flex items-center gap-2">
          <Film class="size-4 text-brand-300" />
          Disponibilidad por Plataforma de Streaming
        </h3>
        <p class="text-xs text-muted mt-0.5">
          Monitorea el inventario por servicio y abastece cuentas maestras según la demanda.
        </p>
      </div>

      <button
        type="button"
        class="btn-primary text-xs py-2 px-3.5 self-start sm:self-auto cursor-pointer"
        @click="emit('cargarCuenta')"
      >
        <Plus class="size-3.5" />
        <span>Nueva Plataforma / Cuenta</span>
      </button>
    </div>

    <!-- Cuadrícula de Tarjetas de Plataforma -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="item in statsPorPlataforma"
        :key="item.plat.id"
        class="rounded-2xl border border-line/70 bg-[#12172D] overflow-hidden flex flex-col justify-between hover:border-brand-500/40 transition-all hover:shadow-lg hover:shadow-brand-500/5 group"
      >
        <!-- Portada o Banner de la Plataforma -->
        <div class="relative h-28 bg-surface-2 overflow-hidden border-b border-line/50">
          <img
            v-if="item.plat.coverUrl"
            :src="item.plat.coverUrl"
            :alt="item.plat.nombre"
            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center font-display font-black text-2xl text-white/30"
            :style="{ backgroundColor: item.plat.color || '#8057FF' }"
          >
            {{ item.plat.nombre }}
          </div>

          <!-- Badge de Estado de Stock Flotante -->
          <div class="absolute top-2.5 right-2.5">
            <span
              v-if="item.estadoStock === 'OPTIMO'"
              class="inline-flex items-center gap-1 rounded-full bg-emerald-950/80 backdrop-blur border border-emerald-500/40 text-emerald-300 px-2.5 py-0.5 text-[10px] font-bold"
            >
              <CheckCircle2 class="size-3" /> En Stock
            </span>
            <span
              v-else-if="item.estadoStock === 'BAJO'"
              class="inline-flex items-center gap-1 rounded-full bg-amber-950/80 backdrop-blur border border-amber-500/40 text-amber-300 px-2.5 py-0.5 text-[10px] font-bold"
            >
              <AlertTriangle class="size-3" /> Stock Bajo
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1 rounded-full bg-red-950/80 backdrop-blur border border-red-500/40 text-red-300 px-2.5 py-0.5 text-[10px] font-bold"
            >
              <XCircle class="size-3" /> Agotado
            </span>
          </div>
        </div>

        <!-- Cuerpo con Métricas -->
        <div class="p-4 space-y-3 flex-1 flex flex-col justify-between">
          <div>
            <h4 class="font-display font-black text-fg text-base">
              {{ item.plat.nombre }}
            </h4>
            <p class="text-xs text-muted mt-0.5">
              {{ item.totalCuentas }} cuentas maestras activas
            </p>

            <!-- Ocupación de Pantallas -->
            <div class="mt-3 space-y-1">
              <div class="flex items-center justify-between text-xs">
                <span class="text-muted">Pantallas libres:</span>
                <span class="font-mono font-bold text-fg">
                  {{ item.pantallasLibres }} / {{ item.totalPantallas }}
                </span>
              </div>
              <div class="h-1.5 w-full rounded-full bg-surface-2 overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-300"
                  :class="[
                    item.pantallasLibres === 0 ? 'bg-red-500' :
                    item.pantallasLibres <= 2 ? 'bg-amber-500' : 'bg-emerald-500'
                  ]"
                  :style="{ width: item.totalPantallas > 0 ? `${(item.pantallasLibres / item.totalPantallas) * 100}%` : '0%' }"
                />
              </div>
            </div>
          </div>

          <!-- Botón Cargar Stock Rápido -->
          <div class="pt-2 border-t border-line/60">
            <button
              type="button"
              class="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-line bg-surface-2 hover:border-brand-400 hover:bg-brand-500/10 text-xs font-bold text-fg hover:text-brand-300 py-2 transition-colors cursor-pointer"
              @click="emit('cargarCuenta', item.plat)"
            >
              <Plus class="size-3.5" />
              <span>Abastecer {{ item.plat.nombre }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
