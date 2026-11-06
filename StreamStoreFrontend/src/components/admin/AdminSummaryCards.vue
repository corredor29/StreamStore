<script setup lang="ts">
import { 
  Coins, 
  Layers, 
  Tv, 
  Users 
} from '@lucide/vue'
import type { ResumenAdmin } from '@/types'
import { formatPrice } from '@/composables/useFormat'

defineProps<{
  resumen: ResumenAdmin
}>()
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
    <!-- 1. Facturación del Mes -->
    <div class="rounded-xl border border-white/10 bg-[#0E1322] p-4 flex items-center justify-between shadow-sm">
      <div class="space-y-1">
        <span class="text-xs font-semibold text-slate-400 block">Facturación del Mes</span>
        <p class="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
          {{ formatPrice(resumen.ventasMes) }}
        </p>
        <span class="text-[11px] font-mono text-emerald-400 font-semibold block">
          Hoy: {{ formatPrice(resumen.ventasHoy) }}
        </span>
      </div>
      <div class="size-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
        <Coins class="size-5" />
      </div>
    </div>

    <!-- 2. Pantallas Libres -->
    <div class="rounded-xl border border-white/10 bg-[#0E1322] p-4 flex items-center justify-between shadow-sm">
      <div class="space-y-1">
        <span class="text-xs font-semibold text-slate-400 block">Pantallas Disponibles</span>
        <p class="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
          {{ resumen.pantallasDisponibles }}
        </p>
        <span class="text-[11px] text-amber-400 font-semibold block">
          Perfiles listos para entrega
        </span>
      </div>
      <div class="size-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
        <Tv class="size-5" />
      </div>
    </div>

    <!-- 3. Cuentas en Inventario -->
    <div class="rounded-xl border border-white/10 bg-[#0E1322] p-4 flex items-center justify-between shadow-sm">
      <div class="space-y-1">
        <span class="text-xs font-semibold text-slate-400 block">Cuentas Maestras</span>
        <p class="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
          {{ resumen.totalCuentas }}
        </p>
        <span class="text-[11px] text-cyan-400 font-semibold block">
          {{ resumen.cuentasDisponibles }} en stock disponible
        </span>
      </div>
      <div class="size-11 rounded-xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 flex items-center justify-center shrink-0">
        <Layers class="size-5" />
      </div>
    </div>

    <!-- 4. Clientes y Suscripciones -->
    <div class="rounded-xl border border-white/10 bg-[#0E1322] p-4 flex items-center justify-between shadow-sm">
      <div class="space-y-1">
        <span class="text-xs font-semibold text-slate-400 block">Clientes Activos</span>
        <p class="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
          {{ resumen.serviciosActivos }}
        </p>
        <span class="text-[11px] text-purple-300 font-semibold block">
          Suscripciones vigentes
        </span>
      </div>
      <div class="size-11 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
        <Users class="size-5" />
      </div>
    </div>
  </div>
</template>
