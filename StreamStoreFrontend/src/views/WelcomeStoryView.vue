<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowRight, 
  ChevronDown, 
  Film, 
  Pause, 
  Play, 
  SkipForward, 
  Sparkles, 
  Tv, 
  Volume2, 
  VolumeX 
} from '@lucide/vue'
import AppLogo from '@/components/layout/AppLogo.vue'

const router = useRouter()

const currentScene = ref(0)
const isAutoPlaying = ref(true)
const isMuted = ref(false)
const speechSupported = ref(false)

const scenes = [
  {
    tag: 'INTRODUCCIÓN',
    title: 'El entretenimiento cambió.',
    subtitle: 'Múltiples suscripciones, precios elevados y límites que no necesitas.',
    narration: 'Imagina tener todo tu entretenimiento favorito en un solo lugar, sin pagar de más por suscripciones costosas.',
    highlight: '¿Por qué pagar de más por lo que no usas?',
  },
  {
    tag: 'LA SOLUCIÓN',
    title: 'Bienvenido a StreamStore.',
    subtitle: 'La tienda virtual moderna de cuentas completas y pantallas individuales de streaming.',
    narration: 'Bienvenido a Stream Store. Tu tienda virtual para adquirir cuentas completas y pantallas individuales con los mejores precios.',
    highlight: 'Acceso directo, confiable y sin complicaciones.',
  },
  {
    tag: 'CATÁLOGO OFICIAL',
    title: 'Tus plataformas preferidas.',
    subtitle: 'Netflix, Disney+, Prime Video y Max disponibles con stock verificado en tiempo real.',
    narration: 'Disfruta de Netflix, Disney Plus, Prime Video y Max con entrega digital inmediata y garantía garantizada de 30 días.',
    highlight: 'Activación digital en menos de un minuto.',
  },
  {
    tag: 'MODALIDADES INTELIGENTES',
    title: 'Elige tu forma de disfrutar.',
    subtitle: 'Adquiere una Cuenta Completa con todas las pantallas o una Pantalla Individual con perfil y PIN exclusivo.',
    narration: 'Elige una cuenta completa para toda tu familia, o ahorra hasta un 70 por ciento comprando una pantalla individual con PIN privado.',
    highlight: 'Ahorro de hasta un 70% en cada factura.',
  },
  {
    tag: 'LISTO PARA COMENZAR',
    title: 'Tu experiencia empieza ahora.',
    subtitle: 'Paga de forma segura, consulta tus credenciales protegidas en tu panel y disfruta del mejor contenido.',
    narration: 'Paga de forma rápida y segura. Tus credenciales estarán disponibles de inmediato en tu cuenta. Bienvenido a Stream Store.',
    highlight: 'Bienvenido a la comunidad StreamStore.',
  },
]

let autoPlayTimer: any = null

function speakText(text: string) {
  if (isMuted.value || !speechSupported.value) return
  try {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'es-ES'
    utterance.rate = 0.95
    utterance.pitch = 1.0
    // Buscar voz en español disponible
    const voices = window.speechSynthesis.getVoices()
    const esVoice = voices.find((v) => v.lang.startsWith('es'))
    if (esVoice) utterance.voice = esVoice
    window.speechSynthesis.speak(utterance)
  } catch {
    // Manejo silencioso en navegadores sin soporte
  }
}

function nextScene() {
  if (currentScene.value < scenes.length - 1) {
    currentScene.value++
    speakText(scenes[currentScene.value].narration)
  } else {
    goToHome()
  }
}

function prevScene() {
  if (currentScene.value > 0) {
    currentScene.value--
    speakText(scenes[currentScene.value].narration)
  }
}

function setScene(index: number) {
  currentScene.value = index
  speakText(scenes[index].narration)
}

function toggleAutoPlay() {
  isAutoPlaying.value = !isAutoPlaying.value
  if (isAutoPlaying.value) {
    startAutoPlayLoop()
  } else if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
  }
}

