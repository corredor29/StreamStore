<script setup lang="ts">
import { computed } from 'vue'
import type { CardBankSkin, MarcaTarjeta } from '@/types'

const props = withDefaults(
  defineProps<{
    brand: MarcaTarjeta
    bankSkin?: CardBankSkin
    displayNumero: string
    displayNombre: string
    displayExpiracion: string
    displayCvv: string
    isFlipped: boolean
  }>(),
  {
    bankSkin: 'streamstore',
  }
)

// Estilos dinámicos según el skin de banco seleccionado
const isDarkText = computed(() => props.bankSkin === 'bancolombia')

const cardContainerClasses = computed(() => {
  switch (props.bankSkin) {
    case 'nu':
      return 'border-purple-400/30 text-white shadow-[0_15px_35px_rgba(130,10,209,0.35)]'
    case 'bancolombia':
      return 'border-yellow-400/50 text-neutral-900 shadow-[0_15px_35px_rgba(255,221,0,0.25)]'
    case 'falabella':
      return 'border-emerald-400/30 text-white shadow-[0_15px_35px_rgba(46,125,50,0.35)]'
    case 'bbva':
      return 'border-blue-400/30 text-white shadow-[0_15px_35px_rgba(0,68,129,0.35)]'
    case 'streamstore':
    default:
      return 'border-cyan-500/30 text-white shadow-[0_15px_35px_rgba(6,182,212,0.25)]'
  }
})
</script>

