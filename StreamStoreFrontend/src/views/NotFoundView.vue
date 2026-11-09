<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Film, Home } from '@lucide/vue'
import { useClientFonts } from '@/composables/useClientFonts'
import '@/styles/client-ui.css'

useClientFonts()

const route = useRoute()
const router = useRouter()

// Dirección solicitada para el terminal OSD
const rutaSolicitada = computed(() => decodeURIComponent(route.fullPath || '/desconocido'))

const videoRef = ref<HTMLVideoElement | null>(null)

// Temporizador digital de emisión retro
const retroTime = ref('00:04:04')
let clockInterval: any = null

onMounted(() => {
  const updateClock = () => {
    const now = new Date()
    const hh = String(now.getHours()).padStart(2, '0')
    const mm = String(now.getMinutes()).padStart(2, '0')
    const ss = String(now.getSeconds()).padStart(2, '0')
    retroTime.value = `${hh}:${mm}:${ss}`
  }
  updateClock()
  clockInterval = setInterval(updateClock, 1000)

  // Autoplay del video de estática de fondo
  if (videoRef.value) {
    videoRef.value.play().catch(() => {
      if (videoRef.value) {
        videoRef.value.muted = true
        videoRef.value.play().catch(() => {})
      }
    })
  }
})

onUnmounted(() => {
  if (clockInterval) clearInterval(clockInterval)
})

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<template>
  <!-- CONTENEDOR FULLSCREEN EDGE-TO-EDGE -->
  <div class="fixed inset-0 z-50 h-screen w-screen overflow-hidden bg-black text-white select-none flex flex-col justify-between">
    
    <!-- VIDEO DE ESTÁTICA FULLSCREEN DE FONDO -->
    <video
      ref="videoRef"
      src="/estatica.mp4"
      autoplay
      loop
      muted
      playsinline
      preload="auto"
      class="absolute inset-0 h-full w-full object-cover select-none pointer-events-none opacity-90 contrast-125 brightness-90 z-0"
    />

    <!-- LÍNEAS DE ESCANEO SCANLINES Y VIÑETA CRT -->
    <div
      class="pointer-events-none absolute inset-0 z-10 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.6)_0px,rgba(0,0,0,0.6)_2px,transparent_2px,transparent_4px)] opacity-75"
      aria-hidden="true"
    />
    <div class="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.92)_100%)]" aria-hidden="true" />
    <div class="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/85 via-transparent to-black/75" aria-hidden="true" />

    <!-- =================== CABECERA SOBRIA =================== -->
    <header class="relative z-30 flex items-center justify-between p-5 sm:p-7 backdrop-blur-sm bg-gradient-to-b from-black/80 to-transparent">
      <RouterLink
        to="/"
        class="flex items-center gap-2.5 group focus:outline-none"
        title="Ir al inicio de StreamStore"
      >
        <img
          src="/streamstore_icon.png"
          alt="StreamStore"
          class="size-8 sm:size-9 object-contain drop-shadow-[0_0_12px_rgba(128,87,255,0.8)] group-hover:scale-105 transition-transform"
        />
        <span class="font-display text-lg sm:text-xl font-black uppercase tracking-tight text-white flex items-baseline">
          <span>STREAM</span>
          <span class="bg-gradient-to-r from-[#8057FF] via-[#9B51E0] to-[#06B6D4] bg-clip-text text-transparent">STORE</span>
        </span>
      </RouterLink>

      <div class="flex items-center gap-3 font-mono text-xs sm:text-sm text-neutral-400">
        <div class="flex items-center gap-2 bg-black/60 border border-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
          <span class="size-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]" />
          <span class="text-rose-400 font-bold uppercase tracking-wider">CH-404</span>
          <span class="text-neutral-500">|</span>
          <span class="text-neutral-300">SIN SEÑAL</span>
        </div>
        <span class="hidden sm:inline-block text-neutral-500 font-mono text-xs">
          [{{ retroTime }}]
        </span>
      </div>
    </header>

    <!-- =================== CENTRO DE PANTALLA: EL 404 GLITCH Y BOTONERA REACOMODADA =================== -->
    <main class="relative z-20 my-auto flex flex-col items-center justify-center px-4 text-center max-w-2xl mx-auto w-full">
      
      <!-- BARRAS DE COLOR SMPTE -->
      <div class="flex items-center justify-center gap-2 sm:gap-2.5 mb-3 opacity-95 drop-shadow-[0_0_15px_rgba(0,0,0,0.9)]">
        <span class="h-2.5 w-8 sm:w-12 rounded-sm bg-white" />
        <span class="h-2.5 w-8 sm:w-12 rounded-sm bg-yellow-400" />
        <span class="h-2.5 w-8 sm:w-12 rounded-sm bg-cyan-400" />
        <span class="h-2.5 w-8 sm:w-12 rounded-sm bg-emerald-500" />
        <span class="h-2.5 w-8 sm:w-12 rounded-sm bg-fuchsia-500" />
        <span class="h-2.5 w-8 sm:w-12 rounded-sm bg-rose-500" />
        <span class="h-2.5 w-8 sm:w-12 rounded-sm bg-blue-600" />
      </div>

      <!-- EL 404 GIGANTE CON DESPLAZAMIENTO CROMÁTICO -->
      <div class="relative py-1">
        <h1
          class="tv-glitch-fullscreen text-[clamp(6rem,4.5rem+14vw,13rem)] font-black leading-none tracking-tighter select-none font-mono"
          data-text="404"
        >
          404
        </h1>
      </div>

      <!-- RÓTULO HOLOGRÁFICO -->
      <div class="mt-2 inline-flex items-center gap-2.5 rounded-full border border-rose-500/50 bg-black/85 px-6 sm:px-8 py-2 text-sm sm:text-base font-black text-white shadow-[0_0_30px_rgba(244,63,94,0.35)] backdrop-blur-xl">
        <span class="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
        <span class="tracking-wider uppercase">CANAL SIN SEÑAL</span>
      </div>

      <p class="mt-3 text-xs sm:text-sm text-neutral-300 tracking-wide font-mono uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] max-w-md">
        LA TRANSMISIÓN O PÁGINA SOLICITADA NO EXISTE O NO ESTÁ DISPONIBLE
      </p>

      <!-- TICKER DE DIRECCIÓN SOLICITADA -->
      <div class="mt-3.5 inline-flex items-center gap-2 rounded-xl border border-white/20 bg-black/75 px-4 sm:px-5 py-1.5 text-xs sm:text-sm font-mono text-cyan-300 shadow-xl backdrop-blur-md max-w-lg truncate">
        <span class="text-neutral-400 font-semibold">&gt; RUTA SOLICITADA:</span>
        <span class="truncate font-bold">{{ rutaSolicitada }}</span>
        <span class="animate-pulse text-cyan-400 font-bold">_</span>
      </div>

      <!-- =================== BOTONES REACOMODADOS DE FORMA INTEGRADA Y EQUILIBRADA =================== -->
      <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-3.5 w-full max-w-lg sm:max-w-none">
        
        <!-- Botón Canal Principal -->
        <RouterLink
          to="/"
          class="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#8057FF] via-[#9B51E0] to-[#06B6D4] px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-[0_0_28px_rgba(128,87,255,0.45)] transition-all hover:scale-105 hover:shadow-[0_0_36px_rgba(6,182,212,0.6)] active:scale-95"
        >
          <Home class="size-4 transition-transform group-hover:-translate-y-0.5" />
          <span>Canal Principal</span>
        </RouterLink>

        <!-- Botón Ver Catálogo Completo -->
        <RouterLink
          to="/catalogo"
          class="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl border border-white/25 bg-black/70 px-6 py-3.5 text-xs sm:text-sm font-semibold text-white backdrop-blur-xl transition-all hover:bg-white/15 hover:border-cyan-400/50 active:scale-95 shadow-lg"
        >
          <Film class="size-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span>Ver Catálogo Completo</span>
        </RouterLink>

        <!-- Botón Atrás -->
        <button
          type="button"
          class="group w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-black/50 px-5 py-3.5 text-xs sm:text-sm font-medium text-neutral-300 hover:text-white hover:border-white/35 backdrop-blur-xl transition-all active:scale-95 shadow-lg"
          title="Volver a la página anterior"
          @click="goBack"
        >
          <ArrowLeft class="size-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Atrás</span>
        </button>

      </div>

    </main>

    <!-- =================== PIE DE PÁGINA SOBRIO Y ELEGANTE =================== -->
    <footer class="relative z-30 p-4 sm:p-5 text-center">
      <span class="font-mono text-[11px] text-neutral-400 tracking-wider">
        STREAMSTORE BROADCAST SYSTEM · ERROR 404
      </span>
    </footer>

  </div>
