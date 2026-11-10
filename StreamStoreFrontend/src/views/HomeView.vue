<script lang="ts">
// Variable en memoria a nivel módulo: persiste durante la sesión en el cliente
let introHasPlayedSession = false

export interface ScrollyPlatform {
  id: number
  nombre: string
  tag: string
  slug: string
  logo?: string
  /** Proporción ancho/alto del logo recortado, usada para equilibrar su tamaño visual */
  logoRatio: number
  /** Placa clara detrás del logo cuando la marca es oscura y se pierde sobre fondo negro */
  logoPlate?: 'light'
  logoFilter?: string
  color: string
    bgImage: string
  bgVideo?: string
  familyHappinessTag?: string
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
</script>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { 
  ArrowRight, 
  ChevronDown, 
  Headphones, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  Zap,
  CheckCircle2,
  X,
  Play,
  Pause,
  Maximize2,
  Sparkles,
  Star,
  Users,
  Tv
} from '@lucide/vue'
import type { TipoProducto } from '@/types'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const route = useRoute()
const cart = useCartStore()

const modalidadSeleccionada = ref<TipoProducto>('CUENTA_COMPLETA')

const scrollyPlatforms: ScrollyPlatform[] = [
  {
    id: 1,
    nombre: 'Netflix Premium 4K',
    tag: 'NETFLIX · 4K ULTRA HD',
    slug: 'netflix',
    logo: '/home_logos/netflix.png',
    logoRatio: 3.69,
    logoFilter: 'drop-shadow(0 4px 18px rgba(229,9,20,0.7))',
    color: '#E50914',
    bgImage: '/watching_netflix.jpg',
    bgVideo: '/videos/familia%201.mp4',
    familyHappinessTag: 'Familia feliz · Noche de cine y estrenos',
    badge: 'PLAN DESTACADO',
    headline: 'El catálogo más grande del mundo en Ultra HD.',
    desc: 'Disfruta de series exclusivas, películas taquilleras y documentales en 4K Ultra HD con audio espacial y perfiles protegidos.',
    features: [
      'Calidad 4K Ultra HD con HDR10 y Dolby Vision',
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
    logo: '/home_logos/disney.jfif',
    logoRatio: 1.33,
    logoFilter: 'none',
    color: '#113CCF',
    bgImage: '/watching_disney.jpg',
    bgVideo: '/videos/familia%203.mp4',
    familyHappinessTag: 'Familia feliz · Magia y niños en casa',
    badge: 'FAMILIAR & KIDS',
    headline: 'Tus mundos favoritos juntos en un solo lugar.',
    desc: 'Todo el universo de Disney, Pixar, Marvel, Star Wars y National Geographic, además de deportes en vivo de ESPN, con la máxima calidad de imagen.',
    features: [
      'Catálogo completo de Marvel Studios, Star Wars y Pixar',
      'Transmisiones deportivas de ESPN en vivo',
      'Formato IMAX Enhanced en títulos seleccionados',
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
    logo: '/home_logos/max.png',
    logoRatio: 5.76,
    logoPlate: 'light',
    logoFilter: 'drop-shadow(0 4px 20px rgba(123,47,247,0.85)) drop-shadow(0 0 10px rgba(255,255,255,0.4))',
    color: '#7B2FF7',
    bgImage: '/watching_max.jpg',
    bgVideo: '/videos/familia%202.mp4',
    familyHappinessTag: 'Familia feliz · Maratón de series y risas',
    badge: 'SERIES EXCLUSIVAS',
    headline: 'Historias extraordinarias que definen la cultura.',
    desc: 'Desde La Casa del Dragón y The Last of Us hasta los grandes clásicos de Warner Bros., DC y HBO, en 4K Ultra HD.',
    features: [
      'Series HBO galardonadas con múltiples premios Emmy',
      'Estrenos de cine de Warner Bros. y DC',
      'Audio envolvente Dolby Atmos disponible',
      'Perfiles privados protegidos con código PIN',
      'Reemplazo inmediato garantizado ante cualquier falla'
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
    logo: '/home_logos/prime.png',
    logoRatio: 3.14,
    logoFilter: 'drop-shadow(0 4px 20px rgba(0,168,225,0.85)) drop-shadow(0 0 10px rgba(255,255,255,0.4))',
    color: '#00A8E1',
    bgImage: '/watching_prime.jpg',
    badge: 'ORIGINALS & CINE',
    headline: 'Producciones originales y canales exclusivos.',
    desc: 'Disfruta de producciones icónicas como The Boys y El Señor de los Anillos: Los Anillos de Poder, además de eventos deportivos en vivo.',
    features: [
      'Producciones exclusivas Amazon Originals',
      'Función X-Ray con datos de actores y música en tiempo real',
      'Compatibilidad universal con cualquier Smart TV',
      'Soporte técnico preferencial 24/7 por WhatsApp',
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
    logo: '/home_logos/paramount.png',
    logoRatio: 4.31,
    logoPlate: 'light',
    logoFilter: 'drop-shadow(0 4px 20px rgba(0,100,255,0.85)) drop-shadow(0 0 10px rgba(255,255,255,0.4))',
    color: '#0064FF',
    bgImage: '/hero_cinema_wall.jpg',
    bgVideo: '/videos/familia%204.mp4',
    familyHappinessTag: 'Familia feliz · Cine de estreno y deportes',
    badge: 'CINE DE ESTRENO',
    headline: 'Cine de estreno, series y fútbol en vivo.',
    desc: 'Estrenos de Paramount Pictures, el catálogo completo de Showtime y transmisiones exclusivas en vivo.',
    features: [
      'Estrenos exclusivos de películas Paramount Pictures',
      'Catálogo completo de series Showtime y MTV',
      'Transmisiones de fútbol internacional en vivo',
      'Perfiles familiares con controles parentales',
      'Activación automática al instante'
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
    logo: '/home_logos/crunchyroll.png',
    logoRatio: 1.78,
    logoFilter: 'drop-shadow(0 4px 20px rgba(244,117,33,0.85)) drop-shadow(0 0 10px rgba(255,255,255,0.4))',
    color: '#F47521',
    bgImage: '/hero_cinema_wall.jpg',
    bgVideo: '/videos/familia%205.mp4',
    familyHappinessTag: 'Familia feliz · Emoción y diversión juntos',
    badge: 'SIMULCAST GLOBAL',
    headline: 'El catálogo definitivo de anime sin anuncios.',
    desc: 'Estrenos en simulcast una hora después de su emisión en Japón, doblajes exclusivos al español y la biblioteca de anime más grande del mundo.',
    features: [
      'Episodios en simultáneo con Japón en Full HD',
      'Sin anuncios y con descargas para ver sin conexión',
      'Doblajes exclusivos al español latino',
      'Hasta 4 pantallas simultáneas en Mega Fan',
      'Soporte técnico y garantía durante todo el ciclo'
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
    logo: '/home_logos/spotify.png',
    logoRatio: 3.25,
    logoFilter: 'drop-shadow(0 4px 20px rgba(29,185,84,0.85)) drop-shadow(0 0 10px rgba(255,255,255,0.4))',
    color: '#1DB954',
    bgImage: '/hbo_max_mosaic_bg.jpg',
    badge: 'MÚSICA HI-FI',
    headline: 'Millones de canciones y podcasts sin interrupciones.',
    desc: 'Reproducción sin anuncios, saltos ilimitados, descargas para escuchar sin conexión y audio de alta fidelidad en todos tus dispositivos.',
    features: [
      'Audio de alta fidelidad sin cortes comerciales',
      'Descargas ilimitadas para escuchar sin internet',
      'Compatible con parlantes, smart TV y autos',
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
    logo: '/home_logos/appletv.png',
    logoRatio: 2.63,
    logoFilter: 'drop-shadow(0 4px 20px rgba(255,255,255,0.6)) drop-shadow(0 0 10px rgba(255,255,255,0.3))',
    color: '#E2E8F0',
    bgImage: '/watching_prime.jpg',
    badge: 'PRODUCCIONES ORIGINALES',
    headline: 'Historias visionarias creadas por las mejores mentes.',
    desc: 'Producciones premiadas por la Academia, documentales impactantes y series de ciencia ficción en 4K HDR con Dolby Atmos.',
    features: [
      'Imagen 4K HDR con Dolby Vision',
      'Audio espacial inmersivo con tecnología Dolby Atmos',
      'App de Apple TV para smart TV y consolas',
      'Sin anuncios y en varios dispositivos',
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
  if (typeof window !== 'undefined') sessionStorage.setItem('streamstore_intro_seen', 'true')
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
const planesIntroProgress = ref(0.5)
let targetPlanesIntro = 0.5
let currentPlanesIntro = 0.5
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

  const planesEl = document.getElementById('planes-intro')
  if (planesEl) {
    const rect = planesEl.getBoundingClientRect()
    const totalTravel = windowHeight + rect.height
    const currentTravel = windowHeight - rect.top
    targetPlanesIntro = Math.min(1.25, Math.max(-0.25, currentTravel / totalTravel))
  }

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

    const diffPlanes = targetPlanesIntro - currentPlanesIntro
    if (Math.abs(diffPlanes) > 0.0004) {
      currentPlanesIntro += diffPlanes * lerpFactor
      hasMotion = true
    } else {
      currentPlanesIntro = targetPlanesIntro
    }
    planesIntroProgress.value = currentPlanesIntro

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

// ================= PREFERENCIA DE MOVIMIENTO REDUCIDO =================
const prefersReducedMotion = ref(false)
let motionQuery: MediaQueryList | null = null
function syncMotionPreference() {
  prefersReducedMotion.value = !!motionQuery?.matches
}

// Transiciones fluidas del Hero: el texto se desplaza pero nunca se vuelve transparente
const heroContentStyle = computed(() => {
  if (prefersReducedMotion.value) return {}
  const p = Math.min(1, Math.max(0, scrollY.value / 420))
  const eased = easeOutCubic(p)
  // Al scrollear hacia la pantalla 2, el contenido del Hero se desvanece suavemente a negro
  const opacity = Math.max(0, 1 - p * 1.35)
  return {
    transform: `translate3d(0, -${(eased * 50).toFixed(1)}px, 0)`,
    opacity: opacity.toFixed(2),
  }
})

const heroDarkenStyle = computed(() => {
  const p = Math.min(1, Math.max(0, scrollY.value / 360))
  // Se oscurece completamente hacia negro absoluto
  return {
    opacity: Math.min(1, p * 1.25).toFixed(2),
  }
})

// ================= ANIMACIONES DE DESVANECER Y APARECER CINEMÁTICO =================
const planesIntroStyle = computed(() => {
  if (prefersReducedMotion.value) return {}
  const p = planesIntroProgress.value
  let opacity = 1
  let translateY = 0
  if (p < 0.45) {
    const t = Math.max(0, Math.min(1, (p - 0.15) / 0.30))
    const eased = easeOutCubic(t)
    opacity = eased
    translateY = (1 - eased) * 45
  } else if (p > 0.55) {
    const t = Math.max(0, Math.min(1, (p - 0.55) / 0.30))
    const eased = easeInCubic(t)
    opacity = Math.max(0, 1 - eased)
    translateY = -eased * 45
  }
  return {
    opacity: opacity.toFixed(2),
    transform: `translate3d(0, ${translateY.toFixed(1)}px, 0)`,
  }
})

function getCardStyle(idx: number, color: string) {
  const p = sectionProgress.value[idx] ?? 0.5
  const restShadow = `0 25px 60px -15px rgba(0,0,0,0.9), 0 0 30px -10px ${color}40, inset 0 1px 0 rgba(255,255,255,0.15)`
  if (prefersReducedMotion.value) {
    return { boxShadow: restShadow }
  }

  // 1. Entrada desde el negro (Aparece suavemente desde 0 a 1)
  if (p < 0.45) {
    const t = Math.max(0, Math.min(1, (p - 0.15) / 0.30))
    const eased = easeOutCubic(t)
    const translateY = (1 - eased) * 45
    const rotateX = ((1 - eased) * 6).toFixed(1)
    const scale = (0.94 + eased * 0.06).toFixed(3)
    const opacity = eased.toFixed(2)

    return {
      transform: `perspective(1200px) rotateX(${rotateX}deg) translate3d(0, ${translateY.toFixed(1)}px, 0) scale(${scale})`,
      boxShadow: restShadow,
      opacity,
    }
  }

  // 2. Centro de la pantalla (100% visible, halo y microflotación)
  if (p <= 0.55) {
    const centerNorm = (p - 0.45) / 0.10
    const wave = Math.sin(centerNorm * Math.PI)
    const scale = (1.0 + wave * 0.02).toFixed(3)
    const translateY = -(wave * 5).toFixed(1)
    const glowAlpha = Math.round((0.50 + wave * 0.40) * 255).toString(16).padStart(2, '0')

    return {
      transform: `perspective(1200px) scale(${scale}) translate3d(0, ${translateY}px, 0)`,
      boxShadow: `0 35px 80px -15px rgba(0,0,0,0.95), 0 0 45px -5px ${color}${glowAlpha}, inset 0 1px 0 rgba(255,255,255,0.25)`,
      opacity: '1',
    }
  }

  // 3. Salida hacia el negro (Se desvanece suavemente desde 1 a 0)
  const t = Math.max(0, Math.min(1, (p - 0.55) / 0.30))
  const eased = easeInCubic(t)
  const translateY = -eased * 45
  const rotateX = (-eased * 6).toFixed(1)
  const scale = (1.0 - eased * 0.05).toFixed(3)
  const opacity = Math.max(0, 1 - eased).toFixed(2)

  return {
    transform: `perspective(1200px) rotateX(${rotateX}deg) translate3d(0, ${translateY.toFixed(1)}px, 0) scale(${scale})`,
    boxShadow: restShadow,
    opacity,
  }
}

function getInfoStyle(idx: number) {
  if (prefersReducedMotion.value) return {}
  const p = sectionProgress.value[idx] ?? 0.5

  // 1. Entrada desde el negro (Aparecer)
  if (p < 0.45) {
    const t = Math.max(0, Math.min(1, (p - 0.15) / 0.30))
    const eased = easeOutCubic(t)
    return {
      transform: `translate3d(0, ${((1 - eased) * 40).toFixed(1)}px, 0)`,
      opacity: eased.toFixed(2),
    }
  }

  // 2. Centro
  if (p <= 0.55) {
    const wave = Math.sin(((p - 0.45) / 0.10) * Math.PI)
    return {
      transform: `translate3d(0, -${(wave * 4).toFixed(1)}px, 0)`,
      opacity: '1',
    }
  }

  // 3. Salida hacia el negro (Desvanecer)
  const t = Math.max(0, Math.min(1, (p - 0.55) / 0.30))
  const eased = easeInCubic(t)
  return {
    transform: `translate3d(0, ${(-eased * 40).toFixed(1)}px, 0)`,
    opacity: Math.max(0, 1 - eased).toFixed(2),
  }
}

// ================= HALO AMBIENTAL REACTIVO AL ENFOQUE =================
function getHaloStyle(idx: number, color: string) {
  const p = prefersReducedMotion.value ? 0.5 : (sectionProgress.value[idx] ?? 0.5)
  const dist = Math.abs(p - 0.50)
  const eased = smoothstep(0, 1, Math.max(0, 1 - dist / 0.30))
  return {
    backgroundColor: color,
    opacity: (eased * 0.55).toFixed(2),
    transform: `scale(${(0.85 + eased * 0.25).toFixed(2)})`,
  }
}

// ================= PARALLAX Y DESVANECIMIENTO DEL FONDO =================
function getVideoParallax(idx: number) {
  if (prefersReducedMotion.value) {
    return { opacity: '0.88' }
  }
  const p = sectionProgress.value[idx] ?? 0.5
  let fade = 1
  if (p < 0.45) {
    const t = Math.max(0, Math.min(1, (p - 0.15) / 0.30))
    fade = easeOutCubic(t)
  } else if (p > 0.55) {
    const t = Math.max(0, Math.min(1, (p - 0.55) / 0.30))
    fade = Math.max(0, 1 - easeInCubic(t))
  }
  return {
    opacity: (fade * 0.90).toFixed(2),
    willChange: 'opacity',
  }
}

function getBgParallax(idx: number, bgImage: string) {
  if (prefersReducedMotion.value) {
    return { backgroundImage: `url('${bgImage}')` }
  }
  const p = sectionProgress.value[idx] ?? 0.5
  let fade = 1
  if (p < 0.45) {
    const t = Math.max(0, Math.min(1, (p - 0.15) / 0.30))
    fade = easeOutCubic(t)
  } else if (p > 0.55) {
    const t = Math.max(0, Math.min(1, (p - 0.55) / 0.30))
    fade = Math.max(0, 1 - easeInCubic(t))
  }
  const panY = Math.max(-20, Math.min(20, (p - 0.5) * 35))
  return {
    backgroundImage: `url('${bgImage}')`,
    opacity: (fade * 0.90).toFixed(2),
    transform: `translate3d(0, ${panY.toFixed(1)}px, 0) scale(1.05)`,
  }
}


// Barra de progreso del capítulo: avanza al bajar y retrocede al subir
function getChapterProgress(idx: number) {
  const p = sectionProgress.value[idx] ?? 0
  return Math.max(0, Math.min(1, (p - 0.1) / 0.8))
}

function scrollToPlatform(slug: string) {
  const el = document.getElementById(`plataforma-${slug}`)
  if (el) {
    el.scrollIntoView({ behavior: prefersReducedMotion.value ? 'auto' : 'smooth', block: 'center' })
  }
}

// Tipografías propias del inicio (nombres exclusivos: no alteran otras vistas ni el panel administrativo)
function ensureHomeFonts() {
  const id = 'home-fonts-sora-manrope'
  if (document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap'
  document.head.appendChild(link)
}

// ================= OPTIMIZACIÓN DE RENDIMIENTO: INTERSECTION OBSERVER DE VIDEOS =================
// Solo se decodifica y reproduce el video visible en pantalla.
// Todos los videos fuera de vista se pausan de inmediato para garantizar 60 FPS sin tirones.
let videoObserver: IntersectionObserver | null = null
const registeredVideos = new Set<HTMLVideoElement>()

function setupVideoObserver() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return

  videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target as HTMLVideoElement
        if (entry.isIntersecting && entry.intersectionRatio >= 0.20) {
          if (video.preload === 'none') {
            video.preload = 'metadata'
          }
          if (video.paused) {
            video.play().catch(() => {})
          }
        } else {
          if (!video.paused) {
            video.pause()
          }
        }
      })
    },
    {
      threshold: [0, 0.20, 0.50],
      rootMargin: '100px 0px 100px 0px',
    }
  )

  registeredVideos.forEach((v) => videoObserver?.observe(v))
}

function registerVideoElement(el: any) {
  if (!el || typeof window === 'undefined') return
  const video = el as HTMLVideoElement
  registeredVideos.add(video)
  if (videoObserver) {
    videoObserver.observe(video)
  }
}

function cleanupVideoObserver() {
  if (videoObserver) {
    videoObserver.disconnect()
    videoObserver = null
  }
  registeredVideos.clear()
}


onMounted(() => {
    setupVideoObserver()
  if (typeof window !== 'undefined') {
    ensureHomeFonts()
    motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    syncMotionPreference()
    motionQuery.addEventListener('change', syncMotionPreference)
    scrollY.value = window.scrollY
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', updateScrollTargets, { passive: true })
    setTimeout(updateScrollTargets, 100)
  }

  // La intro cinematica solo se reproduce al recargar la pagina o si se pulsa el logo (?intro=true)
  const forceIntro = route.query.intro === 'true'
  if (!introHasPlayedSession || forceIntro) {
    introHasPlayedSession = true
    startCinematicIntro()
    if (forceIntro) {
      router.replace({ query: { ...route.query, intro: undefined } })
    }
  }
})

// Escuchar si se pulsa el logo estando ya en Home
watch(
  () => route.query.intro,
  (val) => {
    if (val === 'true') {
      startCinematicIntro()
      router.replace({ query: { ...route.query, intro: undefined } })
    }
  }
)

onUnmounted(() => {
    cleanupVideoObserver()
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', handleScroll)
    window.removeEventListener('resize', updateScrollTargets)
    motionQuery?.removeEventListener('change', syncMotionPreference)
    if (rafId) window.cancelAnimationFrame(rafId)
  }
})

function toggleMute() {
  isMuted.value = !isMuted.value
}

// ================= LOGOS: ÁREA VISUAL EQUILIBRADA =================
// Cada logo recibe aproximadamente la misma superficie según su proporción, dentro de una
// caja fija, para que ninguna marca domine a otra ni invada el texto.

// ================= TIPOGRAFÍAS DE MARCA POR PLATAFORMA =================
function getPlatformFontClass(slug: string) {
  switch (slug) {
    case 'netflix':
      return 'font-brand-netflix'
    case 'disney':
      return 'font-brand-disney'
    case 'max':
      return 'font-brand-max'
    case 'prime':
      return 'font-brand-prime'
    case 'paramount':
      return 'font-brand-paramount'
    case 'crunchyroll':
      return 'font-brand-crunchyroll'
    case 'spotify':
      return 'font-brand-spotify'
    case 'appletv':
      return 'font-brand-apple'
    default:
      return 'font-display'
  }
}

function getLogoSize(sp: ScrollyPlatform, area: number, maxW: number, maxH: number) {
  let h = Math.sqrt(area / sp.logoRatio)
  let w = h * sp.logoRatio
  if (w > maxW) { w = maxW; h = w / sp.logoRatio }
  if (h > maxH) { h = maxH; w = h * sp.logoRatio }
  return { '--logo-w': `${Math.round(w)}px`, '--logo-h': `${Math.round(h)}px` }
}

function getLogoImgClass(sp: ScrollyPlatform) {
  // El logo de Disney trae su propio fondo: se presenta como insignia redondeada
  return sp.slug === 'disney' ? 'rounded-xl ring-1 ring-white/25 shadow-[0_10px_30px_rgba(0,180,200,0.35)]' : ''
}

function getLogoPlateClass(sp: ScrollyPlatform) {
  return sp.logoPlate === 'light'
    ? 'bg-white/90 border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.45)]'
    : 'bg-white/[0.06] border-white/15'
}

// ================= CONTRASTE DE TEXTOS CON EL COLOR DE MARCA =================
function luminance(hex: string) {
  const v = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4]
    .map((i) => parseInt(v.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
// Texto del botón de compra: blanco o casi negro, el que ofrezca mayor contraste
function getButtonTextColor(color: string) {
  const l = luminance(color)
  return 1.05 / (l + 0.05) >= (l + 0.05) / 0.05 ? '#FFFFFF' : '#0B0E1F'
}
// Acento legible sobre fondo oscuro: mezcla el color de marca con blanco
function getAccentText(color: string) {
  return `color-mix(in srgb, ${color} 62%, white)`
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
    a: 'La entrega es automática e inmediata. En cuanto el sistema verifica tu pago, tus credenciales (correo, contraseña y, si corresponde, el PIN de tu perfil) aparecen en "Mi cuenta > Mis servicios".',
    open: true,
  },
  {
    q: '¿Qué diferencia hay entre una cuenta completa y una pantalla individual?',
    a: 'Con la cuenta completa recibes acceso total a la suscripción para usarla en 4 o 5 dispositivos, según la plataforma. Con la pantalla individual obtienes un perfil exclusivo, protegido con PIN privado, dentro de una cuenta compartida.',
    open: false,
  },
  {
    q: '¿Qué pasa si la cuenta presenta fallas o deja de funcionar?',
    a: 'Tienes garantía total de reposición. Si una pantalla presenta problemas de conexión o de credenciales durante los 30 días contratados, te asignamos una nueva cuenta de inmediato y sin costo.',
    open: false,
  },
  {
    q: '¿Cuáles son los métodos de pago disponibles en Colombia?',
    a: 'Aceptamos tarjetas débito (Bancolombia, Nu, BBVA y otras entidades, con detección automática de Visa, Mastercard y American Express) y pagos con Nequi, que confirmas directamente desde tu celular.',
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

interface FamilyVideo {
  id: number
  title: string
  subtitle: string
  quote: string
  client: string
  city: string
  platformTag: string
  duration: string
  videoSrc: string
  poster: string
  badge: string
}

const familyVideos: FamilyVideo[] = [
  {
    id: 1,
    title: 'Noche de Películas en Familia',
    subtitle: 'Estrenos en 4K Ultra HD en la sala de casa',
    quote: 'StreamStore cambió nuestras noches de fin de semana. Todo carga al instante y la calidad 4K es impresionante.',
    client: 'Familia Restrepo',
    city: 'Medellín',
    platformTag: 'Netflix 4K · Cuenta Completa',
    duration: '0:48',
    videoSrc: '/videos/familia%201.mp4',
    poster: '/watching_netflix.jpg',
    badge: 'HISTORIA DESTACADA',
  },
  {
    id: 2,
    title: 'Maratón de Series Juntos',
    subtitle: 'Risas, emoción y cero interrupciones',
    quote: 'Llevamos más de 6 meses con el servicio y nunca se ha caído. El soporte por WhatsApp es inmediato.',
    client: 'Familia Ramírez',
    city: 'Bogotá',
    platformTag: 'Max & Prime Video · Pantalla con PIN',
    duration: '0:28',
    videoSrc: '/videos/familia%202.mp4',
    poster: '/watching_max.jpg',
    badge: 'CLIENTE VERIFICADO',
  },
  {
    id: 3,
    title: 'Tardes de Niños y Animación',
    subtitle: 'Contenido seguro con control parental y perfiles propios',
    quote: 'Mis hijos adoran sus series en Disney+ y yo estoy tranquila porque cada uno tiene su perfil protegido.',
    client: 'Familia Mendoza',
    city: 'Cali',
    platformTag: 'Disney+ Total · Pantalla Individual',
    duration: '0:39',
    videoSrc: '/videos/familia%203.mp4',
    poster: '/watching_disney.jpg',
    badge: 'FAMILIA & NIÑOS',
  },
  {
    id: 4,
    title: 'Cine en Casa sin Límites',
    subtitle: 'La magia de la pantalla grande en tu hogar',
    quote: 'El ahorro frente a pagar cada plataforma por separado es brutal. 100% recomendado.',
    client: 'Familia Osorio',
    city: 'Barranquilla',
    platformTag: 'Combo Familiar Ultra HD',
    duration: '0:52',
    videoSrc: '/videos/familia%204.mp4',
    poster: '/hero_cinema_wall.jpg',
    badge: 'EXPERIENCIA 4K',
  },
  {
    id: 5,
    title: 'Compartiendo lo que más Amamos',
    subtitle: 'Entretenimiento para todas las edades al mejor precio',
    quote: 'Activación en menos de un minuto. Compré con Nequi y al momento ya estábamos viendo nuestras series.',
    client: 'Familia Cárdenas',
    city: 'Bucaramanga',
    platformTag: 'Suscripción Anual · Verificada',
    duration: '0:33',
    videoSrc: '/videos/familia%205.mp4',
    poster: '/hbo_max_mosaic_bg.jpg',
    badge: 'ENTREGA INMEDIATA',
  },
]

const selectedVideoIndex = ref(0)
const selectedVideo = computed(() => familyVideos[selectedVideoIndex.value])
const isMainVideoPlaying = ref(true)
const isMainVideoMuted = ref(true)
const mainVideoRef = ref<HTMLVideoElement | null>(null)
const mainVideoProgress = ref(0)

function selectVideo(index: number) {
  selectedVideoIndex.value = index
  mainVideoProgress.value = 0
  if (mainVideoRef.value) {
    registerVideoElement(mainVideoRef.value)
    mainVideoRef.value.currentTime = 0
    mainVideoRef.value.play().then(() => {
      isMainVideoPlaying.value = true
    }).catch(() => {})
  }
}

function toggleMainVideoPlay() {
  if (!mainVideoRef.value) return
  if (mainVideoRef.value.paused) {
    mainVideoRef.value.play().catch(() => {})
    isMainVideoPlaying.value = true
  } else {
    mainVideoRef.value.pause()
    isMainVideoPlaying.value = false
  }
}

function toggleMainVideoMute() {
  if (!mainVideoRef.value) return
  mainVideoRef.value.muted = !mainVideoRef.value.muted
  isMainVideoMuted.value = mainVideoRef.value.muted
}

function toggleMainVideoFullscreen() {
  if (!mainVideoRef.value) return
  const container = mainVideoRef.value.parentElement
  if (!document.fullscreenElement) {
    if (container && container.requestFullscreen) {
      container.requestFullscreen().catch(() => {})
    } else if (mainVideoRef.value.requestFullscreen) {
      mainVideoRef.value.requestFullscreen().catch(() => {})
    }
  } else {
    document.exitFullscreen().catch(() => {})
  }
}

function onMainVideoTimeUpdate() {
  if (!mainVideoRef.value || !mainVideoRef.value.duration) return
  mainVideoProgress.value = (mainVideoRef.value.currentTime / mainVideoRef.value.duration) * 100
}

function seekMainVideo(event: MouseEvent) {
  if (!mainVideoRef.value || !mainVideoRef.value.duration) return
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const pct = Math.max(0, Math.min(1, clickX / rect.width))
  mainVideoRef.value.currentTime = pct * mainVideoRef.value.duration
}

</script>

<template>
  <div class="home-type bg-black text-white selection:bg-brand-500/30 selection:text-white pb-24 overflow-x-hidden relative">
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
          class="home-type fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden select-none"
        >
          <!-- Controles de la Intro (Saltar y Silencio) -->
          <div class="absolute top-6 right-6 z-50 flex items-center gap-3">
            <button
              type="button"
              class="size-10 rounded-full border border-white/20 bg-black/60 text-white flex items-center justify-center hover:bg-white/10 transition-colors"
              :aria-label="isMuted ? 'Activar sonido' : 'Silenciar sonido'"
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
              <span>Saltar intro</span>
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
              class="absolute h-1 w-[200vw] bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-sm motion-safe:animate-pulse"
              style="box-shadow: 0 0 40px #8057FF, 0 0 80px #06B6D4;"
            />

            <div class="relative size-32 sm:size-44 rounded-3xl p-1 bg-gradient-to-tr from-[#8057FF] via-[#06B6D4] to-[#8057FF] shadow-[0_0_80px_rgba(128,87,255,0.7)] motion-safe:animate-bounce">
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
        class="absolute inset-0 bg-cover bg-center kenburns-bg opacity-85 saturate-[1.15] contrast-[1.05]"
        style="background-image: url('/hbo_max_mosaic_bg.jpg');"
      >
        <!-- Viñeta gradual estilo cine: no tapa completamente el mosaico -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 via-50% to-black pointer-events-none" />

        <!-- Radial sutil para concentrar la atención en el centro -->
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.75)_90%)] pointer-events-none" />

        <!-- Oscurecimiento dinámico suave al hacer scroll -->
        <div
          class="absolute inset-0 bg-black pointer-events-none"
          :style="heroDarkenStyle"
        />
      </div>

      <!-- CONTENIDO CENTRAL DEL HERO -->
      <div
        class="container-app relative z-10 text-center max-w-4xl mx-auto pt-28 sm:pt-36 pb-16 flex flex-col items-center justify-center space-y-6"
        :style="heroContentStyle"
      >
        <div class="flex flex-col items-center justify-center space-y-2 mt-6 sm:mt-10">
          <h1 class="font-display text-[3.25rem] leading-[0.95] sm:text-7xl md:text-8xl lg:text-9xl font-extrabold uppercase tracking-tight select-none drop-shadow-[0_15px_45px_rgba(0,0,0,0.95)]">
            <span class="title-metal">STREAM</span>
            <span class="block sm:inline sm:ml-4 bg-gradient-to-r from-[#9B7BFF] via-[#B26BFF] to-[#22D3EE] bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(6,182,212,0.45)]">STORE</span>
          </h1>
        </div>

        <p class="font-display text-xl sm:text-2xl md:text-3xl text-white font-semibold tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
          Planes desde <strong class="font-extrabold text-cyan-300">$6.500</strong> por 30 días
        </p>

        <p class="text-sm sm:text-base text-slate-100 max-w-xl mx-auto leading-relaxed drop-shadow-md">
          Acceso inmediato a Netflix, Disney+, Max, Prime Video, Paramount+, Crunchyroll, Spotify y Apple TV+, con garantía durante todo tu plan.
        </p>

        <!-- Botones de Acción -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3 w-full sm:w-auto">
          <RouterLink
            to="/login"
            class="inline-flex items-center justify-center rounded-full bg-white hover:bg-slate-200 text-neutral-950 font-extrabold text-base px-10 sm:px-14 py-3.5 sm:py-4 shadow-[0_0_35px_rgba(255,255,255,0.4)] hover:shadow-[0_0_55px_rgba(255,255,255,0.7)] transition-[background-color,box-shadow,transform] duration-200 motion-safe:hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto uppercase tracking-wider focus-visible:outline-offset-4"
          >
            Iniciar sesión
          </RouterLink>

          <a
            href="#plataformas-showcase"
            class="inline-flex items-center justify-center rounded-full border border-white/40 bg-black/60 hover:bg-white/10 text-white font-bold text-base px-8 sm:px-10 py-3.5 sm:py-4 backdrop-blur-md transition-colors duration-200 hover:border-white w-full sm:w-auto cursor-pointer focus-visible:outline-offset-4"
          >
            <span>Ver plataformas y planes</span>
            <ArrowRight class="size-4 ml-2" aria-hidden="true" />
          </a>
        </div>

        <!-- 4 Métricas de Confianza -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 pt-8 w-full max-w-3xl border-t border-white/15 mt-6">
          <div class="rounded-xl border border-white/15 bg-black/70 p-3.5 shadow-lg backdrop-blur-md">
            <p class="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">+15K</p>
            <p class="text-xs text-slate-200 mt-0.5 font-medium">Clientes satisfechos</p>
          </div>
          <div class="rounded-xl border border-white/15 bg-black/70 p-3.5 shadow-lg backdrop-blur-md">
            <p class="font-display text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight">100%</p>
            <p class="text-xs text-slate-200 mt-0.5 font-medium">Garantía activa</p>
          </div>
          <div class="rounded-xl border border-white/15 bg-black/70 p-3.5 shadow-lg backdrop-blur-md">
            <p class="font-display text-2xl sm:text-3xl font-extrabold text-cyan-300 tracking-tight">24/7</p>
            <p class="text-xs text-slate-200 mt-0.5 font-medium">Soporte inmediato</p>
          </div>
          <div class="rounded-xl border border-white/15 bg-black/70 p-3.5 shadow-lg backdrop-blur-md">
            <p class="font-display text-2xl sm:text-3xl font-extrabold text-purple-300 tracking-tight">&lt; 10 s</p>
            <p class="text-xs text-slate-200 mt-0.5 font-medium">Entrega automática</p>
          </div>
        </div>
      </div>
    </section>


    <!-- ================= 2. CABECERA: ELIGE EL MEJOR PLAN PARA TI ================= -->
    <section id="planes-intro" class="relative bg-black pt-16 pb-12 text-center overflow-hidden">
      <!-- Resplandor ambiental superior -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-3xl h-32 bg-gradient-to-b from-[#8057FF]/20 via-[#06B6D4]/15 to-transparent blur-3xl pointer-events-none" />

      <div class="container-app relative z-10 max-w-3xl mx-auto space-y-5" :style="planesIntroStyle">
        <h2 class="font-display text-4xl sm:text-6xl font-extrabold uppercase tracking-tight leading-[1.05] drop-shadow-2xl">
          <span class="title-metal">Elige el mejor</span><br />
          <span class="bg-gradient-to-r from-[#9B7BFF] via-[#B26BFF] to-[#22D3EE] bg-clip-text text-transparent">
            plan para ti
          </span>
        </h2>

        <p class="text-sm sm:text-base text-slate-200 max-w-xl mx-auto leading-relaxed drop-shadow">
          Desplázate para recorrer cada plataforma. Activación automática en segundos y garantía total de 30 días.
        </p>

        <!-- Selector de Modalidad (Cuentas Completas vs Pantallas Individuales) -->
        <div class="pt-2 flex justify-center">
          <div
            class="flex p-1.5 rounded-full border border-white/20 bg-black/80 backdrop-blur-xl w-full max-w-sm shadow-2xl"
            role="group"
            aria-label="Modalidad de compra"
          >
            <button
              type="button"
              class="flex-1 py-3 px-4 rounded-full text-xs sm:text-sm font-extrabold transition-colors duration-300 cursor-pointer text-center"
              :class="
                modalidadSeleccionada === 'CUENTA_COMPLETA'
                  ? 'bg-white text-neutral-950 shadow-lg'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              "
              :aria-pressed="modalidadSeleccionada === 'CUENTA_COMPLETA'"
              @click="modalidadSeleccionada = 'CUENTA_COMPLETA'"
            >
              Cuentas completas
            </button>
            <button
              type="button"
              class="flex-1 py-3 px-4 rounded-full text-xs sm:text-sm font-extrabold transition-colors duration-300 cursor-pointer text-center"
              :class="
                modalidadSeleccionada === 'PANTALLA'
                  ? 'bg-cyan-400 text-neutral-950 shadow-lg'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              "
              :aria-pressed="modalidadSeleccionada === 'PANTALLA'"
              @click="modalidadSeleccionada = 'PANTALLA'"
            >
              Pantallas con PIN
            </button>
          </div>
        </div>

        <!-- Índice de plataformas para móvil y tableta (el dock lateral solo aparece en pantallas anchas) -->
        <nav class="xl:hidden pt-4" aria-label="Ir a una plataforma">
          <ul class="flex flex-wrap justify-center gap-2.5">
            <li v-for="sp in scrollyPlatforms" :key="'chip-' + sp.slug">
              <button
                type="button"
                class="h-12 w-[4.75rem] rounded-xl border flex items-center justify-center px-2 transition-colors duration-200 cursor-pointer hover:border-white/50"
                :class="sp.logoPlate === 'light' ? 'bg-white/90 border-white/60' : 'bg-white/[0.06] border-white/15'"
                :aria-label="`Ir a ${sp.nombre}`"
                @click="scrollToPlatform(sp.slug)"
              >
                <img
                  v-if="sp.logo"
                  :src="sp.logo"
                  alt=""
                  class="max-h-8 max-w-full object-contain"
                  :class="sp.slug === 'disney' ? 'rounded-md' : ''"
                />
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </section>

    <!-- ================= 3. CAPÍTULOS SCROLLYTELLING POR PLATAFORMA ================= -->
    <div id="plataformas-showcase" class="bg-black relative scroll-mt-20">

      <!-- ================= DOCK FLOTANTE LATERAL (solo pantallas anchas, fuera del contenido) ================= -->
      <nav
        class="hidden xl:flex fixed right-4 top-1/2 -translate-y-1/2 z-40 flex-col gap-2 p-2 rounded-2xl border border-white/20 bg-black/85 backdrop-blur-2xl shadow-[0_0_35px_rgba(0,0,0,0.9)]"
        aria-label="Plataformas"
      >
        <button
          v-for="(sp, idx) in scrollyPlatforms"
          :key="'dock-' + sp.slug"
          type="button"
          class="size-12 rounded-xl flex items-center justify-center p-1.5 transition-[background-color,border-color,box-shadow] duration-300 cursor-pointer relative group border"
          :class="[
            activeIndex === idx ? 'border-white/60' : 'border-transparent hover:border-white/30',
            sp.logoPlate === 'light' ? 'bg-white/90' : activeIndex === idx ? 'bg-white/20' : 'bg-white/[0.04] hover:bg-white/10',
          ]"
          :style="activeIndex === idx ? { boxShadow: `0 0 18px ${sp.color}` } : {}"
          :aria-label="`Ir a ${sp.nombre}`"
          :aria-current="activeIndex === idx ? 'true' : undefined"
          @click="scrollToPlatform(sp.slug)"
        >
          <img
            v-if="sp.logo"
            :src="sp.logo"
            alt=""
            class="max-h-8 max-w-full object-contain"
            :class="sp.slug === 'disney' ? 'rounded-md' : ''"
          />

          <!-- Tooltip a la izquierda: visible con ratón y con teclado -->
          <span class="absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-black/95 border border-white/20 text-xs font-bold text-white whitespace-nowrap opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity pointer-events-none shadow-2xl flex items-center gap-1.5">
            <span class="size-2 rounded-full" :style="{ backgroundColor: sp.color }" />
            {{ sp.nombre }}
          </span>
        </button>
      </nav>

      <!-- SECCIONES DE PLATAFORMAS (SCROLLYTELLING) -->
      <template v-for="(sp, idx) in scrollyPlatforms" :key="sp.id">
        <section
          :id="'plataforma-' + sp.slug"
        class="relative min-h-[95vh] flex items-center justify-center overflow-hidden py-16 sm:py-24 bg-black scroll-mt-20"
        :aria-labelledby="'titulo-' + sp.slug"
      >
        <!-- VIDEO O FOTO DE REFERENCIA CINEMÁTICA DE FONDO -->
        <video
          v-if="sp.bgVideo"
          :ref="registerVideoElement"
          :src="sp.bgVideo"
          :poster="sp.bgImage"
          loop
          muted
          playsinline
          preload="none"
          class="absolute inset-0 w-full h-full object-cover opacity-85 sm:opacity-90 saturate-[1.12] contrast-[1.06] brightness-[0.92] pointer-events-none will-change-opacity transition-opacity duration-700"
          :style="getVideoParallax(idx)"
        />
        <div
          v-else
          class="absolute inset-0 bg-cover bg-center opacity-85 sm:opacity-90 saturate-[1.12] contrast-[1.06] brightness-[0.92] pointer-events-none"
          :style="getBgParallax(idx, sp.bgImage)"
        />

        <!-- VIÑETAS CINEMÁTICAS (PROTEGEN EL TEXTO SIN APAGAR LA IMAGEN) -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/85 via-black/35 via-50% to-black/85 pointer-events-none" />
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.6)_95%)] pointer-events-none" />

        <!-- Halo neón ambiental con el color de la plataforma -->
        <div
          class="absolute top-1/2 -translate-y-1/2 size-[520px] sm:size-[680px] rounded-full blur-[140px] pointer-events-none"
          :class="idx % 2 === 0 ? 'right-10' : 'left-10'"
          :style="getHaloStyle(idx, sp.color)"
        />

        <!-- Riel de progreso del capítulo: crece al bajar y se recoge al subir -->
        <div class="absolute left-0 top-0 bottom-0 w-[3px] bg-white/10 pointer-events-none" aria-hidden="true">
          <div
            class="absolute inset-x-0 top-0 h-full origin-top"
            :style="{ backgroundColor: sp.color, transform: `scaleY(${getChapterProgress(idx).toFixed(3)})`, boxShadow: `0 0 12px ${sp.color}` }"
          />
        </div>

        <!-- CONTENIDO EN 2 COLUMNAS ALTERNADAS -->
        <div class="container-app relative z-10 w-full xl:pr-24">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

            <!-- INFORMACIÓN Y PROPUESTA DE VALOR -->
            <div
              class="lg:col-span-6 space-y-6 text-left"
              :class="idx % 2 === 0 ? 'lg:order-1' : 'lg:order-2'"
              :style="getInfoStyle(idx)"
            >
              <!-- Logo en caja de tamaño controlado: nunca invade el título -->
              <div
                v-if="sp.logo"
                class="inline-flex items-center justify-center rounded-2xl border backdrop-blur-md"
                :class="sp.slug === 'disney' ? 'border-transparent' : ['px-5 py-4', getLogoPlateClass(sp)]"
              >
                <img
                  :src="sp.logo"
                  :alt="`Logo de ${sp.nombre}`"
                  class="logo-fit logo-hero"
                  :class="getLogoImgClass(sp)"
                  :style="[getLogoSize(sp, 13000, 250, 96), sp.logoPlate === 'light' ? {} : { filter: sp.logoFilter }]"
                  loading="lazy"
                />
              </div>

              <!-- Título e impacto -->
              <div class="space-y-3">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="font-mono text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em]" :style="{ color: getAccentText(sp.color) }">
                    {{ sp.tag }}
                  </p>
                  <span
                    v-if="sp.familyHappinessTag"
                    class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-emerald-400/30 bg-emerald-950/60 text-[10px] font-mono text-emerald-300 font-semibold backdrop-blur-md"
                  >
                    <span class="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {{ sp.familyHappinessTag }}
                  </span>
                </div>
                <h3
                  :id="'titulo-' + sp.slug"
                  class="font-display text-[2rem] sm:text-5xl lg:text-[3.5rem] font-extrabold uppercase tracking-tight leading-[1.02] drop-shadow-[0_10px_30px_rgba(0,0,0,0.95)] text-balance"
                >
                  <span class="title-metal">{{ sp.nombre }}</span>
                </h3>
                <p class="font-display text-lg sm:text-2xl font-semibold leading-snug drop-shadow" :style="{ color: getAccentText(sp.color) }">
                  {{ sp.headline }}
                </p>
              </div>

              <!-- Descripción -->
              <p class="text-sm sm:text-base text-slate-100 leading-relaxed max-w-xl drop-shadow-md">
                {{ sp.desc }}
              </p>

              <!-- Beneficios -->
              <ul class="space-y-3 pt-1">
                <li
                  v-for="(feat, fIdx) in sp.features"
                  :key="fIdx"
                  class="flex items-start gap-3 text-sm text-slate-100 drop-shadow"
                >
                  <span class="mt-0.5 size-5 rounded-full flex items-center justify-center shrink-0 border border-white/20" :style="{ backgroundColor: `${sp.color}40` }">
                    <CheckCircle2 class="size-3.5" :style="{ color: getAccentText(sp.color) }" aria-hidden="true" />
                  </span>
                  <span class="font-medium">{{ feat }}</span>
                </li>
              </ul>
            </div>

            <!-- TARJETA DE PRECIO Y COMPRA DIRECTA -->
            <div
              class="lg:col-span-6 flex justify-center"
              :class="idx % 2 === 0 ? 'lg:order-2 lg:justify-end' : 'lg:order-1 lg:justify-start'"
            >
              <article
                class="w-full max-w-lg rounded-[2rem] border border-white/15 bg-gradient-to-b from-[#13172E]/95 via-[#0B0E1F]/98 to-black backdrop-blur-2xl p-6 sm:p-9 shadow-[0_25px_65px_-15px_rgba(0,0,0,0.9)] relative overflow-hidden transition-all duration-300 hover:border-white/30"
                :style="getCardStyle(idx, sp.color)"
                :aria-label="`Plan de ${sp.nombre}`"
              >
                <!-- Resplandor ambiental interno suave en la esquina -->
                <div
                  class="absolute -top-20 -right-20 size-48 rounded-full blur-3xl opacity-25 pointer-events-none"
                  :style="{ backgroundColor: sp.color }"
                />

                <!-- Línea de acento neón superior -->
                <div
                  class="absolute top-0 left-0 right-0 h-1"
                  :style="{ backgroundColor: sp.color, boxShadow: `0 0 25px ${sp.color}` }"
                />

                <!-- Cabecera del plan -->
                <div class="mb-5 relative z-10">
                  <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md mb-2.5">
                    <span class="size-1.5 rounded-full" :style="{ backgroundColor: sp.color, boxShadow: `0 0 8px ${sp.color}` }" />
                    <span class="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] font-bold text-slate-300">
                      {{ modalidadSeleccionada === 'CUENTA_COMPLETA' ? 'Cuenta Completa' : 'Pantalla con PIN' }}
                    </span>
                  </div>
                  <h4
                    class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug drop-shadow"
                    :class="getPlatformFontClass(sp.slug)"
                  >
                    {{ sp.nombre }}
                  </h4>
                </div>

                <!-- Bloque de Precio Glassmorphism -->
                <div class="p-5 sm:p-6 rounded-2xl border border-white/10 bg-white/[0.03] mb-6 backdrop-blur-md shadow-inner relative overflow-hidden">
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                      Suscripción de 30 días
                    </span>
                    <span class="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md border border-white/10 bg-white/[0.05] text-slate-300 font-medium">
                      Garantía 100%
                    </span>
                  </div>

                  <div class="flex flex-wrap items-baseline gap-x-2 pt-1">
                    <span class="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow">
                      {{ formatCOP(modalidadSeleccionada === 'CUENTA_COMPLETA' ? sp.precioCompleta : sp.precioPantalla) }}
                    </span>
                    <span class="text-sm text-slate-400 font-medium">/ 30 días</span>
                  </div>

                  <div class="flex items-center gap-2 mt-3 pt-3 border-t border-white/10 text-xs text-slate-200 font-medium">
                    <CheckCircle2 class="size-4 shrink-0" :style="{ color: getAccentText(sp.color) }" aria-hidden="true" />
                    <span>
                      {{ modalidadSeleccionada === 'CUENTA_COMPLETA' ? 'Acceso completo a todos los perfiles de la cuenta' : 'Pantalla individual exclusiva con PIN privado' }}
                    </span>
                  </div>
                </div>

                <!-- Botón de compra moderno -->
                <button
                  type="button"
                  class="group/buy w-full inline-flex items-center justify-center rounded-2xl text-base font-extrabold py-4 px-8 transition-all duration-300 hover:brightness-110 motion-safe:hover:-translate-y-0.5 active:translate-y-0 cursor-pointer gap-2 uppercase tracking-wider relative overflow-hidden focus-visible:outline-offset-4 shadow-lg hover:shadow-2xl"
                  :style="{ backgroundColor: sp.color, color: getButtonTextColor(sp.color), boxShadow: `0 8px 30px -6px ${sp.color}80` }"
                  :aria-label="`Comprar ${sp.nombre}`"
                  @click="comprarPlataforma(sp)"
                >
                  <span class="relative z-10 font-black">Comprar ahora</span>
                  <ArrowRight class="size-4 relative z-10 transition-transform duration-200 motion-safe:group-hover/buy:translate-x-1" aria-hidden="true" />
                </button>
              </article>
            </div>

          </div>
        </div>
      </section>
      </template>
    </div>

    <!-- ================= 4. HISTORIAS REALES · FAMILIAS FELICES ================= -->
    <section class="relative bg-black py-20 overflow-hidden border-t border-white/10" aria-label="Historias de familias felices">
      <!-- Resplandor ambiental de fondo -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-purple-600/15 via-cyan-500/15 to-transparent blur-[130px] pointer-events-none" />

      <div class="container-app relative z-10 max-w-6xl mx-auto space-y-12">
        <!-- Encabezado de la Sección -->
        <div class="text-center max-w-3xl mx-auto space-y-4">
          <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-950/40 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <Sparkles class="size-3.5 text-cyan-300" aria-hidden="true" />
            <span class="text-xs font-mono font-bold tracking-[0.2em] text-cyan-300 uppercase">
              Historias Reales · Familias StreamStore
            </span>
          </div>

          <h2 class="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight leading-[1.05]">
            <span class="title-metal">Familias felices,</span><br />
            <span class="bg-gradient-to-r from-[#9B7BFF] via-[#B26BFF] to-[#22D3EE] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(6,182,212,0.4)]">
              momentos inolvidables
            </span>
          </h2>

          <p class="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Mira cómo hogares reales disfrutan de sus películas, series y deportes favoritos en 4K Ultra HD, con entrega inmediata y garantía total.
          </p>
        </div>

        <!-- REPRODUCTOR CINEMÁTICO PRINCIPAL (TEATRO STREAMSTORE) -->
        <div class="relative rounded-3xl border border-white/20 bg-neutral-950/90 backdrop-blur-2xl overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.95)] group">
          <!-- Aspect ratio video container -->
          <div class="relative aspect-video w-full max-h-[640px] bg-black overflow-hidden flex items-center justify-center">
            <video
              ref="mainVideoRef"
              :key="selectedVideo.id"
              :src="selectedVideo.videoSrc"
              :poster="selectedVideo.poster"
              class="w-full h-full object-cover transition-opacity duration-500 will-change-opacity"
              loop
              :muted="isMainVideoMuted"
              playsinline
              preload="none"
              @play="isMainVideoPlaying = true"
              @pause="isMainVideoPlaying = false"
              @timeupdate="onMainVideoTimeUpdate"
            />

            <!-- Viñeta degradada superior e inferior -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 via-60% to-black/60 pointer-events-none" />

            <!-- Insignias Superiores -->
            <div class="absolute top-4 sm:top-6 inset-x-4 sm:inset-x-6 flex items-center justify-between z-20 pointer-events-none">
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 border border-white/20 text-[11px] font-mono font-bold text-white backdrop-blur-md shadow-lg">
                  <span class="size-2 rounded-full bg-red-500 animate-pulse" />
                  4K ULTRA HD
                </span>
                <span class="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-mono text-cyan-300 font-semibold backdrop-blur-md">
                  {{ selectedVideo.badge }}
                </span>
              </div>

              <div class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/70 border border-amber-400/30 text-amber-300 text-xs font-semibold backdrop-blur-md shadow-lg">
                <div class="flex items-center">
                  <Star v-for="s in 5" :key="s" class="size-3 fill-amber-400 text-amber-400" />
                </div>
                <span class="font-bold ml-1">5.0</span>
                <span class="hidden sm:inline text-slate-300 text-[11px]">· Verificado</span>
              </div>
            </div>

            <!-- Botón Central de Play/Pause (hover o pausa) -->
            <button
              type="button"
              class="absolute z-20 size-16 sm:size-20 rounded-full bg-black/60 border border-white/30 text-white flex items-center justify-center backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:bg-white hover:text-black cursor-pointer shadow-2xl"
              :class="isMainVideoPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100 scale-105'"
              :aria-label="isMainVideoPlaying ? 'Pausar video' : 'Reproducir video'"
              @click="toggleMainVideoPlay"
            >
              <Pause v-if="isMainVideoPlaying" class="size-7 sm:size-8" />
              <Play v-else class="size-7 sm:size-8 ml-1" />
            </button>

            <!-- Testimonio y datos de la familia (Esquina Inferior Izquierda) -->
            <div class="absolute bottom-14 sm:bottom-16 left-4 sm:left-8 right-4 sm:right-28 z-20 text-left pointer-events-none space-y-2">
              <p class="font-display text-base sm:text-2xl font-bold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] max-w-2xl leading-snug">
                “{{ selectedVideo.quote }}”
              </p>
              <div class="flex flex-wrap items-center gap-2 pt-1 text-xs sm:text-sm text-slate-200">
                <span class="font-extrabold text-white">{{ selectedVideo.client }}</span>
                <span class="text-slate-400">·</span>
                <span class="text-cyan-300 font-medium">{{ selectedVideo.city }}</span>
                <span class="text-slate-400">·</span>
                <span class="px-2 py-0.5 rounded-md bg-white/10 border border-white/15 text-[11px] font-mono text-purple-200">
                  {{ selectedVideo.platformTag }}
                </span>
              </div>
            </div>

            <!-- Barra de Controles Inferior -->
            <div class="absolute bottom-0 inset-x-0 z-30 p-3 sm:p-4 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col gap-2">
              <!-- Barra de Progreso con Scrubber Clickeable -->
              <div
                class="w-full h-1.5 sm:h-2 rounded-full bg-white/20 hover:h-2.5 transition-all cursor-pointer relative overflow-hidden"
                @click="seekMainVideo"
              >
                <div
                  class="h-full bg-gradient-to-r from-purple-500 via-cyan-400 to-cyan-300 rounded-full transition-all duration-100"
                  :style="{ width: `${mainVideoProgress}%` }"
                />
              </div>

              <!-- Fila de Controles -->
              <div class="flex items-center justify-between text-white pt-1">
                <div class="flex items-center gap-3">
                  <button
                    type="button"
                    class="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer text-slate-200 hover:text-white"
                    :aria-label="isMainVideoPlaying ? 'Pausar' : 'Reproducir'"
                    @click="toggleMainVideoPlay"
                  >
                    <Pause v-if="isMainVideoPlaying" class="size-4 sm:size-5" />
                    <Play v-else class="size-4 sm:size-5" />
                  </button>

                  <button
                    type="button"
                    class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer text-xs font-semibold text-slate-200 hover:text-white"
                    :aria-label="isMainVideoMuted ? 'Activar sonido' : 'Silenciar'"
                    @click="toggleMainVideoMute"
                  >
                    <VolumeX v-if="isMainVideoMuted" class="size-4 text-red-400" />
                    <Volume2 v-else class="size-4 text-cyan-400 animate-pulse" />
                    <span class="text-[11px] font-mono">{{ isMainVideoMuted ? 'Sin sonido' : 'Sonido activo' }}</span>
                  </button>

                  <span class="text-xs font-mono text-slate-400 hidden sm:inline">
                    {{ selectedVideo.title }}
                  </span>
                </div>

                <div class="flex items-center gap-2">
                  <span class="text-xs font-mono text-slate-300">
                    {{ selectedVideo.duration }}
                  </span>

                  <button
                    type="button"
                    class="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer text-slate-200 hover:text-white"
                    aria-label="Pantalla completa"
                    @click="toggleMainVideoFullscreen"
                  >
                    <Maximize2 class="size-4 sm:size-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- LISTA / SELECTOR INTERACTIVO DE HISTORIAS DE FAMILIAS (5 VIDEOS) -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="font-display text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Users class="size-5 text-cyan-400" aria-hidden="true" />
              <span>Selecciona una historia familiar</span>
            </h3>
            <span class="text-xs font-mono text-slate-400">
              5 testimonios en video · 4K Ultra HD
            </span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <button
              v-for="(vid, vIdx) in familyVideos"
              :key="vid.id"
              type="button"
              class="relative rounded-2xl overflow-hidden border text-left transition-all duration-300 cursor-pointer p-2.5 group flex flex-col justify-between"
              :class="[
                selectedVideoIndex === vIdx
                  ? 'border-cyan-400 bg-neutral-900/90 shadow-[0_0_25px_rgba(34,211,238,0.35)] ring-2 ring-cyan-400/50 scale-[1.02]'
                  : 'border-white/10 bg-neutral-950/60 hover:border-white/30 hover:bg-neutral-900/60'
              ]"
              :aria-pressed="selectedVideoIndex === vIdx"
              @click="selectVideo(vIdx)"
            >
              <!-- Miniatura Optimizada con Poster y Play Hover -->
              <div class="relative aspect-video w-full rounded-xl overflow-hidden bg-neutral-900 mb-2.5">
                <img
                  :src="vid.poster"
                  :alt="vid.title"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-80 group-hover:opacity-100"
                  loading="lazy"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                <!-- Ícono Play en Hover -->
                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div class="size-8 rounded-full bg-cyan-400/90 text-black flex items-center justify-center shadow-lg">
                    <Play class="size-4 ml-0.5 fill-black" />
                  </div>
                </div>

                <!-- Duración -->
                <span class="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono font-bold text-white">
                  {{ vid.duration }}
                </span>

                <!-- Indicador 'En reproducción' -->
                <div
                  v-if="selectedVideoIndex === vIdx"
                  class="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full bg-cyan-400 text-black text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg"
                >
                  <span class="size-1.5 rounded-full bg-black animate-ping" />
                  Viendo
                </div>
              </div>

              <!-- Metadatos de la tarjeta -->
              <div class="space-y-1">
                <p class="text-xs font-bold text-white line-clamp-1 group-hover:text-cyan-300 transition-colors">
                  {{ vid.title }}
                </p>
                <p class="text-[11px] text-slate-400 line-clamp-1">
                  {{ vid.client }} · {{ vid.city }}
                </p>
                <div class="flex items-center gap-1 pt-1 text-[10px] text-amber-300">
                  <Star class="size-2.5 fill-amber-400 text-amber-400" />
                  <span class="font-bold">5.0</span>
                  <span class="text-slate-400">· {{ vid.badge }}</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Banner de Confianza y CTA para Familias -->
        <div class="rounded-2xl border border-white/10 bg-gradient-to-r from-purple-950/40 via-neutral-900/60 to-cyan-950/40 p-5 sm:p-7 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="space-y-1 text-center sm:text-left">
            <h4 class="font-display font-extrabold text-base sm:text-lg text-white">
              ¿Listo para que tu familia disfrute del mejor streaming?
            </h4>
            <p class="text-xs sm:text-sm text-slate-300">
              Más de 15.000 clientes satisfechos. Planes desde $6.500 COP con garantía y soporte total.
            </p>
          </div>

          <a
            href="#plataformas-showcase"
            class="inline-flex items-center justify-center gap-2 rounded-full bg-white hover:bg-slate-200 text-neutral-950 font-extrabold text-xs sm:text-sm px-6 sm:px-8 py-3 uppercase tracking-wider shadow-[0_0_25px_rgba(255,255,255,0.35)] hover:shadow-[0_0_40px_rgba(255,255,255,0.6)] transition-all shrink-0 cursor-pointer"
          >
            <span>Ver planes para mi familia</span>
            <ArrowRight class="size-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>

    <!-- ================= 5. GARANTÍAS Y BENEFICIOS ================= -->
    <section class="container-app pt-16">
      <div class="rounded-3xl border border-white/15 bg-white/5 p-6 sm:p-12 relative overflow-hidden backdrop-blur-md">
        <div class="absolute -right-20 -bottom-20 size-64 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />

        <div class="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <span class="text-xs font-mono uppercase tracking-[0.25em] text-brand-300 font-bold">Por qué elegirnos</span>
          <h2 class="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
            <span class="title-metal">Compra sin complicaciones</span>
          </h2>
          <p class="text-sm text-slate-300">
            Pensado para ofrecerte rapidez, seguridad y tranquilidad en cada compra.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="space-y-2.5">
            <div class="size-10 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center border border-brand-500/30">
              <Zap class="size-5" aria-hidden="true" />
            </div>
            <h3 class="font-display font-bold text-fg text-base">Entrega inmediata</h3>
            <p class="text-sm text-slate-300 leading-relaxed">
              Recibe tus datos de acceso en segundos, de forma automática, tras verificar tu pago.
            </p>
          </div>

          <div class="space-y-2.5">
            <div class="size-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck class="size-5" aria-hidden="true" />
            </div>
            <h3 class="font-display font-bold text-fg text-base">Garantía total</h3>
            <p class="text-sm text-slate-300 leading-relaxed">
              Reemplazo inmediato durante todo el periodo de tu suscripción.
            </p>
          </div>

          <div class="space-y-2.5">
            <div class="size-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-500/30">
              <Headphones class="size-5" aria-hidden="true" />
            </div>
            <h3 class="font-display font-bold text-fg text-base">Soporte 24/7</h3>
            <p class="text-sm text-slate-300 leading-relaxed">
              Equipo técnico disponible por WhatsApp y tickets para resolver cualquier duda.
            </p>
          </div>

          <div class="space-y-2.5">
            <div class="size-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/30">
              <CheckCircle2 class="size-5" aria-hidden="true" />
            </div>
            <h3 class="font-display font-bold text-fg text-base">Pagos en pesos colombianos</h3>
            <p class="text-sm text-slate-300 leading-relaxed">
              Paga en COP con métodos de pago locales y seguros.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= 6. PREGUNTAS FRECUENTES ================= -->
    <section class="container-app max-w-3xl space-y-6 pt-16">
      <div class="text-center space-y-2">
        <span class="text-xs font-mono uppercase tracking-[0.25em] text-cyan-400 font-bold">Dudas habituales</span>
        <h2 class="font-display text-3xl sm:text-4xl font-extrabold tracking-tight">
          <span class="title-metal">Preguntas frecuentes</span>
        </h2>
      </div>

      <div class="space-y-3">
        <div
          v-for="(faq, i) in faqs"
          :key="i"
          class="rounded-xl border border-white/10 bg-white/5 overflow-hidden transition-colors duration-200 hover:border-white/20"
        >
          <button
            :id="'faq-btn-' + i"
            type="button"
            class="w-full p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-fg flex items-center justify-between gap-4 hover:text-cyan-300 transition-colors cursor-pointer"
            :aria-expanded="faq.open"
            :aria-controls="'faq-panel-' + i"
            @click="toggleFaq(i)"
          >
            <span>{{ faq.q }}</span>
            <ChevronDown
              class="size-4 shrink-0 transition-transform duration-300"
              :class="{ 'rotate-180 text-cyan-300': faq.open }"
              aria-hidden="true"
            />
          </button>

          <div
            v-show="faq.open"
            :id="'faq-panel-' + i"
            role="region"
            :aria-labelledby="'faq-btn-' + i"
            class="px-4 pb-4 sm:px-5 sm:pb-5 text-sm text-slate-300 leading-relaxed border-t border-white/10 pt-3"
          >
            {{ faq.a }}
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>

/* Tipografías auténticas por plataforma de streaming */
.font-brand-netflix {
  font-family: 'Bebas Neue', sans-serif !important;
  letter-spacing: 0.05em;
  font-weight: 400;
}
.font-brand-disney {
  font-family: 'Plus Jakarta Sans', sans-serif !important;
  letter-spacing: -0.03em;
  font-weight: 800;
}
.font-brand-max {
  font-family: 'Syne', sans-serif !important;
  letter-spacing: -0.02em;
  font-weight: 800;
}
.font-brand-prime {
  font-family: 'Space Grotesk', sans-serif !important;
  letter-spacing: -0.03em;
  font-weight: 700;
}
.font-brand-paramount {
  font-family: 'DM Serif Display', Georgia, serif !important;
  letter-spacing: 0.02em;
  font-weight: 400;
  font-style: italic;
}
.font-brand-crunchyroll {
  font-family: 'Kanit', sans-serif !important;
  letter-spacing: 0.03em;
  font-weight: 800;
  font-style: italic;
  text-transform: uppercase;
}
.font-brand-spotify {
  font-family: 'Plus Jakarta Sans', sans-serif !important;
  letter-spacing: -0.02em;
  font-weight: 800;
}
.font-brand-apple {
  font-family: 'Inter', -apple-system, sans-serif !important;
  letter-spacing: -0.02em;
  font-weight: 600;
}

/* Tipografía propia del inicio: más carácter que la fuente del sistema */
.home-type {
  font-family: 'Manrope', var(--font-sans);
}
.home-type .font-display {
  font-family: 'Sora', var(--font-display);
  letter-spacing: -0.02em;
}

/* Títulos con volumen: degradado metálico sutil + sombra (no es transparencia: el texto es opaco) */
.title-metal {
  background-image: linear-gradient(180deg, #ffffff 0%, #ffffff 45%, #c9d2e3 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  filter: drop-shadow(0 2px 0 rgba(0, 0, 0, 0.45)) drop-shadow(0 10px 24px rgba(0, 0, 0, 0.55));
}

/* Logos con tamaño equilibrado: se escalan dentro de su caja sin deformarse */
.logo-fit {
  display: block;
  max-width: 100%;
  object-fit: contain;
}
.logo-hero {
  width: calc(var(--logo-w) * 0.78);
  height: calc(var(--logo-h) * 0.78);
}
.logo-card {
  width: calc(var(--logo-w) * 0.74);
  height: calc(var(--logo-h) * 0.74);
}
@media (min-width: 640px) {
  .logo-hero {
    width: var(--logo-w);
    height: var(--logo-h);
  }
  .logo-card {
    width: var(--logo-w);
    height: var(--logo-h);
  }
}

@keyframes kenburns {
  0% {
    transform: scale(1.02) translate(0, 0);
  }
  50% {
    transform: scale(1.06) translate(-1%, -1%);
  }
  100% {
    transform: scale(1.02) translate(0, 0);
  }
}

.kenburns-bg {
  animation: kenburns 30s ease-in-out infinite alternate;
}

@media (prefers-reduced-motion: reduce) {
  .kenburns-bg {
    animation: none;
  }
}
</style>
