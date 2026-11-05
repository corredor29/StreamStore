<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { 
  ArrowRight, 
  ChevronDown, 
  Headphones, 
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

// Estado y datos de Scrollytelling
const activeStoryIndex = ref(0)
const storyCardRefs = ref<HTMLElement[]>([])

const scrollyPlatforms = [
  {
    id: 1,
    nombre: 'Netflix Premium 4K',
    tag: 'NETFLIX · 4K ULTRA HD',
    slug: 'netflix',
    color: '#E50914',
    bgImage: '/watching_netflix.jpg',
    headline: 'El catálogo más grande del mundo en Ultra HD.',
    desc: 'Disfruta de series exclusivas, películas taquilleras y documentales en 4K Ultra HD con audio espacial y perfiles protegidos.',
    features: [
      'Calidad 4K Ultra HD + HDR10 + Dolby Vision',
      'Audio espacial inmersivo para cine en casa',
      'Descargas ilimitadas para disfrutar sin conexión',
      'Garantía total de 30 días sin caídas',
      'Activación automática e inmediata tras el pago'
    ],
    productoIdCompleta: 1,
    productoIdPantalla: 2,
    precioCompleta: 38000,
    precioPantalla: 12000,
    stats: 'Más de 15.000 títulos disponibles'
  },
  {
    id: 2,
    nombre: 'Disney+ Total Family',
    tag: 'DISNEY+ · FAMILIAR & MARVEL',
    slug: 'disney',
    color: '#113CCF',
    bgImage: '/watching_disney.jpg',
    headline: 'Tus mundos favoritos juntos en un solo lugar.',
    desc: 'Todo el universo Disney, Pixar, Marvel, Star Wars, National Geographic y deportes en vivo de ESPN con la máxima fidelidad.',
    features: [
      'Contenido completo de Marvel Studios, Star Wars y Pixar',
      'Transmisiones deportivas de ESPN en vivo',
      'Formatos IMAX Enhanced en títulos seleccionados',
      'Control parental avanzado con PIN por perfil',
      'Activación digital en menos de 10 segundos'
    ],
    productoIdCompleta: 3,
    productoIdPantalla: 4,
    precioCompleta: 30000,
    precioPantalla: 9000,
    stats: 'Entretenimiento para toda la familia'
  },
  {
    id: 3,
    nombre: 'Max (HBO) 4K Ultra',
    tag: 'MAX · HBO ORIGINALS & WARNER',
    slug: 'max',
    color: '#7B2FF7',
    bgImage: '/watching_max.jpg',
    headline: 'Historias extraordinarias que definen la cultura.',
    desc: 'Desde La Casa del Dragón y The Last of Us hasta los clásicos inmortales de Warner Bros, DC Comics y HBO en 4K Ultra HD.',
    features: [
      'Series HBO galardonadas con múltiples premios Emmy',
      'Estrenos cinematográficos de Warner Bros y DC',
      'Audio envolvente Dolby Atmos disponible',
      'Perfiles privados protegidos con código PIN',
      'Reemplazo inmediato garantizado ante fallas'
    ],
    productoIdCompleta: 5,
    productoIdPantalla: 6,
    precioCompleta: 28000,
    precioPantalla: 9500,
    stats: 'La casa del cine y televisión de culto'
  },
  {
    id: 4,
    nombre: 'Amazon Prime Video',
    tag: 'PRIME VIDEO · ORIGINALS & DEPORTES',
    slug: 'prime',
    color: '#00A8E1',
    bgImage: '/watching_prime.jpg',
    headline: 'Producciones originales y canales exclusivos.',
    desc: 'Disfruta de producciones icónicas como The Boys, El Señor de los Anillos y eventos deportivos en vivo con reproducción simultánea.',
    features: [
      'Producciones exclusivas Amazon Originals',
      'X-Ray con información de actores y música en vivo',
      'Compatibilidad universal con cualquier Smart TV',
      'Soporte técnico preferencial 24/7 vía WhatsApp',
      'Precios transparentes en pesos colombianos'
    ],
    productoIdCompleta: 7,
    productoIdPantalla: 8,
    precioCompleta: 25000,
    precioPantalla: 8000,
    stats: 'Calidad 4K sin costo adicional'
  }
]

function scrollToStoryPlatform(index: number) {
  activeStoryIndex.value = index
  const el = storyCardRefs.value[index]
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

function handleStoryObserver() {
  if (typeof IntersectionObserver === 'undefined') return
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = Number(entry.target.getAttribute('data-story-index'))
          if (!isNaN(idx)) {
            activeStoryIndex.value = idx
          }
        }
      })
    },
    { threshold: 0.5, rootMargin: '-10% 0px -20% 0px' }
  )

  storyCardRefs.value.forEach((card) => {
    if (card) observer.observe(card)
  })
}

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

