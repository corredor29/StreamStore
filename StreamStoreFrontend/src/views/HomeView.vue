<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { 
  ArrowRight, 
  ChevronDown, 
  Headphones, 
  Play, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Zap,
  CheckCircle2,
  X
} from '@lucide/vue'
import type { TipoProducto } from '@/types'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const cart = useCartStore()

const modalidadSeleccionada = ref<TipoProducto>('CUENTA_COMPLETA')

// Estado de la Animación Cinemática Tipo Netflix
const showNetflixIntro = ref(false)
const introStage = ref<'black' | 'logo' | 'mosaic' | 'finished'>('finished')
const isMuted = ref(false)

function playCinematicSound() {
  if (isMuted.value) return
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }
    const now = ctx.currentTime

    // 1. Sub-bajo cinematográfico profundo (55Hz a 110Hz)
    const subOsc = ctx.createOscillator()
    const subGain = ctx.createGain()
    subOsc.type = 'sine'
    subOsc.frequency.setValueAtTime(55, now)
    subOsc.frequency.exponentialRampToValueAtTime(110, now + 1.2)
    subGain.gain.setValueAtTime(0.01, now)
    subGain.gain.linearRampToValueAtTime(0.45, now + 0.3)
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 2.6)
    subOsc.connect(subGain)
    subGain.connect(ctx.destination)
    subOsc.start(now)
    subOsc.stop(now + 2.7)

    // 2. Acorde sinfónico de sintetizador Ta-Dum (frecuencias armónicas)
    const chordFreqs = [110, 164.81, 220, 329.63]
    chordFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const filter = ctx.createBiquadFilter()

      osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle'
      osc.frequency.setValueAtTime(freq, now)

      filter.type = 'lowpass'
      filter.frequency.setValueAtTime(350, now)
      filter.frequency.exponentialRampToValueAtTime(2200, now + 0.8)
      filter.frequency.exponentialRampToValueAtTime(250, now + 2.5)

      gain.gain.setValueAtTime(0.001, now)
      gain.gain.linearRampToValueAtTime(0.12, now + 0.35)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5)

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + 0.05)
      osc.stop(now + 2.6)
    })
  } catch (e) {
    // Ignorar si el navegador bloquea audio por políticas de interacción
  }
}

function startCinematicIntro() {
  showNetflixIntro.value = true
  introStage.value = 'black'
  playCinematicSound()

  setTimeout(() => {
    introStage.value = 'logo'
  }, 400)

  setTimeout(() => {
    introStage.value = 'mosaic'
  }, 1900)

  setTimeout(() => {
    closeCinematicIntro()
  }, 4200)
}

function closeCinematicIntro() {
  introStage.value = 'finished'
  showNetflixIntro.value = false
}

function toggleMute() {
  isMuted.value = !isMuted.value
}

