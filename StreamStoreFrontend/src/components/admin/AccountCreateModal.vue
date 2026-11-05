<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { 
  Check, 
  Image as ImageIcon, 
  Info, 
  Sparkles, 
  Trash2, 
  Tv, 
  Upload, 
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

// Campos del formulario
const nombrePlataforma = ref('')
const plataformaId = ref<number | null>(null)
const coverPreview = ref<string | null>(null)
const coverInputMode = ref<'upload' | 'url'>('upload')
const coverUrlInput = ref('')
const totalPantallas = ref<number>(5)

// Estado de UI de autocompletado
const showSuggestions = ref(false)
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

const errors = reactive<Record<string, string>>({
  nombre: '',
  cover: '',
})

const isSubmitting = ref(false)
const serverError = ref<string | null>(null)

// Sugerencias de autocompletado basadas en lo que escribe el admin
const plataformasSugeridas = computed(() => {
  const query = nombrePlataforma.value.trim().toLowerCase()
  if (!query) {
    return props.plataformas.slice(0, 6)
  }
  return props.plataformas.filter((p) =>
    p.nombre.toLowerCase().includes(query)
  )
})

// Detección de coincidencia exacta con plataforma registrada
const plataformaExistente = computed(() => {
  const query = nombrePlataforma.value.trim().toLowerCase()
  if (!query) return null
  return props.plataformas.find((p) => p.nombre.toLowerCase() === query) || null
})

// Al escribir en el input de plataforma
function onNombreInput() {
  errors.nombre = ''
  showSuggestions.value = true
  const match = props.plataformas.find(
    (p) => p.nombre.toLowerCase() === nombrePlataforma.value.trim().toLowerCase()
  )
  if (match) {
    plataformaId.value = match.id
    if (!coverPreview.value && match.coverUrl) {
      coverPreview.value = match.coverUrl
    }
  } else {
    plataformaId.value = null
  }
}

// Seleccionar una sugerencia del autocompletado
function selectSugerencia(plat: Plataforma) {
  nombrePlataforma.value = plat.nombre
  plataformaId.value = plat.id
  showSuggestions.value = false
  if (plat.coverUrl && !coverPreview.value) {
    coverPreview.value = plat.coverUrl
  }
}

// Manejo de subida de archivo para foto de portada
function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  processFile(file)
}

function processFile(file?: File) {
  if (!file) return
  if (!file.type.startsWith('image/')) {
    errors.cover = 'Por favor selecciona un archivo de imagen válido (.png, .jpg, .webp).'
    return
  }
  errors.cover = ''
  const reader = new FileReader()
  reader.onload = (e) => {
    coverPreview.value = (e.target?.result as string) || null
  }
  reader.readAsDataURL(file)
}

function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function onDragLeave(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  processFile(file)
}

function applyCoverUrl() {
  if (!coverUrlInput.value.trim()) return
  coverPreview.value = coverUrlInput.value.trim()
  errors.cover = ''
}

function removeCover() {
  coverPreview.value = null
  coverUrlInput.value = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// Reset al abrir o cerrar modal
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      nombrePlataforma.value = ''
      plataformaId.value = null
      coverPreview.value = null
      coverUrlInput.value = ''
      totalPantallas.value = 5
      errors.nombre = ''
      errors.cover = ''
      serverError.value = null
      showSuggestions.value = false
    }
  }
)

