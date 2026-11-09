<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { 
  Check, 
  Film, 
  Image as ImageIcon, 
  Sparkles, 
  Trash2, 
  Upload, 
  X 
} from '@lucide/vue'
import type { CrearPlataformaPayload, Plataforma } from '@/types'
import { adminService } from '@/services/adminService'
import AppAlert from '@/components/common/AppAlert.vue'

const props = defineProps<{
  isOpen: boolean
  plataformasExistentes: Plataforma[]
}>()

const emit = defineEmits<{
  close: []
  created: [plat: Plataforma]
}>()

const nombre = ref('')
const color = ref('#8057FF')
const coverMode = ref<'local' | 'url'>('local')
const coverUrl = ref('')
const coverPreview = ref<string | null>(null)
const selectedFile = ref<File | null>(null)
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

const isSubmitting = ref(false)
const serverError = ref<string | null>(null)

// Paleta rápida de colores populares para streaming
const coloresSugeridos = [
  { label: 'Rojo (Netflix)', hex: '#E50914' },
  { label: 'Azul (Disney+)', hex: '#113CCF' },
  { label: 'Cian (Prime)', hex: '#00A8E1' },
  { label: 'Púrpura (Max)', hex: '#7B2FF7' },
  { label: 'Verde (Spotify)', hex: '#1DB954' },
  { label: 'Naranja (Crunchyroll)', hex: '#F47521' },
  { label: 'Azul Marino (Paramount+)', hex: '#0064FF' },
  { label: 'Gris Plata (Apple TV)', hex: '#A6AEC5' },
]

const yaExiste = computed(() => {
  const q = nombre.value.trim().toLowerCase()
  if (!q) return false
  return props.plataformasExistentes.some((p) => p.nombre.toLowerCase() === q)
})

function handleFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) processFile(file)
}

function processFile(file: File) {
  if (!file.type.startsWith('image/')) {
    serverError.value = 'Por favor selecciona un archivo de imagen (.png, .jpg, .webp).'
    return
  }
  selectedFile.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    coverPreview.value = (e.target?.result as string) || null
  }
  reader.readAsDataURL(file)
}

function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) processFile(file)
}

function applyUrl() {
  if (coverUrl.value.trim()) {
    coverPreview.value = coverUrl.value.trim()
    selectedFile.value = null
  }
}

function removeCover() {
  coverPreview.value = null
  selectedFile.value = null
  coverUrl.value = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      nombre.value = ''
      color.value = '#8057FF'
      coverMode.value = 'local'
      coverUrl.value = ''
      coverPreview.value = null
      selectedFile.value = null
      serverError.value = null
    }
  }
)

