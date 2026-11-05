<script setup lang="ts">
import { computed } from 'vue'
import { Wifi } from '@lucide/vue'
import type { MarcaTarjeta } from '@/types'

const props = defineProps<{
  brand: MarcaTarjeta
  displayNumero: string
  displayNombre: string
  displayExpiracion: string
  displayCvv: string
  isFlipped: boolean
}>()

// Esquema de colores según marca
const cardTheme = computed(() => {
  switch (props.brand) {
    case 'visa':
      return {
        bg: 'from-blue-900 via-indigo-900 to-slate-950',
        border: 'border-blue-400/40',
        accent: 'text-amber-400',
        logoText: 'VISA',
      }
    case 'mastercard':
      return {
        bg: 'from-zinc-950 via-stone-900 to-neutral-950',
        border: 'border-orange-500/40',
        accent: 'text-orange-400',
        logoText: 'Mastercard',
      }
    case 'amex':
      return {
        bg: 'from-teal-950 via-cyan-950 to-slate-950',
        border: 'border-cyan-400/40',
        accent: 'text-cyan-300',
        logoText: 'AMEX',
      }
    default:
      return {
        bg: 'from-brand-900 via-purple-950 to-slate-950',
        border: 'border-brand-400/30',
        accent: 'text-brand-300',
        logoText: 'StreamCard',
      }
  }
})
</script>

<template>
  <div class="card-3d-wrapper mx-auto w-full max-w-[380px] sm:max-w-[420px]" aria-hidden="true">
    <div
      class="card-3d-inner relative h-[215px] sm:h-[235px] w-full rounded-2xl transition-transform duration-700 ease-out"
      :class="{ 'card-flipped': isFlipped }"
    >
      <!-- ================= CARA FRONTAL ================= -->
      <div
        class="card-face card-front absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl border p-6 shadow-2xl bg-gradient-to-br"
        :class="[cardTheme.bg, cardTheme.border]"
      >
        <!-- Reflejo decorativo de brillo sutil -->
        <div class="pointer-events-none absolute -right-20 -top-20 size-48 rounded-full bg-white/10 blur-2xl" />

        <!-- Encabezado de la tarjeta (Chip + Contactless + Marca) -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <!-- Chip metálico -->
            <div class="h-9 w-12 rounded-md bg-gradient-to-tr from-amber-300 via-yellow-200 to-amber-400 p-1 shadow-inner border border-amber-500/40">
              <div class="h-full w-full rounded border border-amber-600/30 grid grid-cols-2 gap-0.5 opacity-70" />
            </div>
            <!-- Ícono Contactless -->
            <Wifi class="size-5 rotate-90 text-white/70" />
          </div>

          <!-- Logo de la marca -->
          <div class="text-right">
            <template v-if="brand === 'mastercard'">
              <div class="flex items-center -space-x-3">
                <div class="size-8 rounded-full bg-red-600/90 shadow-sm" />
                <div class="size-8 rounded-full bg-amber-500/90 mix-blend-screen shadow-sm" />
              </div>
            </template>
            <template v-else-if="brand === 'visa'">
              <span class="font-display text-2xl font-black italic tracking-wider text-white">
                VISA
              </span>
            </template>
            <template v-else-if="brand === 'amex'">
              <div class="rounded bg-cyan-700 px-2 py-0.5 text-xs font-black uppercase tracking-tighter text-white">
                AMERICAN EXPRESS
              </div>
            </template>
            <template v-else>
              <span class="font-display text-sm font-bold tracking-wider text-white/80">
                StreamStore
              </span>
            </template>
          </div>
        </div>

        <!-- Número de la tarjeta (enmascarado progresivo en monospace) -->
        <div class="my-auto py-2">
          <p class="font-mono text-lg sm:text-xl font-bold tracking-[0.18em] text-white drop-shadow-md select-none">
            {{ displayNumero }}
          </p>
        </div>

        <!-- Pie de la tarjeta: Titular y Expiración -->
        <div class="flex items-end justify-between">
          <div class="min-w-0 max-w-[65%]">
            <span class="block text-[10px] font-semibold uppercase tracking-wider text-white/60">
              Titular
            </span>
            <p class="truncate font-mono text-xs sm:text-sm font-semibold tracking-wider text-white drop-shadow">
              {{ displayNombre }}
            </p>
          </div>

          <div class="text-right">
            <span class="block text-[10px] font-semibold uppercase tracking-wider text-white/60">
              Expira
            </span>
            <p class="font-mono text-xs sm:text-sm font-semibold tracking-wider text-white drop-shadow">
              {{ displayExpiracion }}
            </p>
          </div>
        </div>
      </div>

      <!-- ================= CARA TRASERA ================= -->
      <div
        class="card-face card-back absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl border py-6 shadow-2xl bg-gradient-to-br"
        :class="[cardTheme.bg, cardTheme.border]"
      >
        <!-- Banda magnética superior -->
        <div class="h-11 w-full bg-black/90 shadow-inner mt-1" />

        <!-- Panel de firma y CVV -->
        <div class="px-6 my-auto">
          <div class="flex items-center">
            <!-- Área de firma con líneas de seguridad -->
            <div class="h-9 flex-1 bg-neutral-200/90 rounded-l flex items-center px-3 overflow-hidden">
              <span class="font-mono text-[10px] text-neutral-500 italic select-none">
                firma autorizada · prueba simulada
              </span>
            </div>

            <!-- Recuadro del CVV -->
            <div class="h-9 w-14 bg-white rounded-r flex items-center justify-center font-mono text-xs font-bold text-neutral-900 border-l border-neutral-300">
              {{ displayCvv }}
            </div>
          </div>
          <span class="mt-1 block text-right text-[10px] uppercase font-semibold text-white/60 pr-1">
            CVV / CVC
          </span>
        </div>

        <!-- Pie de la cara trasera con advertencia de demostración -->
        <div class="px-6 text-[9px] leading-tight text-white/50 text-center">
          Esta tarjeta es una representación 3D de demostración. No almacena ni procesa fondos reales.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-3d-wrapper {
  perspective: 1000px;
}

.card-3d-inner {
  transform-style: preserve-3d;
}

.card-flipped {
  transform: rotateY(180deg);
}

.card-face {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.card-back {
  transform: rotateY(180deg);
}

@media (prefers-reduced-motion: reduce) {
  .card-3d-inner {
    transition: none !important;
  }
}
</style>