</template>

<style scoped>
/* =================== TIPOGRAFÍA GLITCH CRT 404 FULLSCREEN =================== */
.tv-glitch-fullscreen {
  color: #ffffff;
  position: relative;
  text-shadow: 
    0 0 15px rgba(255, 255, 255, 0.95),
    0 0 35px rgba(128, 87, 255, 0.9),
    0 0 75px rgba(6, 182, 212, 0.8);
  animation: glitch-flicker 2.5s infinite;
}

.tv-glitch-fullscreen::before,
.tv-glitch-fullscreen::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* Desplazamiento cromático cian */
.tv-glitch-fullscreen::before {
  left: 4px;
  text-shadow: -4px 0 #06B6D4;
  clip-path: rect(24px, 950px, 90px, 0);
  animation: glitch-anim-1 2s infinite linear alternate-reverse;
}

/* Desplazamiento cromático rojo/magenta */
.tv-glitch-fullscreen::after {
  left: -4px;
  text-shadow: -4px 0 #ef4444;
  clip-path: rect(85px, 950px, 140px, 0);
  animation: glitch-anim-2 2.5s infinite linear alternate-reverse;
}

@keyframes glitch-anim-1 {
  0% {
    clip-path: inset(40% 0 61% 0);
    transform: skew(0.5deg);
  }
  20% {
    clip-path: inset(92% 0 1% 0);
    transform: skew(-0.7deg);
  }
  40% {
    clip-path: inset(10% 0 80% 0);
    transform: skew(1deg);
  }
  60% {
    clip-path: inset(65% 0 20% 0);
    transform: skew(-0.5deg);
  }
  80% {
    clip-path: inset(25% 0 58% 0);
    transform: skew(0.6deg);
  }
  100% {
    clip-path: inset(5% 0 88% 0);
    transform: skew(-0.4deg);
  }
}

@keyframes glitch-anim-2 {
  0% {
    clip-path: inset(25% 0 58% 0);
    transform: skew(-1deg);
  }
  20% {
    clip-path: inset(54% 0 7% 0);
    transform: skew(0.6deg);
  }
  40% {
    clip-path: inset(70% 0 15% 0);
    transform: skew(-0.6deg);
  }
  60% {
    clip-path: inset(12% 0 72% 0);
    transform: skew(0.8deg);
  }
  80% {
    clip-path: inset(80% 0 5% 0);
    transform: skew(-0.4deg);
  }
  100% {
    clip-path: inset(38% 0 49% 0);
    transform: skew(0.5deg);
  }
}

@keyframes glitch-flicker {
  0%, 100% {
    opacity: 1;
  }
  41.99% {
    opacity: 1;
  }
  42% {
    opacity: 0.7;
  }
  43% {
    opacity: 1;
  }
  45% {
    opacity: 0.2;
  }
  46% {
    opacity: 1;
  }
}
</style>
