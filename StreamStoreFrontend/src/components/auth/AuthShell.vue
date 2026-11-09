<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowLeft } from '@lucide/vue'
import { useClientFonts } from '@/composables/useClientFonts'
import '@/styles/client-ui.css'

defineProps<{
  /** Título grande del panel cinematográfico (solo pantallas anchas) */
  showcaseTitle: string
  /** Texto breve bajo el título del panel */
  showcaseText: string
}>()

useClientFonts()

// ================= PARTÍCULAS DE LUZ DE PROYECTOR (solo panel ancho y sin movimiento reducido) =================
const canvasRef = ref<HTMLCanvasElement | null>(null)
let frameId: number | null = null
let cleanup: (() => void) | undefined

function startParticles() {
  const canvas = canvasRef.value
  if (!canvas) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const size = () => {
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
  }
  size()
  window.addEventListener('resize', size)

  const colors = ['128, 87, 255', '6, 182, 212', '255, 255, 255']
  const count = Math.min(36, Math.floor((canvas.width * canvas.height) / 30000))
  const particles = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.8 + 0.6,
    vx: (Math.random() - 0.5) * 0.3,
    vy: -Math.random() * 0.4 - 0.15,
    a: Math.random() * 0.4 + 0.1,
    c: colors[Math.floor(Math.random() * colors.length)],
  }))

  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (const p of particles) {
      p.x += p.vx
      p.y += p.vy
      if (p.y < -10) {
        p.y = canvas.height + 10
        p.x = Math.random() * canvas.width
      }
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${p.c}, ${p.a})`
      ctx.fill()
    }
    frameId = requestAnimationFrame(render)
  }
  render()

  cleanup = () => {
    window.removeEventListener('resize', size)
    if (frameId) cancelAnimationFrame(frameId)
  }
}

onMounted(startParticles)
onUnmounted(() => cleanup?.())
</script>

<template>
  <div class="ss-page relative min-h-dvh bg-[#05060d] lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
    <!-- Panel cinematográfico: en móvil es el fondo, en escritorio la columna izquierda -->
    <aside
      class="absolute inset-0 overflow-hidden lg:relative lg:inset-auto lg:min-h-dvh"
      aria-hidden="true"
    >
      <div
        class="absolute inset-0 bg-cover bg-center opacity-50 lg:opacity-80"
        style="background-image: url('/login_cinema_bg.jpg');"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-[#05060d]/70 via-[#05060d]/60 to-[#05060d] lg:bg-gradient-to-r lg:from-[#05060d]/30 lg:via-[#05060d]/40 lg:to-[#05060d]" />
      <!-- Haz del proyector: el único gesto decorativo de la pantalla -->
      <div class="absolute -top-24 left-1/2 hidden h-[140%] w-[70%] -translate-x-1/2 bg-[conic-gradient(from_180deg_at_50%_0%,transparent_160deg,rgba(139,108,255,0.22)_175deg,rgba(45,212,239,0.18)_185deg,transparent_200deg)] lg:block" />
      <canvas ref="canvasRef" class="absolute inset-0 hidden h-full w-full lg:block" />

      <div class="relative z-10 hidden h-full flex-col justify-end p-12 xl:p-16 lg:flex">
        <p class="ss-title max-w-md text-4xl leading-[1.05] text-white xl:text-5xl">{{ showcaseTitle }}</p>
        <p class="mt-4 max-w-sm text-base leading-relaxed text-[#c9cfe4]">{{ showcaseText }}</p>
      </div>
    </aside>

    <!-- Columna del formulario -->
    <div class="relative z-10 flex min-h-dvh flex-col px-4 py-5 sm:px-8 lg:bg-[#05060d] lg:px-12 xl:px-16">
      <header class="flex items-center justify-between gap-4">
        <RouterLink to="/" class="inline-flex items-center gap-2.5 rounded-lg" aria-label="StreamStore, ir al inicio">
          <img src="/streamstore_icon.png" alt="" class="size-9 object-contain" />
          <span class="font-display text-xl font-extrabold tracking-tight text-white">
            Stream<span class="text-[#2dd4ef]">Store</span>
          </span>
        </RouterLink>
        <RouterLink
          to="/catalogo"
          class="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-white/20 px-4 text-sm font-semibold text-[#d7dcf0] transition-colors hover:border-white/45 hover:text-white"
        >
          <ArrowLeft class="size-4" aria-hidden="true" />
          Ver catálogo
        </RouterLink>
      </header>

      <div class="flex flex-1 items-center justify-center py-10">
        <div class="w-full max-w-[26rem]">
          <slot />
        </div>
      </div>

      <footer class="text-center text-xs text-[#8a93b2]">
        © {{ new Date().getFullYear() }} StreamStore · Bogotá, Colombia
      </footer>
    </div>
  </div>
</template>