<template>
  <div class="card-3d-wrapper mx-auto w-full max-w-[390px] sm:max-w-[420px]" aria-hidden="true">
    <div
      class="card-3d-inner relative h-[225px] sm:h-[240px] w-full rounded-2xl transition-transform duration-700 ease-out"
      :class="{ 'card-flipped': isFlipped }"
    >
      <!-- ================= CARA FRONTAL ================= -->
      <div
        class="card-face card-front absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl border p-5 sm:p-6"
        :class="cardContainerClasses"
      >
        <!-- FONDOS Y PATRONES SEGÚN SKIN -->
        <!-- Skin 1: StreamStore Cyber Dark -->
        <template v-if="bankSkin === 'streamstore'">
          <div class="absolute inset-0 bg-gradient-to-br from-[#0c1322] via-[#11192e] to-[#070b14]" />
          <div class="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-cyan-500/15 blur-2xl" />
          <div class="pointer-events-none absolute -left-12 -bottom-12 size-36 rounded-full bg-brand-500/10 blur-2xl" />
          <div class="absolute inset-0 bg-[linear-gradient(to_right,#06b6d40a_1px,transparent_1px),linear-gradient(to_bottom,#06b6d40a_1px,transparent_1px)] bg-[size:20px_20px]" />
        </template>

        <!-- Skin 2: Nu (Nubank) -->
        <template v-else-if="bankSkin === 'nu'">
          <div class="absolute inset-0 bg-gradient-to-br from-[#9B30D9] via-[#820AD1] to-[#6B09A8]" />
          <div class="pointer-events-none absolute -right-10 top-6 size-40 rounded-full bg-white/10 blur-xl" />
          <div class="pointer-events-none absolute -left-8 -bottom-10 size-36 rounded-full bg-black/20 blur-lg" />
        </template>

        <!-- Skin 3: Bancolombia -->
        <template v-else-if="bankSkin === 'bancolombia'">
          <div class="absolute inset-0 bg-[#FFDD00]" />
          <!-- Curvas decorativas SVG estilo Bancolombia -->
          <svg
            class="pointer-events-none absolute left-0 top-0 h-full w-[60%]"
            viewBox="0 0 120 160"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M-10 20 C40 10, 50 50, 20 90 C-5 120, 30 150, 70 160" fill="none" stroke="#00A651" stroke-width="13" stroke-linecap="round" />
            <path d="M0 35 C45 25, 55 60, 25 95 C5 120, 40 145, 80 155" fill="none" stroke="#7B2D8E" stroke-width="10" stroke-linecap="round" />
            <path d="M5 55 C40 50, 48 80, 28 110 C12 130, 45 148, 75 152" fill="none" stroke="#00A3E0" stroke-width="8" stroke-linecap="round" />
            <path d="M15 75 C42 78, 50 100, 40 125 C32 140, 55 150, 70 148" fill="none" stroke="#E85D75" stroke-width="7" stroke-linecap="round" />
          </svg>
        </template>

        <!-- Skin 4: Falabella CMR -->
        <template v-else-if="bankSkin === 'falabella'">
          <div class="absolute inset-0 bg-gradient-to-b from-[#43A047] via-[#2E7D32] to-[#1B5E20]" />
          <div class="pointer-events-none absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.4),transparent_50%)]" />
        </template>

        <!-- Skin 5: BBVA Aqua -->
        <template v-else-if="bankSkin === 'bbva'">
          <!-- Patrón geométrico poligonal BBVA -->
          <svg
            class="pointer-events-none absolute inset-0 h-full w-full"
            viewBox="0 0 340 200"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="bbvaBaseSvg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#0A2F5C" />
                <stop offset="55%" stop-color="#004481" />
                <stop offset="100%" stop-color="#072A4A" />
              </linearGradient>
            </defs>
            <rect width="340" height="200" fill="url(#bbvaBaseSvg)" />
            <polygon points="0,0 90,0 40,70" fill="#1464A5" opacity="0.55" />
            <polygon points="90,0 170,0 120,55" fill="#0D3B6E" opacity="0.7" />
            <polygon points="170,0 260,0 210,80" fill="#1A6FB0" opacity="0.45" />
            <polygon points="260,0 340,0 340,60 280,40" fill="#0B355F" opacity="0.8" />
            <polygon points="40,70 120,55 160,120 70,130" fill="#155A96" opacity="0.4" />
            <polygon points="120,55 210,80 230,140 160,120" fill="#0E4478" opacity="0.55" />
            <polygon points="210,80 280,40 340,60 340,130 250,150" fill="#1976B8" opacity="0.35" />
            <polygon points="0,90 70,130 50,200 0,200" fill="#0A3A68" opacity="0.65" />
            <polygon points="70,130 160,120 180,200 50,200" fill="#125890" opacity="0.4" />
          </svg>
        </template>

        <!-- CONTENIDO FRONTAL DE LA TARJETA -->
        <div class="relative z-10 flex h-full flex-col justify-between">
          <!-- Fila Superior: Marca del Banco / Identidad y Red (Visa/Mastercard/Amex) -->
          <div class="flex items-start justify-between">
            <!-- Identidad del Banco -->
            <div>
              <template v-if="bankSkin === 'nu'">
                <span class="font-black text-2xl tracking-tighter text-white font-sans lowercase">
                  nu
                </span>
              </template>
              <template v-else-if="bankSkin === 'bancolombia'">
                <div class="flex items-center gap-1.5 font-bold tracking-tight text-neutral-900 text-sm">
                  <span class="flex flex-col gap-[2px]">
                    <span class="h-[2px] w-2.5 rounded-sm bg-neutral-900" />
                    <span class="h-[2px] w-3.5 rounded-sm bg-neutral-900" />
                    <span class="h-[2px] w-4.5 rounded-sm bg-neutral-900" />
                  </span>
                  <span>Bancolombia</span>
                </div>
              </template>
              <template v-else-if="bankSkin === 'falabella'">
                <div>
                  <span class="font-black text-2xl tracking-tight text-white leading-none block font-sans">
                    CMR
                  </span>
                  <span class="text-[9px] font-medium tracking-wide text-white/90">
                    Banco Falabella
                  </span>
                </div>
              </template>
              <template v-else-if="bankSkin === 'bbva'">
                <span class="font-black text-lg tracking-[0.2em] text-white uppercase">
                  BBVA
                </span>
              </template>
              <template v-else>
                <div class="flex items-center gap-1.5">
                  <div class="size-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span class="font-display text-sm font-bold tracking-wider text-cyan-200">
                    StreamStore
                  </span>
                </div>
              </template>
            </div>

            <!-- Logo de la Franquicia (Mastercard / Visa / Amex) -->
            <div class="flex items-center gap-2">
              <template v-if="brand === 'mastercard' || bankSkin === 'nu' || bankSkin === 'falabella'">
                <!-- Logo Oficial Mastercard (Círculos entrelazados) -->
                <div class="relative inline-flex h-6 w-10 items-center justify-center" aria-label="Mastercard">
                  <span class="absolute left-0 size-6 rounded-full bg-[#eb001b] shadow-sm" />
                  <span class="absolute right-0 size-6 rounded-full bg-[#f79e1b] mix-blend-screen shadow-sm" />
                </div>
              </template>
              <template v-else-if="brand === 'visa' || bankSkin === 'bbva'">
                <span
                  class="font-display text-xl font-black italic tracking-wider drop-shadow"
                  :class="isDarkText ? 'text-blue-900' : 'text-white'"
                >
                  VISA
                </span>
              </template>
              <template v-else-if="brand === 'amex'">
                <div class="rounded bg-cyan-700 px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter text-white shadow-sm">
                  AMERICAN EXPRESS
                </div>
              </template>
              <template v-else>
                <span class="text-[10px] font-mono uppercase tracking-widest text-cyan-300">
                  CRÉDITO / DÉBITO
                </span>
              </template>
            </div>
          </div>

          <!-- Fila Central: Chip EMV Metálico de 6 Contactos + Contactless -->
          <div class="my-auto flex items-center justify-between pt-2">
            <div class="flex items-center gap-3">
              <!-- Chip Metálico EMV con cuadrícula de 6 pines -->
              <div
                class="relative h-8 w-11 rounded-[4px] border shrink-0 overflow-hidden shadow-sm"
                :class="isDarkText ? 'border-neutral-900/30' : 'border-black/25'"
                style="background: linear-gradient(145deg, #f0dfa0 0%, #d4b037 45%, #f5e8b7 70%, #a67c00 100%);"
              >
                <div class="absolute inset-[2.5px] grid grid-cols-3 grid-rows-2 gap-px opacity-45">
                  <span v-for="i in 6" :key="i" class="rounded-[1px] bg-neutral-900/40" />
                </div>
              </div>

              <!-- Símbolo Contactless (Ondas de radiofrecuencia) -->
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                :stroke="isDarkText ? '#171717' : '#ffffff'"
                stroke-width="2"
                stroke-linecap="round"
                class="opacity-80"
              >
                <path d="M8 8.5c2.2 1.8 2.2 5.2 0 7" />
                <path d="M11 5.5c3.5 2.8 3.5 10.2 0 13" />
                <path d="M14 3c4.8 3.8 4.8 14.2 0 18" />
              </svg>
            </div>

            <!-- Holograma metálico adicional para BBVA o StreamStore -->
            <div
              v-if="bankSkin === 'bbva'"
              class="relative size-8 rounded border border-white/40 overflow-hidden"
              style="background: linear-gradient(135deg, #c0c8d4 0%, #e8eef5 30%, #9aa8b8 60%, #d5dde8 100%);"
            >
              <div class="absolute inset-1 rounded-full border border-slate-500/30 opacity-60" />
            </div>
          </div>

          <!-- Fila del Número de Tarjeta (Enmascarado Progresivo) -->
          <div class="pb-1">
            <p
              class="font-mono text-base sm:text-lg font-bold tracking-[0.16em] tabular-nums select-none"
              :class="isDarkText ? 'text-neutral-900' : 'text-white drop-shadow'"
            >
              {{ displayNumero }}
            </p>
          </div>

          <!-- Fila Inferior: Titular y Fecha de Expiración -->
          <div class="flex items-end justify-between pt-1">
            <div class="min-w-0 max-w-[65%]">
              <span
                class="block text-[9px] font-semibold uppercase tracking-wider"
                :class="isDarkText ? 'text-neutral-700' : 'text-white/65'"
              >
                Titular
              </span>
              <p
                class="truncate font-mono text-xs sm:text-sm font-bold tracking-wider"
                :class="isDarkText ? 'text-neutral-900' : 'text-white drop-shadow'"
              >
                {{ displayNombre }}
              </p>
            </div>

            <div class="text-right shrink-0">
              <span
                class="block text-[9px] font-semibold uppercase tracking-wider"
                :class="isDarkText ? 'text-neutral-700' : 'text-white/65'"
              >
                Expira
              </span>
              <p
                class="font-mono text-xs sm:text-sm font-bold tracking-wider"
                :class="isDarkText ? 'text-neutral-900' : 'text-white drop-shadow'"
              >
                {{ displayExpiracion }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= CARA TRASERA ================= -->
      <div
        class="card-face card-back absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl border py-4 shadow-2xl"
        :class="cardContainerClasses"
      >
        <!-- Fondos de la cara trasera correspondientes al skin -->
        <template v-if="bankSkin === 'streamstore'">
          <div class="absolute inset-0 bg-gradient-to-br from-[#0c1322] via-[#11192e] to-[#070b14]" />
        </template>
        <template v-else-if="bankSkin === 'nu'">
          <div class="absolute inset-0 bg-gradient-to-br from-[#9B30D9] via-[#820AD1] to-[#6B09A8]" />
        </template>
        <template v-else-if="bankSkin === 'bancolombia'">
          <div class="absolute inset-0 bg-[#FFDD00]" />
        </template>
        <template v-else-if="bankSkin === 'falabella'">
          <div class="absolute inset-0 bg-gradient-to-b from-[#2E7D32] to-[#1B5E20]" />
        </template>
        <template v-else-if="bankSkin === 'bbva'">
          <div class="absolute inset-0 bg-gradient-to-br from-[#0A2F5C] via-[#004481] to-[#072A4A]" />
        </template>

        <!-- CONTENIDO TRASERO -->
        <div class="relative z-10 flex h-full flex-col justify-between">
          <!-- Leyenda superior -->
          <div class="px-5 pt-1 text-[8px] truncate" :class="isDarkText ? 'text-neutral-700' : 'text-white/60'">
            <template v-if="bankSkin === 'nu'">
              Línea de soporte Nu 800 099 1133 · Chat en la App
            </template>
            <template v-else-if="bankSkin === 'bancolombia'">
              Colombia 018000912345 · Tarjeta de simulación
            </template>
            <template v-else-if="bankSkin === 'falabella'">
              CMR Banco Falabella · Soporte 24/7 simulado
            </template>
            <template v-else-if="bankSkin === 'bbva'">
              Línea BBVA Nacional · Simulación interactiva
            </template>
            <template v-else>
              StreamStore Payment Gateway · Simulación Segura
            </template>
          </div>

          <!-- Banda Magnética Negra Continua -->
          <div class="my-1 h-10 w-full bg-black shadow-inner" />

          <!-- Panel de Firma y CVV -->
          <div class="px-5 my-auto">
            <div class="flex items-center shadow-sm">
              <!-- Franja de firma con trama de seguridad -->
              <div
                class="h-8 flex-1 rounded-l flex items-center px-3 overflow-hidden"
                style="background: repeating-linear-gradient(-45deg, #fafafa, #fafafa 4px, #e2e8f0 4px, #e2e8f0 8px);"
              >
                <span class="font-mono text-[9px] text-neutral-500 italic select-none">
                  firma autorizada · prueba simulada
                </span>
              </div>

              <!-- Recuadro Blanco del CVV con tipografía cursiva -->
              <div class="h-8 w-14 bg-white rounded-r flex items-center justify-center font-mono text-xs font-bold text-neutral-900 border-l border-neutral-300">
                <span class="italic tracking-widest">{{ displayCvv }}</span>
              </div>
            </div>
            <div class="mt-1 flex justify-between text-[9px] font-semibold" :class="isDarkText ? 'text-neutral-700' : 'text-white/60'">
              <span class="pl-1">Seguridad EMV</span>
              <span class="pr-1 uppercase">Código CVV / CVC</span>
            </div>
          </div>

          <!-- Pie de la cara trasera con aviso educativo -->
          <div class="px-5 pb-1 text-[8px] leading-tight text-center" :class="isDarkText ? 'text-neutral-600' : 'text-white/50'">
            Vista previa 3D educativa. No recolecta datos bancarios reales ni transfiere fondos.
          </div>
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
