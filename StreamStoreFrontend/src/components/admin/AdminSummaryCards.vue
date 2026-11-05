<script setup lang="ts">
import { 
  BadgeDollarSign, 
  CheckCircle2, 
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
  <div class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
    <!-- Ventas Hoy -->
    <div class="card p-4 flex flex-col justify-between border-l-4 border-l-emerald-500">
      <div class="flex items-center justify-between text-muted text-xs">
        <span class="font-semibold uppercase tracking-wider">Ventas Hoy</span>
        <BadgeDollarSign class="size-4 text-emerald-400" />
      </div>
      <p class="mt-2 font-display text-xl sm:text-2xl font-black text-fg">
        {{ formatPrice(resumen.ventasHoy) }}
      </p>
      <span class="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
        <TrendingUp class="size-3" /> Facturación hoy
      </span>
    </div>

    <!-- Ventas Mes -->
    <div class="card p-4 flex flex-col justify-between border-l-4 border-l-brand-400">
      <div class="flex items-center justify-between text-muted text-xs">
        <span class="font-semibold uppercase tracking-wider">Ventas Mes</span>
        <TrendingUp class="size-4 text-brand-300" />
      </div>
      <p class="mt-2 font-display text-xl sm:text-2xl font-black text-fg">
        {{ formatPrice(resumen.ventasMes) }}
      </p>
      <span class="text-[11px] text-muted mt-1">Mes en curso</span>
    </div>

    <!-- Total Cuentas -->
    <div class="card p-4 flex flex-col justify-between border-l-4 border-l-blue-500">
      <div class="flex items-center justify-between text-muted text-xs">
        <span class="font-semibold uppercase tracking-wider">Total Cuentas</span>
        <Layers class="size-4 text-blue-400" />
      </div>
      <p class="mt-2 font-display text-xl sm:text-2xl font-black text-fg">
        {{ resumen.totalCuentas }}
      </p>
      <span class="text-[11px] text-muted mt-1">Registradas en sistema</span>
    </div>

    <!-- Cuentas Disponibles -->
    <div class="card p-4 flex flex-col justify-between border-l-4 border-l-success">
      <div class="flex items-center justify-between text-muted text-xs">
        <span class="font-semibold uppercase tracking-wider">Cuentas Libres</span>
        <CheckCircle2 class="size-4 text-success" />
      </div>
      <p class="mt-2 font-display text-xl sm:text-2xl font-black text-fg">
        {{ resumen.cuentasDisponibles }}
      </p>
      <span class="text-[11px] text-success mt-1">Stock completo listo</span>
    </div>

    <!-- Pantallas Disponibles -->
    <div class="card p-4 flex flex-col justify-between border-l-4 border-l-amber-500">
      <div class="flex items-center justify-between text-muted text-xs">
        <span class="font-semibold uppercase tracking-wider">Pantallas Libres</span>
        <Tv class="size-4 text-amber-400" />
      </div>
      <p class="mt-2 font-display text-xl sm:text-2xl font-black text-fg">
        {{ resumen.pantallasDisponibles }}
      </p>
      <span class="text-[11px] text-muted mt-1">Perfiles sin asignar</span>
    </div>

    <!-- Servicios Activos -->
    <div class="card p-4 flex flex-col justify-between border-l-4 border-l-purple-500">
      <div class="flex items-center justify-between text-muted text-xs">
        <span class="font-semibold uppercase tracking-wider">Clientes Activos</span>
        <Users class="size-4 text-purple-400" />
      </div>
      <p class="mt-2 font-display text-xl sm:text-2xl font-black text-fg">
        {{ resumen.serviciosActivos }}
      </p>
      <span class="text-[11px] text-muted mt-1">Suscripciones vigentes</span>
    </div>
  </div>
</template>
