<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  ShieldCheck, 
  Sparkles, 
  UserCheck 
} from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { DEMO_ACCOUNTS } from '@/services/authService'
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

function fillDemoAccount(type: 'cliente' | 'admin') {
  const acc = DEMO_ACCOUNTS[type]
  form.email = acc.email
  form.password = acc.password
  errors.email = ''
  errors.password = ''
  serverError.value = null
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
  <div class="relative min-h-screen w-full flex flex-col justify-between bg-black text-white overflow-hidden">
    <!-- ================= FONDO CINEMATOGRÁFICO REALISTA DE STREAMING ================= -->
    <div
      class="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-100 pointer-events-none opacity-60"
      style="background-image: url('/login_cinema_bg.jpg');"
    >
      <!-- Viñeta Gradual Estilo Sala de Cine / HBO Max (Transparente al centro para apreciar la escena) -->
      <div class="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/80" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.8)_80%)]" />
    </div>

    <!-- Haces de Luz Neón Ambientales Suaves -->
    <div class="pointer-events-none absolute -top-40 left-1/4 size-[500px] rounded-full bg-brand-600/20 blur-[150px]" />
    <div class="pointer-events-none absolute -bottom-40 right-1/4 size-[500px] rounded-full bg-cyan-600/20 blur-[150px]" />

    <!-- ================= CABECERA MINIMALISTA OFICIAL ================= -->
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
        class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-4 py-2 text-xs font-semibold text-neutral-200 backdrop-blur-md hover:bg-white/10 hover:text-white transition-all shadow-md"
      >
        <ArrowLeft class="size-3.5 text-cyan-400" />
        <span class="hidden sm:inline">Explorar catálogo</span>
        <span class="sm:hidden">Catálogo</span>
      </RouterLink>
    </header>

    <!-- ================= CONTENEDOR CENTRAL: FORMULARIO CENTRADO Y LIMPIO ================= -->
    <main class="relative z-20 my-auto flex flex-col items-center justify-center px-4 py-8 sm:px-6">
      <div class="w-full max-w-[450px] rounded-3xl border border-white/15 bg-black/80 p-8 sm:p-11 shadow-[0_25px_70px_rgba(0,0,0,0.95)] backdrop-blur-xl">
        
        <!-- Título Principal -->
        <div>
          <h1 class="font-display text-3xl sm:text-4xl font-black text-white tracking-tight">
            Iniciar sesión
          </h1>
          <p class="mt-2 text-xs sm:text-sm text-neutral-300 font-light">
            Ingresa tus datos para acceder a tus pantallas y suscripciones.
          </p>
        </div>

        <!-- Alerta de Error -->
        <AppAlert
          v-if="serverError"
          variant="error"
          title="No se pudo iniciar sesión"
          class="mt-5"
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
                class="w-full rounded-xl border border-neutral-700/80 bg-neutral-900/90 pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-neutral-500 focus:border-cyan-400 focus:bg-black focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
                :class="{ 'border-rose-500 focus:border-rose-500 focus:ring-rose-500': errors.email }"
                :aria-invalid="!!errors.email"
                :aria-describedby="errors.email ? 'login-email-error' : undefined"
                @blur="validateField('email')"
              />
              <Mail class="absolute left-3.5 top-3.5 size-4 text-neutral-400 group-focus-within:text-cyan-400 transition-colors" aria-hidden="true" />
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
                class="text-xs text-neutral-400 hover:text-cyan-400 transition-colors"
                @click="fillDemoAccount('cliente')"
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
                class="w-full rounded-xl border border-neutral-700/80 bg-neutral-900/90 pl-11 pr-11 py-3.5 text-sm text-white placeholder:text-neutral-500 focus:border-cyan-400 focus:bg-black focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
                :class="{ 'border-rose-500 focus:border-rose-500 focus:ring-rose-500': errors.password }"
                :aria-invalid="!!errors.password"
                :aria-describedby="errors.password ? 'login-password-error' : undefined"
                @blur="validateField('password')"
              />
              <Lock class="absolute left-3.5 top-3.5 size-4 text-neutral-400 group-focus-within:text-cyan-400 transition-colors" aria-hidden="true" />
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

          <!-- Opciones adicionales: Recordarme & Acceso Demo -->
          <div class="flex items-center justify-between text-xs text-neutral-400 pt-1">
            <label class="flex items-center gap-2 cursor-pointer select-none">
              <input
                v-model="rememberMe"
                type="checkbox"
                class="size-4 rounded border-neutral-700 bg-neutral-900 text-brand-500 focus:ring-brand-400 focus:ring-offset-0"
              />
              <span>Recordar mi sesión</span>
            </label>

            <!-- Acceso rápido Demo -->
            <button
              type="button"
              class="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
              @click="showDemoQuickAccess = !showDemoQuickAccess"
            >
              <Sparkles class="size-3" />
              <span>{{ showDemoQuickAccess ? 'Ocultar demos' : 'Accesos Demo' }}</span>
            </button>
          </div>

          <!-- Panel desplegable discreto de cuentas Demo -->
          <div
            v-if="showDemoQuickAccess"
            class="rounded-xl border border-white/10 bg-white/5 p-2.5 transition-all flex items-center justify-between gap-2"
          >
            <button
              type="button"
              class="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-neutral-200 hover:border-emerald-400 hover:text-emerald-300 transition-colors"
              @click="fillDemoAccount('cliente')"
            >
              <UserCheck class="size-3 text-emerald-400" />
              <span>Cliente (Laura)</span>
            </button>
            <button
              type="button"
              class="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 text-xs text-neutral-200 hover:border-brand-400 hover:text-brand-300 transition-colors"
              @click="fillDemoAccount('admin')"
            >
              <ShieldCheck class="size-3 text-brand-400" />
              <span>Admin (Panel)</span>
            </button>
          </div>

          <!-- Botón Principal -->
          <div class="pt-3">
            <button
              type="submit"
              class="w-full relative inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#8057FF] via-[#9B51E0] to-[#06B6D4] hover:opacity-95 text-white font-bold text-base py-3.5 shadow-[0_0_25px_rgba(128,87,255,0.35)] transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none"
              :disabled="isSubmitting"
              :aria-busy="isSubmitting"
            >
              <span v-if="isSubmitting" class="flex items-center gap-2">
                <span class="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Iniciando sesión...</span>
              </span>
              <span v-else class="font-display">
                Iniciar sesión
              </span>
            </button>
          </div>
        </form>

        <!-- Pie de la tarjeta -->
        <div class="mt-8 border-t border-neutral-800 pt-6 text-center">
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

        <p class="mt-6 text-[11px] text-neutral-500 text-center leading-relaxed">
          Esta página está protegida con cifrado SSL para garantizar la seguridad de tus accesos a servicios de streaming.
        </p>
      </div>
    </main>

    <!-- ================= PIE DE PÁGINA MINIMALISTA ================= -->
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