function toggleMute() {
  isMuted.value = !isMuted.value
  if (isMuted.value) {
    if (speechSupported.value) window.speechSynthesis.cancel()
  } else {
    speakText(scenes[currentScene.value].narration)
  }
}

function startAutoPlayLoop() {
  if (autoPlayTimer) clearInterval(autoPlayTimer)
  autoPlayTimer = setInterval(() => {
    if (isAutoPlaying.value) {
      if (currentScene.value < scenes.length - 1) {
        currentScene.value++
        speakText(scenes[currentScene.value].narration)
      } else {
        clearInterval(autoPlayTimer)
        isAutoPlaying.value = false
      }
    }
  }, 6500)
}

function goToHome() {
  if (speechSupported.value) window.speechSynthesis.cancel()
  router.push('/')
}

function goToCatalog() {
  if (speechSupported.value) window.speechSynthesis.cancel()
  router.push('/catalogo')
}

// Control mediante teclado para accesibilidad
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault()
    nextScene()
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    prevScene()
  } else if (e.key === 'Escape') {
    goToHome()
  }
}

// Control de scroll para Scrollytelling
function handleWheel(e: WheelEvent) {
  if (Math.abs(e.deltaY) > 50) {
    if (e.deltaY > 0) {
      nextScene()
    } else {
      prevScene()
    }
  }
}

onMounted(() => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    speechSupported.value = true
    // Iniciar con la narración de la primera escena
    setTimeout(() => {
      speakText(scenes[0].narration)
    }, 600)
  }
  startAutoPlayLoop()
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('wheel', handleWheel, { passive: true })
})

onBeforeUnmount(() => {
  if (autoPlayTimer) clearInterval(autoPlayTimer)
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    window.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('wheel', handleWheel)
  }
})
</script>

