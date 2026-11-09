<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Eye, EyeOff, Lock, Mail, User } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { registerSchema } from '@/utils/validators'
import AppAlert from '@/components/common/AppAlert.vue'
import AuthShell from '@/components/auth/AuthShell.vue'

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
      // Se muestra el primer problema de cada campo (por ejemplo, "obligatorio" antes que "formato")
      if (field && !errors[field]) errors[field] = issue.message
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
  <AuthShell
    showcase-title="Una cuenta para todas tus plataformas."
    showcase-text="Compra cuentas completas o pantallas con PIN y recibe tus accesos en Mi cuenta en cuanto se confirme el pago."
  >
    <h1 class="ss-title ss-h1 text-white">Crear cuenta</h1>
    <p class="ss-lead mt-2">Solo necesitas tu nombre, un correo y una contraseña.</p>

    <AppAlert v-if="serverError" variant="error" title="No se pudo crear la cuenta" class="mt-4">
      <p>{{ serverError }}</p>
    </AppAlert>

    <form class="mt-7 space-y-5" novalidate @submit.prevent="onSubmit">
      <div class="ss-field">
        <label for="register-name" class="ss-label">Nombre completo</label>
        <div class="ss-control">
          <User class="ss-input-icon" aria-hidden="true" />
          <input
            id="register-name"
            v-model="form.nombre"
            type="text"
            autocomplete="name"
            placeholder="Juan Pérez"
            required
            class="ss-input has-icon"
            :aria-invalid="!!errors.nombre"
            :aria-describedby="errors.nombre ? 'register-name-error' : undefined"
            @blur="validateField('nombre')"
          />
        </div>
        <p v-if="errors.nombre" id="register-name-error" class="ss-error">{{ errors.nombre }}</p>
      </div>

      <div class="ss-field">
        <label for="register-email" class="ss-label">Correo electrónico</label>
        <div class="ss-control">
          <Mail class="ss-input-icon" aria-hidden="true" />
          <input
            id="register-email"
            v-model="form.email"
            type="email"
            autocomplete="email"
            inputmode="email"
            placeholder="nombre@ejemplo.com"
            required
            class="ss-input has-icon"
            :aria-invalid="!!errors.email"
            :aria-describedby="errors.email ? 'register-email-error' : 'register-email-help'"
            @blur="validateField('email')"
          />
        </div>
        <p v-if="errors.email" id="register-email-error" class="ss-error">{{ errors.email }}</p>
        <p v-else id="register-email-help" class="ss-help">Lo usarás para iniciar sesión.</p>
      </div>

      <div class="ss-field">
        <label for="register-password" class="ss-label">Contraseña</label>
        <div class="ss-control">
          <Lock class="ss-input-icon" aria-hidden="true" />
          <input
            id="register-password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            required
            class="ss-input has-icon has-action"
            :aria-invalid="!!errors.password"
            :aria-describedby="errors.password ? 'register-password-error' : 'register-password-help'"
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
        <p v-if="errors.password" id="register-password-error" class="ss-error">{{ errors.password }}</p>
        <p v-else id="register-password-help" class="ss-help">Mínimo 6 caracteres.</p>
      </div>

      <div class="ss-field">
        <label for="register-confirm-password" class="ss-label">Confirma la contraseña</label>
        <div class="ss-control">
          <Lock class="ss-input-icon" aria-hidden="true" />
          <input
            id="register-confirm-password"
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            autocomplete="new-password"
            required
            class="ss-input has-icon has-action"
            :aria-invalid="!!errors.confirmPassword"
            :aria-describedby="errors.confirmPassword ? 'register-confirm-error' : undefined"
            @blur="validateField('confirmPassword')"
          />
          <button
            type="button"
            class="ss-input-action"
            :aria-label="showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            :aria-pressed="showConfirmPassword"
            @click="showConfirmPassword = !showConfirmPassword"
          >
            <component :is="showConfirmPassword ? EyeOff : Eye" class="size-5" aria-hidden="true" />
          </button>
        </div>
        <p v-if="errors.confirmPassword" id="register-confirm-error" class="ss-error">{{ errors.confirmPassword }}</p>
      </div>

      <button type="submit" class="ss-btn ss-btn-primary ss-btn-block mt-2" :disabled="isSubmitting" :aria-busy="isSubmitting">
        <span v-if="isSubmitting" class="ss-spinner" aria-hidden="true" />
        {{ isSubmitting ? 'Creando cuenta…' : 'Crear cuenta' }}
      </button>
    </form>

    <p class="mt-8 border-t border-white/10 pt-6 text-center text-sm text-[#a9b1cc]">
      ¿Ya tienes cuenta?
      <RouterLink to="/login" class="ss-link ml-1">Iniciar sesión</RouterLink>
    </p>
  </AuthShell>
</template>
