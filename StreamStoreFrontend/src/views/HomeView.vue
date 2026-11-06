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

export interface ScrollyPlatform {
  id: number
  nombre: string
  tag: string
  slug: string
  logo?: string
  logoFilter?: string
  color: string
  bgImage: string
  badge: string
  headline: string
  desc: string
  features: string[]
  productoIdCompleta: number
  productoIdPantalla: number
  precioCompleta: number
  precioPantalla: number
  stats: string
}

const scrollyPlatforms: ScrollyPlatform[] = [
  {
    id: 1,
    nombre: 'Netflix Premium 4K',
    tag: 'NETFLIX · 4K ULTRA HD',
    slug: 'netflix',
    logo: '/netflix.webp',
    logoFilter: 'drop-shadow(0 4px 18px rgba(229,9,20,0.7))',
    color: '#E50914',
    bgImage: '/watching_netflix.jpg',
    badge: '🔥 MÁS VENDIDO',
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
    logo: '/disne.png',
    logoFilter: 'drop-shadow(0 4px 20px rgba(17,60,207,0.8)) drop-shadow(0 0 10px rgba(255,255,255,0.4))',
    color: '#113CCF',
    bgImage: '/watching_disney.jpg',
    badge: '⭐ TOP FAMILIAR',
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
    logo: '/hbomax.png',
    logoFilter: 'drop-shadow(0 4px 20px rgba(123,47,247,0.85)) drop-shadow(0 0 10px rgba(255,255,255,0.4))',
    color: '#7B2FF7',
    bgImage: '/watching_max.jpg',
    badge: '🏆 SERIES EMMY',
    headline: 'Historias extraordinarias que definen la cultura.',
    desc: 'Desde La Casa del Dragón y The Last of Us hasta los clásicos inmortales de Warner Bros, DC Comics y HBO en 4K Ultra HD.',
    features: [
      'Series HBO galardonadas con múltiples premios Emmy',
      'Estrenos cinematográficos de Warner Bros y DC',
      'Audio envolvente Dolby Atmos disponible',
      'Perfiles privados protegidos con código PIN',
      'Reemplazo inmediato garantizado ante fallas'
    ],
    productoIdCompleta: 7,
    productoIdPantalla: 8,
    precioCompleta: 28000,
    precioPantalla: 9500,
    stats: 'La casa del cine y televisión de culto'
  },
  {
    id: 4,
    nombre: 'Amazon Prime Video',
    tag: 'PRIME VIDEO · ORIGINALS & DEPORTES',
    slug: 'prime',
    logo: '/primevideo.png',
    logoFilter: 'drop-shadow(0 4px 20px rgba(0,168,225,0.85)) drop-shadow(0 0 10px rgba(255,255,255,0.4))',
    color: '#00A8E1',
    bgImage: '/watching_prime.jpg',
    badge: '🎬 ORIGINALS & CINE',
    headline: 'Producciones originales y canales exclusivos.',
    desc: 'Disfruta de producciones icónicas como The Boys, El Señor de los Anillos y eventos deportivos en vivo con reproducción simultánea.',
    features: [
      'Producciones exclusivas Amazon Originals',
      'X-Ray con información de actores y música en vivo',
      'Compatibilidad universal con cualquier Smart TV',
      'Soporte técnico preferencial 24/7 vía WhatsApp',
      'Precios transparentes en pesos colombianos'
    ],
    productoIdCompleta: 5,
    productoIdPantalla: 6,
    precioCompleta: 25000,
    precioPantalla: 8000,
    stats: 'Calidad 4K sin costo adicional'
  },
  {
    id: 5,
    nombre: 'Paramount+ Premium',
    tag: 'PARAMOUNT+ · BLOCKBUSTERS & SHOWTIME',
    slug: 'paramount',
    logo: '/paramont.webp',
    logoFilter: 'drop-shadow(0 4px 20px rgba(0,100,255,0.85)) drop-shadow(0 0 10px rgba(255,255,255,0.4))',
    color: '#0064FF',
    bgImage: '/hero_cinema_wall.jpg',
    badge: '🚀 BLOCKBUSTERS 4K',
    headline: 'Montañas de entretenimiento con cine y fútbol en vivo.',
    desc: 'Estrenos directos de cine de Paramount Pictures, producciones completas de Showtime y transmisiones exclusivas en vivo.',
    features: [
      'Estrenos exclusivos de películas Paramount Pictures',
      'Catálogo completo de series Showtime y MTV',
      'Transmisiones de fútbol internacional en vivo',
      'Perfiles familiares con controles parentales',
      'Activación automatizada al instante'
    ],
    productoIdCompleta: 9,
    productoIdPantalla: 10,
    precioCompleta: 22000,
    precioPantalla: 7500,
    stats: 'Cine de estreno y transmisiones en vivo'
  },
  {
    id: 6,
    nombre: 'Crunchyroll Mega Fan',
    tag: 'CRUNCHYROLL · ANIME EN SIMULCAST',
    slug: 'crunchyroll',
    logo: '/crunchiroll.png',
    logoFilter: 'drop-shadow(0 4px 20px rgba(244,117,33,0.85)) drop-shadow(0 0 10px rgba(255,255,255,0.4))',
    color: '#F47521',
    bgImage: '/hero_cinema_wall.jpg',
    badge: '⚡ SIMULCAST JAPÓN',
    headline: 'El catálogo definitivo de anime sin anuncios.',
    desc: 'Episodios estreno en simultáneo una hora después de Japón, doblajes exclusivos al español y la biblioteca de anime más grande del mundo.',
    features: [
      'Episodios en simultáneo con Japón en Full HD',
      'Visualización sin anuncios y modo sin conexión',
      'Doblajes exclusivos al español latino',
      'Hasta 4 pantallas simultáneas en Mega Fan',
      'Soporte técnico y garantía ininterrumpida'
    ],
    productoIdCompleta: 11,
    productoIdPantalla: 12,
    precioCompleta: 18000,
    precioPantalla: 6500,
    stats: 'Más de 1.000 títulos de anime'
  },
  {
    id: 7,
    nombre: 'Spotify Premium Individual',
    tag: 'SPOTIFY · MÚSICA & AUDIO HI-FI',
    slug: 'spotify',
    logo: '/spotify.png',
    logoFilter: 'drop-shadow(0 4px 20px rgba(29,185,84,0.85)) drop-shadow(0 0 10px rgba(255,255,255,0.4))',
    color: '#1DB954',
    bgImage: '/hbo_max_mosaic_bg.jpg',
    badge: '🎧 AUDIO SIN ANUNCIOS',
    headline: 'Millones de canciones y podcasts sin interrupciones.',
    desc: 'Reproducción sin anuncios, saltos ilimitados, descargas para modo offline y audio en máxima fidelidad en todos tus dispositivos.',
    features: [
      'Audio en máxima fidelidad sin cortes comerciales',
      'Descargas ilimitadas para escuchar sin internet',
      'Compatibilidad con parlantes, smart TV y autos',
      'Listas personalizadas y estrenos semanales',
      'Garantía total de renovación mensual'
    ],
    productoIdCompleta: 13,
    productoIdPantalla: 14,
    precioCompleta: 16900,
    precioPantalla: 6900,
    stats: 'Más de 100M de canciones disponibles'
  },
  {
    id: 8,
    nombre: 'Apple TV+ Original',
    tag: 'APPLE TV+ · APPLE ORIGINALS',
    slug: 'appletv',
    logo: '/appletv.webp',
    logoFilter: 'drop-shadow(0 4px 20px rgba(255,255,255,0.6)) drop-shadow(0 0 10px rgba(255,255,255,0.3))',
    color: '#E2E8F0',
    bgImage: '/watching_prime.jpg',
    badge: '🌟 CALIDAD OSCAR & EMMY',
    headline: 'Historias visionarias creadas por las mejores mentes.',
    desc: 'Producciones galardonadas por la academia, documentales impactantes y series de ciencia ficción en 4K HDR y Dolby Atmos.',
    features: [
      'Calidad técnica insuperable en 4K HDR y Dolby Vision',
      'Audio espacial inmersivo con tecnología Dolby Atmos',
      'Acceso en app Apple TV para Smart TV y consolas',
      'Sin anuncios y reproducción multi-dispositivo',
      'Activación instantánea garantizada 24/7'
    ],
    productoIdCompleta: 15,
    productoIdPantalla: 16,
    precioCompleta: 19900,
    precioPantalla: 7500,
    stats: 'Ganadora de premios Oscar y Emmy'
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

// ================= SCROLLYTELLING CON FÍSICA SUAVE (LERP + EASING) =================
const scrollY = ref(0)
const activeIndex = ref(0)
const sectionProgress = ref<number[]>(scrollyPlatforms.map(() => 0.5))

// Valores objetivo y suavizados para interpolación continua (LERP)
const targetProgress = scrollyPlatforms.map(() => 0.5)
const currentProgress = scrollyPlatforms.map(() => 0.5)
let rafId: number | null = null
let isAnimating = false

// Funciones de suavizado cinemático (Easing Curves)
function easeOutCubic(t: number): number {
  const f = t - 1
  return f * f * f + 1
}

function easeInCubic(t: number): number {
  return t * t * t
}

function smoothstep(min: number, max: number, value: number): number {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)))
  return x * x * (3 - 2 * x)
}

