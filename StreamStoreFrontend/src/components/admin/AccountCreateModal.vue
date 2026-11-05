<script setup lang="ts">
import { reactive, ref } from 'vue'
import { 
  KeyRound, 
  Lock, 
  Mail, 
  Plus, 
  Trash2, 
  Tv, 
  X 
} from '@lucide/vue'
import type { CrearCuentaPayload, Plataforma } from '@/types'
import { adminService } from '@/services/adminService'
import AppAlert from '@/components/common/AppAlert.vue'

const props = defineProps<{
  plataformas: Plataforma[]
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  created: []
}>()

const form = reactive({
  plataformaId: 1,
  correo: '',
  password: '',
  pantallas: [
    { perfil: 'Perfil 1', pin: '' },
    { perfil: 'Perfil 2', pin: '' },
    { perfil: 'Perfil 3', pin: '' },
    { perfil: 'Perfil 4', pin: '' },
    { perfil: 'Perfil 5', pin: '' },
  ],
})

const errors = reactive<Record<string, string>>({
  correo: '',
  password: '',
  pantallas: '',
})

const isSubmitting = ref(false)
const serverError = ref<string | null>(null)

function addPantalla() {
  if (form.pantallas.length >= 6) return
  form.pantallas.push({
    perfil: `Perfil ${form.pantallas.length + 1}`,
    pin: '',
  })
}

function removePantalla(index: number) {
  if (form.pantallas.length <= 1) return
  form.pantallas.splice(index, 1)
}

function adjustPantallasPorPlataforma() {
  // Ajuste inteligente sugerido según plataforma típica
  const p = props.plataformas.find((x) => x.id === form.plataformaId)
  if (p?.slug === 'max') {
    form.pantallas = [
      { perfil: 'Perfil 1', pin: '' },
      { perfil: 'Perfil 2', pin: '' },
      { perfil: 'Perfil 3', pin: '' },
    ]
  } else if (p?.slug === 'disney') {
    form.pantallas = [
      { perfil: 'Perfil 1', pin: '' },
      { perfil: 'Perfil 2', pin: '' },
      { perfil: 'Perfil 3', pin: '' },
      { perfil: 'Perfil 4', pin: '' },
    ]
  } else if (p?.slug === 'prime') {
    form.pantallas = [
      { perfil: 'Perfil 1', pin: '' },
      { perfil: 'Perfil 2', pin: '' },
      { perfil: 'Perfil 3', pin: '' },
    ]
  } else {
    form.pantallas = [
      { perfil: 'Perfil 1', pin: '' },
      { perfil: 'Perfil 2', pin: '' },
      { perfil: 'Perfil 3', pin: '' },
      { perfil: 'Perfil 4', pin: '' },
      { perfil: 'Perfil 5', pin: '' },
    ]
  }
}

