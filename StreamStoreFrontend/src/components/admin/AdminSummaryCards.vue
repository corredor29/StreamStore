<script setup lang="ts">
import { computed } from 'vue'
import type { ResumenAdmin } from '@/types'
import { formatPrice } from '@/composables/useFormat'

const props = defineProps<{
  resumen: ResumenAdmin
  pantallasTotales: number
  entregasPendientes: number
}>()

// Medidor segmentado: 12 celdas proporcionales a pantallas libres / totales
const SEGMENTOS = 12
const segmentosLibres = computed(() =>
  props.pantallasTotales > 0 ? Math.round((props.resumen.pantallasDisponibles / props.pantallasTotales) * SEGMENTOS) : 0,
)
const porcentajeHoy = computed(() =>
  props.resumen.ventasMes > 0 ? Math.min(100, Math.round((props.resumen.ventasHoy / props.resumen.ventasMes) * 100)) : 0,
)
const cuentasVendidas = computed(() => Math.max(0, props.resumen.totalCuentas - props.resumen.cuentasDisponibles))
</script>

<template>
  <section aria-label="Resumen" class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <!-- Ventas -->
    <div class="hud-panel p-5">
      <div class="flex items-center justify-between">
        <span class="hud-label">Ventas // mes</span>
        <span class="font-mono text-[11px] text-ad-ok">+{{ formatPrice(resumen.ventasHoy) }} hoy</span>
      </div>
      <p class="mt-3 font-hud text-[2rem] leading-none font-bold tracking-tight text-ad-text tabular-nums">
        {{ formatPrice(resumen.ventasMes) }}
      </p>
      <div class="mt-4 flex items-center gap-2">
        <div class="h-1 flex-1 bg-ad-hover">
          <div class="h-full bg-ad-accent" :style="{ width: `${porcentajeHoy}%` }" />
        </div>
        <span class="font-mono text-[10px] text-ad-faint">{{ porcentajeHoy }}% hoy</span>
      </div>
    </div>

    <!-- Pantallas -->
    <div class="hud-panel p-5">
      <div class="flex items-center justify-between">
        <span class="hud-label">Pantallas libres</span>
        <span
          class="inline-flex items-center gap-1.5 font-mono text-[11px]"
          :class="resumen.pantallasDisponibles === 0 ? 'text-ad-err' : resumen.pantallasDisponibles <= 3 ? 'text-ad-warn' : 'text-ad-ok'"
        >
          <span class="led" />{{ resumen.pantallasDisponibles === 0 ? 'Agotado' : resumen.pantallasDisponibles <= 3 ? 'Bajo' : 'Stock ok' }}
        </span>
      </div>
      <p class="mt-3 font-hud text-[2rem] leading-none font-bold tracking-tight text-ad-text tabular-nums">
        {{ String(resumen.pantallasDisponibles).padStart(2, '0') }}
        <span class="font-mono text-sm font-normal text-ad-faint">/ {{ pantallasTotales }}</span>
      </p>
      <div class="mt-4 flex gap-[3px]" role="img" :aria-label="`${resumen.pantallasDisponibles} de ${pantallasTotales} pantallas libres`">
        <span
          v-for="i in SEGMENTOS"
          :key="i"
          class="h-1.5 flex-1"
          :class="i <= segmentosLibres ? 'bg-ad-accent' : 'bg-ad-hover'"
        />
      </div>
    </div>

    <!-- Cuentas -->
    <div class="hud-panel p-5">
      <div class="flex items-center justify-between">
        <span class="hud-label">Cuentas maestras</span>
        <span class="font-mono text-[11px] text-ad-dim">{{ resumen.cuentasDisponibles }} sin vender</span>
      </div>
      <p class="mt-3 font-hud text-[2rem] leading-none font-bold tracking-tight text-ad-text tabular-nums">
        {{ String(resumen.totalCuentas).padStart(2, '0') }}
      </p>
      <div class="mt-4 flex items-center gap-4 font-mono text-[10px] text-ad-faint">
        <span class="inline-flex items-center gap-1.5"><span class="led text-ad-accent" /> {{ resumen.cuentasDisponibles }} libres</span>
        <span class="inline-flex items-center gap-1.5"><span class="led text-ad-faint" /> {{ cuentasVendidas }} vendidas</span>
      </div>
    </div>

    <!-- Suscripciones -->
    <div class="hud-panel p-5" :class="{ '!border-amber-400/40': entregasPendientes > 0 }">
      <div class="flex items-center justify-between">
        <span class="hud-label">Suscripciones</span>
        <span
          class="inline-flex items-center gap-1.5 font-mono text-[11px]"
          :class="entregasPendientes > 0 ? 'text-ad-warn' : 'text-ad-ok'"
        >
          <span class="led" />{{ entregasPendientes > 0 ? `${entregasPendientes} por entregar` : 'Todo entregado' }}
        </span>
      </div>
      <p class="mt-3 font-hud text-[2rem] leading-none font-bold tracking-tight text-ad-text tabular-nums">
        {{ String(resumen.serviciosActivos).padStart(2, '0') }}
      </p>
      <p class="mt-4 font-mono text-[10px] text-ad-faint">Clientes con acceso vigente</p>
    </div>
  </section>
</template>