<template>
  <div
    class="relative min-h-screen w-full overflow-hidden bg-black text-white select-none transition-colors duration-1000 flex flex-col justify-between"
    role="region"
    aria-label="Video interactivo de bienvenida StreamStore"
  >
    <!-- Fondo cinematográfico animado con haces de luz y partículas -->
    <div class="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <!-- Glow centrado que reacciona a la escena -->
      <div
        class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-1000"
        :class="[
          currentScene === 0 ? 'size-64 bg-neutral-900/40 blur-3xl' :
          currentScene === 1 ? 'size-96 bg-brand-500/25 blur-3xl scale-125' :
          currentScene === 2 ? 'size-[500px] bg-blue-600/20 blur-3xl scale-150' :
          currentScene === 3 ? 'size-[500px] bg-purple-600/25 blur-3xl scale-125' :
          'size-[600px] bg-emerald-500/20 blur-3xl scale-150'
        ]"
      />

      <!-- Líneas de textura cinematográfica -->
      <div class="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />

      <!-- Viñeta cinematográfica (bordes oscuros) -->
      <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-90" />
      <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80" />
    </div>

    <!-- Barra superior de control (Logo, Saltar, Audio, Autoplay) -->
    <header class="relative z-20 flex items-center justify-between px-6 py-6 sm:px-10">
      <div class="flex items-center gap-3">
        <AppLogo size="sm" />
        <span class="ml-2 hidden rounded-full border border-white/20 bg-white/5 px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-white/60 sm:inline-block">
          Experiencia Audiovisual
        </span>
      </div>

      <div class="flex items-center gap-2 sm:gap-4">
        <!-- Control de voz / mute -->
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white backdrop-blur hover:bg-white/20 focus:outline-none"
          :aria-label="isMuted ? 'Activar voz de narración' : 'Silenciar narración'"
          @click="toggleMute"
        >
          <component :is="isMuted ? VolumeX : Volume2" class="size-4" aria-hidden="true" />
          <span class="hidden sm:inline">{{ isMuted ? 'Activar voz' : 'Voz activa' }}</span>
        </button>

        <!-- Control de reproducción automática -->
        <button
          type="button"
          class="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white backdrop-blur hover:bg-white/20 focus:outline-none"
          :aria-label="isAutoPlaying ? 'Pausar avance automático' : 'Reanudar avance automático'"
          @click="toggleAutoPlay"
        >
          <component :is="isAutoPlaying ? Pause : Play" class="size-4" aria-hidden="true" />
          <span class="hidden sm:inline">{{ isAutoPlaying ? 'Pausar' : 'Reproducir' }}</span>
        </button>

        <!-- Botón para saltar e ir al Home de inmediato -->
        <button
          type="button"
          class="btn-primary text-xs py-1.5 px-4 shadow-lg shadow-brand-500/30"
          @click="goToHome"
        >
          <span>Ir al Home</span>
          <SkipForward class="size-3.5" aria-hidden="true" />
        </button>
      </div>
    </header>

    <!-- Barra de progreso superior estilo historia / reel -->
    <div class="relative z-20 px-6 sm:px-10">
      <div class="grid grid-cols-5 gap-2">
        <button
          v-for="(scene, idx) in scenes"
          :key="idx"
          type="button"
          class="group relative h-1.5 rounded-full overflow-hidden bg-white/20 transition-all focus:outline-none"
          :aria-label="`Ir a escena ${idx + 1}: ${scene.title}`"
          @click="setScene(idx)"
        >
          <div
            class="h-full bg-brand-400 transition-all duration-300"
            :style="{
              width: currentScene > idx ? '100%' : currentScene === idx ? '100%' : '0%'
            }"
            :class="{ 'animate-pulse': currentScene === idx && isAutoPlaying }"
          />
        </button>
      </div>
    </div>

    <!-- Escena Central Dinámica (Scrollytelling Content) -->
    <main class="relative z-20 my-auto flex flex-col items-center justify-center px-6 py-12 text-center max-w-4xl mx-auto">
      <transition mode="out-in" name="scene-fade">
        <div :key="currentScene" class="space-y-6">
          <!-- Tag de la escena -->
          <div class="inline-flex items-center gap-2 rounded-full border border-brand-400/40 bg-brand-500/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-300 backdrop-blur">
            <Sparkles class="size-3.5" aria-hidden="true" />
            <span>{{ scenes[currentScene].tag }} · 0{{ currentScene + 1 }}/05</span>
          </div>

          <!-- Título cinematográfico -->
          <h1 class="font-display text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-[1.08] text-white drop-shadow-2xl">
            {{ scenes[currentScene].title }}
          </h1>

          <!-- Subtítulo descriptivo -->
          <p class="mx-auto max-w-2xl text-base sm:text-xl text-neutral-300 font-light leading-relaxed">
            {{ scenes[currentScene].subtitle }}
          </p>

          <!-- Elemento visual interactivo según la escena -->
          <div class="py-4">
            <!-- Escena 1: Icono Streaming pulsante -->
            <div v-if="currentScene === 0" class="flex justify-center">
              <div class="size-20 rounded-2xl bg-neutral-900 border border-neutral-700 grid place-items-center animate-pulse">
                <Film class="size-10 text-neutral-400" />
              </div>
            </div>

            <!-- Escena 2: Logo luminoso gigante -->
            <div v-else-if="currentScene === 1" class="flex justify-center">
              <div class="p-6 rounded-3xl bg-brand-950/40 border border-brand-500/40 shadow-2xl shadow-brand-500/30 flex items-center gap-4">
                <span class="grid size-16 place-items-center rounded-2xl bg-brand-500 text-white shadow-xl shadow-brand-500/50">
                  <Tv class="size-9" />
                </span>
                <span class="font-display text-3xl sm:text-4xl font-black tracking-tight text-white">
                  Stream<span class="text-brand-300">Store</span>
                </span>
              </div>
            </div>

            <!-- Escena 3: Plataformas insignias -->
            <div v-else-if="currentScene === 2" class="flex flex-wrap justify-center gap-3">
              <span class="rounded-xl border border-red-500/50 bg-red-950/40 px-4 py-2 font-display text-sm font-bold text-red-400">
                Netflix
              </span>
              <span class="rounded-xl border border-blue-500/50 bg-blue-950/40 px-4 py-2 font-display text-sm font-bold text-blue-400">
                Disney+
              </span>
              <span class="rounded-xl border border-sky-500/50 bg-sky-950/40 px-4 py-2 font-display text-sm font-bold text-sky-400">
                Prime Video
              </span>
              <span class="rounded-xl border border-purple-500/50 bg-purple-950/40 px-4 py-2 font-display text-sm font-bold text-purple-400">
                Max
              </span>
            </div>

            <!-- Escena 4: Comparativa de modalidades -->
            <div v-else-if="currentScene === 3" class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto text-left">
              <div class="rounded-xl border border-brand-500/30 bg-surface-2/60 p-4">
                <p class="text-xs font-bold uppercase text-brand-300">Cuenta Completa</p>
                <p class="text-xs text-neutral-300 mt-1">Todas las pantallas a tu disposición para compartir en familia.</p>
              </div>
              <div class="rounded-xl border border-blue-500/30 bg-surface-2/60 p-4">
                <p class="text-xs font-bold uppercase text-blue-300">Pantalla Individual</p>
                <p class="text-xs text-neutral-300 mt-1">Perfil exclusivo con PIN para disfrutar a una fracción del precio.</p>
              </div>
            </div>

            <!-- Escena 5: Acciones de Bienvenida -->
            <div v-else class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                type="button"
                class="btn-primary text-base py-3.5 px-8 shadow-2xl shadow-brand-500/50 text-white font-bold"
                @click="goToHome"
              >
                <span>Entrar a StreamStore (Home)</span>
                <ArrowRight class="size-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                class="btn-secondary text-base py-3.5 px-6 font-semibold"
                @click="goToCatalog"
              >
                Explorar Catálogo
              </button>
            </div>
          </div>

          <!-- Frase destacada -->
          <p class="font-mono text-xs uppercase tracking-widest text-brand-300/80">
            — {{ scenes[currentScene].highlight }} —
          </p>
        </div>
      </transition>
    </main>

    <!-- Subtítulos de cine en la parte inferior para accesibilidad WCAG -->
    <footer class="relative z-20 px-6 pb-8 pt-4 sm:px-10">
      <div class="mx-auto max-w-2xl rounded-2xl border border-white/10 bg-black/70 p-4 backdrop-blur text-center">
        <p class="text-xs font-semibold uppercase tracking-wider text-white/50 mb-1">
          Subtítulo de narración en vivo
        </p>
        <p class="text-sm sm:text-base font-medium text-white/95 leading-relaxed">
          « {{ scenes[currentScene].narration }} »
        </p>

        <!-- Indicador de desplazamiento con rueda o clic -->
        <div class="mt-3 flex items-center justify-between text-[11px] text-white/50 border-t border-white/10 pt-2">
          <span>Usa la rueda del ratón o flechas ← → para cambiar escena</span>
          <button
            type="button"
            class="text-brand-300 hover:text-white font-semibold inline-flex items-center gap-1"
            @click="nextScene"
          >
            <span>{{ currentScene < scenes.length - 1 ? 'Siguiente escena' : 'Finalizar e ir al Home' }}</span>
            <ChevronDown class="size-3 -rotate-90" aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.scene-fade-enter-active,
.scene-fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.scene-fade-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.97);
}

.scene-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.97);
}

@media (prefers-reduced-motion: reduce) {
  .scene-fade-enter-active,
  .scene-fade-leave-active {
    transition: none !important;
  }
}
</style>