function updateScrollTargets() {
  if (typeof window === 'undefined') return
  scrollY.value = window.scrollY
  const windowHeight = window.innerHeight || 800

  scrollyPlatforms.forEach((sp, idx) => {
    const el = document.getElementById(`plataforma-${sp.slug}`)
    if (!el) return
    const rect = el.getBoundingClientRect()
    const totalTravel = windowHeight + rect.height
    const currentTravel = windowHeight - rect.top
    const raw = currentTravel / totalTravel
    targetProgress[idx] = Math.min(1.25, Math.max(-0.25, raw))

    // Detectar el capítulo activo que domina el centro de la pantalla
    if (rect.top <= windowHeight * 0.55 && rect.bottom >= windowHeight * 0.40) {
      activeIndex.value = idx
    }
  })

  startPhysicsLoop()
}

function startPhysicsLoop() {
  if (isAnimating) return
  isAnimating = true

  const step = () => {
    let hasMotion = false
    const lerpFactor = 0.12 // 12% por fotograma para amortiguación sedosa estilo Apple

    for (let i = 0; i < scrollyPlatforms.length; i++) {
      const diff = targetProgress[i] - currentProgress[i]
      if (Math.abs(diff) > 0.0004) {
        currentProgress[i] += diff * lerpFactor
        hasMotion = true
      } else {
        currentProgress[i] = targetProgress[i]
      }
    }

    sectionProgress.value = [...currentProgress]

    if (hasMotion) {
      rafId = window.requestAnimationFrame(step)
    } else {
      isAnimating = false
      rafId = null
    }
  }

  rafId = window.requestAnimationFrame(step)
}

