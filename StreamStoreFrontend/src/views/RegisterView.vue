<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  User 
} from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { registerSchema } from '@/utils/validators'
import AppAlert from '@/components/common/AppAlert.vue'

const auth = useAuthStore()
const router = useRouter()

const form = reactive({
  nombre: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const errors = reactive<Record<string, string>>({
  nombre: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isSubmitting = ref(false)
const serverError = ref<string | null>(null)

function validateField(field: keyof typeof form) {
  errors[field] = ''
  serverError.value = null
  const result = registerSchema.safeParse(form)
  if (!result.success) {
    const issue = result.error.issues.find((i) => i.path[0] === field)
    if (issue) {
      errors[field] = issue.message
    }
  }
}

async function onSubmit() {
  Object.keys(errors).forEach((k) => (errors[k] = ''))
  serverError.value = null

  const validation = registerSchema.safeParse(form)
  if (!validation.success) {
    for (const issue of validation.error.issues) {
      const field = issue.path[0] as string
      if (field) errors[field] = issue.message
    }
    return
  }

  isSubmitting.value = true
  try {
    await auth.register({
      nombre: form.nombre,
      email: form.email,
      password: form.password,
    })

    await router.push('/mi-cuenta')
  } catch (err: any) {
    serverError.value = err?.message || 'Error al crear la cuenta. Intenta nuevamente.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="relative min-h-screen w-full flex flex-col justify-between bg-black text-white overflow-hidden">
    <!-- FONDO CINEMATOGRÁFICO DE STREAMING -->
    <div
      class="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-100 pointer-events-none opacity-60"
      style="background-image: url('/login_cinema_bg.jpg');"
    >
      <div class="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/80" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.8)_80%)]" />
    </div>

    <!-- Haces de Luz Cinemáticos -->
    <div class="pointer-events-none absolute -top-40 right-1/4 size-[500px] rounded-full bg-brand-600/20 blur-[150px]" />
    <div class="pointer-events-none absolute -bottom-40 left-1/4 size-[500px] rounded-full bg-cyan-600/20 blur-[150px]" />

    <!-- CABECERA MINIMALISTA -->
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
        to="/login"
        class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-4 py-2 text-xs font-semibold text-neutral-200 backdrop-blur-md hover:bg-white/10 hover:text-white transition-all shadow-md"
      >
        <ArrowLeft class="size-3.5 text-cyan-400" />
        <span>Ya tengo cuenta</span>
      </RouterLink>
    </header>

    <!-- FORMULARIO CENTRAL -->
    <main class="relative z-20 my-auto flex flex-col items-center justify-center px-4 py-8 sm:px-6">
      <div class="w-full max-w-[480px] rounded-3xl border border-white/15 bg-black/80 p-8 sm:p-11 shadow-[0_25px_70px_rgba(0,0,0,0.95)] backdrop-blur-xl">
        <div>
          <h1 class="font-display text-3xl sm:text-4xl font-black text-white tracking-tight">
            Crear cuenta
          </h1>
          <p class="mt-2 text-xs sm:text-sm text-neutral-300 font-light">
            Regístrate para comprar pantallas y cuentas con entrega inmediata.
          </p>
        </div>

        <AppAlert
          v-if="serverError"
          variant="error"
          title="No se pudo crear la cuenta"
          class="mt-5"
        >
          <p>{{ serverError }}</p>
        </AppAlert>

        <form class="mt-7 space-y-4" novalidate @submit.prevent="onSubmit">
          <!-- Campo Nombre -->
          <div class="space-y-1.5">
            <label for="register-name" class="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Nombre Completo
            </label>
            <div class="relative group">
              <input
                id="register-name"
                v-model="form.nombre"
                type="text"
                autocomplete="name"
                placeholder="Ej. Juan Pérez"
                required
                class="w-full rounded-xl border border-neutral-700/80 bg-neutral-900/90 pl-11 pr-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:border-cyan-400 focus:bg-black focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
                :class="{ 'border-rose-500 focus:border-rose-500 focus:ring-rose-500': errors.nombre }"
                :aria-invalid="!!errors.nombre"
                :aria-describedby="errors.nombre ? 'register-name-error' : undefined"
                @blur="validateField('nombre')"
              />
              <User class="absolute left-3.5 top-3.5 size-4 text-neutral-400 group-focus-within:text-cyan-400 transition-colors" aria-hidden="true" />
            </div>
            <p v-if="errors.nombre" id="register-name-error" class="text-xs font-medium text-rose-400 pt-0.5" role="alert">
              {{ errors.nombre }}
            </p>
          </div>

          <!-- Campo Correo -->
          <div class="space-y-1.5">
            <label for="register-email" class="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Correo Electrónico
            </label>
            <div class="relative group">
              <input
                id="register-email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                placeholder="nombre@ejemplo.com"
                required
                class="w-full rounded-xl border border-neutral-700/80 bg-neutral-900/90 pl-11 pr-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:border-cyan-400 focus:bg-black focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
                :class="{ 'border-rose-500 focus:border-rose-500 focus:ring-rose-500': errors.email }"
                :aria-invalid="!!errors.email"
                :aria-describedby="errors.email ? 'register-email-error' : undefined"
                @blur="validateField('email')"
              />
              <Mail class="absolute left-3.5 top-3.5 size-4 text-neutral-400 group-focus-within:text-cyan-400 transition-colors" aria-hidden="true" />
            </div>
            <p v-if="errors.email" id="register-email-error" class="text-xs font-medium text-rose-400 pt-0.5" role="alert">
              {{ errors.email }}
            </p>
          </div>

          <!-- Campo Contraseña -->
          <div class="space-y-1.5">
            <label for="register-password" class="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Contraseña
            </label>
            <div class="relative group">
              <input
                id="register-password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="Mínimo 6 caracteres"
                required
                class="w-full rounded-xl border border-neutral-700/80 bg-neutral-900/90 pl-11 pr-11 py-3 text-sm text-white placeholder:text-neutral-500 focus:border-cyan-400 focus:bg-black focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
                :class="{ 'border-rose-500 focus:border-rose-500 focus:ring-rose-500': errors.password }"
                :aria-invalid="!!errors.password"
                :aria-describedby="errors.password ? 'register-password-error' : undefined"
                @blur="validateField('password')"
              />
              <Lock class="absolute left-3.5 top-3.5 size-4 text-neutral-400 group-focus-within:text-cyan-400 transition-colors" aria-hidden="true" />
              <button
                type="button"
                class="absolute right-3.5 top-2.5 text-neutral-400 hover:text-white transition-colors focus:outline-none p-0.5 rounded-lg"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Ver contraseña'"
                @click="showPassword = !showPassword"
              >
                <component :is="showPassword ? EyeOff : Eye" class="size-4" aria-hidden="true" />
              </button>
            </div>
            <p v-if="errors.password" id="register-password-error" class="text-xs font-medium text-rose-400 pt-0.5" role="alert">
              {{ errors.password }}
            </p>
          </div>

          <!-- Campo Confirmar Contraseña -->
          <div class="space-y-1.5">
            <label for="register-confirm-password" class="block text-xs font-semibold uppercase tracking-wider text-neutral-300">
              Confirmar Contraseña
            </label>
            <div class="relative group">
              <input
                id="register-confirm-password"
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="Repite tu contraseña"
                required
                class="w-full rounded-xl border border-neutral-700/80 bg-neutral-900/90 pl-11 pr-11 py-3 text-sm text-white placeholder:text-neutral-500 focus:border-cyan-400 focus:bg-black focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
                :class="{ 'border-rose-500 focus:border-rose-500 focus:ring-rose-500': errors.confirmPassword }"
                :aria-invalid="!!errors.confirmPassword"
                :aria-describedby="errors.confirmPassword ? 'register-confirm-password-error' : undefined"
                @blur="validateField('confirmPassword')"
              />
              <Lock class="absolute left-3.5 top-3.5 size-4 text-neutral-400 group-focus-within:text-cyan-400 transition-colors" aria-hidden="true" />
              <button
                type="button"
                class="absolute right-3.5 top-2.5 text-neutral-400 hover:text-white transition-colors focus:outline-none p-0.5 rounded-lg"
                :aria-label="showConfirmPassword ? 'Ocultar confirmación' : 'Ver confirmación'"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <component :is="showConfirmPassword ? EyeOff : Eye" class="size-4" aria-hidden="true" />
              </button>
            </div>
            <p v-if="errors.confirmPassword" id="register-confirm-password-error" class="text-xs font-medium text-rose-400 pt-0.5" role="alert">
              {{ errors.confirmPassword }}
            </p>
          </div>

          <!-- Botón de Registro -->
          <div class="pt-3">
            <button
              type="submit"
              class="w-full relative inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#8057FF] via-[#9B51E0] to-[#06B6D4] hover:opacity-95 text-white font-bold text-base py-3.5 shadow-[0_0_25px_rgba(128,87,255,0.35)] transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none"
              :disabled="isSubmitting"
              :aria-busy="isSubmitting"
            >
              <span v-if="isSubmitting" class="flex items-center gap-2">
                <span class="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creando cuenta...</span>
              </span>
              <span v-else class="font-display">
                Crear cuenta gratis
              </span>
            </button>
          </div>
        </form>

        <!-- Pie de la tarjeta -->
        <div class="mt-8 border-t border-neutral-800 pt-6 text-center">
          <p class="text-sm text-neutral-400">
            ¿Ya tienes una cuenta?
            <RouterLink
              to="/login"
              class="ml-1 font-bold text-white hover:text-cyan-400 underline underline-offset-4 transition-colors"
            >
              Inicia sesión aquí
            </RouterLink>
          </p>
        </div>
      </div>
    </main>

    <!-- PIE DE PÁGINA MINIMALISTA -->
    <footer class="relative z-20 py-6 px-6 sm:px-12 text-center text-xs text-neutral-500">
      <div class="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
        <span>© {{ new Date().getFullYear() }} StreamStore</span>
        <span>•</span>
        <RouterLink to="/" class="hover:text-neutral-300 transition-colors">Términos de servicio</RouterLink>
        <span>•</span>
        <RouterLink to="/" class="hover:text-neutral-300 transition-colors">Privacidad</RouterLink>
      </div>
    </footer>
  </div>
</template>
