<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { Eye, EyeOff, Lock, Mail } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { loginSchema } from '@/utils/validators'
import AppAlert from '@/components/common/AppAlert.vue'
import AuthShell from '@/components/auth/AuthShell.vue'

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
const demoNotification = ref<string | null>(null)

// Soporte real: el mismo canal de WhatsApp del botón flotante de la tienda
const soporteRecuperacion = `https://wa.me/573001234567?text=${encodeURIComponent(
  'Hola StreamStore, necesito ayuda para recuperar el acceso a mi cuenta.',
)}`

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

async function fillDemoAccount(type: 'cliente' | 'admin') {
  if (!import.meta.env.DEV) return
  const { DEMO_ACCOUNTS } = await import('@/services/demoAccounts')
  const acc = DEMO_ACCOUNTS[type]
  form.email = acc.email
  form.password = acc.password
  errors.email = ''
  errors.password = ''
  serverError.value = null
  demoNotification.value = type === 'cliente' ? 'Datos de la cuenta demo de cliente cargados.' : 'Datos de la cuenta demo de administración cargados.'
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
      // Se muestra el primer problema de cada campo (por ejemplo, "obligatorio" antes que "formato")
      if (field && !errors[field]) errors[field] = issue.message
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
  <AuthShell
    showcase-title="Tus pantallas te esperan."
    showcase-text="Entra para ver las credenciales de tus servicios activos, renovarlos y seguir tus compras."
  >
    <h1 class="ss-title ss-h1 text-white">Iniciar sesión</h1>
    <p class="ss-lead mt-2">Usa el correo y la contraseña con los que creaste tu cuenta.</p>

    <p v-if="route.query.redirect" class="mt-4 rounded-xl border border-[#2dd4ef]/40 bg-[#2dd4ef]/10 px-4 py-3 text-sm text-[#d7f7fd]" role="status">
      Inicia sesión para continuar con tu compra.
    </p>

    <p
      v-if="demoNotification"
      class="mt-4 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200"
      role="status"
    >
      {{ demoNotification }}
    </p>

    <AppAlert v-if="serverError" variant="error" title="No se pudo iniciar sesión" class="mt-4">
      <p>{{ serverError }}</p>
    </AppAlert>

    <form class="mt-7 space-y-5" novalidate @submit.prevent="onSubmit">
      <div class="ss-field">
        <label for="login-email" class="ss-label">Correo electrónico</label>
        <div class="ss-control">
          <Mail class="ss-input-icon" aria-hidden="true" />
          <input
            id="login-email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            inputmode="email"
            placeholder="nombre@ejemplo.com"
            required
            class="ss-input has-icon"
            :aria-invalid="!!errors.email"
            :aria-describedby="errors.email ? 'login-email-error' : undefined"
            @blur="validateField('email')"
          />
        </div>
        <p v-if="errors.email" id="login-email-error" class="ss-error">{{ errors.email }}</p>
      </div>

      <div class="ss-field">
        <label for="login-password" class="ss-label">Contraseña</label>
        <div class="ss-control">
          <Lock class="ss-input-icon" aria-hidden="true" />
          <input
            id="login-password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            required
            class="ss-input has-icon has-action"
            :aria-invalid="!!errors.password"
            :aria-describedby="errors.password ? 'login-password-error' : 'login-password-help'"
            @blur="validateField('password')"
          />
          <button
            type="button"
            class="ss-input-action"
            :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            :aria-pressed="showPassword"
            @click="showPassword = !showPassword"
          >
            <component :is="showPassword ? EyeOff : Eye" class="size-5" aria-hidden="true" />
          </button>
        </div>
        <p v-if="errors.password" id="login-password-error" class="ss-error">{{ errors.password }}</p>
        <p v-else id="login-password-help" class="ss-help">
          <a
            :href="soporteRecuperacion"
            target="_blank"
            rel="noopener noreferrer"
            class="ss-link"
            aria-label="Ayuda para acceder: abre el chat de soporte por WhatsApp en una pestaña nueva"
          >Ayuda para acceder</a>
          (soporte por WhatsApp; no restablece la contraseña automáticamente)
        </p>
      </div>

      <button type="submit" class="ss-btn ss-btn-primary ss-btn-block mt-2" :disabled="isSubmitting" :aria-busy="isSubmitting">
        <span v-if="isSubmitting" class="ss-spinner" aria-hidden="true" />
        {{ isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión' }}
      </button>
    </form>

    <!-- Accesos de prueba: solo existen en desarrollo -->
    <div v-if="demoDisponible" class="mt-6 rounded-xl border border-dashed border-white/20 p-4">
      <p class="text-sm font-semibold text-white">Cuentas de prueba (solo desarrollo)</p>
      <div class="mt-3 grid grid-cols-2 gap-2">
        <button type="button" class="ss-btn ss-btn-secondary text-sm" @click="fillDemoAccount('cliente')">Cliente</button>
        <button type="button" class="ss-btn ss-btn-secondary text-sm" @click="fillDemoAccount('admin')">Administración</button>
      </div>
    </div>

    <p class="mt-8 border-t border-white/10 pt-6 text-center text-sm text-[#a9b1cc]">
      ¿Aún no tienes cuenta?
      <RouterLink to="/registro" class="ss-link ml-1">Crear cuenta</RouterLink>
    </p>
  </AuthShell>
</template>
