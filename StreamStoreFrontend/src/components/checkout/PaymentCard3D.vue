<script setup lang="ts">
import { computed } from 'vue'
import type { CardBankSkin, CardKind, MarcaTarjeta } from '@/types'

const props = withDefaults(
  defineProps<{
    brand: MarcaTarjeta
    bankSkin?: CardBankSkin
    cardKind?: CardKind
    displayNumero: string
    displayNombre: string
    displayExpiracion: string
    displayCvv: string
    isFlipped: boolean
  }>(),
  {
    bankSkin: 'generica',
    cardKind: 'debito',
  }
)

const emit = defineEmits<{
  toggleFlip: []
}>()

const ambientGlowClass = computed(() => {
  switch (props.bankSkin) {
    case 'generica':
      return 'bg-cyan-500/35'
    case 'nu':
      return 'bg-purple-600/40'
    case 'bancolombia':
      return 'bg-yellow-400/35'
    case 'bbva':
      return 'bg-blue-600/40'
    case 'streamstore':
    default:
      return 'bg-cyan-500/30'
  }
})

const cardContainerClasses = computed(() => {
  switch (props.bankSkin) {
    case 'generica':
      return 'border-cyan-400/30 text-white shadow-2xl'
    case 'nu':
      return 'border-purple-400/20 text-white shadow-2xl'
    case 'bancolombia':
      return 'border-black/15 text-neutral-900 shadow-2xl'
    case 'bbva':
      return 'border-blue-400/20 text-white shadow-2xl'
    case 'streamstore':
    default:
      return 'border-cyan-500/20 text-white shadow-2xl'
  }
})
</script>