async function onSubmit() {
  errors.nombre = ''
  errors.cover = ''
  serverError.value = null

  const nombreLimpio = nombrePlataforma.value.trim()
  if (!nombreLimpio) {
    errors.nombre = 'Ingresa el nombre de la plataforma (ej. Netflix, Disney+, Max...).'
    return
  }

  isSubmitting.value = true
  try {
    const payload: CrearCuentaPayload = {
      plataformaId: plataformaId.value || undefined,
      nombrePlataforma: nombreLimpio,
      coverUrl: coverPreview.value || undefined,
      totalPantallas: totalPantallas.value,
      pantallas: Array.from({ length: totalPantallas.value }, (_, i) => ({
        perfil: `Perfil ${i + 1}`,
      })),
    }

    await adminService.crearCuenta(payload)
    emit('created')
    emit('close')
  } catch (err: any) {
    serverError.value = err?.message || 'Error al registrar la cuenta en el inventario.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    @click.self="showSuggestions = false"
  >
    <div class="card w-full max-w-xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 border-brand-500/40 shadow-2xl bg-[#10152A]">
      <!-- Encabezado Modal -->
      <div class="flex items-start justify-between border-b border-line pb-4">
        <div>
          <h2 id="modal-title" class="font-display text-lg sm:text-xl font-bold text-fg flex items-center gap-2">
            <Tv class="size-5 text-brand-300" />
            <span>Cargar Cuenta al Inventario</span>
          </h2>
          <p class="text-xs text-muted mt-1">
            Registra la plataforma y portada para habilitar la disponibilidad en catálogo.
          </p>
        </div>
        <button
          type="button"
          class="text-muted hover:text-fg p-1.5 rounded-lg hover:bg-surface-2 transition-colors"
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

      <!-- Formulario Adaptado al Nuevo Flujo -->
      <form class="mt-6 space-y-6" @submit.prevent="onSubmit">
        
        <!-- ================= 1. NOMBRE DE PLATAFORMA CON AUTOCOMPLETADO ================= -->
        <div class="relative space-y-1.5">
          <label for="admin-platform-input" class="field-label flex items-center justify-between">
            <span>Nombre de la Plataforma *</span>
            <span v-if="plataformaExistente" class="text-[11px] font-mono text-cyan-400 font-normal flex items-center gap-1">
              <Check class="size-3 text-cyan-400" />
              <span>Plataforma existente</span>
            </span>
            <span v-else-if="nombrePlataforma.trim()" class="text-[11px] font-mono text-brand-300 font-normal flex items-center gap-1">
              <Sparkles class="size-3 text-brand-300" />
              <span>Nueva plataforma a registrar</span>
            </span>
          </label>

          <div class="relative">
            <input
              id="admin-platform-input"
              v-model="nombrePlataforma"
              type="text"
              autocomplete="off"
              placeholder="Escribe o busca (ej. Netflix, Disney+, Max, Apple TV+...)"
              class="field-input pl-10 pr-10"
              :class="{ 'border-danger': !!errors.nombre }"
              @input="onNombreInput"
              @focus="showSuggestions = true"
            />
            <Tv class="absolute left-3 top-3 size-4 text-muted" aria-hidden="true" />

            <button
              v-if="nombrePlataforma"
              type="button"
              class="absolute right-3 top-3 text-muted hover:text-white"
              title="Limpiar campo"
              @click="nombrePlataforma = ''; plataformaId = null; showSuggestions = true"
            >
              <X class="size-4" />
            </button>
          </div>
          <p v-if="errors.nombre" class="field-error">{{ errors.nombre }}</p>

          <!-- Menú Flotante de Sugerencias de Autocompletado -->
          <div
            v-if="showSuggestions && plataformasSugeridas.length > 0"
            class="absolute top-full left-0 right-0 z-30 mt-1 max-h-52 overflow-y-auto rounded-xl border border-line/80 bg-[#151B32] shadow-2xl backdrop-blur-lg divide-y divide-line/40"
          >
            <div class="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-muted bg-[#10152A]">
              Sugerencias rápidas (puedes elegir o seguir escribiendo):
            </div>
            <button
              v-for="plat in plataformasSugeridas"
              :key="plat.id"
              type="button"
              class="w-full flex items-center justify-between px-3 py-2.5 text-left text-xs hover:bg-surface-2 transition-colors group"
              @click="selectSugerencia(plat)"
            >
              <div class="flex items-center gap-2.5">
                <span
                  class="size-2.5 rounded-full"
                  :style="{ backgroundColor: plat.color || '#8057FF' }"
                />
                <span class="font-semibold text-fg group-hover:text-cyan-300 transition-colors">
                  {{ plat.nombre }}
                </span>
              </div>
              <span class="text-[10px] font-mono text-muted group-hover:text-fg">
                Autocompletar ↵
              </span>
            </button>
          </div>
        </div>

        <!-- ================= 2. FOTO DE LA PORTADA DE LA PLATAFORMA ================= -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="field-label mb-0">Foto de Portada de la Plataforma</label>
            <div class="flex items-center gap-2 text-xs">
              <button
                type="button"
                class="px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition-colors"
                :class="coverInputMode === 'upload' ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40' : 'text-muted hover:text-fg'"
                @click="coverInputMode = 'upload'"
              >
                Subir Archivo
              </button>
              <button
                type="button"
                class="px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition-colors"
                :class="coverInputMode === 'url' ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40' : 'text-muted hover:text-fg'"
                @click="coverInputMode = 'url'"
              >
                Pegar URL
              </button>
            </div>
          </div>

          <!-- Previsualización si ya hay imagen cargada -->
          <div v-if="coverPreview" class="relative group rounded-xl overflow-hidden border border-line bg-black/40">
            <div class="aspect-video w-full overflow-hidden flex items-center justify-center bg-black/60">
              <img
                :src="coverPreview"
                alt="Vista previa de portada"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <!-- Overlay con botón para eliminar portada -->
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                class="px-3 py-1.5 rounded-lg bg-danger/80 hover:bg-danger text-white text-xs font-bold flex items-center gap-1.5 shadow-lg"
                @click="removeCover"
              >
                <Trash2 class="size-3.5" />
                <span>Quitar portada</span>
              </button>
            </div>
            <div class="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-cyan-300">
              Portada lista para mostrarse en catálogo
            </div>
          </div>

          <!-- Modo 1: Zona Drag & Drop de Subida -->
          <div
            v-else-if="coverInputMode === 'upload'"
            class="relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer group"
            :class="[
              isDragging ? 'border-cyan-400 bg-cyan-950/20' : 'border-line/80 hover:border-brand-500/60 bg-surface/40',
            ]"
            @dragover="onDragOver"
            @dragleave="onDragLeave"
            @drop="onDrop"
            @click="fileInputRef?.click()"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept="image/png, image/jpeg, image/webp"
              class="hidden"
              @change="handleFileChange"
            />
            <div class="flex flex-col items-center justify-center gap-2">
              <div class="size-11 rounded-xl bg-surface-2 border border-line/60 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload class="size-5 text-cyan-400" />
              </div>
              <div>
                <p class="text-xs font-semibold text-fg">
                  Haz clic para seleccionar o arrastra la foto de portada
                </p>
                <p class="text-[11px] text-muted mt-0.5">
                  Formatos recomendados: PNG, JPG o WEBP (Relación 16:9)
                </p>
              </div>
            </div>
          </div>

          <!-- Modo 2: Ingresar URL Directa -->
          <div v-else class="flex gap-2">
            <div class="relative flex-1">
              <input
                v-model="coverUrlInput"
                type="url"
                placeholder="https://ejemplo.com/portada-streaming.jpg"
                class="field-input pl-9 text-xs"
              />
              <ImageIcon class="absolute left-3 top-2.5 size-4 text-muted" />
            </div>
            <button
              type="button"
              class="btn-secondary text-xs px-3"
              @click="applyCoverUrl"
            >
              Cargar
            </button>
          </div>
          <p v-if="errors.cover" class="field-error">{{ errors.cover }}</p>
        </div>

        <!-- ================= 3. DISTRIBUCIÓN DE CUPOS / PANTALLAS ================= -->
        <div class="space-y-2 border-t border-line pt-4">
          <label class="field-label flex items-center justify-between">
            <span>Capacidad / Cupos de Pantallas</span>
            <span class="font-mono text-xs text-brand-300 font-bold">
              {{ totalPantallas }} {{ totalPantallas === 1 ? 'Pantalla' : 'Pantallas' }}
            </span>
          </label>
          <div class="grid grid-cols-5 gap-2">
            <button
              v-for="num in [1, 2, 3, 4, 5]"
              :key="num"
              type="button"
              class="py-2 rounded-lg text-xs font-mono font-bold border transition-all"
              :class="[
                totalPantallas === num
                  ? 'border-cyan-400 bg-cyan-950/60 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : 'border-line bg-surface hover:bg-surface-2 text-muted hover:text-fg'
              ]"
              @click="totalPantallas = num"
            >
              {{ num }} {{ num === 1 ? 'cupo' : 'cupos' }}
            </button>
          </div>
        </div>

        <!-- ================= NOTA INFORMATIVA DEL FLUJO DE ENTREGA ================= -->
        <div class="rounded-xl border border-cyan-400/30 bg-cyan-950/30 p-3.5 flex items-start gap-3">
          <Info class="size-4 text-cyan-400 shrink-0 mt-0.5" />
          <div class="text-xs text-cyan-200/90 leading-relaxed">
            <strong class="text-white block font-semibold mb-0.5">Entrega bajo demanda:</strong>
            No es necesario ingresar correo ni contraseña ahora. Cuando un cliente realice la compra, tú como administrador le asignarás directamente las credenciales de acceso y el PIN desde el panel de órdenes.
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
            class="btn-primary text-xs py-2 px-5 font-bold shadow-lg shadow-brand-500/25"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting">Guardando en inventario...</span>
            <span v-else>Guardar e Ingresar a Inventario</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
