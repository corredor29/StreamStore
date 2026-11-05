<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'
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

// Tracking reactivo del scroll para efecto cinemático de desvanecer y aparecer
const scrollY = ref(0)
let scrollTicking = false

function handleScroll() {
  if (!scrollTicking) {
    window.requestAnimationFrame(() => {
      scrollY.value = window.scrollY
      scrollTicking = false
    })
    scrollTicking = true
  }
}

// Reproducir animación automáticamente al entrar y activar listeners de scroll
onMounted(() => {
  if (typeof window !== 'undefined') {
    scrollY.value = window.scrollY
    window.addEventListener('scroll', handleScroll, { passive: true })
  }
  startCinematicIntro()
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', handleScroll)
  }
})

// Computados reactivos para la transición fluida (Desvanecer y Aparecer)
const heroContentStyle = computed(() => {
  const p = Math.min(1, Math.max(0, scrollY.value / 320))
  return {
    opacity: (1 - p).toFixed(2),
    transform: `translate3d(0, -${(p * 45).toFixed(1)}px, 0)`,
    pointerEvents: (p > 0.85 ? 'none' : 'auto') as any,
  }
})

const heroDarkenStyle = computed(() => {
  const p = Math.min(1, Math.max(0, scrollY.value / 260))
  return {
    opacity: p.toFixed(2),
  }
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
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      <!-- FONDO: MOSAICO DE ENTRETENIMIENTO AL ESTILO HBO MAX -->
      <div
        class="absolute inset-0 bg-cover bg-center transition-transform duration-[25000ms] ease-out kenburns-bg opacity-75"
        style="background-image: url('/hbo_max_mosaic_bg.jpg');"
      >
        <!-- Viñeta Gradual Estilo HBO Max: oscura arriba para el header, respirable al centro y fundido a negro puro abajo -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/85 via-black/45 via-60% to-black pointer-events-none" />
        
        <!-- Radial sutil para concentrar la atención en el centro -->
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.85)_85%)] pointer-events-none" />

        <!-- Oscurecimiento dinámico a negro absoluto al hacer scroll -->
        <div
          class="absolute inset-0 bg-black pointer-events-none transition-opacity duration-150"
          :style="heroDarkenStyle"
        />
      </div>

      <!-- CONTENIDO CENTRAL DEL HERO (IDÉNTICO A HBO MAX) -->
      <div
        class="container-app relative z-10 text-center max-w-4xl mx-auto pt-28 sm:pt-40 pb-16 flex flex-col items-center justify-center space-y-6 transition-all duration-150 ease-out will-change-transform"
        :style="heroContentStyle"
      >
        <!-- Nombre Stream Store con los Colores Oficiales del Logo (Alineado ópticamente con la intro para evitar desnivel) -->
        <div class="flex flex-col items-center justify-center space-y-2 mt-8 sm:mt-14">
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

    <!-- ================= 2. CABECERA: ELIGE EL MEJOR PLAN PARA TI ================= -->
    <section id="planes-intro" class="relative bg-black pt-20 pb-12 text-center overflow-hidden">
      <!-- Resplandor ambiental superior -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-3xl h-32 bg-gradient-to-b from-[#8057FF]/15 via-[#06B6D4]/10 to-transparent blur-3xl pointer-events-none" />

      <div class="container-app relative z-10 max-w-3xl mx-auto space-y-6">
        <h2 class="font-display text-4xl sm:text-6xl font-black text-white uppercase tracking-tight leading-[1.05] drop-shadow-2xl">
          ELIGE EL MEJOR <br />
          <span class="bg-gradient-to-r from-[#8057FF] via-[#A855F7] to-[#06B6D4] bg-clip-text text-transparent">
            PLAN PARA TI
          </span>
        </h2>

        <p class="text-sm sm:text-base text-slate-300/90 font-sans max-w-xl mx-auto leading-relaxed">
          Recorre cada una de nuestras plataformas oficiales con activación inmediata en 4K Ultra HD y garantía total de 30 días.
        </p>

        <!-- Selector de Modalidad (Cuentas Completas vs Pantallas Individuales) -->
        <div class="pt-2 flex justify-center">
          <div class="flex p-1.5 rounded-full border border-white/20 bg-black/80 backdrop-blur-xl w-full max-w-sm shadow-2xl">
            <button
              type="button"
              class="flex-1 py-3 px-5 rounded-full text-xs sm:text-sm font-black transition-all duration-300 cursor-pointer text-center"
              :class="
                modalidadSeleccionada === 'CUENTA_COMPLETA'
                  ? 'bg-white text-neutral-950 shadow-lg scale-100'
                  : 'text-slate-400 hover:text-white'
              "
              @click="modalidadSeleccionada = 'CUENTA_COMPLETA'"
            >
              Cuentas Completas
            </button>
            <button
              type="button"
              class="flex-1 py-3 px-5 rounded-full text-xs sm:text-sm font-black transition-all duration-300 cursor-pointer text-center"
              :class="
                modalidadSeleccionada === 'PANTALLA'
                  ? 'bg-cyan-400 text-neutral-950 shadow-lg scale-100'
                  : 'text-slate-400 hover:text-white'
              "
              @click="modalidadSeleccionada = 'PANTALLA'"
            >
              Pantallas (PIN)
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= 3. CAPÍTULOS SCROLLYTELLING POR PLATAFORMA (ALTERNADO IZQ / DER CON OSCURIDAD TOTAL) ================= -->
    <div id="plataformas-showcase" class="space-y-0 bg-black">
      <div
        v-for="(sp, idx) in scrollyPlatforms"
        :key="sp.id"
      >
        <!-- Transición previa a oscuridad total -->
        <div class="h-20 sm:h-28 bg-gradient-to-b from-black via-black to-black pointer-events-none" />

        <!-- Sección de la Plataforma -->
        <section
          :id="'plataforma-' + sp.slug"
          class="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-16 sm:py-24 bg-black"
        >
          <!-- FOTO DE REFERENCIA CINEMÁTICA DE FONDO (PERSONAS DISFRUTANDO EL SERVICIO) -->
          <div
            class="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out opacity-40 scale-100"
            :style="{ backgroundImage: `url('${sp.bgImage}')` }"
          >
            <!-- Viñetas de Fundido a Negro Profundo (Arriba, Abajo y Laterales) -->
            <div class="absolute inset-0 bg-gradient-to-b from-black via-black/75 to-black pointer-events-none" />
            <div class="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black pointer-events-none" />
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_15%,rgba(0,0,0,0.85)_85%)] pointer-events-none" />

            <!-- Resplandor ambiental con el color distintivo de la plataforma -->
            <div
              class="absolute top-1/2 -translate-y-1/2 size-[650px] rounded-full blur-[170px] opacity-25 pointer-events-none transition-all duration-700"
              :class="idx % 2 === 0 ? 'right-10' : 'left-10'"
              :style="{ backgroundColor: sp.color }"
            />
          </div>

          <!-- CONTENIDO EN 2 COLUMNAS ALTERNADAS (ZIG-ZAG) -->
          <div class="container-app relative z-10 w-full">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

              <!-- ================= CASO 1: ÍNDICE PAR (NETFLIX, MAX) -> INFORMACIÓN A LA IZQUIERDA, TARJETA A LA DERECHA ================= -->
              <template v-if="idx % 2 === 0">
                <!-- COLUMNA IZQUIERDA: INFORMACIÓN Y PROPUESTA DE VALOR DE LA PLATAFORMA -->
                <div class="lg:col-span-6 space-y-6 text-left">
                  <!-- Tag de la Plataforma -->
                  <div class="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-md">
                    <span class="size-2 rounded-full animate-ping" :style="{ backgroundColor: sp.color }" />
                    <span class="text-xs font-mono uppercase tracking-[0.2em] font-bold" :style="{ color: sp.color }">
                      {{ sp.tag }}
                    </span>
                  </div>

                  <!-- Título e Impacto -->
                  <div class="space-y-3">
                    <h3 class="font-display text-3xl sm:text-5xl font-black text-white uppercase tracking-tight leading-tight drop-shadow-xl">
                      {{ sp.nombre }}
                    </h3>
                    <p class="text-base sm:text-lg text-cyan-300 font-medium">
                      {{ sp.headline }}
                    </p>
                  </div>

                  <!-- Descripción -->
                  <p class="text-sm sm:text-base text-slate-300/90 leading-relaxed font-sans max-w-xl">
                    {{ sp.desc }}
                  </p>

                  <!-- Checklist de Beneficios Exclusivos -->
                  <div class="space-y-3 pt-2">
                    <div
                      v-for="(feat, fIdx) in sp.features"
                      :key="fIdx"
                      class="flex items-center gap-3 text-xs sm:text-sm text-slate-200"
                    >
                      <div class="size-5 rounded-full flex items-center justify-center shrink-0" :style="{ backgroundColor: `${sp.color}25` }">
                        <CheckCircle2 class="size-3.5" :style="{ color: sp.color }" />
                      </div>
                      <span class="font-medium">{{ feat }}</span>
                    </div>
                  </div>

                  <!-- Badge de Garantía Oficial -->
                  <div class="inline-flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md mt-4">
                    <ShieldCheck class="size-5 text-emerald-400 shrink-0" />
                    <span class="text-xs text-slate-300 font-medium">
                      Garantía ininterrumpida de 30 días · Reemplazo automático 24/7
                    </span>
                  </div>
                </div>

                <!-- COLUMNA DERECHA: TARJETA DE PRECIO Y COMPRA DIRECTA -->
                <div class="lg:col-span-6 flex justify-center lg:justify-end">
                  <div
                    class="w-full max-w-lg rounded-3xl border border-white/20 bg-gradient-to-b from-black/90 to-[#0B0E1F]/95 backdrop-blur-2xl p-7 sm:p-9 shadow-2xl relative overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                    :style="{
                      boxShadow: `0 25px 70px -15px ${sp.color}35, 0 0 1px 1px ${sp.color}50`
                    }"
                  >
                    <!-- Línea Neón Superior -->
                    <div
                      class="absolute top-0 left-0 right-0 h-1.5"
                      :style="{ backgroundColor: sp.color, boxShadow: `0 0 25px ${sp.color}` }"
                    />

                    <!-- Cabecera de Tarjeta -->
                    <div class="flex items-start justify-between gap-4 mb-6">
                      <div>
                        <span class="text-xs font-mono uppercase tracking-wider font-bold" :style="{ color: sp.color }">
                          {{ modalidadSeleccionada === 'CUENTA_COMPLETA' ? 'PLAN CUENTA COMPLETA' : 'PLAN PANTALLA PRIVADA' }}
                        </span>
                        <h4 class="font-display text-2xl sm:text-3xl font-black text-white mt-1">
                          {{ sp.nombre }}
                        </h4>
                      </div>

                      <span class="rounded-full px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-1.5 shrink-0">
                        <span class="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Inmediato
                      </span>
                    </div>

                    <!-- Precio Dinámico -->
                    <div class="p-5 rounded-2xl border border-white/10 bg-white/5 mb-6">
                      <span class="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                        {{ modalidadSeleccionada === 'CUENTA_COMPLETA' ? 'Precio Suscripción 30 días' : 'Precio Perfil Individual con PIN' }}
                      </span>
                      <div class="flex items-baseline gap-2">
                        <span class="font-display text-4xl sm:text-5xl font-black text-white tracking-tight">
                          {{ formatCOP(modalidadSeleccionada === 'CUENTA_COMPLETA' ? sp.precioCompleta : sp.precioPantalla) }}
                        </span>
                        <span class="text-xs sm:text-sm text-slate-400 font-medium">/ 30 días</span>
                      </div>
                      <p class="text-[11px] text-cyan-300/90 mt-1 font-mono">
                        {{ modalidadSeleccionada === 'CUENTA_COMPLETA' ? 'Acceso total a todos los perfiles' : '1 Pantalla exclusiva protegida con PIN' }}
                      </p>
                    </div>

                    <!-- Botón de Compra Directo -->
                    <button
                      type="button"
                      class="w-full inline-flex items-center justify-center rounded-full text-base font-black py-4 px-8 shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer gap-2 uppercase tracking-wider text-white"
                      :style="{ backgroundColor: sp.color, boxShadow: `0 0 35px ${sp.color}50` }"
                      @click="comprarPlataforma(sp)"
                    >
                      <span>Comprar Ahora</span>
                      <ArrowRight class="size-4" />
                    </button>

                    <!-- Métodos de Pago y Entrega -->
                    <div class="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                      <span>⚡ Entrega en &lt; 10s</span>
                      <span>💳 Bancolombia · Nequi · Nu</span>
                    </div>
                  </div>
                </div>
              </template>

              <!-- ================= CASO 2: ÍNDICE IMPAR (DISNEY+, PRIME) -> TARJETA A LA IZQUIERDA, INFORMACIÓN A LA DERECHA ================= -->
              <template v-else>
                <!-- COLUMNA IZQUIERDA: TARJETA DE PRECIO Y COMPRA DIRECTA -->
                <div class="lg:col-span-6 flex justify-center lg:justify-start order-2 lg:order-1">
                  <div
                    class="w-full max-w-lg rounded-3xl border border-white/20 bg-gradient-to-b from-black/90 to-[#0B0E1F]/95 backdrop-blur-2xl p-7 sm:p-9 shadow-2xl relative overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                    :style="{
                      boxShadow: `0 25px 70px -15px ${sp.color}35, 0 0 1px 1px ${sp.color}50`
                    }"
                  >
                    <!-- Línea Neón Superior -->
                    <div
                      class="absolute top-0 left-0 right-0 h-1.5"
                      :style="{ backgroundColor: sp.color, boxShadow: `0 0 25px ${sp.color}` }"
                    />

                    <!-- Cabecera de Tarjeta -->
                    <div class="flex items-start justify-between gap-4 mb-6">
                      <div>
                        <span class="text-xs font-mono uppercase tracking-wider font-bold" :style="{ color: sp.color }">
                          {{ modalidadSeleccionada === 'CUENTA_COMPLETA' ? 'PLAN CUENTA COMPLETA' : 'PLAN PANTALLA PRIVADA' }}
                        </span>
                        <h4 class="font-display text-2xl sm:text-3xl font-black text-white mt-1">
                          {{ sp.nombre }}
                        </h4>
                      </div>

                      <span class="rounded-full px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-1.5 shrink-0">
                        <span class="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Inmediato
                      </span>
                    </div>

                    <!-- Precio Dinámico -->
                    <div class="p-5 rounded-2xl border border-white/10 bg-white/5 mb-6">
                      <span class="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                        {{ modalidadSeleccionada === 'CUENTA_COMPLETA' ? 'Precio Suscripción 30 días' : 'Precio Perfil Individual con PIN' }}
                      </span>
                      <div class="flex items-baseline gap-2">
                        <span class="font-display text-4xl sm:text-5xl font-black text-white tracking-tight">
                          {{ formatCOP(modalidadSeleccionada === 'CUENTA_COMPLETA' ? sp.precioCompleta : sp.precioPantalla) }}
                        </span>
                        <span class="text-xs sm:text-sm text-slate-400 font-medium">/ 30 días</span>
                      </div>
                      <p class="text-[11px] text-cyan-300/90 mt-1 font-mono">
                        {{ modalidadSeleccionada === 'CUENTA_COMPLETA' ? 'Acceso total a todos los perfiles' : '1 Pantalla exclusiva protegida con PIN' }}
                      </p>
                    </div>

                    <!-- Botón de Compra Directo -->
                    <button
                      type="button"
                      class="w-full inline-flex items-center justify-center rounded-full text-base font-black py-4 px-8 shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer gap-2 uppercase tracking-wider text-white"
                      :style="{ backgroundColor: sp.color, boxShadow: `0 0 35px ${sp.color}50` }"
                      @click="comprarPlataforma(sp)"
                    >
                      <span>Comprar Ahora</span>
                      <ArrowRight class="size-4" />
                    </button>

                    <!-- Métodos de Pago y Entrega -->
                    <div class="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                      <span>⚡ Entrega en &lt; 10s</span>
                      <span>💳 Bancolombia · Nequi · Nu</span>
                    </div>
                  </div>
                </div>

                <!-- COLUMNA DERECHA: INFORMACIÓN Y PROPUESTA DE VALOR DE LA PLATAFORMA -->
                <div class="lg:col-span-6 space-y-6 text-left order-1 lg:order-2">
                  <!-- Tag de la Plataforma -->
                  <div class="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-md">
                    <span class="size-2 rounded-full animate-ping" :style="{ backgroundColor: sp.color }" />
                    <span class="text-xs font-mono uppercase tracking-[0.2em] font-bold" :style="{ color: sp.color }">
                      {{ sp.tag }}
                    </span>
                  </div>

                  <!-- Título e Impacto -->
                  <div class="space-y-3">
                    <h3 class="font-display text-3xl sm:text-5xl font-black text-white uppercase tracking-tight leading-tight drop-shadow-xl">
                      {{ sp.nombre }}
                    </h3>
                    <p class="text-base sm:text-lg text-cyan-300 font-medium">
                      {{ sp.headline }}
                    </p>
                  </div>

                  <!-- Descripción -->
                  <p class="text-sm sm:text-base text-slate-300/90 leading-relaxed font-sans max-w-xl">
                    {{ sp.desc }}
                  </p>

                  <!-- Checklist de Beneficios Exclusivos -->
                  <div class="space-y-3 pt-2">
                    <div
                      v-for="(feat, fIdx) in sp.features"
                      :key="fIdx"
                      class="flex items-center gap-3 text-xs sm:text-sm text-slate-200"
                    >
                      <div class="size-5 rounded-full flex items-center justify-center shrink-0" :style="{ backgroundColor: `${sp.color}25` }">
                        <CheckCircle2 class="size-3.5" :style="{ color: sp.color }" />
                      </div>
                      <span class="font-medium">{{ feat }}</span>
                    </div>
                  </div>

                  <!-- Badge de Garantía Oficial -->
                  <div class="inline-flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md mt-4">
                    <ShieldCheck class="size-5 text-emerald-400 shrink-0" />
                    <span class="text-xs text-slate-300 font-medium">
                      Garantía ininterrumpida de 30 días · Reemplazo automático 24/7
                    </span>
                  </div>
                </div>
              </template>

            </div>
          </div>
        </section>

        <!-- Transición posterior a oscuridad total (Se vuelve a oscurecer) -->
        <div class="h-20 sm:h-28 bg-gradient-to-b from-black via-black to-black pointer-events-none" />
      </div>
    </div>

    <!-- ================= 4. GARANTÍAS Y BENEFICIOS ================= -->
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
