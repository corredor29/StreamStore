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
    bankSkin: 'bancolombia',
    cardKind: 'debito',
  }
)

const emit = defineEmits<{
  toggleFlip: []
}>()

const ambientGlowClass = computed(() => {
  switch (props.bankSkin) {
    case 'nu':
      return 'bg-purple-600/40'
    case 'bancolombia':
      return 'bg-yellow-400/35'
    case 'generica':
    case 'falabella':
      return 'bg-cyan-500/40'
    case 'bbva':
      return 'bg-blue-600/40'
    case 'streamstore':
    default:
      return 'bg-cyan-500/30'
  }
})

const cardContainerClasses = computed(() => {
  switch (props.bankSkin) {
    case 'nu':
      return 'border-purple-400/20 text-white shadow-2xl'
    case 'bancolombia':
      return 'border-black/15 text-neutral-900 shadow-2xl'
    case 'generica':
    case 'falabella':
      return 'border-cyan-400/30 text-white shadow-2xl'
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
    class="card-3d-wrapper relative mx-auto w-full max-w-[370px] sm:max-w-[400px] cursor-pointer group select-none"
    title="Haz clic para voltear la tarjeta"
    @click="emit('toggleFlip')"
  >
    <!-- Aura ambiental suave detrás del plástico -->
    <div
      class="pointer-events-none absolute -inset-3 rounded-3xl blur-2xl opacity-35 transition-all duration-700 -z-10 group-hover:opacity-60"
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
        <!-- FONDOS Y PATRONES VECTORIALES SEGÚN SKIN -->
        <!-- Skin 1: Bancolombia (Diseño Exacto al Plástico Físico Oficial) -->
        <template v-if="bankSkin === 'bancolombia'">
          <div class="absolute inset-0 bg-[#FFDD00]" />

          <!-- Muesca de accesibilidad táctil para personas con discapacidad visual en el borde derecho -->
          <div class="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-6 rounded-l-full bg-[#0a0c10] shadow-inner" />

          <!-- Cintas multicolores curvadas oficiales de Bancolombia -->
          <svg
            class="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 380 230"
            fill="none"
            aria-hidden="true"
          >
            <!-- Cinta verde esmeralda y violeta vertical que pasa detrás del chip -->
            <path
              d="M135 0 V80 C135 130 170 170 205 185"
              stroke="#00B594"
              stroke-width="16"
              stroke-linecap="round"
            />
            <path
              d="M135 45 C135 110 160 155 200 180"
              stroke="#7E3294"
              stroke-width="17"
              stroke-linecap="round"
            />
            <!-- Cinta rosa / lila que continúa la curva -->
            <path
              d="M152 135 C170 165 200 185 220 185"
              stroke="#E289C3"
              stroke-width="13"
              stroke-linecap="round"
            />
            <!-- Cinta naranja y cian inferior izquierda -->
            <path
              d="M80 160 C90 190 75 220 40 230"
              stroke="#FF8200"
              stroke-width="14"
              stroke-linecap="round"
            />
            <path
              d="M100 195 C95 215 80 230 60 230"
              stroke="#00A3E0"
              stroke-width="10"
              stroke-linecap="round"
            />
            <path
              d="M75 140 C85 170 60 200 30 205"
              stroke="#00B594"
              stroke-width="12"
              stroke-linecap="round"
            />
          </svg>

          <!-- Estructura Frontal Bancolombia: TOTALMENTE LIMPIA, SIN NÚMEROS NI TITULAR (Todo va atrás) -->
          <div class="relative z-10 flex h-full flex-col justify-between text-black">
            <!-- Fila Superior: 'débito' a la izquierda, logo '= Ba' a la derecha -->
            <div class="flex justify-between items-start">
              <span class="text-[12px] font-sans font-semibold lowercase text-black tracking-tight">
                débito
              </span>

              <!-- Logotipo Oficial Bancolombia: 3 barras horizontales + 'Ba' en negrita -->
              <div class="flex items-center gap-2 pr-1">
                <div class="flex flex-col gap-[3.5px] items-end" aria-hidden="true">
                  <span class="block w-6 h-[4.5px] bg-black rounded-sm" />
                  <span class="block w-8 h-[4.5px] bg-black rounded-sm" />
                  <span class="block w-10 h-[4.5px] bg-black rounded-sm" />
                </div>
                <span
                  class="text-[34px] font-black tracking-tighter text-black leading-none font-sans"
                  style="font-family: 'Space Grotesk', Arial, sans-serif;"
                >
                  Ba
                </span>
              </div>
            </div>

            <!-- Fila Media: Chip EMV Plateado/Dorado + Contactless Ondas Negras -->
            <div class="flex items-center gap-2.5 my-auto ml-3 relative z-10">
              <!-- Chip EMV metálico exacto -->
              <div
                class="relative w-11 h-8 rounded-[4px] border border-black/40 shrink-0 overflow-hidden shadow-sm"
                style="background: linear-gradient(145deg, #d8dbdf 0%, #c4c8ce 35%, #eef0f3 65%, #a6abb3 100%);"
                aria-hidden="true"
              >
                <!-- Líneas orgánicas grabadas en el chip físico -->
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

            <!-- Fila Inferior: Exclusivamente el Logo de Mastercard a la derecha y aviso claro de giro -->
            <div class="flex justify-between items-end mt-auto pt-2">
              <span class="text-[9px] font-mono font-semibold text-black/70 uppercase tracking-wider pl-1 flex items-center gap-1">
                <span>🔄</span> Reverso con datos
              </span>

              <!-- Logo Oficial Mastercard (Rojo #EB001B y Naranja #F79E1B) -->
              <div class="relative inline-block w-11 h-7 mr-2" aria-hidden="true">
                <span class="absolute left-0 top-0 size-7 rounded-full bg-[#eb001b] shadow-sm" />
                <span class="absolute right-0 top-0 size-7 rounded-full bg-[#f79e1b] mix-blend-screen shadow-sm" />
              </div>
            </div>
          </div>
        </template>

        <!-- Skin 2: Nu (Nubank Colombia - Réplica Fiel del Plástico Físico Oficial) -->
        <template v-else-if="bankSkin === 'nu'">
          <!-- Fondo púrpura mate oficial Nubank (#820AD1) -->
          <div
            class="absolute inset-0"
            style="background: linear-gradient(145deg, #8A05BE 0%, #820AD1 50%, #6D079D 100%);"
          />

          <!-- Cara Frontal Nu: Nombre del Titular arriba a la izquierda, Logo 'nu' arriba a la derecha,
               crédito/débito + contactless + chip plateado + Mastercard abajo. SIN NÚMEROS (van al reverso) -->
          <div class="relative z-10 flex h-full flex-col justify-between text-white p-1">
            <!-- Fila Superior: Nombre del Titular a la izquierda y Logotipo Oficial 'nu' a la derecha -->
            <div class="flex justify-between items-start pt-1 px-1">
              <p class="text-[12px] sm:text-[13px] font-sans font-medium text-white tracking-wide truncate max-w-[210px] drop-shadow-sm">
                {{ displayNombre }}
              </p>

              <!-- Logotipo Nu oficial en blanco -->
              <span
                class="text-[32px] font-black lowercase text-white tracking-tighter leading-none select-none font-sans pr-1"
                style="font-family: system-ui, -apple-system, sans-serif; letter-spacing: -0.06em;"
              >
                nu
              </span>
            </div>

            <!-- Fila Inferior: 'crédito' + contactless a la izquierda, chip metálico al centro, Mastercard a la derecha -->
            <div class="flex items-end justify-between pb-1 px-1 mt-auto">
              <!-- crédito / débito y contactless ))) -->
              <div class="flex flex-col gap-1 items-start">
                <span class="text-[11px] font-sans lowercase text-white font-medium tracking-tight">
                  débito
                </span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="text-white" aria-hidden="true">
                  <path d="M8 8.5c2.2 1.8 2.2 5.2 0 7" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" />
                  <path d="M11 5.5c3.5 2.8 3.5 10.2 0 13" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" />
                  <path d="M14 3c4.8 3.8 4.8 14.2 0 18" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" />
                </svg>
              </div>

              <!-- Chip EMV plateado oficial -->
              <div
                class="relative w-9 h-7 rounded-[3px] border border-black/20 shrink-0 overflow-hidden shadow-sm"
                style="background: linear-gradient(135deg, #e8ecef 0%, #c4cbd1 35%, #f1f4f7 65%, #a8b1b8 100%);"
                aria-hidden="true"
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

              <!-- Logo Oficial Mastercard (Rojo #EB001B y Naranja #F79E1B) -->
              <div class="relative inline-block w-11 h-7" aria-hidden="true">
                <span class="absolute left-0 top-0 size-7 rounded-full bg-[#eb001b] shadow-sm" />
                <span class="absolute right-0 top-0 size-7 rounded-full bg-[#f79e1b] mix-blend-screen shadow-sm" />
              </div>
            </div>

            <!-- Aviso interactivo en el borde inferior -->
            <div class="flex justify-between items-center px-1 pt-0.5">
              <span class="text-[8px] font-mono font-medium text-white/70 uppercase tracking-wider flex items-center gap-1">
                <span>🔄</span> Datos impresos al reverso
              </span>
            </div>
          </div>
        </template>

        <!-- Skin 3: Tarjeta Genérica Multibanco (Auto-detecta marca Visa, Mastercard o Amex según el número) -->
        <template v-else-if="bankSkin === 'generica' || bankSkin === 'falabella'">
          <div
            class="absolute inset-0"
            style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);"
          />
          <div class="absolute inset-0 opacity-25 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px]" />
          <div class="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-cyan-500/15 blur-2xl" />

          <div class="relative z-10 flex h-full flex-col justify-between text-white p-1">
            <div class="flex items-center justify-between">
              <!-- Chip metálico y ondas Contactless -->
              <div class="flex items-center gap-2.5">
                <div
                  class="relative w-9 h-7 rounded-[3px] border border-black/30 shrink-0 overflow-hidden shadow-sm"
                  style="background: linear-gradient(145deg, #e8d48b 0%, #c9a227 45%, #f0e0a0 70%, #a67c00 100%);"
                >
                  <div class="absolute inset-[2.5px] border border-black/30 rounded-[1.5px]" />
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="w-full h-px bg-black/30" />
                  </div>
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="h-full w-px bg-black/30" />
                  </div>
                </div>

                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" class="text-cyan-300">
                  <path d="M8 8.5c2.2 1.8 2.2 5.2 0 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                  <path d="M11 5.5c3.5 2.8 3.5 10.2 0 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                  <path d="M14 3c4.8 3.8 4.8 14.2 0 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
              </div>

              <!-- Indicador Débito y Logo Detectado (Visa, Mastercard, Amex, Multibanco) -->
              <div class="flex items-center gap-2.5">
                <span class="text-[9px] uppercase tracking-[0.16em] text-cyan-300 font-mono font-bold">
                  DÉBITO
                </span>

                <!-- Marca Detectada automáticamente -->
                <div class="h-6 flex items-center">
                  <!-- Visa -->
                  <span
                    v-if="brand === 'visa'"
                    class="font-black italic text-lg tracking-tighter text-white font-sans pr-1"
                  >
                    VISA
                  </span>
                  <!-- Mastercard -->
                  <div v-else-if="brand === 'mastercard'" class="relative inline-block w-9 h-6">
                    <span class="absolute left-0 top-0 size-6 rounded-full bg-[#eb001b]" />
                    <span class="absolute right-0 top-0 size-6 rounded-full bg-[#f79e1b] mix-blend-screen" />
                  </div>
                  <!-- Amex -->
                  <span
                    v-else-if="brand === 'amex'"
                    class="px-1.5 py-0.5 rounded bg-blue-600 text-white font-black text-[9px] font-sans tracking-tight"
                  >
                    AMEX
                  </span>
                  <!-- Multibanco Genérico -->
                  <span
                    v-else
                    class="text-[9px] font-mono tracking-wider text-gray-400 uppercase border border-gray-700 px-1.5 py-0.5 rounded"
                  >
                    UNIVERSAL
                  </span>
                </div>
              </div>
            </div>

            <div class="my-auto py-1">
              <span class="text-[8px] font-mono text-cyan-400/70 uppercase tracking-widest">
                Tarjeta Débito Universal
              </span>
            </div>

            <div class="mt-auto space-y-1">
              <p class="text-[13px] sm:text-[14px] font-mono tracking-[0.15em] tabular-nums text-white drop-shadow">
                {{ displayNumero }}
              </p>
              <div class="flex justify-between items-end gap-2">
                <p class="text-[11px] font-semibold truncate uppercase text-white tracking-wide">
                  {{ displayNombre }}
                </p>
                <div class="flex items-center gap-2 shrink-0">
                  <span class="text-[7.5px] uppercase font-bold text-gray-400">VENCE</span>
                  <p class="text-[10.5px] font-mono text-cyan-300 font-bold">{{ displayExpiracion }}</p>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Skin 4: BBVA Aqua -->
        <template v-else-if="bankSkin === 'bbva'">
          <svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 340 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="bbvaBaseSvg3" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#0A2F5C" />
                <stop offset="55%" stop-color="#004481" />
                <stop offset="100%" stop-color="#072A4A" />
              </linearGradient>
            </defs>
            <rect width="340" height="200" fill="url(#bbvaBaseSvg3)" />
            <polygon points="0,0 90,0 40,70" fill="#1464A5" opacity="0.55" />
            <polygon points="90,0 170,0 120,55" fill="#0D3B6E" opacity="0.7" />
            <polygon points="170,0 260,0 210,80" fill="#1A6FB0" opacity="0.45" />
            <polygon points="260,0 340,0 340,60 280,40" fill="#0B355F" opacity="0.8" />
            <polygon points="40,70 120,55 160,120 70,130" fill="#155A96" opacity="0.4" />
            <polygon points="120,55 210,80 230,140 160,120" fill="#0E4478" opacity="0.55" />
            <polygon points="210,80 280,40 340,60 340,130 250,150" fill="#1976B8" opacity="0.35" />
            <polygon points="0,90 70,130 50,200 0,200" fill="#0A3A68" opacity="0.65" />
          </svg>

          <div class="relative z-10 flex h-full flex-col justify-between text-white">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-[12px] font-bold tracking-[0.2em] uppercase text-white font-sans">BBVA</p>
                <p class="text-[7px] uppercase tracking-widest text-cyan-300 mt-0.5 font-mono font-bold">
                  DÉBITO
                </p>
              </div>
              <div class="relative inline-block w-8 h-5">
                <span class="absolute left-0 top-0 w-[58%] h-full rounded-full bg-[#eb001b]" />
                <span class="absolute right-0 top-0 w-[58%] h-full rounded-full bg-[#f79e1b] mix-blend-screen" />
              </div>
            </div>

            <div class="flex items-center justify-between my-auto">
              <div
                class="relative w-9 h-7 rounded-[3px] border border-white/20 shrink-0 overflow-hidden"
                style="background: linear-gradient(145deg, #e8d48b 0%, #c9a227 45%, #f0e0a0 70%, #a67c00 100%);"
              >
                <div class="absolute inset-[3px] grid grid-cols-3 grid-rows-2 gap-px opacity-40">
                  <span v-for="i in 6" :key="i" class="bg-black/30 rounded-[1px]" />
                </div>
              </div>

              <div
                class="w-8 h-8 rounded-sm border border-white/30 shrink-0 overflow-hidden relative shadow-sm"
                style="background: linear-gradient(135deg, #c0c8d4 0%, #e8eef5 25%, #9aa8b8 50%, #d5dde8 75%, #a8b4c4 100%);"
              >
                <div class="absolute inset-1 rounded-full border border-slate-600/30 opacity-50" />
              </div>
            </div>

            <div class="mt-auto">
              <p class="text-[13px] font-mono tracking-[0.14em] tabular-nums text-white drop-shadow">
                {{ displayNumero }}
              </p>
              <div class="flex justify-between items-end mt-1.5 gap-2">
                <p class="text-[10px] font-semibold tracking-[0.08em] truncate uppercase text-white">
                  {{ displayNombre }}
                </p>
                <div class="text-right shrink-0">
                  <p class="text-[6px] uppercase tracking-wider text-white/50 font-mono">Expires end</p>
                  <p class="text-[10px] font-mono text-white/90">{{ displayExpiracion }}</p>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Skin 5: StreamStore Cyber Dark -->
        <template v-else>
          <div class="absolute inset-0 bg-gradient-to-br from-[#0c1322] via-[#11192e] to-[#070b14]" />
          <div class="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-cyan-500/15 blur-2xl" />

          <div class="relative z-10 flex h-full flex-col justify-between text-white">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-1.5">
                <div class="size-2 rounded-full bg-cyan-400 animate-pulse" />
                <span class="font-display text-sm font-bold tracking-wider text-cyan-200">
                  StreamStore
                </span>
              </div>
              <div class="relative inline-block w-8 h-5">
                <span class="absolute left-0 top-0 w-[58%] h-full rounded-full bg-[#eb001b]" />
                <span class="absolute right-0 top-0 w-[58%] h-full rounded-full bg-[#f79e1b] mix-blend-screen" />
              </div>
            </div>

            <div class="flex items-center gap-2 my-auto">
              <div
                class="relative w-9 h-7 rounded-[3px] border border-white/20 shrink-0 overflow-hidden"
                style="background: linear-gradient(145deg, #e8d48b 0%, #c9a227 45%, #f0e0a0 70%, #a67c00 100%);"
              >
                <div class="absolute inset-[3px] grid grid-cols-3 grid-rows-2 gap-px opacity-40">
                  <span v-for="i in 6" :key="i" class="bg-black/30 rounded-[1px]" />
                </div>
              </div>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M8 8.5c2.2 1.8 2.2 5.2 0 7" stroke="#fff" stroke-width="1.8" stroke-linecap="round" />
                <path d="M11 5.5c3.5 2.8 3.5 10.2 0 13" stroke="#fff" stroke-width="1.8" stroke-linecap="round" />
                <path d="M14 3c4.8 3.8 4.8 14.2 0 18" stroke="#fff" stroke-width="1.8" stroke-linecap="round" />
              </svg>
            </div>

            <div class="mt-auto">
              <p class="text-[13px] font-mono tracking-[0.14em] tabular-nums text-white">
                {{ displayNumero }}
              </p>
              <div class="flex justify-between items-end mt-1.5 gap-2">
                <p class="text-[10px] font-semibold tracking-wider truncate uppercase text-white">
                  {{ displayNombre }}
                </p>
                <p class="text-[10px] font-mono text-cyan-300 shrink-0">{{ displayExpiracion }}</p>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- ================= CARA TRASERA ================= -->
      <div
        class="card-face card-back absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl border py-3 shadow-2xl"
        :class="cardContainerClasses"
      >
        <!-- ================= REVERSO BANCOLOMBIA (IDÉNTICO A LA FOTO OFICIAL) ================= -->
        <template v-if="bankSkin === 'bancolombia'">
          <div class="absolute inset-0 bg-[#FFDD00]" />

          <!-- Muesca de accesibilidad táctil también reflejada en el reverso -->
          <div class="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 w-2.5 h-6 rounded-r-full bg-[#0a0c10] shadow-inner" />

          <div class="relative z-10 flex h-full flex-col justify-between text-black">
            <!-- Banda Magnética Negra Superior -->
            <div>
              <div class="h-8 bg-black w-full shadow-inner" />
              <!-- Líneas de atención oficiales en microtexto amarillo/naranja -->
              <p class="px-3 pt-1 text-[6.5px] font-mono text-neutral-800 tracking-tight truncate">
                Líneas de atención en Colombia: 01 800 09-12345 · Resto del mundo 1-800-307-7309 · Simulación
              </p>
            </div>

            <!-- CUERPO CENTRAL: LOGOTIPO BANCOLOMBIA + TODOS LOS DATOS IMPRESOS ATRÁS -->
            <div class="px-5 my-auto grid grid-cols-12 gap-3 items-center">
              <!-- Lado Izquierdo: Marca Bancolombia, Reciclaje y Licencia -->
              <div class="col-span-5 space-y-1">
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
                  <span>Hecha de 100% plástico reciclado</span>
                </div>

                <p class="text-[5.5px] leading-tight text-neutral-700">
                  This card is issued by Bancolombia S.A. pursuant to license by Mastercard.
                </p>
              </div>

              <!-- Lado Derecho: NÚMERO DE TARJETA, VENCIMIENTO, CVV Y TITULAR (Impresión Térmica Negra) -->
              <div class="col-span-7 space-y-1 text-right pr-2">
                <!-- Número de tarjeta en bloque monospace destacado -->
                <p class="font-mono text-[12px] sm:text-[13px] font-black tracking-[0.14em] tabular-nums text-black drop-shadow-sm">
                  {{ displayNumero }}
                </p>

                <!-- VALID THRU y CVV / CVC -->
                <div class="flex items-center justify-end gap-3 text-[9px] font-mono pt-0.5">
                  <div class="flex items-center gap-1">
                    <span class="text-[6.5px] leading-tight uppercase font-bold text-neutral-700">VALID<br>THRU</span>
                    <span class="font-bold text-[11px] text-black">{{ displayExpiracion }}</span>
                  </div>

                  <div class="flex items-center gap-1">
                    <span class="text-[6.5px] leading-tight uppercase font-bold text-neutral-700">CVC</span>
                    <span class="font-mono text-[11px] font-black italic bg-white px-1.5 py-0.5 rounded border border-neutral-300 text-black">
                      {{ displayCvv }}
                    </span>
                  </div>
                </div>

                <!-- Nombre del Titular -->
                <p class="font-mono text-[10px] font-bold uppercase tracking-wider text-black pt-0.5">
                  {{ displayNombre }}
                </p>
              </div>
            </div>

            <!-- PIE INFERIOR: HOLOGRAMA DE SEGURIDAD MASTERCARD Y FABRICACIÓN -->
            <div class="px-5 pb-1 flex items-center justify-between">
              <!-- Holograma de Seguridad Plateado de Mastercard -->
              <div
                class="w-8 h-5 rounded-full border border-neutral-400 overflow-hidden relative shadow-sm"
                style="background: linear-gradient(135deg, #d8dbdf 0%, #ffffff 40%, #a6abb3 80%, #e2e8f0 100%);"
                title="Holograma de seguridad"
              >
                <div class="absolute inset-0 opacity-40 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:3px_3px]" />
              </div>

              <span class="text-[6.5px] font-mono text-neutral-600">
                THALES IZT · SIMULACIÓN SEGURA STREAMSTORE
              </span>
            </div>
          </div>
        </template>

        <!-- ================= REVERSO NU (IDÉNTICO A LA FOTO FÍSICA OFICIAL) ================= -->
        <template v-else-if="bankSkin === 'nu'">
          <!-- Fondo púrpura Nubank mate -->
          <div
            class="absolute inset-0"
            style="background: linear-gradient(145deg, #8A05BE 0%, #820AD1 50%, #6D079D 100%);"
          />

          <div class="relative z-10 flex h-full flex-col justify-between text-white">
            <!-- Banda Magnética Negra Superior -->
            <div>
              <div class="h-8 bg-black w-full shadow-inner" />
              <!-- Microtexto oficial de Nu -->
              <p class="px-3 pt-1 text-[6.5px] font-mono text-purple-200/90 tracking-tight truncate">
                ¿Necesitas ayuda? Abre el chat en la app · Colombia 01 800 917 2000 · Bogotá +57 60(1) 357 1102 · ayuda@nu.com.co
              </p>
            </div>

            <!-- CUERPO CENTRAL: TEXTOS LEGALES A LA IZQUIERDA + DATOS IMPRESOS A LA DERECHA -->
            <div class="px-5 my-auto grid grid-cols-12 gap-3 items-center">
              <!-- Lado Izquierdo: Leyenda legal de Nu Colombia -->
              <div class="col-span-5 space-y-1 text-[6.5px] text-white/80 leading-tight">
                <p>Al usar la tarjeta, aceptas los términos de tu contrato.</p>
                <p>Válida en todo el mundo e intransferible.</p>
                <p class="text-[5.5px] text-purple-200/70">
                  Emitida con cariño por Nu Colombia Compañía de Financiamiento S.A.
                </p>
              </div>

              <!-- Lado Derecho: NÚMERO DE 16 DÍGITOS, VÁLIDA HASTA Y CVC -->
              <div class="col-span-7 space-y-1 text-right pr-2">
                <!-- Número de tarjeta en bloque monospace blanco destacado -->
                <p class="font-mono text-[13px] sm:text-[14px] font-black tracking-[0.14em] tabular-nums text-white drop-shadow-sm">
                  {{ displayNumero }}
                </p>

                <!-- Válida hasta y CVC -->
                <div class="flex items-center justify-end gap-3 text-[9px] font-mono pt-0.5">
                  <div class="flex items-center gap-1">
                    <span class="text-[6.5px] leading-tight uppercase font-bold text-white/70">Válida<br>hasta</span>
                    <span class="font-bold text-[11px] text-white">{{ displayExpiracion }}</span>
                  </div>

                  <div class="flex items-center gap-1">
                    <span class="text-[6.5px] leading-tight uppercase font-bold text-white/70">CVC</span>
                    <span class="font-mono text-[11px] font-black italic bg-white/15 px-1.5 py-0.5 rounded border border-white/25 text-white">
                      {{ displayCvv }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- PIE INFERIOR: HOLOGRAMA DE SEGURIDAD MASTERCARD + CATEGORÍA GOLD Y FABRICANTE -->
            <div class="px-5 pb-1 flex items-center justify-between">
              <!-- Holograma de Seguridad Plateado de Mastercard y etiqueta 'gold' -->
              <div class="flex items-center gap-2">
                <div
                  class="w-8 h-5 rounded-full border border-white/30 overflow-hidden relative shadow-sm"
                  style="background: linear-gradient(135deg, #d8dbdf 0%, #ffffff 40%, #a6abb3 80%, #e2e8f0 100%);"
                  title="Holograma de seguridad"
                >
                  <div class="absolute inset-0 opacity-40 bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:3px_3px]" />
                </div>
                <span class="text-[12px] font-sans font-medium text-white/95 lowercase tracking-wide">
                  gold
                </span>
              </div>

              <span class="text-[6.5px] font-mono text-purple-200/60">
                THALES IZT U1188174F2 0626 · STREAMSTORE
              </span>
            </div>
          </div>
        </template>

        <!-- REVERSO FALABELLA / BBVA / STREAMSTORE -->
        <template v-else>
          <div
            v-if="bankSkin === 'falabella'"
            class="absolute inset-0"
            style="background: linear-gradient(180deg, #2E7D32 0%, #1B5E20 100%);"
          />
          <div
            v-else-if="bankSkin === 'bbva'"
            class="absolute inset-0"
            style="background: linear-gradient(160deg, #0A2F5C 0%, #004481 50%, #072A4A 100%);"
          />
          <div v-else class="absolute inset-0 bg-gradient-to-br from-[#0c1322] via-[#11192e] to-[#070b14]" />

          <div class="relative z-10 flex h-full flex-col justify-between text-white">
            <div class="px-4 text-[7px] text-white/70">
              Atencion 24/7 · Simulacion StreamStore
            </div>
            <div class="my-1 h-8 bg-black w-full" />
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
            <div class="px-4 pb-0.5 text-[7px] text-center text-white/60">
              Vista previa visual interactiva. No se almacenan ni procesan datos bancarios reales.
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