async function onSubmit() {
  errors.correo = ''
  errors.password = ''
  errors.pantallas = ''
  serverError.value = null

  if (!form.correo || !form.correo.includes('@')) {
    errors.correo = 'Ingresa un correo electrónico de cuenta válido.'
  }
  if (!form.password || form.password.length < 6) {
    errors.password = 'La contraseña debe tener al menos 6 caracteres.'
  }
  if (form.pantallas.length === 0) {
    errors.pantallas = 'Debes configurar al menos una pantalla.'
  }

  if (errors.correo || errors.password || errors.pantallas) return

  isSubmitting.value = true
  try {
    const payload: CrearCuentaPayload = {
      plataformaId: form.plataformaId,
      correo: form.correo.trim(),
      password: form.password,
      pantallas: form.pantallas.map((p) => ({
        perfil: p.perfil.trim(),
        pin: p.pin?.trim() || undefined,
      })),
    }

    await adminService.crearCuenta(payload)
    emit('created')
    emit('close')
  } catch (err: any) {
    serverError.value = err?.message || 'Error al cargar la cuenta en inventario.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <div class="card w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 border-brand-500/40 shadow-2xl">
      <!-- Encabezado Modal -->
      <div class="flex items-center justify-between border-b border-line pb-4">
        <div>
          <h2 id="modal-title" class="font-display text-lg font-bold text-fg flex items-center gap-2">
            <Tv class="size-5 text-brand-300" />
            Cargar Cuenta al Inventario
          </h2>
          <p class="text-xs text-muted">
            Configura las credenciales maestras y la distribución de pantallas.
          </p>
        </div>
        <button
          type="button"
          class="text-muted hover:text-fg p-1.5 rounded-lg hover:bg-surface-2"
          aria-label="Cerrar modal"
          @click="emit('close')"
        >
          <X class="size-5" />
        </button>
      </div>

      <!-- Alerta de Error -->
      <AppAlert v-if="serverError" variant="error" title="Error al guardar" class="my-4">
        <p>{{ serverError }}</p>
      </AppAlert>

      <!-- Formulario -->
      <form class="mt-6 space-y-4" @submit.prevent="onSubmit">
        <!-- Plataforma -->
        <div>
          <label for="admin-platform" class="field-label">Plataforma</label>
          <select
            id="admin-platform"
            v-model.number="form.plataformaId"
            class="field-input"
            @change="adjustPantallasPorPlataforma"
          >
            <option v-for="plat in plataformas" :key="plat.id" :value="plat.id">
              {{ plat.nombre }}
            </option>
          </select>
        </div>

        <!-- Correo de la Cuenta -->
        <div>
          <label for="admin-acc-email" class="field-label">Correo electrónico de acceso</label>
          <div class="relative">
            <input
              id="admin-acc-email"
              v-model="form.correo"
              type="email"
              placeholder="cuenta@plataforma.com"
              required
              class="field-input pl-10"
              :aria-invalid="!!errors.correo"
            />
            <Mail class="absolute left-3 top-3 size-4 text-muted" aria-hidden="true" />
          </div>
          <p v-if="errors.correo" class="field-error">{{ errors.correo }}</p>
        </div>

        <!-- Contraseña Maestra -->
        <div>
          <label for="admin-acc-pwd" class="field-label">Contraseña maestra</label>
          <div class="relative">
            <input
              id="admin-acc-pwd"
              v-model="form.password"
              type="text"
              placeholder="Contraseña segura de la cuenta"
              required
              class="field-input pl-10 font-mono"
              :aria-invalid="!!errors.password"
            />
            <Lock class="absolute left-3 top-3 size-4 text-muted" aria-hidden="true" />
          </div>
          <p v-if="errors.password" class="field-error">{{ errors.password }}</p>
        </div>

        <!-- Configuración de Pantallas -->
        <div class="border-t border-line pt-4 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-fg">
              Configuración de Pantallas ({{ form.pantallas.length }})
            </span>
            <button
              type="button"
              class="btn-secondary text-xs py-1 px-2.5 gap-1"
              :disabled="form.pantallas.length >= 6"
              @click="addPantalla"
            >
              <Plus class="size-3.5" />
              <span>Añadir pantalla</span>
            </button>
          </div>

          <div class="space-y-2 max-h-52 overflow-y-auto pr-1">
            <div
              v-for="(pantalla, idx) in form.pantallas"
              :key="idx"
              class="flex items-center gap-2 rounded-lg border border-line bg-surface-2 p-2.5"
            >
              <span class="font-mono text-xs font-bold text-muted w-6 text-center">
                #{{ idx + 1 }}
              </span>

              <input
                v-model="pantalla.perfil"
                type="text"
                placeholder="Nombre de perfil"
                class="field-input text-xs py-1.5 flex-1"
                required
              />

              <div class="relative w-28">
                <input
                  v-model="pantalla.pin"
                  type="text"
                  placeholder="PIN opcional"
                  maxlength="6"
                  class="field-input text-xs py-1.5 pl-7 text-center font-mono"
                />
                <KeyRound class="absolute left-2 top-2 size-3.5 text-muted" />
              </div>

              <button
                type="button"
                class="text-muted hover:text-danger p-1 disabled:opacity-30"
                :disabled="form.pantallas.length <= 1"
                aria-label="Eliminar pantalla"
                @click="removePantalla(idx)"
              >
                <Trash2 class="size-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Acciones del Modal -->
        <div class="flex items-center justify-end gap-3 border-t border-line pt-4">
          <button
            type="button"
            class="btn-secondary text-xs py-2 px-4"
            @click="emit('close')"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="btn-primary text-xs py-2 px-5 font-bold"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting">Guardando cuenta...</span>
            <span v-else>Guardar e Ingresar a Inventario</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
