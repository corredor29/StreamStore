<script setup lang="ts">
import { 
  ArrowUpRight,
  Coins, 
  Layers, 
  TrendingUp,
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
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- 1. Facturación del Mes -->
    <div class="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#131A2E] via-[#0E1322] to-[#0A0D18] p-5 shadow-xl shadow-black/40 hover:border-emerald-500/40 hover:shadow-emerald-500/10 transition-all duration-300 group">
      <!-- Acento de brillo superior -->
      <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/60 via-teal-400 to-emerald-500/0 opacity-80" />

      <div class="flex items-start justify-between">
        <div class="space-y-1">
          <span class="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-400 block">
            Facturación del Mes
          </span>
          <p class="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {{ formatPrice(resumen.ventasMes) }}
          </p>
        </div>

        <div class="size-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
          <Coins class="size-5" />
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
        <span class="text-slate-400">Hoy acumulado:</span>
        <span class="font-mono text-emerald-400 font-bold flex items-center gap-1">
          <ArrowUpRight class="size-3" />
          {{ formatPrice(resumen.ventasHoy) }}
        </span>
      </div>
    </div>

    <!-- 2. Pantallas Libres -->
    <div class="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#131A2E] via-[#0E1322] to-[#0A0D18] p-5 shadow-xl shadow-black/40 hover:border-amber-500/40 hover:shadow-amber-500/10 transition-all duration-300 group">
      <!-- Acento de brillo superior -->
      <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500/60 via-orange-400 to-amber-500/0 opacity-80" />

      <div class="flex items-start justify-between">
        <div class="space-y-1">
          <span class="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-400 block">
            Pantallas Disponibles
          </span>
          <p class="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {{ resumen.pantallasDisponibles }}
          </p>
        </div>

        <div class="size-11 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
          <Tv class="size-5" />
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
        <span class="text-slate-400">Estado de stock:</span>
        <span class="text-amber-400 font-semibold flex items-center gap-1.5">
          <span class="size-1.5 rounded-full bg-amber-400 animate-pulse" />
          Listas para entrega
        </span>
      </div>
    </div>

    <!-- 3. Cuentas en Inventario -->
    <div class="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#131A2E] via-[#0E1322] to-[#0A0D18] p-5 shadow-xl shadow-black/40 hover:border-cyan-500/40 hover:shadow-cyan-500/10 transition-all duration-300 group">
      <!-- Acento de brillo superior -->
      <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500/60 via-blue-400 to-cyan-500/0 opacity-80" />

      <div class="flex items-start justify-between">
        <div class="space-y-1">
          <span class="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-400 block">
            Cuentas Maestras
          </span>
          <p class="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {{ resumen.totalCuentas }}
          </p>
        </div>

        <div class="size-11 rounded-xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
          <Layers class="size-5" />
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
        <span class="text-slate-400">Totalmente libres:</span>
        <span class="font-mono text-cyan-300 font-bold">
          {{ resumen.cuentasDisponibles }} cuentas
        </span>
      </div>
    </div>

    <!-- 4. Clientes y Suscripciones -->
    <div class="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#131A2E] via-[#0E1322] to-[#0A0D18] p-5 shadow-xl shadow-black/40 hover:border-purple-500/40 hover:shadow-purple-500/10 transition-all duration-300 group">
      <!-- Acento de brillo superior -->
      <div class="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500/60 via-pink-400 to-purple-500/0 opacity-80" />

      <div class="flex items-start justify-between">
        <div class="space-y-1">
          <span class="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-400 block">
            Clientes Activos
          </span>
          <p class="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {{ resumen.serviciosActivos }}
          </p>
        </div>

        <div class="size-11 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
          <Users class="size-5" />
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
        <span class="text-slate-400">Suscripciones:</span>
        <span class="text-purple-300 font-semibold flex items-center gap-1.5">
          <span class="size-1.5 rounded-full bg-purple-400" />
          En streaming
        </span>
      </div>
    </div>
  </div>
</template>
