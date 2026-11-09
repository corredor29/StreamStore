<script setup lang="ts">
import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  ShieldCheck, 
  Sparkles, 
  UserCheck 
} from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { loginSchema } from '@/utils/validators'
import AppAlert from '@/components/common/AppAlert.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive({
  email: '',
  password: '',
})

const errors = reactive<Record<string, string>>({
  email: '',
  password: '',
})

const showPassword = ref(false)
const rememberMe = ref(true)
const isSubmitting = ref(false)
const serverError = ref<string | null>(null)
const showDemoQuickAccess = ref(false)
const demoNotification = ref<string | null>(null)

// ================= EFECTO SPOTLIGHT Y TILT 3D INTERACTIVO =================
const cardRef = ref<HTMLElement | null>(null)
const cardTransform = ref('')
const spotlightPos = ref({ x: 225, y: 200, opacity: 0 })

function handleMouseMove(e: MouseEvent) {
  if (!cardRef.value) return
  const rect = cardRef.value.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top

  spotlightPos.value = {
    x: mouseX,
    y: mouseY,
    opacity: 1,
  }

  // Tilt 3D suave (máximo 4 grados para no exagerar)
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  const rotateX = ((mouseY - centerY) / centerY) * -4.5
  const rotateY = ((mouseX - centerX) / centerX) * 4.5

  cardTransform.value = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(0)`
}

function handleMouseLeave() {
  spotlightPos.value.opacity = 0
  cardTransform.value = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)'
}

// ================= CANVAS DE PARTÍCULAS CINEMATOGRÁFICAS (LUZ DE CINE) =================
const canvasRef = ref<HTMLCanvasElement | null>(null)
let animationFrameId: number | null = null

interface Particle {
  x: number
  y: number
  radius: number
  vx: number
  vy: number
  alpha: number
  targetAlpha: number
  color: string
}

function initCinemaParticles() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  let width = (canvas.width = window.innerWidth)
  let height = (canvas.height = window.innerHeight)

  function onResize() {
    if (!canvas) return
    width = canvas.width = window.innerWidth
    height = canvas.height = window.innerHeight
  }
  window.addEventListener('resize', onResize)

  const colors = [
    'rgba(128, 87, 255, ',  // Violeta oficial
    'rgba(6, 182, 212, ',   // Cian oficial
    'rgba(255, 255, 255, ', // Luz blanca cálida de proyector
    'rgba(155, 81, 224, ',  // Púrpura medio
  ]

  const particleCount = Math.min(45, Math.floor((width * height) / 35000))
  const particles: Particle[] = []

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 0.8,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 0.5 - 0.2, // Flotan suave hacia arriba como polvo en luz
      alpha: Math.random() * 0.4 + 0.1,
      targetAlpha: Math.random() * 0.5 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
    })
  }

  function render() {
    if (!ctx) return
    ctx.clearRect(0, 0, width, height)

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      p.x += p.vx
      p.y += p.vy

      // Parpadeo suave y orgánico
      p.alpha += (p.targetAlpha - p.alpha) * 0.02
      if (Math.abs(p.targetAlpha - p.alpha) < 0.03) {
        p.targetAlpha = Math.random() * 0.45 + 0.1
      }

      // Reaparecer al salir de los bordes
      if (p.y < -10) {
        p.y = height + 10
        p.x = Math.random() * width
      }
      if (p.x < -10) p.x = width + 10
      if (p.x > width + 10) p.x = -10

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      ctx.fillStyle = `${p.color}${p.alpha})`
      ctx.shadowBlur = 8
      ctx.shadowColor = p.color.includes('6, 182') ? '#06B6D4' : '#8057FF'
      ctx.fill()
    }

    animationFrameId = requestAnimationFrame(render)
  }

  render()

  return () => {
    window.removeEventListener('resize', onResize)
    if (animationFrameId) cancelAnimationFrame(animationFrameId)
  }
}

let cleanupParticles: (() => void) | undefined

onMounted(() => {
  cleanupParticles = initCinemaParticles()
})

onUnmounted(() => {
  if (cleanupParticles) cleanupParticles()
})

// ================= VALIDACIÓN Y ENVÍO =================
function validateField(field: 'email' | 'password') {
  errors[field] = ''
  serverError.value = null
  const result = loginSchema.safeParse(form)
  if (!result.success) {
    const issue = result.error.issues.find((i) => i.path[0] === field)
    if (issue) {
      errors[field] = issue.message
    }
  }
}

// Accesos demo solo en desarrollo: en el build de producción este código y las contraseñas no existen
const demoDisponible = import.meta.env.DEV

function avisarRecuperacion() {
  serverError.value = null
  demoNotification.value = 'Escríbenos por WhatsApp y te ayudamos a recuperar tu contraseña.'
  setTimeout(() => {
    demoNotification.value = null
  }, 3500)
}

async function fillDemoAccount(type: 'cliente' | 'admin') {
  if (!import.meta.env.DEV) return
  const { DEMO_ACCOUNTS } = await import('@/services/demoAccounts')
  const acc = DEMO_ACCOUNTS[type]
  form.email = acc.email
  form.password = acc.password
  errors.email = ''
  errors.password = ''
  serverError.value = null
  demoNotification.value = type === 'cliente' ? 'Acceso Cliente (Laura) cargado' : 'Acceso Admin (Panel) cargado'
  setTimeout(() => {
    demoNotification.value = null
  }, 2500)
}

async function onSubmit() {
  errors.email = ''
  errors.password = ''
  serverError.value = null

  const validation = loginSchema.safeParse(form)
  if (!validation.success) {
    for (const issue of validation.error.issues) {
      const field = issue.path[0] as string
      if (field) errors[field] = issue.message
    }
    return
  }

  isSubmitting.value = true
  try {
    const user = await auth.login({
      email: form.email,
      password: form.password,
    })

    const redirectPath = route.query.redirect as string
    if (redirectPath && redirectPath.startsWith('/')) {
      await router.push(redirectPath)
    } else if (user.rol === 'admin') {
      await router.push('/admin')
    } else {
      await router.push('/mi-cuenta')
    }
  } catch (err: any) {
    serverError.value = err?.message || 'Error al iniciar sesión. Intenta nuevamente.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="relative min-h-screen w-full flex flex-col justify-between bg-black text-white overflow-hidden select-none selection:bg-brand-500 selection:text-white">
    <!-- ================= 1. FONDO CINEMATOGRÁFICO DE SALA DE CINE ================= -->
    <div
      class="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-100 pointer-events-none opacity-65"
      style="background-image: url('/login_cinema_bg.jpg');"
    >
      <!-- Viñeta Gradual Estilo Cine (Transparente al centro para apreciar la sala) -->
      <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/75" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(0,0,0,0.85)_85%)]" />
    </div>

    <!-- ================= 2. CANVAS DE LUZ Y PARTÍCULAS DE PROYECTOR (60 FPS) ================= -->
    <canvas
      ref="canvasRef"
      class="pointer-events-none absolute inset-0 z-10"
      aria-hidden="true"
    />

    <!-- Haces de Luz Neón Ambientales Cinematográficos -->
    <div class="pointer-events-none absolute -top-40 left-1/4 size-[550px] rounded-full bg-brand-500/20 blur-[150px]" />
    <div class="pointer-events-none absolute -bottom-40 right-1/4 size-[550px] rounded-full bg-cyan-500/20 blur-[150px]" />

    <!-- ================= 3. CABECERA SUPERIOR ================= -->
    <header class="relative z-20 flex items-center justify-between px-6 py-6 sm:px-12">
      <RouterLink
        to="/"
        class="inline-flex items-center gap-3 group transition-transform hover:scale-[1.02]"
        aria-label="Ir al inicio de StreamStore"
      >
        <img
          src="/streamstore_icon.png"
          alt="StreamStore"
          class="size-10 sm:size-11 object-contain drop-shadow-[0_0_15px_rgba(128,87,255,0.7)]"
        />
        <span class="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-baseline gap-1">
          <span>STREAM</span>
          <span class="bg-gradient-to-r from-[#8057FF] via-[#9B51E0] to-[#06B6D4] bg-clip-text text-transparent">STORE</span>
        </span>
      </RouterLink>

      <RouterLink
        to="/catalogo"
        class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-xs font-semibold text-neutral-200 backdrop-blur-md hover:bg-white/10 hover:text-white transition-all shadow-md group"
      >
        <ArrowLeft class="size-3.5 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
        <span class="hidden sm:inline">Explorar catálogo</span>
        <span class="sm:hidden">Catálogo</span>
      </RouterLink>
    </header>

    <!-- ================= 4. CONTENEDOR CENTRAL: TARJETA SPOTLIGHT 3D ================= -->
    <main class="relative z-20 my-auto flex flex-col items-center justify-center px-4 py-6 sm:px-6">
      
      <!-- HAZ DE LUZ ANAMÓRFICO DETRÁS DE LA TARJETA -->
      <div class="pointer-events-none absolute h-[1px] w-[500px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent blur-[2px] -top-1" />

      <!-- TARJETA CON TILT 3D Y REFLEJO SPOTLIGHT INTERACTIVO -->
      <div
        ref="cardRef"
        class="relative w-full max-w-[460px] overflow-hidden rounded-[28px] border border-white/[0.14] bg-black/80 p-8 sm:p-11 shadow-[0_30px_90px_rgba(0,0,0,0.95),0_0_40px_rgba(128,87,255,0.18)] backdrop-blur-2xl transition-transform duration-150 ease-out will-change-transform"
        :style="{ transform: cardTransform }"
        @mousemove="handleMouseMove"
        @mouseleave="handleMouseLeave"
      >
        <!-- CAPA SPOTLIGHT QUE SIGUE EL CURSOR (LUZ RADIAL ELEGANTE) -->
        <div
          class="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
          :style="{
            opacity: spotlightPos.opacity,
            background: `radial-gradient(420px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(128, 87, 255, 0.18), rgba(6, 182, 212, 0.08) 35%, transparent 70%)`
          }"
        />

        <!-- LÍNEA SUPERIOR DE BRILLO GLASSMORPHISM -->
        <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 via-50% to-transparent" />

        <!-- CONTENIDO DE LA TARJETA -->
        <div class="relative z-10">
          
          <!-- Título y Subtítulo -->
          <div>
            <h1 class="font-display text-3xl sm:text-4xl font-black text-white tracking-tight">
              Iniciar sesión
            </h1>
            <p class="mt-2 text-xs sm:text-sm text-neutral-300 font-light leading-relaxed">
              Ingresa tus datos para acceder a tus pantallas y suscripciones.
            </p>
          </div>

          <!-- Toast de Notificación Demo -->
          <transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <div
              v-if="demoNotification"
              class="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 py-2 text-xs font-medium text-emerald-300 backdrop-blur"
            >
              <Check class="size-3.5 text-emerald-400 shrink-0" />
              <span>{{ demoNotification }}</span>
            </div>
          </transition>

          <!-- Alerta de Error -->
          <AppAlert
            v-if="serverError"
            variant="error"
            title="No se pudo iniciar sesión"
            class="mt-4"
          >
            <p>{{ serverError }}</p>
          </AppAlert>

          <!-- Formulario -->
          <form class="mt-7 space-y-5" novalidate @submit.prevent="onSubmit">
            
            <!-- Campo Correo Electrónico -->
            <div class="space-y-1.5">
              <label for="login-email" class="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Correo Electrónico
              </label>
              <div class="relative group">
                <input
                  id="login-email"
                  v-model="form.email"
                  type="email"
                  autocomplete="email"
                  placeholder="nombre@ejemplo.com"
                  required
                  class="w-full rounded-xl border border-white/10 bg-neutral-900/90 pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-neutral-500 focus:border-cyan-400 focus:bg-black focus:outline-none focus:ring-2 focus:ring-cyan-400/25 transition-all shadow-inner"
                  :class="{ 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/25': errors.email }"
                  :aria-invalid="!!errors.email"
                  :aria-describedby="errors.email ? 'login-email-error' : undefined"
                  @blur="validateField('email')"
                />
                <Mail class="absolute left-3.5 top-3.5 size-4 text-neutral-400 group-focus-within:text-cyan-400 group-focus-within:drop-shadow-[0_0_6px_rgba(6,182,212,0.7)] transition-all" aria-hidden="true" />
              </div>
              <p v-if="errors.email" id="login-email-error" class="text-xs font-medium text-rose-400 pt-0.5" role="alert">
                {{ errors.email }}
              </p>
            </div>

            <!-- Campo Contraseña -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label for="login-password" class="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
                  Contraseña
                </label>
                <button
                  type="button"
                  class="text-xs text-neutral-400 hover:text-cyan-300 transition-colors"
                  @click="avisarRecuperacion"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div class="relative group">
                <input
                  id="login-password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="••••••••"
                  required
                  class="w-full rounded-xl border border-white/10 bg-neutral-900/90 pl-11 pr-11 py-3.5 text-sm text-white placeholder:text-neutral-500 focus:border-cyan-400 focus:bg-black focus:outline-none focus:ring-2 focus:ring-cyan-400/25 transition-all shadow-inner"
                  :class="{ 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/25': errors.password }"
                  :aria-invalid="!!errors.password"
                  :aria-describedby="errors.password ? 'login-password-error' : undefined"
                  @blur="validateField('password')"
                />
                <Lock class="absolute left-3.5 top-3.5 size-4 text-neutral-400 group-focus-within:text-cyan-400 group-focus-within:drop-shadow-[0_0_6px_rgba(6,182,212,0.7)] transition-all" aria-hidden="true" />
                <button
                  type="button"
                  class="absolute right-3.5 top-3 text-neutral-400 hover:text-white transition-colors focus:outline-none p-0.5 rounded-lg"
                  :aria-label="showPassword ? 'Ocultar contraseña' : 'Ver contraseña'"
                  @click="showPassword = !showPassword"
                >
                  <component :is="showPassword ? EyeOff : Eye" class="size-4" aria-hidden="true" />
                </button>
              </div>
              <p v-if="errors.password" id="login-password-error" class="text-xs font-medium text-rose-400 pt-0.5" role="alert">
                {{ errors.password }}
              </p>
            </div>

            <!-- Opciones adicionales: Recordarme & Acceso Rápido Demo -->
            <div class="flex items-center justify-between text-xs text-neutral-400 pt-1">
              <label class="flex items-center gap-2 cursor-pointer select-none hover:text-neutral-200 transition-colors">
                <input
                  v-model="rememberMe"
                  type="checkbox"
                  class="size-4 rounded border-neutral-700 bg-neutral-900 text-brand-500 focus:ring-brand-400 focus:ring-offset-0"
                />
                <span>Recordar mi sesión</span>
              </label>

              <!-- Acceso rápido Demo interactivo (solo desarrollo) -->
              <button
                v-if="demoDisponible"
                type="button"
                class="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
                @click="showDemoQuickAccess = !showDemoQuickAccess"
              >
                <Sparkles class="size-3" />
                <span>{{ showDemoQuickAccess ? 'Ocultar demos' : 'Accesos Demo' }}</span>
              </button>
            </div>

            <!-- Panel desplegable con cápsulas animadas de Demo -->
            <div
              v-if="demoDisponible && showDemoQuickAccess"
              class="rounded-xl border border-white/10 bg-white/5 p-2.5 transition-all flex items-center justify-between gap-2"
            >
              <button
                type="button"
                class="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-neutral-200 hover:border-emerald-400 hover:text-emerald-300 hover:shadow-[0_0_12px_rgba(34,197,94,0.3)] transition-all"
                @click="fillDemoAccount('cliente')"
              >
                <UserCheck class="size-3 text-emerald-400" />
                <span>Cliente (Laura)</span>
              </button>
              <button
                type="button"
                class="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-neutral-200 hover:border-brand-400 hover:text-brand-300 hover:shadow-[0_0_12px_rgba(128,87,255,0.3)] transition-all"
                @click="fillDemoAccount('admin')"
              >
                <ShieldCheck class="size-3 text-brand-400" />
                <span>Admin (Panel)</span>
              </button>
            </div>

            <!-- BOTÓN PRINCIPAL CON EFECTO SHIMMER DE LUZ Y GLOW NEÓN -->
            <div class="pt-3">
              <button
                type="submit"
                class="w-full relative group overflow-hidden inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8057FF] via-[#8C4BFF] to-[#06B6D4] text-white font-black text-sm uppercase tracking-wider py-4 shadow-[0_0_30px_rgba(128,87,255,0.45)] hover:shadow-[0_0_45px_rgba(6,182,212,0.6)] transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none"
                :disabled="isSubmitting"
                :aria-busy="isSubmitting"
              >
                <!-- Haz de luz reflectante (Shimmer beam suave) -->
                <span class="pointer-events-none absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.4s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                <span v-if="isSubmitting" class="relative z-10 flex items-center gap-2">
                  <span class="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Iniciando sesión...</span>
                </span>
                <span v-else class="relative z-10 flex items-center gap-2 font-display">
                  <span>Iniciar sesión</span>
                  <ArrowRight class="size-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          </form>

          <!-- Pie de la tarjeta -->
          <div class="mt-8 border-t border-white/10 pt-6 text-center">
            <p class="text-sm text-neutral-400">
              ¿Primera vez en StreamStore?
              <RouterLink
                to="/registro"
                class="ml-1 font-bold text-white hover:text-cyan-400 underline underline-offset-4 transition-colors"
              >
                Suscríbete ahora
              </RouterLink>
            </p>
          </div>

          <p class="mt-5 text-[11px] text-neutral-500 text-center leading-relaxed">
            Esta página está protegida con cifrado SSL para garantizar la seguridad de tus accesos a servicios de streaming.
          </p>
        </div>
      </div>
    </main>

    <!-- ================= 5. PIE DE PÁGINA MINIMALISTA ================= -->
    <footer class="relative z-20 py-6 px-6 sm:px-12 text-center text-xs text-neutral-500">
      <div class="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
        <span>© {{ new Date().getFullYear() }} StreamStore</span>
        <span>•</span>
        <RouterLink to="/" class="hover:text-neutral-300 transition-colors">Términos de servicio</RouterLink>
        <span>•</span>
        <RouterLink to="/" class="hover:text-neutral-300 transition-colors">Privacidad</RouterLink>
        <span>•</span>
        <RouterLink to="/catalogo" class="hover:text-neutral-300 transition-colors">Centro de ayuda</RouterLink>
      </div>
    </footer>
  </div>
</template>

<style scoped>
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
