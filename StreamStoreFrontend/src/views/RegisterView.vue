<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { Eye, EyeOff, Lock, Mail, User } from '@lucide/vue'
import AppLogo from '@/components/layout/AppLogo.vue'
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

    // Redirección directa al panel de cliente
    await router.push('/mi-cuenta')
  } catch (err: any) {
    serverError.value = err?.message || 'Error al crear la cuenta. Intenta nuevamente.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="container-app flex min-h-[calc(100vh-14rem)] items-center justify-center py-12">
    <div class="card w-full max-w-md p-6 sm:p-8">
      <!-- Encabezado con Logotipo StreamStore -->
      <div class="text-center">
        <div class="flex justify-center mb-5">
          <AppLogo size="lg" />
        </div>
        <h1 class="mt-2 font-display text-2xl font-black text-fg sm:text-3xl tracking-tight">
          Crear Cuenta
        </h1>
        <p class="mt-2 text-sm text-muted">
          Regístrate para comprar y gestionar tus cuentas de streaming.
        </p>
      </div>

      <!-- Alerta de Error -->
      <AppAlert
        v-if="serverError"
        variant="error"
        title="Error al registrarse"
        class="mt-4"
      >
        <p>{{ serverError }}</p>
      </AppAlert>

      <!-- Formulario -->
      <form class="mt-6 space-y-4" novalidate @submit.prevent="onSubmit">
        <!-- Campo Nombre -->
        <div>
          <label for="register-name" class="field-label">Nombre completo</label>
          <div class="relative">
            <input
              id="register-name"
              v-model="form.nombre"
              type="text"
              autocomplete="name"
              placeholder="Ej. Juan Pérez"
              required
              class="field-input pl-10"
              :aria-invalid="!!errors.nombre"
              :aria-describedby="errors.nombre ? 'register-name-error' : undefined"
              @blur="validateField('nombre')"
            />
            <User class="absolute left-3 top-3 size-4 text-muted" aria-hidden="true" />
          </div>
          <p v-if="errors.nombre" id="register-name-error" class="field-error" role="alert">
            {{ errors.nombre }}
          </p>
        </div>

        <!-- Campo Correo -->
        <div>
          <label for="register-email" class="field-label">Correo electrónico</label>
          <div class="relative">
            <input
              id="register-email"
              v-model="form.email"
              type="email"
              autocomplete="email"
              placeholder="nombre@ejemplo.com"
              required
              class="field-input pl-10"
              :aria-invalid="!!errors.email"
              :aria-describedby="errors.email ? 'register-email-error' : undefined"
              @blur="validateField('email')"
            />
            <Mail class="absolute left-3 top-3 size-4 text-muted" aria-hidden="true" />
          </div>
          <p v-if="errors.email" id="register-email-error" class="field-error" role="alert">
            {{ errors.email }}
          </p>
        </div>

        <!-- Campo Contraseña -->
        <div>
          <label for="register-password" class="field-label">Contraseña</label>
          <div class="relative">
            <input
              id="register-password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="Mínimo 6 caracteres"
              required
              class="field-input pl-10 pr-10"
              :aria-invalid="!!errors.password"
              :aria-describedby="errors.password ? 'register-password-error' : undefined"
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
          <p v-if="errors.password" id="register-password-error" class="field-error" role="alert">
            {{ errors.password }}
          </p>
        </div>

        <!-- Campo Confirmar Contraseña -->
        <div>
          <label for="register-confirm-password" class="field-label">Confirmar contraseña</label>
          <div class="relative">
            <input
              id="register-confirm-password"
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              autocomplete="new-password"
              placeholder="Repite tu contraseña"
              required
              class="field-input pl-10 pr-10"
              :aria-invalid="!!errors.confirmPassword"
              :aria-describedby="errors.confirmPassword ? 'register-confirm-password-error' : undefined"
              @blur="validateField('confirmPassword')"
            />
            <Lock class="absolute left-3 top-3 size-4 text-muted" aria-hidden="true" />
            <button
              type="button"
              class="absolute right-3 top-2.5 text-muted hover:text-fg focus:outline-none"
              :aria-label="showConfirmPassword ? 'Ocultar confirmación' : 'Ver confirmación'"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <component :is="showConfirmPassword ? EyeOff : Eye" class="size-4" aria-hidden="true" />
            </button>
          </div>
          <p v-if="errors.confirmPassword" id="register-confirm-password-error" class="field-error" role="alert">
            {{ errors.confirmPassword }}
          </p>
        </div>

        <!-- Botón de Registro -->
        <button
          type="submit"
          class="btn-primary w-full py-3"
          :disabled="isSubmitting"
          :aria-busy="isSubmitting"
        >
          <span v-if="isSubmitting">Creando cuenta...</span>
          <span v-else>Crear cuenta gratuita</span>
        </button>
      </form>

      <!-- Pie con enlace a Login -->
      <p class="mt-6 text-center text-xs text-muted">
        ¿Ya tienes una cuenta?
        <RouterLink to="/login" class="font-semibold text-brand-300 hover:text-brand-200 underline underline-offset-4">
          Inicia sesión aquí
        </RouterLink>
      </p>
    </div>
  </div>
</template>