async function onSubmit() {
  serverError.value = null
  const nombreLimpio = nombre.value.trim()
  if (!nombreLimpio) {
    serverError.value = 'Por favor ingresa el nombre de la plataforma (ej. Netflix, Disney+, HBO Max).'
    return
  }

  isSubmitting.value = true
  try {
    const payload: CrearPlataformaPayload = {
      nombre: nombreLimpio,
      color: color.value,
      coverFile: selectedFile.value || undefined,
      coverUrl: coverMode.value === 'url' && coverUrl.value.trim() ? coverUrl.value.trim() : (coverPreview.value || undefined),
    }

    const creada = await adminService.crearPlataforma(payload)
    emit('created', creada)
    emit('close')
  } catch (err: any) {
    serverError.value = err?.message || 'Error al registrar la plataforma.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 select-none"
    role="dialog"
    aria-modal="true"
  >
    <div class="hud-panel w-full max-w-lg max-h-[92vh] overflow-y-auto p-5 sm:p-7 space-y-5">
      <!-- Encabezado Paso 1 -->
      <div class="flex items-start justify-between border-b border-ad-line pb-4">
        <div>
          <h2 class="font-display text-lg font-semibold text-ad-text">
            Nueva Plataforma
          </h2>
          <p class="text-xs text-ad-dim mt-0.5">
            Nombre y portada del servicio (ej. Netflix, Disney+, Max).
          </p>
        </div>

        <button
          type="button"
          class="text-ad-dim hover:text-ad-text p-1 rounded-md transition-colors cursor-pointer"
          @click="emit('close')"
        >
          <X class="size-5" />
        </button>
      </div>

      <AppAlert v-if="serverError" variant="error" title="Error">
        <p>{{ serverError }}</p>
      </AppAlert>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <!-- 1. Nombre de la Plataforma -->
        <div>
          <label class="text-xs font-semibold text-ad-text block mb-1">
            Nombre de la Plataforma / Servicio *
          </label>
          <input
            v-model="nombre"
            type="text"
            placeholder="ej. Netflix, Disney+, HBO Max, Star+..."
            class="w-full rounded-lg border border-ad-line bg-ad-raised px-3.5 py-2 text-xs text-ad-text placeholder:text-ad-dim focus:border-ad-accent focus:outline-none"
          />
          <p v-if="yaExiste" class="text-[11px] text-ad-warn mt-1 font-medium">
            Aviso: Ya existe una plataforma con este nombre en el sistema.
          </p>
        </div>

        <!-- 2. Color Identificador -->
        <div>
          <label class="text-xs font-semibold text-ad-text block mb-1">
            Color de Identidad de Marca
          </label>
          <div class="flex items-center gap-2">
            <input
              v-model="color"
              type="color"
              class="size-8 rounded border border-ad-line bg-transparent cursor-pointer"
            />
            <input
              v-model="color"
              type="text"
              class="w-28 rounded-lg border border-ad-line bg-ad-raised px-2.5 py-1.5 text-xs tabular-nums text-ad-text focus:border-ad-accent focus:outline-none"
            />
          </div>

          <!-- Sugerencias de colores rápidos -->
          <div class="flex flex-wrap gap-1.5 mt-2">
            <button
              v-for="c in coloresSugeridos"
              :key="c.hex"
              type="button"
              class="size-5 rounded-full border border-ad-line transition-transform hover:scale-110 cursor-pointer"
              :style="{ backgroundColor: c.hex }"
              :title="c.label"
              @click="color = c.hex"
            />
          </div>
        </div>

        <!-- 3. Subir Imagen de Portada (Local vs Link URL) -->
        <div class="space-y-2 border-t border-ad-line pt-3">
          <div class="flex items-center justify-between">
            <label class="text-xs font-semibold text-ad-text">
              Imagen de Portada / Logo de la Plataforma
            </label>

            <!-- Toggle Modo Subida -->
            <div class="flex items-center gap-1 rounded bg-ad-raised p-0.5 border border-ad-line text-[11px]">
              <button
                type="button"
                class="px-2.5 py-1 rounded transition-colors cursor-pointer"
                :class="coverMode === 'local' ? 'bg-ad-accent/20 text-ad-accent-text font-semibold' : 'text-ad-dim hover:text-ad-text'"
                @click="coverMode = 'local'"
              >
                Subir Local
              </button>
              <button
                type="button"
                class="px-2.5 py-1 rounded transition-colors cursor-pointer"
                :class="coverMode === 'url' ? 'bg-ad-accent/20 text-ad-accent-text font-semibold' : 'text-ad-dim hover:text-ad-text'"
                @click="coverMode = 'url'"
              >
                Pegar Link (URL)
              </button>
            </div>
          </div>

          <!-- Vista Previa si hay imagen -->
          <div v-if="coverPreview" class="relative rounded-lg overflow-hidden border border-ad-line bg-black/60">
            <div class="aspect-video w-full max-h-40 overflow-hidden flex items-center justify-center bg-black/60">
              <img
                :src="coverPreview"
                alt="Vista previa"
                class="w-full h-full object-cover"
              />
            </div>
            <button
              type="button"
              class="absolute top-2 right-2 p-1.5 rounded-md bg-black/60 hover:bg-ad-err text-ad-text transition-colors cursor-pointer"
              title="Quitar imagen"
              @click="removeCover"
            >
              <Trash2 class="size-3.5" />
            </button>
          </div>

          <!-- Opción A: Archivo Local -->
          <div
            v-else-if="coverMode === 'local'"
            class="border-2 border-dashed rounded-lg p-5 text-center transition-colors cursor-pointer"
            :class="isDragging ? 'border-ad-accent bg-ad-accent/20' : 'border-ad-line hover:border-ad-line bg-ad-raised'"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop="onDrop"
            @click="fileInputRef?.click()"
          >
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleFileChange"
            />
            <Upload class="size-6 text-ad-accent-text mx-auto mb-2" />
            <p class="text-xs font-semibold text-ad-text">Haz clic o arrastra la imagen aquí</p>
            <p class="text-[10px] text-ad-dim mt-0.5">Soporta PNG, JPG o WEBP</p>
          </div>

          <!-- Opción B: Enlace URL -->
          <div v-else class="flex gap-2">
            <input
              v-model="coverUrl"
              type="url"
              placeholder="https://ejemplo.com/portada-netflix.jpg"
              class="flex-1 rounded-lg border border-ad-line bg-ad-raised px-3 py-2 text-xs text-ad-text placeholder:text-ad-dim focus:border-ad-accent focus:outline-none"
            />
            <button
              type="button"
              class="px-3 py-2 rounded-lg bg-ad-raised hover:bg-ad-hover text-xs font-semibold text-ad-text border border-ad-line cursor-pointer"
              @click="applyUrl"
            >
              Cargar
            </button>
          </div>
        </div>

        <!-- Acciones Inferiores -->
        <div class="flex items-center justify-end gap-2.5 border-t border-ad-line pt-4">
          <button
            type="button"
            class="px-3.5 py-2 rounded-lg text-xs font-semibold text-ad-text hover:text-ad-text hover:bg-ad-hover transition-colors cursor-pointer"
            @click="emit('close')"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-2 rounded-lg bg-ad-accent hover:bg-ad-accent text-neutral-950 text-xs font-semibold transition-colors cursor-pointer"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting">Guardando plataforma...</span>
            <span v-else>Guardar Plataforma</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