function handleScroll() {
  updateScrollTargets()
}

// Transiciones fluidas del Hero
const heroContentStyle = computed(() => {
  const p = Math.min(1, Math.max(0, scrollY.value / 320))
  const eased = easeOutCubic(p)
  return {
    opacity: (1 - p).toFixed(2),
    transform: `translate3d(0, -${(eased * 45).toFixed(1)}px, 0)`,
    pointerEvents: (p > 0.85 ? 'none' : 'auto') as any,
  }
})

const heroDarkenStyle = computed(() => {
  const p = Math.min(1, Math.max(0, scrollY.value / 260))
  return {
    opacity: p.toFixed(2),
  }
})

// ================= ANIMACIÓN DINÁMICA DE ENTRADA Y SALIDA DE LAS TARJETAS =================
function getCardStyle(idx: number, color: string) {
  const p = sectionProgress.value[idx] ?? 0.5

  // 1. Fase de Entrada (p: 0.05 a 0.40): Deslizando desde abajo con curva suave y ganando nitidez
  if (p < 0.40) {
    const t = Math.max(0, Math.min(1, (p - 0.05) / 0.35))
    const eased = easeOutCubic(t)
    const translateY = (1 - eased) * 85
    const scale = 0.90 + eased * 0.10
    const opacity = Math.max(0.04, Math.pow(t, 1.2))
    const blur = (1 - eased) * 6

    return {
      transform: `translate3d(0, ${translateY.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`,
      opacity: opacity.toFixed(2),
      filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : 'none',
      boxShadow: `0 25px 60px -15px ${color}35, 0 0 1px 1px ${color}45`,
      willChange: 'transform, opacity, filter',
    }
  }

  // 2. Fase Activa / Enfocada (p: 0.40 a 0.60): Sweet Spot con halo neón reactivo y flotación suave
  if (p >= 0.40 && p <= 0.60) {
    const centerNorm = (p - 0.40) / 0.20
    const floatY = Math.sin(centerNorm * Math.PI) * 8
    const neonIntensity = (0.55 + Math.sin(centerNorm * Math.PI) * 0.35).toFixed(2)

    return {
      transform: `translate3d(0, -${floatY.toFixed(1)}px, 0) scale(1)`,
      opacity: '1',
      filter: 'none',
      boxShadow: `0 35px 90px -15px ${color}75, 0 0 30px -5px ${color}${Math.round(parseFloat(neonIntensity) * 255).toString(16).padStart(2, '0')}, 0 0 1px 1px ${color}90`,
      willChange: 'transform, opacity, filter',
    }
  }

  // 3. Fase de Salida (p: 0.60 a 1.05): Flotando suavemente hacia arriba y desvaneciéndose con elegancia
  const t = Math.max(0, Math.min(1, (p - 0.60) / 0.40))
  const eased = easeInCubic(t)
  const translateY = -eased * 80
  const scale = 1 - eased * 0.08
  const opacity = Math.max(0.04, 1 - eased * 0.96)
  const blur = eased * 6

  return {
    transform: `translate3d(0, ${translateY.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`,
    opacity: opacity.toFixed(2),
    filter: blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : 'none',
    boxShadow: `0 15px 40px -15px ${color}25, 0 0 1px 1px ${color}30`,
    willChange: 'transform, opacity, filter',
  }
}

// ================= SINCRONIZACIÓN DE HISTORIA Y PROPUESTA DE VALOR =================
function getInfoStyle(idx: number) {
  const p = sectionProgress.value[idx] ?? 0.5

  if (p < 0.40) {
    const t = Math.max(0, Math.min(1, (p - 0.05) / 0.35))
    const eased = easeOutCubic(t)
    const translateY = (1 - eased) * 55
    return {
      transform: `translate3d(0, ${translateY.toFixed(1)}px, 0)`,
      opacity: Math.max(0.06, t).toFixed(2),
      willChange: 'transform, opacity',
    }
  }

  if (p >= 0.40 && p <= 0.60) {
    const centerNorm = (p - 0.40) / 0.20
    const floatY = Math.sin(centerNorm * Math.PI) * 4
    return {
      transform: `translate3d(0, -${floatY.toFixed(1)}px, 0)`,
      opacity: '1',
      willChange: 'transform, opacity',
    }
  }

  const t = Math.max(0, Math.min(1, (p - 0.60) / 0.40))
  const eased = easeInCubic(t)
  const translateY = -eased * 50
  return {
    transform: `translate3d(0, ${translateY.toFixed(1)}px, 0)`,
    opacity: Math.max(0.08, 1 - eased * 0.92).toFixed(2),
    willChange: 'transform, opacity',
  }
}

