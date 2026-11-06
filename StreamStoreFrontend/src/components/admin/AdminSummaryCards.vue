<script setup lang="ts">
import { computed } from 'vue'
import { 
  ArrowUpRight, 
  CheckCircle2, 
  Coins, 
  Flame, 
  Layers, 
  ShieldCheck, 
  TrendingUp, 
  Tv, 
  Users 
} from '@lucide/vue'
import type { ResumenAdmin } from '@/types'
import { formatPrice } from '@/composables/useFormat'

const props = defineProps<{
  resumen: ResumenAdmin
}>()

const totalPantallasAprox = computed(() => {
  return props.resumen.pantallasDisponibles + (props.resumen.serviciosActivos || 0)
})

const porcentajeOcupacion = computed(() => {
  if (totalPantallasAprox.value === 0) return 0
  const ocupadas = props.resumen.serviciosActivos || 0
  return Math.min(100, Math.round((ocupadas / totalPantallasAprox.value) * 100))
})
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- 1. FACTURACIÓN Y VENTAS -->
    <div class="rounded-xl border border-line/70 bg-[#101628] p-4.5 flex flex-col justify-between shadow-sm">
      <div class="flex items-center justify-between text-xs text-muted">
        <span class="font-bold text-fg/80 uppercase tracking-wider text-[11px]">Facturación en Línea</span>
        <span class="rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold px-1.5 py-0.2">
          COP
        </span>
      </div>

      <div class="mt-3">
        <div class="flex items-baseline gap-2">
          <p class="font-display text-2xl font-black text-white tracking-tight">
            {{ formatPrice(resumen.ventasHoy) }}
          </p>
          <span class="text-[11px] font-bold text-emerald-400 flex items-center">
            <ArrowUpRight class="size-3" /> Hoy
          </span>
        </div>
        <p class="text-xs text-muted mt-1 flex items-center justify-between">
          <span>Acumulado del mes:</span>
          <strong class="font-mono text-fg font-semibold">{{ formatPrice(resumen.ventasMes) }}</strong>
        </p>
      </div>

      <div class="mt-3 pt-2.5 border-t border-line/50 flex items-center justify-between text-[11px] text-muted">
        <span class="flex items-center gap-1 text-emerald-400 font-medium">
          <TrendingUp class="size-3" /> Operando normal
        </span>
        <span class="font-mono text-[10px] text-muted">Pasarelas activas</span>
      </div>
    </div>

    <!-- 2. CAPACIDAD DE PANTALLAS -->
    <div class="rounded-xl border border-line/70 bg-[#101628] p-4.5 flex flex-col justify-between shadow-sm">
      <div class="flex items-center justify-between text-xs text-muted">
        <span class="font-bold text-fg/80 uppercase tracking-wider text-[11px]">Pantallas Libres</span>
        <span class="rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono font-bold px-1.5 py-0.2">
          Stock
        </span>
      </div>

      <div class="mt-3">
        <div class="flex items-baseline gap-2">
          <p class="font-display text-2xl font-black text-white tracking-tight">
            {{ resumen.pantallasDisponibles }}
          </p>
          <span class="text-xs font-semibold text-amber-400">perfiles listos</span>
        </div>

        <div class="mt-2 space-y-1">
          <div class="flex items-center justify-between text-[11px] text-muted">
            <span>Ocupación:</span>
            <span class="font-mono font-bold text-fg">{{ porcentajeOcupacion }}% asignado</span>
          </div>
          <div class="h-1.5 w-full rounded-full bg-surface-2 overflow-hidden">
            <div
              class="h-full rounded-full bg-amber-500 transition-all duration-300"
              :style="{ width: `${Math.max(8, porcentajeOcupacion)}%` }"
            />
          </div>
        </div>
      </div>

      <div class="mt-3 pt-2.5 border-t border-line/50 flex items-center justify-between text-[11px] text-muted">
        <span>Disponibilidad:</span>
        <span class="font-mono text-emerald-400 font-bold">Entrega Inmediata</span>
      </div>
    </div>

    <!-- 3. CUENTAS MAESTRAS -->
    <div class="rounded-xl border border-line/70 bg-[#101628] p-4.5 flex flex-col justify-between shadow-sm">
      <div class="flex items-center justify-between text-xs text-muted">
        <span class="font-bold text-fg/80 uppercase tracking-wider text-[11px]">Cuentas Maestras</span>
        <span class="rounded bg-brand-500/10 border border-brand-500/20 text-brand-300 text-[10px] font-mono font-bold px-1.5 py-0.2">
          Matriz
        </span>
      </div>

      <div class="mt-3">
        <div class="flex items-baseline gap-2">
          <p class="font-display text-2xl font-black text-white tracking-tight">
            {{ resumen.totalCuentas }}
          </p>
          <span class="text-xs text-muted">cuentas registradas</span>
        </div>
        <p class="text-xs text-muted mt-1 flex items-center justify-between">
          <span>100% Libres:</span>
          <strong class="font-mono text-emerald-400 font-bold">{{ resumen.cuentasDisponibles }} cuentas</strong>
        </p>
      </div>

      <div class="mt-3 pt-2.5 border-t border-line/50 flex items-center justify-between text-[11px] text-muted">
        <span class="flex items-center gap-1 text-fg font-medium">
          <CheckCircle2 class="size-3 text-emerald-400" /> Sincronizado MySQL
        </span>
        <span class="font-mono text-[10px]">Multi-perfil</span>
      </div>
    </div>

    <!-- 4. CLIENTES ACTIVOS -->
    <div class="rounded-xl border border-line/70 bg-[#101628] p-4.5 flex flex-col justify-between shadow-sm">
      <div class="flex items-center justify-between text-xs text-muted">
        <span class="font-bold text-fg/80 uppercase tracking-wider text-[11px]">Suscripciones Activas</span>
        <span class="rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold px-1.5 py-0.2">
          En Vivo
        </span>
      </div>

      <div class="mt-3">
        <div class="flex items-baseline gap-2">
          <p class="font-display text-2xl font-black text-white tracking-tight">
            {{ resumen.serviciosActivos }}
          </p>
          <span class="text-xs text-cyan-300 font-semibold">clientes activos</span>
        </div>
        <p class="text-xs text-muted mt-1 flex items-center justify-between">
          <span>Vencimientos hoy:</span>
          <strong class="font-mono text-fg font-semibold">0 alertas</strong>
        </p>
      </div>

      <div class="mt-3 pt-2.5 border-t border-line/50 flex items-center justify-between text-[11px] text-muted">
        <span class="text-cyan-300 font-medium">Monitoreo 24/7</span>
        <span class="font-mono text-[10px] text-emerald-400">Cron OK</span>
      </div>
    </div>
  </div>
</template>