const plataformas = [
  {
    id: 1,
    productoIdCompleta: 1,
    productoIdPantalla: 2,
    nombre: 'Netflix Premium 4K',
    slug: 'netflix',
    desc: 'Acceso completo en 4K Ultra HD. Compatible con Smart TVs, consolas y dispositivos móviles.',
    color: '#E50914',
    badge: 'Ultra HD 4K',
    precioCompleta: 38000,
    precioPantalla: 12000,
  },
  {
    id: 2,
    productoIdCompleta: 3,
    productoIdPantalla: 4,
    nombre: 'Disney+ Total Family',
    slug: 'disney',
    desc: 'Todo el universo Disney, Pixar, Marvel, Star Wars y Star+ sin interrupciones con audio envolvente.',
    color: '#113CCF',
    badge: 'Familiar',
    precioCompleta: 30000,
    precioPantalla: 9000,
  },
  {
    id: 3,
    productoIdCompleta: 5,
    productoIdPantalla: 6,
    nombre: 'Max (HBO) 4K Ultra',
    slug: 'max',
    desc: 'Series icónicas de HBO, Warner Bros, Max Originals y transmisiones de alta calidad.',
    color: '#7B2FF7',
    badge: 'HBO & Warner',
    precioCompleta: 28000,
    precioPantalla: 9500,
  },
  {
    id: 4,
    productoIdCompleta: 7,
    productoIdPantalla: 8,
    nombre: 'Amazon Prime Video',
    slug: 'prime',
    desc: 'Producciones originales galardonadas, canales en vivo y transmisiones deportivas en HD.',
    color: '#00A8E1',
    badge: 'Originals',
    precioCompleta: 25000,
    precioPantalla: 8000,
  },
  {
    id: 5,
    productoIdCompleta: 9,
    productoIdPantalla: 10,
    nombre: 'Spotify Individual Premium',
    slug: 'spotify',
    desc: 'Música ilimitada sin anuncios, audio de máxima calidad y descargas offline para tus viajes.',
    color: '#1DB954',
    badge: 'Audio HQ',
    precioCompleta: 14900,
    precioPantalla: 7500,
  },
  {
    id: 6,
    productoIdCompleta: 11,
    productoIdPantalla: 12,
    nombre: 'Crunchyroll Mega Fan',
    slug: 'crunchyroll',
    desc: 'El catálogo de anime más extenso del mundo en simulcast con subtítulos y doblaje en español.',
    color: '#F47521',
    badge: 'Anime HD',
    precioCompleta: 15000,
    precioPantalla: 8500,
  },
]

function comprarPlataforma(p: typeof plataformas[0]) {
  const prodId = modalidadSeleccionada.value === 'CUENTA_COMPLETA' 
    ? p.productoIdCompleta 
    : p.productoIdPantalla
  const precio = modalidadSeleccionada.value === 'CUENTA_COMPLETA'
    ? p.precioCompleta
    : p.precioPantalla

  cart.addItem({
    id: prodId,
    nombre: `${p.nombre} (${modalidadSeleccionada.value === 'CUENTA_COMPLETA' ? 'Cuenta Completa' : '1 Pantalla'})`,
    tipo: modalidadSeleccionada.value,
    duracionDias: 30,
    precio: precio,
    stock: 5,
    activo: true,
    plataformaId: p.id,
    plataforma: {
      id: p.id,
      nombre: p.nombre,
      slug: p.slug,
      color: p.color,
    },
  })

  router.push('/checkout')
}

const faqs = ref([
  {
    q: '¿Cómo se realiza la entrega de la cuenta o pantalla?',
    a: 'La entrega es automatizada e inmediata. En cuanto tu pago es verificado en el sistema, tus credenciales (correo, contraseña y PIN de perfil individual si corresponde) se activan y muestran de inmediato en tu panel "Mi Cuenta > Mis Servicios".',
    open: true,
  },
  {
    q: '¿Qué diferencia hay entre una cuenta completa y una pantalla individual?',
    a: 'En la Cuenta Completa recibes el acceso integral a la suscripción para usar en hasta 4 o 5 dispositivos según la plataforma. En Pantalla Individual adquieres 1 perfil exclusivo y personal protegido con PIN privado dentro de una cuenta compartida por nuestro sistema.',
    open: false,
  },
  {
    q: '¿Qué pasa si la cuenta presenta fallas o deja de funcionar?',
    a: 'Cuentas con garantía total de reposición. Si alguna pantalla presenta inconvenientes de conexión o credenciales durante los 30 días del ciclo contratado, nuestro sistema te reasigna una nueva cuenta de inmediato sin costo.',
    open: false,
  },
  {
    q: '¿Cuáles son los métodos de pago disponibles en Colombia?',
    a: 'Admitimos pagos con Tarjeta Débito (Bancolombia, Nu, Genérica multimarca y BBVA con auto-detección de Visa, Mastercard y Amex) y la pasarela móvil directa para Nequi con confirmación en tu celular.',
    open: false,
  },
])

function toggleFaq(index: number) {
  faqs.value[index].open = !faqs.value[index].open
}

const formatCOP = (val: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(val)
}
</script>