// ================= HALO AMBIENTAL REACTIVO AL ENFOQUE =================
function getHaloStyle(idx: number, color: string) {
  const p = sectionProgress.value[idx] ?? 0.5
  const dist = Math.abs(p - 0.50)
  const norm = Math.max(0, 1 - dist / 0.40)
  const eased = smoothstep(0, 1, norm)
  const opacity = (0.15 + eased * 0.40).toFixed(2)
  const scale = (0.90 + eased * 0.25).toFixed(2)

  return {
    backgroundColor: color,
    opacity: opacity,
    transform: `scale(${scale})`,
    willChange: 'opacity, transform',
  }
}

// ================= EFECTO PARALLAX CINEMÁTICO EN EL FONDO =================
function getBgParallax(idx: number, bgImage: string) {
  const p = sectionProgress.value[idx] ?? 0.5
  const zoom = 1.03 + Math.min(0.07, Math.max(0, p * 0.07))
  const panY = (p - 0.5) * 45
  return {
    backgroundImage: `url('${bgImage}')`,
    transform: `translate3d(0, ${panY.toFixed(1)}px, 0) scale(${zoom.toFixed(3)})`,
    willChange: 'transform',
  }
}

function scrollToPlatform(slug: string) {
  const el = document.getElementById(`plataforma-${slug}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    scrollY.value = window.scrollY
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', updateScrollTargets, { passive: true })
    setTimeout(updateScrollTargets, 100)
  }
  startCinematicIntro()
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('resize', updateScrollTargets)
    if (rafId) window.cancelAnimationFrame(rafId)
  }
})

function toggleMute() {
  isMuted.value = !isMuted.value
}

function comprarPlataforma(p: ScrollyPlatform) {
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
  <div class="bg-black text-white selection:bg-brand-500/30 selection:text-white pb-24 overflow-x-hidden relative">
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

          <!-- Mosaico de fondo animado -->
          <div
            class="absolute inset-0 bg-cover bg-center transition-all duration-1000 transform"
            :class="[
              introStage === 'black' ? 'opacity-0 scale-95' : '',
              introStage === 'logo' ? 'opacity-30 scale-100 blur-sm' : '',
              introStage === 'mosaic' ? 'opacity-90 scale-105' : '',
            ]"
            style="background-image: url('/hbo_max_mosaic_bg.jpg');"
          >
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80" />
          </div>

          <!-- Revelación Anamórfica del Logotipo StreamStore -->
          <div
            class="relative z-20 flex flex-col items-center justify-center text-center transition-all duration-700"
            :class="[
              introStage === 'black' ? 'opacity-0 scale-75' : '',
              introStage === 'logo' ? 'opacity-100 scale-110' : '',
              introStage === 'mosaic' ? 'opacity-90 scale-100 translate-y-2' : '',
            ]"
          >
            <div
              class="absolute h-1 w-[200vw] bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-sm animate-pulse"
              style="box-shadow: 0 0 40px #8057FF, 0 0 80px #06B6D4;"
            />

            <div class="relative size-32 sm:size-44 rounded-3xl p-1 bg-gradient-to-tr from-[#8057FF] via-[#06B6D4] to-[#8057FF] shadow-[0_0_80px_rgba(128,87,255,0.7)] animate-bounce duration-1000">
              <img
                src="/streamstore_logo_official.png"
                alt="StreamStore Logo Oficial"
                class="w-full h-full object-cover rounded-[22px] bg-[#0B0E1F]"
              />
            </div>

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
      <!-- FONDO: MOSAICO DE ENTRETENIMIENTO CLARO Y VÍVIDO -->
      <div
        class="absolute inset-0 bg-cover bg-center transition-transform duration-[25000ms] ease-out kenburns-bg opacity-85 saturate-[1.15] contrast-[1.05]"
        style="background-image: url('/hbo_max_mosaic_bg.jpg');"
      >
        <!-- Viñeta Gradual Estilo Cine: no tapa completamente el mosaico -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/80 via-black/35 via-50% to-black pointer-events-none" />
        
        <!-- Radial sutil para concentrar la atención en el centro sin oscurecer en exceso -->
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.75)_90%)] pointer-events-none" />

        <!-- Oscurecimiento dinámico suave al hacer scroll -->
        <div
          class="absolute inset-0 bg-black pointer-events-none transition-opacity duration-150"
          :style="heroDarkenStyle"
        />
      </div>

      <!-- CONTENIDO CENTRAL DEL HERO -->
      <div
        class="container-app relative z-10 text-center max-w-4xl mx-auto pt-28 sm:pt-40 pb-16 flex flex-col items-center justify-center space-y-6 transition-all duration-150 ease-out will-change-transform"
        :style="heroContentStyle"
      >
        <div class="flex flex-col items-center justify-center space-y-2 mt-8 sm:mt-14">
          <h1 class="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight select-none leading-none drop-shadow-[0_15px_45px_rgba(0,0,0,0.95)]">
            <span class="text-white drop-shadow-[0_10px_25px_rgba(0,0,0,0.9)]">STREAM</span>
            <span class="block sm:inline sm:ml-4 bg-gradient-to-r from-[#8057FF] via-[#9B51E0] to-[#06B6D4] bg-clip-text text-transparent filter drop-shadow-[0_0_40px_rgba(6,182,212,0.5)]">STORE</span>
          </h1>
        </div>

        <p class="text-xl sm:text-2xl md:text-3xl text-white/95 font-medium tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
          Los planes empiezan desde <strong class="text-white font-black drop-shadow-md">$6.500/mes</strong>
        </p>

        <p class="text-sm sm:text-base text-slate-200 max-w-xl mx-auto font-sans leading-relaxed drop-shadow-md">
          Acceso instantáneo a Netflix, Disney+, Max, Prime Video, Paramount+, Crunchyroll, Spotify y Apple TV+ con garantía ininterrumpida.
        </p>

        <!-- Botones de Acción -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3 w-full sm:w-auto">
          <RouterLink
            to="/login"
            class="inline-flex items-center justify-center rounded-full bg-white hover:bg-slate-200 text-neutral-950 font-black text-base px-10 sm:px-14 py-3.5 sm:py-4 shadow-[0_0_35px_rgba(255,255,255,0.4)] hover:shadow-[0_0_55px_rgba(255,255,255,0.7)] transition-all duration-200 hover:scale-105 active:scale-95 w-full sm:w-auto uppercase tracking-wider"
          >
            Iniciar Sesión
          </RouterLink>

          <a
            href="#plataformas-showcase"
            class="inline-flex items-center justify-center rounded-full border border-white/35 bg-black/60 hover:bg-white/10 text-white font-bold text-base px-8 sm:px-10 py-3.5 sm:py-4 backdrop-blur-md transition-all duration-200 hover:border-white w-full sm:w-auto cursor-pointer"
          >
            <span>Ver Canales & Planes</span>
            <ArrowRight class="size-4 ml-2" />
          </a>
        </div>

        <!-- 4 Métricas de Confianza -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 pt-8 w-full max-w-3xl border-t border-white/15 mt-6">
          <div class="rounded-xl border border-white/15 bg-black/70 p-3.5 shadow-lg backdrop-blur-md">
            <p class="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">+15K</p>
            <p class="text-[11px] sm:text-xs text-slate-300 mt-0.5">Clientes Satisfechos</p>
          </div>
          <div class="rounded-xl border border-white/15 bg-black/70 p-3.5 shadow-lg backdrop-blur-md">
            <p class="font-display text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight">100%</p>
            <p class="text-[11px] sm:text-xs text-slate-300 mt-0.5">Garantía Activa</p>
          </div>
          <div class="rounded-xl border border-white/15 bg-black/70 p-3.5 shadow-lg backdrop-blur-md">
            <p class="font-display text-2xl sm:text-3xl font-black text-cyan-300 tracking-tight">24/7</p>
            <p class="text-[11px] sm:text-xs text-slate-300 mt-0.5">Soporte Inmediato</p>
          </div>
          <div class="rounded-xl border border-white/15 bg-black/70 p-3.5 shadow-lg backdrop-blur-md">
            <p class="font-display text-2xl sm:text-3xl font-black text-purple-300 tracking-tight">&lt; 10s</p>
            <p class="text-[11px] sm:text-xs text-slate-300 mt-0.5">Entrega Automática</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= 2. CABECERA: ELIGE EL MEJOR PLAN PARA TI ================= -->
    <section id="planes-intro" class="relative bg-black pt-16 pb-12 text-center overflow-hidden">
      <!-- Resplandor ambiental superior -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-3xl h-32 bg-gradient-to-b from-[#8057FF]/20 via-[#06B6D4]/15 to-transparent blur-3xl pointer-events-none" />

      <div class="container-app relative z-10 max-w-3xl mx-auto space-y-5">
        <h2 class="font-display text-4xl sm:text-6xl font-black text-white uppercase tracking-tight leading-[1.05] drop-shadow-2xl">
          ELIGE EL MEJOR <br />
          <span class="bg-gradient-to-r from-[#8057FF] via-[#A855F7] to-[#06B6D4] bg-clip-text text-transparent">
            PLAN PARA TI
          </span>
        </h2>

        <p class="text-sm sm:text-base text-slate-200 font-sans max-w-xl mx-auto leading-relaxed drop-shadow">
          Desliza para recorrer cada plataforma con activación automática en segundos y garantía total de 30 días.
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

    <!-- ================= 3. CAPÍTULOS SCROLLYTELLING POR PLATAFORMA ================= -->
    <div id="plataformas-showcase" class="space-y-0 bg-black relative">

      <!-- ================= DOCK FLOTANTE LATERAL (HIPERVÍNCULOS A CANALES) ================= -->
      <aside 
        class="fixed right-2.5 sm:right-5 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2 p-1.5 sm:p-2 rounded-2xl border border-white/20 bg-black/85 backdrop-blur-2xl shadow-[0_0_35px_rgba(0,0,0,0.9)] transition-all duration-300"
      >
        <button
          v-for="(sp, idx) in scrollyPlatforms"
          :key="'dock-' + sp.slug"
          type="button"
          class="size-10 sm:size-12 rounded-xl flex items-center justify-center p-2 transition-all duration-300 cursor-pointer relative group border"
          :class="activeIndex === idx ? 'bg-white/20 scale-110 shadow-xl border-white/40' : 'border-transparent hover:bg-white/10 opacity-70 hover:opacity-100'"
          :style="activeIndex === idx ? { boxShadow: `0 0 18px ${sp.color}` } : {}"
          :title="sp.nombre"
          @click="scrollToPlatform(sp.slug)"
        >
          <img
            v-if="sp.logo"
            :src="sp.logo"
            :alt="sp.nombre"
            class="max-h-7 max-w-8 sm:max-h-8 sm:max-w-9 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          />
          <span v-else class="text-[10px] font-black" :style="{ color: sp.color }">
            {{ sp.slug.substring(0, 3).toUpperCase() }}
          </span>

          <!-- Tooltip flotante a la izquierda -->
          <span class="absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-black/95 border border-white/20 text-xs font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-2xl flex items-center gap-1.5">
            <span class="size-2 rounded-full" :style="{ backgroundColor: sp.color }" />
            {{ sp.nombre }}
          </span>
        </button>
      </aside>

      <!-- SECCIONES DE PLATAFORMAS (SCROLLYTELLING) -->
      <div
        v-for="(sp, idx) in scrollyPlatforms"
        :key="sp.id"
        class="relative"
      >
        <section
          :id="'plataforma-' + sp.slug"
          class="relative min-h-[95vh] flex items-center justify-center overflow-hidden py-16 sm:py-24 bg-black"
        >
          <!-- FOTO DE REFERENCIA CINEMÁTICA DE FONDO: CLARA, VÍVIDA Y APRECIABLE -->
          <div
            class="absolute inset-0 bg-cover bg-center opacity-85 sm:opacity-90 saturate-[1.12] contrast-[1.06] brightness-[0.92] will-change-transform pointer-events-none"
            :style="getBgParallax(idx, sp.bgImage)"
          />

          <!-- VIÑETAS CINEMÁTICAS SUAVES (PROTEGEN EL TEXTO SIN APAGAR LA IMAGEN) -->
          <!-- 1. Suave degradado vertical para fundir con las secciones superior e inferior -->
          <div class="absolute inset-0 bg-gradient-to-b from-black/85 via-black/25 via-50% to-black/85 pointer-events-none" />

          <!-- 2. Suave radial en las esquinas -->
          <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.6)_95%)] pointer-events-none" />

          <!-- 3. Halo neón ambiental con el color distintivo de la plataforma iluminando la escena -->
          <div
            class="absolute top-1/2 -translate-y-1/2 size-[680px] rounded-full blur-[140px] pointer-events-none will-change-transform"
            :class="idx % 2 === 0 ? 'right-10' : 'left-10'"
            :style="getHaloStyle(idx, sp.color)"
          />

          <!-- CONTENIDO EN 2 COLUMNAS ALTERNADAS (CON ANIMACIÓN DE ENTRADA Y SALIDA) -->
          <div class="container-app relative z-10 w-full">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

              <!-- ================= CASO 1: ÍNDICE PAR -> INFORMACIÓN A LA IZQUIERDA, TARJETA A LA DERECHA ================= -->
              <template v-if="idx % 2 === 0">
                <!-- COLUMNA IZQUIERDA: INFORMACIÓN Y PROPUESTA DE VALOR -->
                <div
                  class="lg:col-span-6 space-y-6 text-left will-change-transform"
                  :style="getInfoStyle(idx)"
                >
                  <!-- Logotipo Oficial de Marca Libre y Grande (Sin caja contenedora) -->
                  <div v-if="sp.logo" class="mb-4">
                    <img 
                      :src="sp.logo" 
                      :alt="sp.nombre" 
                      class="h-14 sm:h-20 w-auto max-w-[260px] sm:max-w-[320px] object-contain transition-transform duration-300"
                      :style="{ filter: sp.logoFilter }"
                    />
                  </div>

                  <!-- Título e Impacto -->
                  <div class="space-y-3">
                    <h3 class="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-tight drop-shadow-[0_10px_30px_rgba(0,0,0,0.95)]">
                      {{ sp.nombre }}
                    </h3>
                    <p class="text-base sm:text-xl font-semibold drop-shadow" :style="{ color: sp.color }">
                      {{ sp.headline }}
                    </p>
                  </div>

                  <!-- Descripción -->
                  <p class="text-sm sm:text-base text-slate-100 leading-relaxed font-sans max-w-xl drop-shadow-md">
                    {{ sp.desc }}
                  </p>

                  <!-- Checklist de Beneficios Exclusivos -->
                  <div class="space-y-3 pt-2">
                    <div
                      v-for="(feat, fIdx) in sp.features"
                      :key="fIdx"
                      class="flex items-center gap-3 text-xs sm:text-sm text-slate-100 drop-shadow"
                    >
                      <div class="size-5 rounded-full flex items-center justify-center shrink-0 border border-white/20" :style="{ backgroundColor: `${sp.color}35` }">
                        <CheckCircle2 class="size-3.5" :style="{ color: sp.color }" />
                      </div>
                      <span class="font-medium">{{ feat }}</span>
                    </div>
                  </div>
                </div>

                <!-- COLUMNA DERECHA: TARJETA DE PRECIO Y COMPRA DIRECTA -->
                <div class="lg:col-span-6 flex justify-center lg:justify-end">
                  <div
                    class="w-full max-w-lg rounded-3xl border border-white/25 bg-gradient-to-b from-black/85 via-[#0B0E1F]/90 to-black/95 backdrop-blur-2xl p-7 sm:p-9 shadow-2xl relative overflow-hidden group hover:border-white/40 will-change-transform"
                    :style="getCardStyle(idx, sp.color)"
                  >
                    <!-- Línea Neón Superior Resplandeciente -->
                    <div
                      class="absolute top-0 left-0 right-0 h-1.5"
                      :style="{ backgroundColor: sp.color, boxShadow: `0 0 30px ${sp.color}, 0 0 60px ${sp.color}` }"
                    />

                    <!-- Cabecera de Tarjeta: Logo Oficial Libre y Grande (Sin cuadro) -->
                    <div class="flex items-center justify-between gap-4 mb-6">
                      <div>
                        <span class="text-xs font-mono uppercase tracking-wider font-black" :style="{ color: sp.color }">
                          {{ modalidadSeleccionada === 'CUENTA_COMPLETA' ? 'PLAN CUENTA COMPLETA' : 'PLAN PANTALLA PRIVADA' }}
                        </span>
                        <h4 class="font-display text-2xl sm:text-3xl font-black text-white mt-0.5 drop-shadow">
                          {{ sp.nombre }}
                        </h4>
                      </div>

                      <!-- Logotipo Oficial Libre, Nítido y Prominente (Sin caja ni marco) -->
                      <div v-if="sp.logo" class="h-12 sm:h-14 flex items-center justify-end shrink-0">
                        <img 
                          :src="sp.logo" 
                          :alt="sp.nombre" 
                          class="h-10 sm:h-12 w-auto max-w-[170px] sm:max-w-[210px] object-contain transition-transform duration-300 group-hover:scale-105"
                          :style="{ filter: sp.logoFilter }"
                        />
                      </div>
                    </div>

                    <!-- Precio Dinámico con Alto Contraste -->
                    <div class="p-5 rounded-2xl border border-white/15 bg-white/5 mb-6 backdrop-blur-sm shadow-inner">
                      <span class="text-[11px] font-mono uppercase text-slate-300 block mb-1 font-bold">
                        {{ modalidadSeleccionada === 'CUENTA_COMPLETA' ? 'Precio Suscripción 30 días' : 'Precio Perfil Individual con PIN' }}
                      </span>
                      <div class="flex items-baseline gap-2">
                        <span class="font-display text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
                          {{ formatCOP(modalidadSeleccionada === 'CUENTA_COMPLETA' ? sp.precioCompleta : sp.precioPantalla) }}
                        </span>
                        <span class="text-xs sm:text-sm text-slate-300 font-medium">/ 30 días</span>
                      </div>
                      <p class="text-[11px] text-cyan-300 mt-1 font-mono font-semibold">
                        {{ modalidadSeleccionada === 'CUENTA_COMPLETA' ? '✔ Acceso total a todos los perfiles de la cuenta' : '✔ 1 Pantalla exclusiva protegida con PIN privado' }}
                      </p>
                    </div>

                    <!-- Botón de Compra Directo -->
                    <button
                      type="button"
                      class="w-full inline-flex items-center justify-center rounded-full text-base font-black py-4 px-8 shadow-2xl transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer gap-2 uppercase tracking-wider text-white relative overflow-hidden"
                      :style="{ backgroundColor: sp.color, boxShadow: `0 0 40px ${sp.color}70` }"
                      @click="comprarPlataforma(sp)"
                    >
                      <span class="relative z-10">Comprar Ahora</span>
                      <ArrowRight class="size-4 relative z-10 transition-transform group-hover:translate-x-1" />
                    </button>

                    <!-- Métodos de Pago y Entrega -->
                    <div class="mt-4 pt-4 border-t border-white/15 flex items-center justify-between text-[11px] text-slate-300 font-medium">
                      <span>⚡ Entrega en &lt; 10s · Garantía 30 días</span>
                      <span>💳 Bancolombia · Nequi · Nu</span>
                    </div>
                  </div>
                </div>
              </template>

              <!-- ================= CASO 2: ÍNDICE IMPAR -> TARJETA A LA IZQUIERDA, INFORMACIÓN A LA DERECHA ================= -->
              <template v-else>
                <!-- COLUMNA IZQUIERDA: TARJETA DE PRECIO Y COMPRA DIRECTA -->
                <div class="lg:col-span-6 flex justify-center lg:justify-start order-2 lg:order-1">
                  <div
                    class="w-full max-w-lg rounded-3xl border border-white/25 bg-gradient-to-b from-black/85 via-[#0B0E1F]/90 to-black/95 backdrop-blur-2xl p-7 sm:p-9 shadow-2xl relative overflow-hidden group hover:border-white/40 will-change-transform"
                    :style="getCardStyle(idx, sp.color)"
                  >
                    <!-- Línea Neón Superior Resplandeciente -->
                    <div
                      class="absolute top-0 left-0 right-0 h-1.5"
                      :style="{ backgroundColor: sp.color, boxShadow: `0 0 30px ${sp.color}, 0 0 60px ${sp.color}` }"
                    />

                    <!-- Cabecera de Tarjeta: Logo Oficial Libre y Grande (Sin cuadro) -->
                    <div class="flex items-center justify-between gap-4 mb-6">
                      <div>
                        <span class="text-xs font-mono uppercase tracking-wider font-black" :style="{ color: sp.color }">
                          {{ modalidadSeleccionada === 'CUENTA_COMPLETA' ? 'PLAN CUENTA COMPLETA' : 'PLAN PANTALLA PRIVADA' }}
                        </span>
                        <h4 class="font-display text-2xl sm:text-3xl font-black text-white mt-0.5 drop-shadow">
                          {{ sp.nombre }}
                        </h4>
                      </div>

                      <!-- Logotipo Oficial Libre, Nítido y Prominente (Sin caja ni marco) -->
                      <div v-if="sp.logo" class="h-12 sm:h-14 flex items-center justify-end shrink-0">
                        <img 
                          :src="sp.logo" 
                          :alt="sp.nombre" 
                          class="h-10 sm:h-12 w-auto max-w-[170px] sm:max-w-[210px] object-contain transition-transform duration-300 group-hover:scale-105"
                          :style="{ filter: sp.logoFilter }"
                        />
                      </div>
                    </div>

                    <!-- Precio Dinámico con Alto Contraste -->
                    <div class="p-5 rounded-2xl border border-white/15 bg-white/5 mb-6 backdrop-blur-sm shadow-inner">
                      <span class="text-[11px] font-mono uppercase text-slate-300 block mb-1 font-bold">
                        {{ modalidadSeleccionada === 'CUENTA_COMPLETA' ? 'Precio Suscripción 30 días' : 'Precio Perfil Individual con PIN' }}
                      </span>
                      <div class="flex items-baseline gap-2">
                        <span class="font-display text-4xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
                          {{ formatCOP(modalidadSeleccionada === 'CUENTA_COMPLETA' ? sp.precioCompleta : sp.precioPantalla) }}
                        </span>
                        <span class="text-xs sm:text-sm text-slate-300 font-medium">/ 30 días</span>
                      </div>
                      <p class="text-[11px] text-cyan-300 mt-1 font-mono font-semibold">
                        {{ modalidadSeleccionada === 'CUENTA_COMPLETA' ? '✔ Acceso total a todos los perfiles de la cuenta' : '✔ 1 Pantalla exclusiva protegida con PIN privado' }}
                      </p>
                    </div>

                    <!-- Botón de Compra Directo -->
                    <button
                      type="button"
                      class="w-full inline-flex items-center justify-center rounded-full text-base font-black py-4 px-8 shadow-2xl transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer gap-2 uppercase tracking-wider text-white relative overflow-hidden"
                      :style="{ backgroundColor: sp.color, boxShadow: `0 0 40px ${sp.color}70` }"
                      @click="comprarPlataforma(sp)"
                    >
                      <span class="relative z-10">Comprar Ahora</span>
                      <ArrowRight class="size-4 relative z-10 transition-transform group-hover:translate-x-1" />
                    </button>

                    <!-- Métodos de Pago y Entrega -->
                    <div class="mt-4 pt-4 border-t border-white/15 flex items-center justify-between text-[11px] text-slate-300 font-medium">
                      <span>⚡ Entrega en &lt; 10s · Garantía 30 días</span>
                      <span>💳 Bancolombia · Nequi · Nu</span>
                    </div>
                  </div>
                </div>

                <!-- COLUMNA DERECHA: INFORMACIÓN Y PROPUESTA DE VALOR -->
                <div
                  class="lg:col-span-6 space-y-6 text-left order-1 lg:order-2 will-change-transform"
                  :style="getInfoStyle(idx)"
                >
                  <!-- Logotipo Oficial de Marca Libre y Grande (Sin caja contenedora) -->
                  <div v-if="sp.logo" class="mb-4">
                    <img 
                      :src="sp.logo" 
                      :alt="sp.nombre" 
                      class="h-14 sm:h-20 w-auto max-w-[260px] sm:max-w-[320px] object-contain transition-transform duration-300"
                      :style="{ filter: sp.logoFilter }"
                    />
                  </div>

                  <!-- Título e Impacto -->
                  <div class="space-y-3">
                    <h3 class="font-display text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-tight drop-shadow-[0_10px_30px_rgba(0,0,0,0.95)]">
                      {{ sp.nombre }}
                    </h3>
                    <p class="text-base sm:text-xl font-semibold drop-shadow" :style="{ color: sp.color }">
                      {{ sp.headline }}
                    </p>
                  </div>

                  <!-- Descripción -->
                  <p class="text-sm sm:text-base text-slate-100 leading-relaxed font-sans max-w-xl drop-shadow-md">
                    {{ sp.desc }}
                  </p>

                  <!-- Checklist de Beneficios Exclusivos -->
                  <div class="space-y-3 pt-2">
                    <div
                      v-for="(feat, fIdx) in sp.features"
                      :key="fIdx"
                      class="flex items-center gap-3 text-xs sm:text-sm text-slate-100 drop-shadow"
                    >
                      <div class="size-5 rounded-full flex items-center justify-center shrink-0 border border-white/20" :style="{ backgroundColor: `${sp.color}35` }">
                        <CheckCircle2 class="size-3.5" :style="{ color: sp.color }" />
                      </div>
                      <span class="font-medium">{{ feat }}</span>
                    </div>
                  </div>
                </div>
              </template>

            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- ================= 5. GARANTÍAS Y BENEFICIOS ================= -->
    <section class="container-app pt-16">
      <div class="rounded-3xl border border-white/15 bg-white/5 p-8 sm:p-12 relative overflow-hidden backdrop-blur-md">
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

    <!-- ================= 6. PREGUNTAS FRECUENTES ================= -->
    <section class="container-app max-w-3xl space-y-6 pt-16">
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
