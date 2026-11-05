<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { Eye, EyeOff, Lock, LogIn, Mail, ShieldAlert, Sparkles, UserCheck } from '@lucide/vue'
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
const isSubmitting = ref(false)
const serverError = ref<string | null>(null)

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

    // Redirección inteligente post-login
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
  <div class="container-app flex min-h-[calc(100vh-14rem)] items-center justify-center py-12">
    <div class="card w-full max-w-md p-6 sm:p-8">
      <!-- Encabezado -->
      <div class="text-center">
        <div class="mx-auto grid size-12 place-items-center rounded-2xl bg-brand-500/20 text-brand-300">
          <LogIn class="size-6" aria-hidden="true" />
        </div>
        <h1 class="mt-4 font-display text-2xl font-bold text-fg sm:text-3xl">
          Iniciar sesión
        </h1>
        <p class="mt-2 text-sm text-muted">
          Ingresa a tu cuenta para gestionar tus servicios de streaming.
        </p>
      </div>

      <!-- Cuentas demo para agilizar revisión -->
      <div class="mt-6 rounded-xl border border-brand-400/30 bg-surface-2 p-3 text-xs">
        <div class="flex items-center gap-1.5 font-semibold text-brand-200">
          <Sparkles class="size-3.5" aria-hidden="true" />
          <span>Accesos de prueba para demostración</span>
        </div>
        <div class="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            class="flex items-center gap-1 rounded-lg border border-line bg-surface px-2.5 py-1 text-fg hover:border-brand-400"
            @click="fillDemoAccount('cliente')"
          >
            <UserCheck class="size-3 text-success" aria-hidden="true" />
            <span>Cliente Demo</span>
          </button>
          <button
            type="button"
            class="flex items-center gap-1 rounded-lg border border-line bg-surface px-2.5 py-1 text-fg hover:border-brand-400"
            @click="fillDemoAccount('admin')"
          >
            <ShieldAlert class="size-3 text-warning" aria-hidden="true" />
            <span>Admin Demo</span>
          </button>
        </div>
      </div>

      <!-- Alerta de Error de Servidor / Credenciales -->
      <AppAlert
        v-if="serverError"
        variant="error"
        title="Error de autenticación"
        class="mt-4"
      >
        <p>{{ serverError }}</p>
      </AppAlert>

      <!-- Formulario -->
      <form class="mt-6 space-y-4" novalidate @submit.prevent="onSubmit">
        <!-- Campo Correo -->
        <div>
          <label for="login-email" class="field-label">Correo electrónico</label>
          <div class="relative">
            <input
              id="login-email"
              v-model="form.email"
              type="email"
              autocomplete="email"
              placeholder="nombre@ejemplo.com"
              required
              class="field-input pl-10"
              :aria-invalid="!!errors.email"
              :aria-describedby="errors.email ? 'login-email-error' : undefined"
              @blur="validateField('email')"
            />
            <Mail class="absolute left-3 top-3 size-4 text-muted" aria-hidden="true" />
          </div>
          <p v-if="errors.email" id="login-email-error" class="field-error" role="alert">
            {{ errors.email }}
          </p>
        </div>

        <!-- Campo Contraseña -->
        <div>
          <label for="login-password" class="field-label">Contraseña</label>
          <div class="relative">
            <input
              id="login-password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="••••••••"
              required
              class="field-input pl-10 pr-10"
              :aria-invalid="!!errors.password"
              :aria-describedby="errors.password ? 'login-password-error' : undefined"
              @blur="validateField('password')"
            />
            <Lock class="absolute left-3 top-3 size-4 text-muted" aria-hidden="true" />
            <button
              type="button"
              class="absolute right-3 top-2.5 text-muted hover:text-fg focus:outline-none"
              :aria-label="showPassword ? 'Ocultar contraseña' : 'Ver contraseña'"
              @click="showPassword = !showPassword"
            >
              <component :is="showPassword ? EyeOff : Eye" class="size-4" aria-hidden="true" />
            </button>
          </div>
          <p v-if="errors.password" id="login-password-error" class="field-error" role="alert">
            {{ errors.password }}
          </p>
        </div>

        <!-- Botón de Envío -->
        <button
          type="submit"
          class="btn-primary w-full py-3"
          :disabled="isSubmitting"
          :aria-busy="isSubmitting"
        >
          <span v-if="isSubmitting">Iniciando sesión...</span>
          <span v-else>Entrar a mi cuenta</span>
        </button>
      </form>

      <!-- Pie con enlace a Registro -->
      <p class="mt-6 text-center text-xs text-muted">
        ¿Aún no tienes cuenta?
        <RouterLink to="/registro" class="font-semibold text-brand-300 hover:text-brand-200 underline underline-offset-4">
          Crea tu cuenta aquí
        </RouterLink>
      </p>
    </div>
  </div>
</template>