<template>
  <div class="space-y-20 pb-20 selection:bg-brand-500/30 selection:text-white">
    <!-- ================= MODAL / OVERLAY INTRO CINEMÁTICA TIPO NETFLIX ================= -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-500 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-700 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showNetflixIntro"
          class="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden select-none"
        >
          <!-- Controles de la Intro (Saltar y Silencio) -->
          <div class="absolute top-6 right-6 z-50 flex items-center gap-3">
            <button
              type="button"
              class="size-10 rounded-full border border-white/20 bg-black/60 text-white flex items-center justify-center hover:bg-white/10 transition-colors"
              title="Activar/Silenciar sonido"
              @click="toggleMute"
            >
              <VolumeX v-if="isMuted" class="size-4" />
              <Volume2 v-else class="size-4 text-cyan-400" />
            </button>

            <button
              type="button"
              class="px-4 py-2 rounded-full border border-white/20 bg-black/60 text-white text-xs font-mono font-semibold hover:bg-white/20 transition-all flex items-center gap-1.5"
              @click="closeCinematicIntro"
            >
              <span>Saltar Intro</span>
              <X class="size-3.5" />
            </button>
          </div>

          <!-- Mosaico de fondo animado que se enciende en ondas -->
          <div
            class="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform"
            :class="[
              introStage === 'black' ? 'opacity-0 scale-95' : '',
              introStage === 'logo' ? 'opacity-30 scale-100 blur-sm' : '',
              introStage === 'mosaic' ? 'opacity-90 scale-105' : '',
            ]"
            style="background-image: url('/hbo_max_mosaic_bg.jpg');"
          >
            <!-- Capa de brillo y viñeta cinematográfica -->
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80" />
          </div>

          <!-- Revelación Anamórfica del Logotipo StreamStore (Estilo Netflix Ta-Dum) -->
          <div
            class="relative z-20 flex flex-col items-center justify-center text-center transition-all duration-700"
            :class="[
              introStage === 'black' ? 'opacity-0 scale-75' : '',
              introStage === 'logo' ? 'opacity-100 scale-110' : '',
              introStage === 'mosaic' ? 'opacity-90 scale-100 translate-y-2' : '',
            ]"
          >
            <!-- Haz de luz horizontal anamórfico tipo cine -->
            <div
              class="absolute h-1 w-[200vw] bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-sm animate-pulse"
              style="box-shadow: 0 0 40px #8057FF, 0 0 80px #06B6D4;"
            />

            <!-- Imagen del Logotipo Oficial StreamStore con Halo Neón -->
            <div class="relative size-32 sm:size-44 rounded-3xl p-1 bg-gradient-to-tr from-[#8057FF] via-[#06B6D4] to-[#8057FF] shadow-[0_0_80px_rgba(128,87,255,0.7)] animate-bounce duration-1000">
              <img
                src="/streamstore_logo_official.png"
                alt="StreamStore Logo Oficial"
                class="w-full h-full object-cover rounded-[22px] bg-[#0B0E1F]"
              />
            </div>

            <!-- Título de Marca Animado -->
            <h2 class="mt-6 font-display text-4xl sm:text-6xl font-black uppercase tracking-tight text-white drop-shadow-[0_0_30px_rgba(6,182,212,0.8)]">
              Stream<span class="text-cyan-400">Store</span>
            </h2>
            <p class="mt-2 text-xs sm:text-sm font-mono tracking-[0.35em] text-cyan-300/90 uppercase">
              Digital Entertainment Universe
            </p>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ================= 1. CINEMATIC WEBSITE HERO (ESTILO HBO MAX) ================= -->
    <section class="relative min-h-[92vh] flex items-center justify-center overflow-hidden border-b border-white/10 bg-black">
      <!-- FONDO: MOSAICO DE ENTRETENIMIENTO AL ESTILO HBO MAX -->
      <div
        class="absolute inset-0 bg-cover bg-center transition-transform duration-[25000ms] ease-out kenburns-bg opacity-75"
        style="background-image: url('/hbo_max_mosaic_bg.jpg');"
      >
        <!-- Viñeta Gradual Estilo HBO Max: oscura arriba para el header, respirable al centro y fundido a negro puro abajo -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/85 via-black/45 via-60% to-black pointer-events-none" />
        
        <!-- Radial sutil para concentrar la atención en el centro -->
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.8)_85%)] pointer-events-none" />
      </div>

      <!-- CONTENIDO CENTRAL DEL HERO (IDÉNTICO A HBO MAX) -->
      <div class="container-app relative z-10 text-center max-w-4xl mx-auto py-20 sm:py-28 flex flex-col items-center justify-center space-y-6">
        <!-- Logotipo Central StreamStore en Relieve / 3D Blanco Puro -->
        <div class="flex flex-col items-center justify-center space-y-2">
          <div class="size-20 sm:size-24 rounded-3xl p-1 bg-gradient-to-b from-white/30 via-white/5 to-transparent border border-white/25 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_40px_rgba(128,87,255,0.4)] backdrop-blur-xl group hover:scale-105 transition-all duration-300">
            <img
              src="/streamstore_logo_official.png"
              alt="StreamStore"
              class="w-full h-full object-contain rounded-[20px] bg-black/80 p-2"
            />
          </div>

          <h1 class="font-display text-5xl sm:text-7xl md:text-8xl font-black text-white uppercase tracking-tight drop-shadow-[0_12px_35px_rgba(0,0,0,0.95)]">
            STREAM<span class="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-purple-300">STORE</span>
          </h1>
        </div>

        <!-- Frase de Precios Estilo HBO Max: "Los planes empiezan desde $..." -->
        <p class="text-xl sm:text-2xl md:text-3xl text-white/95 font-medium tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
          Los planes empiezan desde <strong class="text-white font-black drop-shadow-md">$8.000/mes</strong>
        </p>

        <p class="text-sm sm:text-base text-slate-300/90 max-w-xl mx-auto font-sans leading-relaxed drop-shadow">
          Acceso instantáneo a Netflix, Disney+, Max, Prime Video, Spotify y Crunchyroll en 4K Ultra HD con garantía ininterrumpida.
        </p>

        <!-- Botón Principal "Iniciar Sesión" (En vez de "Suscríbete" tal como pidió el usuario) -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3 w-full sm:w-auto">
          <RouterLink
            to="/login"
            class="inline-flex items-center justify-center rounded-full bg-white hover:bg-slate-200 text-neutral-950 font-black text-base px-10 sm:px-14 py-3.5 sm:py-4 shadow-[0_0_35px_rgba(255,255,255,0.35)] hover:shadow-[0_0_50px_rgba(255,255,255,0.6)] transition-all duration-200 hover:scale-105 active:scale-95 w-full sm:w-auto uppercase tracking-wider"
          >
            Iniciar Sesión
          </RouterLink>

          <RouterLink
            to="/catalogo"
            class="inline-flex items-center justify-center rounded-full border border-white/35 bg-black/60 hover:bg-white/10 text-white font-bold text-base px-8 sm:px-10 py-3.5 sm:py-4 backdrop-blur-md transition-all duration-200 hover:border-white w-full sm:w-auto"
          >
            <span>Explorar Catálogo</span>
            <ArrowRight class="size-4 ml-2" />
          </RouterLink>
        </div>

        <!-- Opción discreta de Intro Cinemática -->
        <div class="pt-2">
          <button
            type="button"
            class="inline-flex items-center gap-2 text-xs font-mono text-cyan-300 hover:text-white transition-colors cursor-pointer py-1 px-3 rounded-full hover:bg-white/5"
            @click="startCinematicIntro"
          >
            <Play class="size-3.5 fill-cyan-400 text-cyan-400" />
            <span>Ver Animación Cinemática Tipo Netflix</span>
          </button>
        </div>

        <!-- 4 Métricas de Confianza Integradas con Estilo Minimalista Oscuro -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 pt-8 w-full max-w-3xl border-t border-white/10 mt-6">
          <div class="rounded-xl border border-white/10 bg-black/60 p-3.5 shadow-lg backdrop-blur-md">
            <p class="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">+15K</p>
            <p class="text-[11px] sm:text-xs text-slate-400 mt-0.5">Clientes Satisfechos</p>
          </div>
          <div class="rounded-xl border border-white/10 bg-black/60 p-3.5 shadow-lg backdrop-blur-md">
            <p class="font-display text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">100%</p>
            <p class="text-[11px] sm:text-xs text-slate-400 mt-0.5">Garantía Activa</p>
          </div>
          <div class="rounded-xl border border-white/10 bg-black/60 p-3.5 shadow-lg backdrop-blur-md">
            <p class="font-display text-2xl sm:text-3xl font-black text-cyan-300 tracking-tight">24/7</p>
            <p class="text-[11px] sm:text-xs text-slate-400 mt-0.5">Soporte Inmediato</p>
          </div>
          <div class="rounded-xl border border-white/10 bg-black/60 p-3.5 shadow-lg backdrop-blur-md">
            <p class="font-display text-2xl sm:text-3xl font-black text-purple-300 tracking-tight">&lt; 10s</p>
            <p class="text-[11px] sm:text-xs text-slate-400 mt-0.5">Entrega Automática</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= 2. ELIGE TU MODALIDAD Y CATÁLOGO RÁPIDO ================= -->
    <section id="plataformas" class="container-app space-y-8 scroll-mt-24">
      <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <span class="text-xs font-mono uppercase tracking-[0.25em] text-cyan-400 font-bold block mb-1">
            Planes y Suscripciones
          </span>
          <h2 class="font-display text-2xl sm:text-4xl font-black text-fg tracking-tight">
            ELIGE EL MEJOR PLAN PARA TI
          </h2>
        </div>

        <!-- Segmented Toggle Cuentas Completas vs Pantallas Individuales -->
        <div class="flex p-1 rounded-xl border border-line bg-surface-2 self-stretch sm:self-auto">
          <button
            type="button"
            class="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer"
            :class="
              modalidadSeleccionada === 'CUENTA_COMPLETA'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-muted hover:text-fg'
            "
            @click="modalidadSeleccionada = 'CUENTA_COMPLETA'"
          >
            Cuentas Completas
          </button>
          <button
            type="button"
            class="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer"
            :class="
              modalidadSeleccionada === 'PANTALLA'
                ? 'bg-cyan-500 text-neutral-900 shadow-sm'
                : 'text-muted hover:text-fg'
            "
            @click="modalidadSeleccionada = 'PANTALLA'"
          >
            Pantallas Individuales (PIN)
          </button>
        </div>
      </div>

      <!-- Cuadrícula de las 6 Plataformas Principales -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="p in plataformas"
          :key="p.id"
          class="card group relative flex flex-col justify-between overflow-hidden border-line hover:border-brand-400/60 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/10"
        >
          <!-- Acento de Color de la Plataforma -->
          <div
            class="h-1.5 w-full absolute top-0 left-0 transition-opacity duration-300"
            :style="{ backgroundColor: p.color }"
          />

          <div class="p-2 space-y-4">
            <div class="flex items-center justify-between pt-2">
              <span class="text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-line bg-surface-2 text-muted">
                {{ p.badge }}
              </span>
              <span class="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <span class="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Disponible
              </span>
            </div>

            <div>
              <h3 class="font-display text-xl font-bold text-fg group-hover:text-cyan-300 transition-colors">
                {{ p.nombre }}
              </h3>
              <p class="text-xs text-muted mt-1 leading-relaxed line-clamp-2">
                {{ p.desc }}
              </p>
            </div>
          </div>

          <div class="p-2 pt-4 border-t border-line/60 mt-auto flex items-center justify-between">
            <div>
              <span class="text-[10px] font-mono uppercase text-muted block">Precio mensual</span>
              <span class="font-display text-lg font-black text-cyan-300">
                {{ formatCOP(modalidadSeleccionada === 'CUENTA_COMPLETA' ? p.precioCompleta : p.precioPantalla) }}
              </span>
            </div>

            <button
              type="button"
              class="btn-primary text-xs py-2 px-3.5 font-bold shadow-md shadow-brand-500/20 flex items-center gap-1.5 cursor-pointer"
              @click="comprarPlataforma(p)"
            >
              <span>{{ modalidadSeleccionada === 'CUENTA_COMPLETA' ? 'Comprar Cuenta' : 'Comprar Pantalla' }}</span>
              <ArrowRight class="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= 3. GARANTÍAS Y BENEFICIOS ================= -->
    <section class="container-app">
      <div class="rounded-2xl border border-line bg-surface/60 p-8 sm:p-12 relative overflow-hidden backdrop-blur-md">
        <div class="absolute -right-20 -bottom-20 size-64 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />

        <div class="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <span class="text-xs font-mono uppercase tracking-[0.25em] text-brand-300 font-bold">Por Qué Elegirnos</span>
          <h2 class="font-display text-2xl sm:text-4xl font-black text-fg tracking-tight">
            Experiencia Sin Complicaciones
          </h2>
          <p class="text-sm text-muted">
            Diseñado para ofrecerte máxima velocidad, seguridad y tranquilidad en cada compra digital.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="space-y-2.5">
            <div class="size-10 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center border border-brand-500/30">
              <Zap class="size-5" />
            </div>
            <h3 class="font-bold text-fg text-sm">Entrega Inmediata</h3>
            <p class="text-xs text-muted leading-relaxed">
              Recibe tus datos de acceso en segundos de forma automatizada tras verificar tu pago.
            </p>
          </div>

          <div class="space-y-2.5">
            <div class="size-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck class="size-5" />
            </div>
            <h3 class="font-bold text-fg text-sm">Garantía Total</h3>
            <p class="text-xs text-muted leading-relaxed">
              Reemplazo inmediato garantizado durante todo el periodo de tu suscripción contratada.
            </p>
          </div>

          <div class="space-y-2.5">
            <div class="size-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/30">
              <Headphones class="size-5" />
            </div>
            <h3 class="font-bold text-fg text-sm">Soporte 24/7</h3>
            <p class="text-xs text-muted leading-relaxed">
              Equipo técnico disponible vía WhatsApp y ticket para resolver cualquier duda al instante.
            </p>
          </div>

          <div class="space-y-2.5">
            <div class="size-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
              <CheckCircle2 class="size-5" />
            </div>
            <h3 class="font-bold text-fg text-sm">Pagos en COP</h3>
            <p class="text-xs text-muted leading-relaxed">
              Paga fácilmente en pesos colombianos con múltiples métodos de pago locales seguros.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= 4. PREGUNTAS FRECUENTES ================= -->
    <section class="container-app max-w-3xl space-y-6">
      <div class="text-center space-y-2">
        <span class="text-xs font-mono uppercase tracking-[0.25em] text-cyan-400 font-bold">Dudas Habituales</span>
        <h2 class="font-display text-2xl sm:text-4xl font-black text-fg tracking-tight">
          Preguntas Frecuentes
        </h2>
      </div>

      <div class="space-y-3">
        <div
          v-for="(faq, i) in faqs"
          :key="i"
          class="rounded-xl border border-line bg-surface/50 overflow-hidden transition-all duration-200"
        >
          <button
            type="button"
            class="w-full p-4 sm:p-5 text-left font-bold text-sm text-fg flex items-center justify-between gap-4 hover:text-cyan-300 transition-colors cursor-pointer"
            @click="toggleFaq(i)"
          >
            <span>{{ faq.q }}</span>
            <ChevronDown
              class="size-4 shrink-0 transition-transform duration-300"
              :class="{ 'rotate-180 text-cyan-300': faq.open }"
            />
          </button>

          <div v-show="faq.open" class="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-muted leading-relaxed border-t border-line/40 pt-3">
            {{ faq.a }}
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
@keyframes kenburns {
  0% {
    transform: scale(1.02) translate(0, 0);
  }
  50% {
    transform: scale(1.08) translate(-1%, -1%);
  }
  100% {
    transform: scale(1.02) translate(0, 0);
  }
}

.kenburns-bg {
  animation: kenburns 30s ease-in-out infinite alternate;
}
</style>
