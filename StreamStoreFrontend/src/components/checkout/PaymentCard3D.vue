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
    bankSkin: 'nu',
    cardKind: 'credito',
  }
)

const emit = defineEmits<{
  toggleFlip: []
}>()

// Estilos dinámicos según el skin de banco seleccionado
const isDarkText = computed(() => props.bankSkin === 'bancolombia')

const ambientGlowClass = computed(() => {
  switch (props.bankSkin) {
    case 'nu':
      return 'bg-purple-600/40'
    case 'bancolombia':
      return 'bg-yellow-400/35'
    case 'falabella':
      return 'bg-emerald-500/40'
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
      return 'border-black/10 text-neutral-900 shadow-2xl'
    case 'falabella':
      return 'border-emerald-400/20 text-white shadow-2xl'
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
        <!-- Skin 1: Nu (Nubank) -->
        <template v-if="bankSkin === 'nu'">
          <div
            class="absolute inset-0"
            style="background: linear-gradient(160deg, #9B30D9 0%, #820AD1 40%, #6B09A8 100%);"
          />
          <div class="pointer-events-none absolute -right-10 top-8 size-40 rounded-full bg-white/5" />
          <div class="pointer-events-none absolute -left-8 -bottom-10 size-36 rounded-full bg-black/10" />

          <!-- Estructura Nu -->
          <div class="relative z-10 flex h-full flex-col justify-between">
            <div class="flex justify-between items-start">
              <span
                class="text-[28px] font-black lowercase leading-none tracking-tighter text-white"
                style="font-family: Arial Black, Arial, sans-serif;"
              >
                nu
              </span>
              <div class="flex flex-col items-end gap-1.5">
                <span class="text-[8px] uppercase tracking-[0.2em] text-white/60 font-mono font-semibold">
                  {{ cardKind === 'credito' ? 'Credito' : 'Debito' }}
                </span>
                <!-- Logo Mastercard -->
                <div class="relative inline-block w-9 h-5.5" aria-hidden="true">
                  <span class="absolute left-0 top-0 w-[58%] h-full rounded-full bg-[#eb001b]" />
                  <span class="absolute right-0 top-0 w-[58%] h-full rounded-full bg-[#f79e1b] mix-blend-screen" />
                </div>
              </div>
            </div>

            <!-- Contactless + Chip EMV en el lado derecho -->
            <div class="flex items-center justify-end gap-2 my-auto pr-1">
              <!-- Contactless -->
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M8 8.5c2.2 1.8 2.2 5.2 0 7" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" />
                <path d="M11 5.5c3.5 2.8 3.5 10.2 0 13" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" />
                <path d="M14 3c4.8 3.8 4.8 14.2 0 18" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" />
              </svg>

              <!-- Chip EMV Dorado 6 contactos -->
              <div
                class="relative w-9 h-7 rounded-[3px] border border-black/20 shrink-0 overflow-hidden shadow-sm"
                style="background: linear-gradient(145deg, #e8d48b 0%, #c9a227 45%, #f0e0a0 70%, #a67c00 100%);"
                aria-hidden="true"
              >
                <div class="absolute inset-[3px] grid grid-cols-3 grid-rows-2 gap-px opacity-40">
                  <span v-for="i in 6" :key="i" class="bg-black/30 rounded-[1px]" />
                </div>
              </div>
            </div>

            <!-- Número, Titular y Expiración -->
            <div class="mt-auto">
              <p class="text-[13px] sm:text-[14px] font-mono tracking-[0.16em] tabular-nums text-white">
                {{ displayNumero }}
              </p>
              <div class="flex justify-between items-end mt-2 gap-2">
                <p class="text-[11px] font-semibold tracking-[0.08em] truncate uppercase text-white">
                  {{ displayNombre }}
                </p>
                <p class="text-[10px] font-mono text-white/85 shrink-0">
                  {{ displayExpiracion }}
                </p>
              </div>
            </div>
          </div>
        </template>

        <!-- Skin 2: Bancolombia -->
        <template v-else-if="bankSkin === 'bancolombia'">
          <div class="absolute inset-0 bg-[#FFDD00]" />
          <!-- Curvas dinámicas de colores oficiales estilo Bancolombia -->
          <svg
            class="absolute left-0 top-0 h-full w-[55%] pointer-events-none"
            viewBox="0 0 120 160"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path d="M-10 20 C40 10, 50 50, 20 90 C-5 120, 30 150, 70 160" fill="none" stroke="#00A651" stroke-width="14" stroke-linecap="round" />
            <path d="M0 35 C45 25, 55 60, 25 95 C5 120, 40 145, 80 155" fill="none" stroke="#7B2D8E" stroke-width="11" stroke-linecap="round" />
            <path d="M5 55 C40 50, 48 80, 28 110 C12 130, 45 148, 75 152" fill="none" stroke="#00A3E0" stroke-width="9" stroke-linecap="round" />
            <path d="M15 75 C42 78, 50 100, 40 125 C32 140, 55 150, 70 148" fill="none" stroke="#E85D75" stroke-width="8" stroke-linecap="round" />
          </svg>

          <!-- Estructura Bancolombia -->
          <div class="relative z-10 flex h-full flex-col justify-between text-black">
            <div class="flex justify-between items-start">
              <span class="text-[11px] font-medium lowercase font-sans">
                {{ cardKind === 'credito' ? 'credito' : 'debito' }}
              </span>

              <!-- Isotipo Bancolombia -->
              <span class="inline-flex items-center gap-1.5 text-xs font-bold tracking-tight">
                <span class="flex flex-col gap-[2px]" aria-hidden="true">
                  <span class="block w-2.5 h-[2px] bg-black rounded-sm" />
                  <span class="block w-3.5 h-[2px] bg-black rounded-sm" />
                  <span class="block w-4.5 h-[2px] bg-black rounded-sm" />
                </span>
                <span>Bancolombia</span>
              </span>
            </div>

            <!-- Chip EMV + Contactless a la izquierda -->
            <div class="flex items-center gap-2 my-auto ml-1 relative z-10">
              <div
                class="relative w-9 h-7 rounded-[3px] border border-black/30 shrink-0 overflow-hidden shadow-sm"
                style="background: linear-gradient(145deg, #e8d48b 0%, #c9a227 45%, #f0e0a0 70%, #a67c00 100%);"
                aria-hidden="true"
              >
                <div class="absolute inset-[3px] grid grid-cols-3 grid-rows-2 gap-px opacity-50">
                  <span v-for="i in 6" :key="i" class="bg-black/30 rounded-[1px]" />
                </div>
              </div>

              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M8 8.5c2.2 1.8 2.2 5.2 0 7" stroke="#111111" stroke-width="1.8" stroke-linecap="round" />
                <path d="M11 5.5c3.5 2.8 3.5 10.2 0 13" stroke="#111111" stroke-width="1.8" stroke-linecap="round" />
                <path d="M14 3c4.8 3.8 4.8 14.2 0 18" stroke="#111111" stroke-width="1.8" stroke-linecap="round" />
              </svg>
            </div>

            <!-- Número, Titular y Expiración con Logo Mastercard -->
            <div class="mt-auto relative z-10">
              <p class="text-[12px] sm:text-[13px] font-mono tracking-[0.14em] tabular-nums text-black/90">
                {{ displayNumero }}
              </p>
              <div class="flex justify-between items-end mt-1.5 gap-2">
                <p class="text-[11px] font-bold tracking-wide truncate uppercase text-black">
                  {{ displayNombre }}
                </p>
                <div class="flex items-center gap-2 shrink-0">
                  <p class="text-[10px] font-mono text-black/85">{{ displayExpiracion }}</p>
                  <!-- Logo Mastercard -->
                  <div class="relative inline-block w-8 h-5" aria-hidden="true">
                    <span class="absolute left-0 top-0 w-[58%] h-full rounded-full bg-[#eb001b]" />
                    <span class="absolute right-0 top-0 w-[58%] h-full rounded-full bg-[#f79e1b] mix-blend-screen" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Skin 3: Falabella CMR -->
        <template v-else-if="bankSkin === 'falabella'">
          <div
            class="absolute inset-0"
            style="background: linear-gradient(180deg, #43A047 0%, #2E7D32 55%, #1B5E20 100%);"
          />
          <div class="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_45%)]" />

          <!-- Estructura Falabella CMR -->
          <div class="relative z-10 flex h-full flex-col justify-between text-white">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div
                  class="relative w-8 h-6 rounded-[3px] border border-black/20 shrink-0 overflow-hidden"
                  style="background: linear-gradient(145deg, #e8d48b 0%, #c9a227 45%, #f0e0a0 70%, #a67c00 100%);"
                >
                  <div class="absolute inset-[2px] grid grid-cols-3 grid-rows-2 gap-px opacity-40">
                    <span v-for="i in 6" :key="i" class="bg-black/30 rounded-[1px]" />
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M8 8.5c2.2 1.8 2.2 5.2 0 7" stroke="#fff" stroke-width="1.8" stroke-linecap="round" />
                  <path d="M11 5.5c3.5 2.8 3.5 10.2 0 13" stroke="#fff" stroke-width="1.8" stroke-linecap="round" />
                  <path d="M14 3c4.8 3.8 4.8 14.2 0 18" stroke="#fff" stroke-width="1.8" stroke-linecap="round" />
                </svg>
              </div>

              <span class="text-[8px] uppercase tracking-[0.18em] text-white/70 font-mono">
                {{ cardKind === 'credito' ? 'Credito' : 'Debito' }}
              </span>
            </div>

            <div class="my-auto">
              <p class="text-[30px] font-black tracking-tight leading-none text-white font-sans">
                CMR
              </p>
              <p class="text-[10px] font-medium mt-1 tracking-wide text-white/90">Banco Falabella</p>
            </div>

            <div class="mt-auto">
              <p class="text-[12px] font-mono tracking-[0.12em] tabular-nums text-white">
                {{ displayNumero }}
              </p>
              <div class="flex justify-between items-end mt-1.5 gap-2">
                <p class="text-[10px] font-semibold truncate uppercase text-white tracking-wide">
                  {{ displayNombre }}
                </p>
                <div class="flex items-center gap-2 shrink-0">
                  <p class="text-[10px] font-mono text-white/90">{{ displayExpiracion }}</p>
                  <div class="relative inline-block w-8 h-5">
                    <span class="absolute left-0 top-0 w-[58%] h-full rounded-full bg-[#eb001b]" />
                    <span class="absolute right-0 top-0 w-[58%] h-full rounded-full bg-[#f79e1b] mix-blend-screen" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Skin 4: BBVA Aqua -->
        <template v-else-if="bankSkin === 'bbva'">
          <!-- Patrón Geométrico Poligonal BBVA -->
          <svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 340 200" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="bbvaBaseSvg2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#0A2F5C" />
                <stop offset="55%" stop-color="#004481" />
                <stop offset="100%" stop-color="#072A4A" />
              </linearGradient>
            </defs>
            <rect width="340" height="200" fill="url(#bbvaBaseSvg2)" />
            <polygon points="0,0 90,0 40,70" fill="#1464A5" opacity="0.55" />
            <polygon points="90,0 170,0 120,55" fill="#0D3B6E" opacity="0.7" />
            <polygon points="170,0 260,0 210,80" fill="#1A6FB0" opacity="0.45" />
            <polygon points="260,0 340,0 340,60 280,40" fill="#0B355F" opacity="0.8" />
            <polygon points="40,70 120,55 160,120 70,130" fill="#155A96" opacity="0.4" />
            <polygon points="120,55 210,80 230,140 160,120" fill="#0E4478" opacity="0.55" />
            <polygon points="210,80 280,40 340,60 340,130 250,150" fill="#1976B8" opacity="0.35" />
            <polygon points="0,90 70,130 50,200 0,200" fill="#0A3A68" opacity="0.65" />
          </svg>

          <!-- Estructura BBVA -->
          <div class="relative z-10 flex h-full flex-col justify-between text-white">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-[12px] font-bold tracking-[0.2em] uppercase text-white font-sans">BBVA</p>
                <p class="text-[7px] uppercase tracking-widest text-white/60 mt-0.5 font-mono">
                  {{ cardKind === 'credito' ? 'Credito' : 'Debito' }}
                </p>
              </div>
              <div class="relative inline-block w-8 h-5">
                <span class="absolute left-0 top-0 w-[58%] h-full rounded-full bg-[#eb001b]" />
                <span class="absolute right-0 top-0 w-[58%] h-full rounded-full bg-[#f79e1b] mix-blend-screen" />
              </div>
            </div>

            <!-- Chip + Holograma -->
            <div class="flex items-center justify-between my-auto">
              <div
                class="relative w-9 h-7 rounded-[3px] border border-white/20 shrink-0 overflow-hidden"
                style="background: linear-gradient(145deg, #e8d48b 0%, #c9a227 45%, #f0e0a0 70%, #a67c00 100%);"
              >
                <div class="absolute inset-[3px] grid grid-cols-3 grid-rows-2 gap-px opacity-40">
                  <span v-for="i in 6" :key="i" class="bg-black/30 rounded-[1px]" />
                </div>
              </div>

              <!-- Holograma de seguridad metálico -->
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

        <!-- Skin 5 (Default): StreamStore Cyber Dark -->
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
        class="card-face card-back absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl border py-4 shadow-2xl"
        :class="cardContainerClasses"
      >
        <!-- Fondos de la cara trasera correspondientes al skin -->
        <div
          v-if="bankSkin === 'nu'"
          class="absolute inset-0"
          style="background: linear-gradient(160deg, #9B30D9 0%, #820AD1 50%, #6B09A8 100%);"
        />
        <div v-else-if="bankSkin === 'bancolombia'" class="absolute inset-0 bg-[#FFDD00]" />
        <div
          v-else-if="bankSkin === 'falabella'"
          class="absolute inset-0"
          style="background: linear-gradient(180deg, #2E7D32 0%, #1B5E20 100%);"
        />
        <div
          v-else-if="bankSkin === 'bbva'"
          class="absolute inset-0"
          style="background: linear-gradient(160deg, #0A2F5C 0%, #004481 50%, #072A4A 100%);"
        />
        <div v-else class="absolute inset-0 bg-gradient-to-br from-[#0c1322] via-[#11192e] to-[#070b14]" />

        <!-- CONTENIDO TRASERO -->
        <div class="relative z-10 flex h-full flex-col justify-between">
          <div class="px-4 text-[7px] truncate" :class="isDarkText ? 'text-black/60' : 'text-white/60'">
            <span v-if="bankSkin === 'nu'">Necesitas ayuda? Abre el chat en la app · Valida en todo el mundo</span>
            <span v-else-if="bankSkin === 'bancolombia'">Colombia 018000912345 · Simulacion StreamStore</span>
            <span v-else-if="bankSkin === 'falabella'">CMR Banco Falabella · Simulacion StreamStore</span>
            <span v-else>Atencion 24/7 · Simulacion StreamStore</span>
          </div>

          <!-- Banda Magnética Negra -->
          <div class="my-1 h-9 bg-black w-full" />

          <!-- Panel de Firma y CVV -->
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
            <div class="mt-1 flex justify-between text-[8px] font-semibold" :class="isDarkText ? 'text-black/60' : 'text-white/60'">
              <span class="pl-0.5">Seguridad EMV</span>
              <span class="pr-0.5 uppercase">Codigo CVV</span>
            </div>
          </div>

          <div class="px-4 pb-0.5 text-[7px] text-center" :class="isDarkText ? 'text-black/50' : 'text-white/50'">
            Vista previa visual interactiva. No se almacenan ni procesan datos bancarios reales.
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