// Reproducir animación automáticamente al entrar / abrir la página
onMounted(() => {
  startCinematicIntro()
  setTimeout(() => handleStoryObserver(), 500)
})

function toggleMute() {
  isMuted.value = !isMuted.value
}

function comprarPlataforma(p: {
  id: number
  productoIdCompleta: number
  productoIdPantalla: number
  nombre: string
  slug: string
  color: string
  precioCompleta: number
  precioPantalla: number
}) {
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
  <div class="bg-black text-white selection:bg-brand-500/30 selection:text-white pb-24 overflow-x-hidden">
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
        <!-- Nombre Stream Store con los Colores Oficiales del Logo -->
        <div class="flex flex-col items-center justify-center space-y-2">
          <h1 class="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight select-none leading-none drop-shadow-[0_15px_45px_rgba(0,0,0,0.95)]">
            <span class="text-white drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)]">STREAM</span>
            <span class="block sm:inline sm:ml-4 bg-gradient-to-r from-[#8057FF] via-[#9B51E0] to-[#06B6D4] bg-clip-text text-transparent filter drop-shadow-[0_0_40px_rgba(6,182,212,0.5)]">STORE</span>
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

    <!-- FASE DE TRANSICIÓN A OSCURIDAD TOTAL (LA PANTALLA SE OSCURECE TOTALMENTE) -->
    <div class="relative z-20 h-[50vh] sm:h-[65vh] bg-gradient-to-b from-black via-black to-black flex flex-col items-center justify-center text-center pointer-events-none">
      <div class="size-1 rounded-full bg-white/20 animate-pulse" />
    </div>

    <!-- ================= 2. EXPERIENCIA SCROLLYTELLING (REVELACIÓN LENTA DESDE LA OSCURIDAD) ================= -->
    <section id="plataformas" class="relative bg-black scroll-mt-10 overflow-hidden">

      <!-- CONTENEDOR DE FONDOS FIJOS CON CROSSFADE INTERACTIVO (FOTOS DE PERSONAS VIENDO CADA PLATAFORMA) -->
      <div class="sticky top-0 h-screen w-full overflow-hidden pointer-events-none z-0">
        <div
          v-for="(sp, idx) in scrollyPlatforms"
          :key="sp.id"
          class="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out"
          :class="activeStoryIndex === idx ? 'opacity-50 scale-100' : 'opacity-0 scale-105'"
          :style="{ backgroundImage: `url('${sp.bgImage}')` }"
        >
          <!-- Viñeta oscura cinemática y resplandor ambiental del color de la plataforma -->
          <div class="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/90 pointer-events-none" />
          <div class="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/90 pointer-events-none" />
          
          <!-- Halo ambiental luminoso correspondiente a la plataforma activa -->
          <div
            class="absolute top-1/3 left-1/3 size-[500px] rounded-full blur-[140px] opacity-25 pointer-events-none transition-colors duration-700"
            :style="{ backgroundColor: sp.color }"
          />
        </div>
      </div>

      <!-- CONTENIDO FOREGROUND (SCROLLYTELLING DIVIDIDO EN 2 COLUMNAS) -->
      <div class="relative z-10 container-app -mt-[100vh] pb-32">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          <!-- COLUMNA IZQUIERDA: TEXTO QUE ASCIENDE Y QUEDA FIJO / STICKY CON EL SELECTOR -->
          <div class="lg:col-span-5 lg:sticky lg:top-24 lg:h-[calc(100vh-120px)] flex flex-col justify-between py-6 space-y-8">
            <div class="space-y-4">
              

              <!-- Título que asciende con fuerza y elegancia -->
              <h2 class="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-[1.05] drop-shadow-2xl">
                ELIGE EL MEJOR <br />
                <span class="bg-gradient-to-r from-brand-300 via-cyan-300 to-white bg-clip-text text-transparent">
                  PLAN PARA TI
                </span>
              </h2>

              <p class="text-sm sm:text-base text-slate-300/90 leading-relaxed font-sans max-w-md">
                Desliza hacia abajo para recorrer cada una de las principales plataformas en una experiencia cinematográfica. Cuentas completas y perfiles individuales con activación inmediata.
              </p>

              <!-- Selector de Modalidad (Cuentas Completas vs Pantallas Individuales) -->
              <div class="pt-2">
                <div class="flex p-1 rounded-full border border-white/20 bg-black/70 backdrop-blur-xl w-full max-w-sm shadow-xl">
                  <button
                    type="button"
                    class="flex-1 py-2.5 px-4 rounded-full text-xs font-black transition-all duration-300 cursor-pointer text-center"
                    :class="
                      modalidadSeleccionada === 'CUENTA_COMPLETA'
                        ? 'bg-white text-neutral-950 shadow-lg'
                        : 'text-slate-400 hover:text-white'
                    "
                    @click="modalidadSeleccionada = 'CUENTA_COMPLETA'"
                  >
                    Cuentas Completas
                  </button>
                  <button
                    type="button"
                    class="flex-1 py-2.5 px-4 rounded-full text-xs font-black transition-all duration-300 cursor-pointer text-center"
                    :class="
                      modalidadSeleccionada === 'PANTALLA'
                        ? 'bg-cyan-400 text-neutral-950 shadow-lg'
                        : 'text-slate-400 hover:text-white'
                    "
                    @click="modalidadSeleccionada = 'PANTALLA'"
                  >
                    Pantallas (PIN)
                  </button>
                </div>
              </div>
            </div>

            <!-- Navegación Interactiva de Plataformas / Indicador de Progreso -->
            <div class="hidden lg:flex flex-col gap-2.5 border-t border-white/10 pt-6">
              <span class="text-[10px] font-mono uppercase tracking-[0.25em] text-slate-400">Plataformas Disponibles:</span>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="(sp, idx) in scrollyPlatforms"
                  :key="sp.id"
                  type="button"
                  class="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border flex items-center gap-2 cursor-pointer"
                  :class="
                    activeStoryIndex === idx
                      ? 'bg-white text-neutral-950 border-white shadow-[0_0_20px_rgba(255,255,255,0.4)] scale-105'
                      : 'border-white/20 text-slate-400 hover:text-white hover:border-white/50 bg-black/40'
                  "
                  @click="scrollToStoryPlatform(idx)"
                >
                  <span class="size-1.5 rounded-full" :style="{ backgroundColor: sp.color }" />
                  <span>{{ sp.nombre.split(' ')[0] }}</span>
                </button>
              </div>
            </div>
          </div>

          <!-- COLUMNA DERECHA: CAPÍTULOS DE CADA PLATAFORMA QUE ASCIENDEN CON EL SCROLL -->
          <div class="lg:col-span-7 space-y-28 pt-8 lg:pt-16">
            <div
              v-for="(sp, idx) in scrollyPlatforms"
              :key="sp.id"
              :ref="(el) => { if (el) storyCardRefs[idx] = el as HTMLElement }"
              :data-story-index="idx"
              class="min-h-[85vh] flex items-center justify-center transition-all duration-1000 ease-out transform"
              :class="
                activeStoryIndex === idx
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-28 scale-95 pointer-events-none'
              "
            >
              <!-- Tarjeta Cinemática de la Plataforma -->
              <div
                class="w-full rounded-3xl border border-white/20 bg-black/80 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden transition-all duration-500 hover:border-white/40"
                :style="{ boxShadow: activeStoryIndex === idx ? `0 20px 60px ${sp.color}25` : undefined }"
              >
                <!-- Línea Neón Superior de la Plataforma -->
                <div
                  class="absolute top-0 left-0 right-0 h-1.5 transition-all duration-500"
                  :style="{ backgroundColor: sp.color, boxShadow: `0 0 20px ${sp.color}` }"
                />

                <div class="space-y-6">
                  <!-- Cabecera de la Tarjeta -->
                  <div class="flex items-start justify-between gap-4">
                    <div>
                      <span class="text-xs font-mono uppercase tracking-wider font-bold" :style="{ color: sp.color }">
                        {{ sp.tag }}
                      </span>
                      <h3 class="font-display text-2xl sm:text-3xl font-black text-white mt-1">
                        {{ sp.nombre }}
                      </h3>
                      <p class="text-xs sm:text-sm text-cyan-300 font-medium mt-0.5">
                        {{ sp.headline }}
                      </p>
                    </div>

                    <span class="rounded-full px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-1.5 shrink-0">
                      <span class="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Disponible
                    </span>
                  </div>

                  <p class="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                    {{ sp.desc }}
                  </p>

                  <!-- Checklist de Beneficios Premium -->
                  <ul class="space-y-2.5 border-y border-white/10 py-4 my-4">
                    <li
                      v-for="(feat, fIdx) in sp.features"
                      :key="fIdx"
                      class="flex items-center gap-3 text-xs sm:text-sm text-white/90 font-medium"
                    >
                      <CheckCircle2 class="size-4 shrink-0 text-cyan-400" />
                      <span>{{ feat }}</span>
                    </li>
                  </ul>

                  <!-- Precios y Botón de Compra Directo -->
                  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                    <div>
                      <span class="text-[11px] font-mono uppercase text-slate-400 block">
                        {{ modalidadSeleccionada === 'CUENTA_COMPLETA' ? 'Precio Cuenta Completa 30 días' : 'Precio 1 Pantalla con PIN 30 días' }}
                      </span>
                      <div class="flex items-baseline gap-2">
                        <span class="font-display text-3xl sm:text-4xl font-black text-white">
                          {{ formatCOP(modalidadSeleccionada === 'CUENTA_COMPLETA' ? sp.precioCompleta : sp.precioPantalla) }}
                        </span>
                        <span class="text-xs text-slate-400">/ mes</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      class="w-full sm:w-auto inline-flex items-center justify-center rounded-full text-sm font-black py-3.5 px-8 shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer gap-2"
                      :style="{ backgroundColor: sp.color, color: '#ffffff', boxShadow: `0 0 30px ${sp.color}50` }"
                      @click="comprarPlataforma(sp)"
                    >
                      <span>{{ modalidadSeleccionada === 'CUENTA_COMPLETA' ? 'Comprar Cuenta Completa' : 'Comprar Pantalla Individual' }}</span>
                      <ArrowRight class="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= 3. GARANTÍAS Y BENEFICIOS ================= -->
    <section class="container-app">
      <div class="rounded-3xl border border-white/10 bg-white/5 p-8 sm:p-12 relative overflow-hidden backdrop-blur-md">
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
          class="rounded-xl border border-white/10 bg-white/5 overflow-hidden transition-all duration-200"
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

          <div v-show="faq.open" class="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-muted leading-relaxed border-t border-white/10 pt-3">
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