<template>
  <div
    class="card-3d-wrapper relative mx-auto w-full max-w-[370px] sm:max-w-[400px] cursor-pointer select-none"
    aria-hidden="true"
    @click="emit('toggleFlip')"
  >
    <!-- Aura ambiental suave detrás del plástico -->
    <div
      class="pointer-events-none absolute -inset-3 rounded-3xl blur-2xl opacity-35 -z-10 transition-all duration-500"
      :class="ambientGlowClass"
    />

    <div
      class="card-3d-inner relative h-[215px] sm:h-[230px] w-full rounded-2xl transition-transform duration-700 ease-out"
      :class="{ 'card-flipped': isFlipped }"
    >
      <!-- ================= CARA FRONTAL ================= -->
      <div
        class="card-face card-front absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl border p-4 sm:p-5"
        :class="cardContainerClasses"
      >
        <!-- ================= 1. SKIN GENÉRICA (AUTO-DETECTA MARCA) ================= -->
        <template v-if="bankSkin === 'generica' || bankSkin === 'streamstore' || bankSkin === 'falabella'">
          <!-- Fondo titanio cepillado con resplandor cyan/violeta -->
          <div
            class="absolute inset-0"
            style="background: linear-gradient(135deg, #0a0f1d 0%, #151d30 50%, #0d1222 100%);"
          />
          <div class="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:14px_14px]" />
          <div class="pointer-events-none absolute -right-10 -top-10 size-44 rounded-full bg-cyan-500/20 blur-2xl" />
          <div class="pointer-events-none absolute -left-10 -bottom-10 size-44 rounded-full bg-purple-500/15 blur-2xl" />

          <!-- Brillo diagonal tipo plástico satinado -->
          <div
            class="pointer-events-none absolute inset-0 opacity-15"
            style="background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.6) 50%, transparent 55%);"
          />

          <div class="relative z-10 flex h-full flex-col justify-between text-white p-1">
            <!-- Fila Superior: Chip + Contactless a la izquierda, DÉBITO + Marca a la derecha -->
            <div class="flex items-center justify-between">
              <!-- Chip metálico dorado con circuito y ondas Contactless -->
              <div class="flex items-center gap-3">
                <div
                  class="relative w-10 h-7 rounded-[4px] border border-amber-300/40 shrink-0 overflow-hidden shadow-md"
                  style="background: linear-gradient(145deg, #f5df8e 0%, #d4aa2e 45%, #fcebb1 70%, #a37a07 100%);"
                >
                  <div class="absolute inset-[3px] border border-black/30 rounded-[2px]" />
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="w-full h-px bg-black/30" />
                  </div>
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="h-full w-px bg-black/30" />
                  </div>
                  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-2 rounded-full border border-black/30" />
                </div>

                <!-- Ondas Contactless ))) -->
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="text-cyan-300">
                  <path d="M8 8.5c2.2 1.8 2.2 5.2 0 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
                  <path d="M11 5.5c3.5 2.8 3.5 10.2 0 13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
                  <path d="M14 3c4.8 3.8 4.8 14.2 0 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
                </svg>
              </div>

              <!-- Indicador Débito y Logo Detectado (Visa, Mastercard, Amex o Universal) -->
              <div class="flex items-center gap-2.5">
                <span class="text-[9px] uppercase tracking-[0.18em] text-cyan-300 font-mono font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                  DÉBITO
                </span>

                <!-- Marca Detectada automáticamente -->
                <div class="h-7 flex items-center">
                  <!-- Visa -->
                  <span
                    v-if="brand === 'visa'"
                    class="font-black italic text-xl tracking-tighter text-white font-sans pr-1 drop-shadow"
                  >
                    VISA
                  </span>
                  <!-- Mastercard -->
                  <div v-else-if="brand === 'mastercard'" class="relative inline-block w-10 h-7">
                    <span class="absolute left-0 top-0 size-7 rounded-full bg-[#eb001b] shadow-sm" />
                    <span class="absolute right-0 top-0 size-7 rounded-full bg-[#f79e1b] mix-blend-screen shadow-sm" />
                  </div>
                  <!-- Amex -->
                  <span
                    v-else-if="brand === 'amex'"
                    class="px-2 py-0.5 rounded bg-blue-600 text-white font-black text-[10px] font-sans tracking-tight"
                  >
                    AMEX
                  </span>
                  <!-- Universal -->
                  <span
                    v-else
                    class="text-[9px] font-mono tracking-wider text-slate-300 uppercase border border-slate-600 bg-black/40 px-2 py-0.5 rounded"
                  >
                    UNIVERSAL
                  </span>
                </div>
              </div>
            </div>

            <!-- Centro: Número de Tarjeta prominente -->
            <div class="my-auto py-2">
              <p
                class="font-mono text-[14px] sm:text-[16px] font-black tracking-[0.16em] tabular-nums text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                style="letter-spacing: 0.16em;"
              >
                {{ displayNumero }}
              </p>
            </div>

            <!-- Fila Inferior: Titular y Expiración -->
            <div class="mt-auto flex justify-between items-end gap-2 pt-1 border-t border-white/10">
              <div class="min-w-0 flex-1">
                <span class="text-[7.5px] uppercase font-mono tracking-widest text-slate-400 block mb-0.5">TITULAR</span>
                <p class="text-[11px] sm:text-[12px] font-mono font-bold truncate uppercase text-white tracking-wider">
                  {{ displayNombre }}
                </p>
              </div>
              <div class="text-right shrink-0">
                <span class="text-[7.5px] uppercase font-mono tracking-widest text-slate-400 block mb-0.5">VENCE</span>
                <p class="text-[11px] sm:text-[12px] font-mono font-bold text-cyan-300 tracking-wider">
                  {{ displayExpiracion }}
                </p>
              </div>
            </div>
          </div>
        </template>

        <!-- ================= 2. SKIN NU BANK ================= -->
        <template v-else-if="bankSkin === 'nu'">
          <!-- Fondo púrpura mate oficial Nubank (#820AD1) -->
          <div
            class="absolute inset-0"
            style="background: linear-gradient(145deg, #8A05BE 0%, #820AD1 50%, #6D079D 100%);"
          />

          <!-- Relieve sutil circular en la esquina -->
          <div class="pointer-events-none absolute -right-8 -top-8 size-48 rounded-full bg-purple-400/20 blur-2xl" />

          <div class="relative z-10 flex h-full flex-col justify-between text-white p-1">
            <!-- Fila Superior: Débito + Contactless a la izquierda, Logo 'nu' a la derecha -->
            <div class="flex justify-between items-start">
              <div class="flex items-center gap-2.5">
                <!-- Chip EMV plateado oficial -->
                <div
                  class="relative w-10 h-7 rounded-[3px] border border-black/20 shrink-0 overflow-hidden shadow-sm"
                  style="background: linear-gradient(135deg, #e8ecef 0%, #c4cbd1 35%, #f1f4f7 65%, #a8b1b8 100%);"
                >
                  <div class="absolute inset-[2.5px] border border-slate-500/40 rounded-[2px]" />
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="w-full h-px bg-slate-500/40" />
                  </div>
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="h-full w-px bg-slate-500/40" />
                  </div>
                  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border border-slate-500/50" />
                </div>

                <!-- Ondas Contactless ))) -->
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="text-white">
                  <path d="M8 8.5c2.2 1.8 2.2 5.2 0 7" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" />
                  <path d="M11 5.5c3.5 2.8 3.5 10.2 0 13" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" />
                  <path d="M14 3c4.8 3.8 4.8 14.2 0 18" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" />
                </svg>

                <span class="text-[10px] font-sans lowercase text-white/90 font-medium tracking-tight ml-1">
                  débito
                </span>
              </div>

              <!-- Logotipo Nu oficial en blanco -->
              <span
                class="text-[34px] font-black lowercase text-white tracking-tighter leading-none select-none font-sans pr-1"
                style="font-family: system-ui, -apple-system, sans-serif; letter-spacing: -0.06em;"
              >
                nu
              </span>
            </div>

            <!-- Centro: Número de Tarjeta con asteriscos progresivos -->
            <div class="my-auto py-1">
              <p
                class="font-mono text-[14px] sm:text-[16px] font-black tracking-[0.15em] tabular-nums text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
              >
                {{ displayNumero }}
              </p>
            </div>

            <!-- Fila Inferior: Nombre del Titular a la izquierda, Fecha de Vencimiento y Logo Mastercard -->
            <div class="mt-auto flex justify-between items-end gap-2 pt-1 border-t border-purple-400/20">
              <div class="min-w-0 flex-1">
                <p class="text-[11px] sm:text-[12px] font-sans font-medium text-white tracking-wide truncate">
                  {{ displayNombre }}
                </p>
                <p class="text-[10px] font-mono text-purple-200/90 font-medium mt-0.5">
                  Válida hasta {{ displayExpiracion }}
                </p>
              </div>

              <!-- Logo Oficial Mastercard (Rojo #EB001B y Naranja #F79E1B) -->
              <div class="relative inline-block w-11 h-7 shrink-0 mr-1" aria-hidden="true">
                <span class="absolute left-0 top-0 size-7 rounded-full bg-[#eb001b] shadow-sm" />
                <span class="absolute right-0 top-0 size-7 rounded-full bg-[#f79e1b] mix-blend-screen shadow-sm" />
              </div>
            </div>
          </div>
        </template>

        <!-- ================= 3. SKIN BANCOLOMBIA ================= -->
        <template v-else-if="bankSkin === 'bancolombia'">
          <div class="absolute inset-0 bg-[#FFDD00]" />

          <!-- Muesca de accesibilidad táctil para personas con discapacidad visual en el borde derecho -->
          <div class="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-6 rounded-l-full bg-[#0a0c10] shadow-inner" />

          <!-- Cintas multicolores curvadas oficiales de Bancolombia -->
          <svg
            class="pointer-events-none absolute inset-0 h-full w-full opacity-90"
            viewBox="0 0 380 230"
            fill="none"
            aria-hidden="true"
          >
            <path d="M135 0 V80 C135 130 170 170 205 185" stroke="#00B594" stroke-width="16" stroke-linecap="round" />
            <path d="M135 45 C135 110 160 155 200 180" stroke="#7E3294" stroke-width="17" stroke-linecap="round" />
            <path d="M152 135 C170 165 200 185 220 185" stroke="#E289C3" stroke-width="13" stroke-linecap="round" />
            <path d="M80 160 C90 190 75 220 40 230" stroke="#FF8200" stroke-width="14" stroke-linecap="round" />
            <path d="M100 195 C95 215 80 230 60 230" stroke="#00A3E0" stroke-width="10" stroke-linecap="round" />
            <path d="M75 140 C85 170 60 200 30 205" stroke="#00B594" stroke-width="12" stroke-linecap="round" />
          </svg>

          <!-- Estructura Frontal Bancolombia con datos visibles -->
          <div class="relative z-10 flex h-full flex-col justify-between text-black">
            <!-- Fila Superior: 'débito' a la izquierda, chip + contactless, y logo Bancolombia a la derecha -->
            <div class="flex justify-between items-start">
              <div class="flex items-center gap-2.5">
                <span class="text-[11px] font-sans font-bold lowercase text-black tracking-tight">
                  débito
                </span>

                <!-- Chip EMV metálico exacto -->
                <div
                  class="relative w-10 h-7 rounded-[4px] border border-black/40 shrink-0 overflow-hidden shadow-sm"
                  style="background: linear-gradient(145deg, #d8dbdf 0%, #c4c8ce 35%, #eef0f3 65%, #a6abb3 100%);"
                  aria-hidden="true"
                >
                  <div class="absolute inset-0 flex items-center justify-center opacity-40">
                    <div class="w-full h-[1px] bg-black" />
                  </div>
                  <div class="absolute inset-[3px] border border-black/30 rounded-[2px] opacity-40" />
                  <div class="absolute left-1/2 top-0 bottom-0 w-[1px] bg-black opacity-30" />
                  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-2 rounded-full border border-black/40 opacity-40" />
                </div>

                <!-- Símbolo Contactless ))) en negro nítido -->
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M8 8.5c2.2 1.8 2.2 5.2 0 7" stroke="#000000" stroke-width="2.2" stroke-linecap="round" />
                  <path d="M11 5.5c3.5 2.8 3.5 10.2 0 13" stroke="#000000" stroke-width="2.2" stroke-linecap="round" />
                  <path d="M14 3c4.8 3.8 4.8 14.2 0 18" stroke="#000000" stroke-width="2.2" stroke-linecap="round" />
                </svg>
              </div>

              <!-- Logotipo Oficial Bancolombia: 3 barras horizontales + 'Ba' en negrita -->
              <div class="flex items-center gap-2 pr-1">
                <div class="flex flex-col gap-[3.5px] items-end" aria-hidden="true">
                  <span class="block w-5 h-[4px] bg-black rounded-sm" />
                  <span class="block w-7 h-[4px] bg-black rounded-sm" />
                  <span class="block w-9 h-[4px] bg-black rounded-sm" />
                </div>
                <span
                  class="text-[30px] font-black tracking-tighter text-black leading-none font-sans"
                  style="font-family: 'Space Grotesk', Arial, sans-serif;"
                >
                  Ba
                </span>
              </div>
            </div>

            <!-- Centro: Número de Tarjeta en negro prominente -->
            <div class="my-auto py-1">
              <p
                class="font-mono text-[14px] sm:text-[16px] font-black tracking-[0.16em] tabular-nums text-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]"
              >
                {{ displayNumero }}
              </p>
            </div>

            <!-- Fila Inferior: Titular a la izquierda, Válida hasta, y Mastercard a la derecha -->
            <div class="mt-auto flex justify-between items-end gap-2 pt-1 border-t border-black/10">
              <div class="min-w-0 flex-1">
                <p class="font-mono text-[11px] sm:text-[12px] font-black uppercase tracking-wider text-black truncate">
                  {{ displayNombre }}
                </p>
                <p class="font-mono text-[10px] font-bold text-black/80 mt-0.5">
                  VENCE {{ displayExpiracion }}
                </p>
              </div>

              <!-- Logo Oficial Mastercard (Rojo #EB001B y Naranja #F79E1B) -->
              <div class="relative inline-block w-11 h-7 shrink-0 mr-2" aria-hidden="true">
                <span class="absolute left-0 top-0 size-7 rounded-full bg-[#eb001b] shadow-sm" />
                <span class="absolute right-0 top-0 size-7 rounded-full bg-[#f79e1b] mix-blend-screen shadow-sm" />
              </div>
            </div>
          </div>
        </template>

        <!-- ================= 4. SKIN BBVA (AZUL AQUA) ================= -->
        <template v-else-if="bankSkin === 'bbva'">
          <!-- Fondo con polígonos geométricos azul marino facetado BBVA (como en la Imagen 1) -->
          <svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 340 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="bbvaBaseSvgGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#072B57" />
                <stop offset="50%" stop-color="#004481" />
                <stop offset="100%" stop-color="#051C36" />
              </linearGradient>
            </defs>
            <rect width="340" height="200" fill="url(#bbvaBaseSvgGrad)" />
            <polygon points="0,0 90,0 40,70" fill="#1464A5" opacity="0.6" />
            <polygon points="90,0 170,0 120,55" fill="#0D3B6E" opacity="0.75" />
            <polygon points="170,0 260,0 210,80" fill="#1A6FB0" opacity="0.5" />
            <polygon points="260,0 340,0 340,60 280,40" fill="#0B355F" opacity="0.85" />
            <polygon points="40,70 120,55 160,120 70,130" fill="#155A96" opacity="0.45" />
            <polygon points="120,55 210,80 230,140 160,120" fill="#0E4478" opacity="0.6" />
            <polygon points="210,80 280,40 340,60 340,130 250,150" fill="#1976B8" opacity="0.4" />
            <polygon points="0,90 70,130 50,200 0,200" fill="#0A3A68" opacity="0.7" />
            <polygon points="70,130 160,120 180,200 50,200" fill="#124E82" opacity="0.5" />
            <polygon points="160,120 230,140 270,200 180,200" fill="#0B3762" opacity="0.65" />
            <polygon points="230,140 340,130 340,200 270,200" fill="#165C94" opacity="0.45" />
          </svg>

          <div class="relative z-10 flex h-full flex-col justify-between text-white p-1">
            <!-- Fila Superior: BBVA Débito a la izquierda, Mastercard a la derecha (Imagen 1) -->
            <div class="flex justify-between items-start">
              <div>
                <p class="text-[15px] font-bold tracking-[0.16em] uppercase text-white font-sans drop-shadow-sm">
                  BBVA
                </p>
                <p class="text-[8px] uppercase tracking-widest text-cyan-300 font-mono font-bold">
                  DÉBITO
                </p>
              </div>

              <!-- Logo Oficial Mastercard (Rojo y Naranja como en la Imagen 1) -->
              <div class="relative inline-block w-10 h-7 mr-1" aria-hidden="true">
                <span class="absolute left-0 top-0 size-7 rounded-full bg-[#eb001b] shadow-sm" />
                <span class="absolute right-0 top-0 size-7 rounded-full bg-[#f79e1b] mix-blend-screen shadow-sm" />
              </div>
            </div>

            <!-- Fila Media: Chip Dorado a la izquierda + Holograma plateado cuadrado a la derecha (Imagen 1) -->
            <div class="flex items-center justify-between my-auto">
              <!-- Chip EMV dorado -->
              <div
                class="relative w-10 h-7 rounded-[4px] border border-amber-300/40 shrink-0 overflow-hidden shadow-sm"
                style="background: linear-gradient(145deg, #f5df8e 0%, #d4aa2e 45%, #fcebb1 70%, #a37a07 100%);"
                aria-hidden="true"
              >
                <div class="absolute inset-[3px] grid grid-cols-3 grid-rows-2 gap-px opacity-40">
                  <span v-for="i in 6" :key="i" class="bg-black/30 rounded-[1px]" />
                </div>
              </div>

              <!-- Holograma de Seguridad plateado cuadrado con círculo concéntrico (Imagen 1) -->
              <div
                class="w-8 h-8 rounded-md border border-white/40 shrink-0 overflow-hidden relative shadow-md"
                style="background: linear-gradient(135deg, #c0c8d4 0%, #e8eef5 25%, #9aa8b8 50%, #d5dde8 75%, #a8b4c4 100%);"
                aria-hidden="true"
              >
                <div class="absolute inset-1 rounded-full border border-slate-600/40 opacity-60" />
              </div>
            </div>

            <!-- Centro/Inferior: Número de Tarjeta y Titular / Vencimiento (Imagen 1) -->
            <div class="mt-auto">
              <!-- Número de tarjeta con asteriscos progresivos -->
              <p
                class="text-[13px] sm:text-[15px] font-mono tracking-[0.16em] tabular-nums text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
              >
                {{ displayNumero }}
              </p>

              <div class="flex justify-between items-end mt-1.5 gap-2">
                <p class="text-[10px] sm:text-[11px] font-semibold tracking-[0.08em] truncate uppercase text-white drop-shadow-sm">
                  {{ displayNombre }}
                </p>

                <div class="text-right shrink-0">
                  <p class="text-[6.5px] uppercase tracking-wider text-white/70 font-mono">EXPIRES END</p>
                  <p class="text-[10.5px] font-mono font-bold text-white tracking-wider">{{ displayExpiracion }}</p>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- ================= CARA TRASERA (REVERSO) ================= -->
      <div
        class="card-face card-back absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl border py-3 shadow-2xl"
        :class="cardContainerClasses"
      >
        <!-- REVERSO GENÉRICO / STREAMSTORE -->
        <template v-if="bankSkin === 'generica' || bankSkin === 'streamstore' || bankSkin === 'falabella'">
          <div class="absolute inset-0 bg-gradient-to-br from-[#0c1322] via-[#11192e] to-[#070b14]" />
          <div class="relative z-10 flex h-full flex-col justify-between text-white">
            <div class="px-4 text-[7px] text-white/70 font-mono">
              Atención 24/7 · Simulación segura StreamStore
            </div>
            <div class="my-1 h-8 bg-black w-full shadow-inner" />
            <div class="px-4 my-auto">
              <div class="flex items-center shadow-sm">
                <div
                  class="h-7 flex-1 rounded-l flex items-center px-2 overflow-hidden"
                  style="background: repeating-linear-gradient(-45deg, #f5f5f5, #f5f5f5 4px, #e2e8f0 4px, #e2e8f0 8px);"
                >
                  <span class="font-mono text-[9px] text-neutral-500 italic select-none">
                    firma autorizada · simulacion
                  </span>
                </div>
                <div class="h-7 w-16 bg-white rounded-r flex items-center justify-center font-mono text-xs font-bold text-[#1a1a1a] border-l border-neutral-300">
                  <span class="italic tracking-widest">{{ displayCvv }}</span>
                </div>
              </div>
            </div>
            <div class="px-4 pb-0.5 text-[7px] text-center text-white/60 font-mono">
              Vista previa visual interactiva. No se almacenan ni procesan datos bancarios reales.
            </div>
          </div>
        </template>

        <!-- REVERSO NU BANK -->
        <template v-else-if="bankSkin === 'nu'">
          <div
            class="absolute inset-0"
            style="background: linear-gradient(145deg, #8A05BE 0%, #820AD1 50%, #6D079D 100%);"
          />

          <div class="relative z-10 flex h-full flex-col justify-between text-white">
            <div>
              <div class="h-8 bg-black w-full shadow-inner" />
              <p class="px-3 pt-1 text-[6.5px] font-mono text-purple-200/90 tracking-tight truncate">
                ¿Necesitas ayuda? Abre el chat en la app · Colombia 01 800 917 2000 · ayuda@nu.com.co
              </p>
            </div>

            <div class="px-5 my-auto grid grid-cols-12 gap-3 items-center">
              <div class="col-span-5 space-y-1 text-[6.5px] text-white/80 leading-tight">
                <p>Al usar la tarjeta, aceptas los términos de tu contrato.</p>
                <p>Válida en todo el mundo e intransferible.</p>
                <p class="text-[5.5px] text-purple-200/70">
                  Emitida con cariño por Nu Colombia Compañía de Financiamiento S.A.
                </p>
              </div>

              <div class="col-span-7 space-y-1 text-right pr-2">
                <div class="flex items-center justify-end gap-2 text-[9px] font-mono pt-0.5">
                  <span class="text-[7.5px] uppercase font-bold text-white/70">CVC / CÓDIGO</span>
                  <span class="font-mono text-[12px] font-black italic bg-white/20 px-2.5 py-0.5 rounded border border-white/30 text-white">
                    {{ displayCvv }}
                  </span>
                </div>
              </div>
            </div>

            <div class="px-5 pb-1 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div
                  class="w-8 h-5 rounded-full border border-white/30 overflow-hidden relative shadow-sm"
                  style="background: linear-gradient(135deg, #d8dbdf 0%, #ffffff 40%, #a6abb3 80%, #e2e8f0 100%);"
                >
                  <div class="absolute inset-0 opacity-40 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:3px_3px]" />
                </div>
                <span class="text-[12px] font-sans font-medium text-white/95 lowercase tracking-wide">
                  gold
                </span>
              </div>
              <span class="text-[6.5px] font-mono text-purple-200/60">
                THALES IZT · SIMULACIÓN STREAMSTORE
              </span>
            </div>
          </div>
        </template>

        <!-- REVERSO BANCOLOMBIA -->
        <template v-else-if="bankSkin === 'bancolombia'">
          <div class="absolute inset-0 bg-[#FFDD00]" />
          <div class="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-6 rounded-r-full bg-[#0a0c10] shadow-inner" />

          <div class="relative z-10 flex h-full flex-col justify-between text-black">
            <div>
              <div class="h-8 bg-black w-full shadow-inner" />
              <p class="px-3 pt-1 text-[6.5px] font-mono text-neutral-800 tracking-tight truncate">
                Líneas de atención en Colombia: 01 800 09-12345 · Resto del mundo 1-800-307-7309 · Simulación
              </p>
            </div>

            <div class="px-5 my-auto grid grid-cols-12 gap-3 items-center">
              <div class="col-span-6 space-y-1">
                <div class="flex items-center gap-1.5">
                  <div class="flex flex-col gap-[1.5px]" aria-hidden="true">
                    <span class="block w-2.5 h-[1.5px] bg-black" />
                    <span class="block w-3.5 h-[1.5px] bg-black" />
                    <span class="block w-4.5 h-[1.5px] bg-black" />
                  </div>
                  <span class="font-bold text-[11px] tracking-tight">Bancolombia</span>
                </div>
                <div class="flex items-center gap-1 text-[7px] text-neutral-800 font-sans leading-tight pt-1">
                  <span>♻️</span>
                  <span>100% plástico reciclado</span>
                </div>
              </div>

              <div class="col-span-6 space-y-1 text-right pr-2">
                <div class="flex items-center justify-end gap-2 text-[9px] font-mono pt-0.5">
                  <span class="text-[7.5px] uppercase font-bold text-neutral-800">CVC</span>
                  <span class="font-mono text-[12px] font-black italic bg-white px-2 py-0.5 rounded border border-neutral-300 text-black">
                    {{ displayCvv }}
                  </span>
                </div>
              </div>
            </div>

            <div class="px-5 pb-1 flex items-center justify-between">
              <div
                class="w-8 h-5 rounded-full border border-neutral-400 overflow-hidden relative shadow-sm"
                style="background: linear-gradient(135deg, #d8dbdf 0%, #ffffff 40%, #a6abb3 80%, #e2e8f0 100%);"
              >
                <div class="absolute inset-0 opacity-40 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:3px_3px]" />
              </div>
              <span class="text-[6.5px] font-mono text-neutral-600">
                THALES IZT · SIMULACIÓN STREAMSTORE
              </span>
            </div>
          </div>
        </template>

        <!-- REVERSO BBVA -->
        <template v-else-if="bankSkin === 'bbva'">
          <div
            class="absolute inset-0"
            style="background: linear-gradient(160deg, #072B57 0%, #004481 50%, #051C36 100%);"
          />

          <div class="relative z-10 flex h-full flex-col justify-between text-white">
            <div>
              <div class="h-8 bg-black w-full shadow-inner" />
              <p class="px-3 pt-1 text-[6.5px] font-mono text-cyan-200/80 tracking-tight truncate">
                Línea BBVA: Bogotá (601) 401 0000 · Nacional 01 8000 912 227 · bbva.com.co
              </p>
            </div>

            <div class="px-4 my-auto">
              <div class="flex items-center shadow-sm">
                <div
                  class="h-7 flex-1 rounded-l flex items-center px-2 overflow-hidden"
                  style="background: repeating-linear-gradient(-45deg, #f5f5f5, #f5f5f5 4px, #e2e8f0 4px, #e2e8f0 8px);"
                >
                  <span class="font-mono text-[9px] text-neutral-500 italic select-none">
                    firma autorizada · simulacion
                  </span>
                </div>
                <div class="h-7 w-16 bg-white rounded-r flex items-center justify-center font-mono text-xs font-bold text-[#1a1a1a] border-l border-neutral-300">
                  <span class="italic tracking-widest">{{ displayCvv }}</span>
                </div>
              </div>
            </div>

            <div class="px-4 pb-0.5 text-[7px] text-center text-white/60 font-mono">
              BBVA Colombia S.A. · Vigilado Superintendencia Financiera de Colombia
            </div>
          </div>
        </template>
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
