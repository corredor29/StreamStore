<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  Check,
  DollarSign,
  Flame,
  Image as ImageIcon,
  Link,
  PackagePlus,
  Palette,
  Percent,
  Sparkles,
  Tag,
  Tv,
  Upload,
  X
} from '@lucide/vue'
import type { Plataforma, CrearComboPayload } from '@/types'
import { adminService } from '@/services/adminService'
import { formatPrice } from '@/composables/useFormat'

const props = defineProps<{
  isOpen: boolean
  plataformas: Plataforma[]
}>()

const emit = defineEmits<{
  close: []
  created: []
}>()

// Plantillas visuales prediseñadas
export interface PromoTemplate {
  id: string
  name: string
  tag: string
  color: string
  gradient: string
  defaultImage: string
  defaultName: string
  defaultDesc: string
  defaultPrecioRegular: number
  defaultPrecioPromo: number
}

const templates: PromoTemplate[] = [
  {
    id: 'neon_duo',
    name: '2x1 Dúo Cine',
    tag: 'COMBO DÚO 2X1',
    color: '#E50914',
    gradient: 'from-red-600 via-purple-600 to-indigo-900',
    defaultImage: '/watching_netflix.jpg',
    defaultName: 'Combo Dúo Cine: Netflix + Max (HBO)',
    defaultDesc: 'Disfruta de estrenos de cartelera y series exclusivas en 4K Ultra HD.',
    defaultPrecioRegular: 48000,
    defaultPrecioPromo: 32000,
  },
  {
    id: 'family_total',
    name: 'Familiar Total',
    tag: 'AHORRA 35%',
    color: '#113CCF',
    gradient: 'from-blue-600 via-cyan-500 to-slate-900',
    defaultImage: '/watching_disney.jpg',
    defaultName: 'Combo Familiar: Disney+ & Prime Video',
    defaultDesc: 'Todo Marvel, Pixar y deportes ESPN junto con series Prime Video.',
    defaultPrecioRegular: 38000,
    defaultPrecioPromo: 25000,
  },
  {
    id: 'gold_4k',
    name: 'Mega Pack 4K Ultra',
    tag: 'MÁS VENDIDO 🔥',
    color: '#FFB800',
    gradient: 'from-amber-500 via-purple-700 to-neutral-950',
    defaultImage: '/hbo_max_mosaic_bg.jpg',
    defaultName: 'Mega Pack Trío: Netflix + Max + Disney+',
    defaultDesc: 'El paquete definitivo de streaming: 3 servicios premium al mejor precio.',
    defaultPrecioRegular: 65000,
    defaultPrecioPromo: 44900,
  },
  {
    id: 'anime_simulcast',
    name: 'Anime & Series Pro',
    tag: 'SIMULCAST PRO',
    color: '#F47521',
    gradient: 'from-orange-500 via-red-600 to-black',
    defaultImage: '/hero_cinema_wall.jpg',
    defaultName: 'Combo Otaku: Crunchyroll + Netflix',
    defaultDesc: 'Episodios estreno en simultáneo con Japón en Full HD sin anuncios.',
    defaultPrecioRegular: 35000,
    defaultPrecioPromo: 24000,
  },
  {
    id: 'cyber_saving',
    name: 'Super Ahorro 40%',
    tag: 'AHORRO 40%',
    color: '#10B981',
    gradient: 'from-emerald-500 via-teal-700 to-slate-950',
    defaultImage: '/watching_prime.jpg',
    defaultName: 'Super Pack Entretenimiento Completo',
    defaultDesc: 'Cine, series y música Hi-Fi en un solo pago mensual unificado.',
    defaultPrecioRegular: 50000,
    defaultPrecioPromo: 30000,
  },
]

// Estado del Formulario
const selectedTemplateId = ref<string>('neon_duo')
const nombre = ref('Combo Dúo Cine: Netflix + Max (HBO)')
const descripcion = ref('Disfruta de estrenos de cartelera y series exclusivas en 4K Ultra HD.')
const etiquetaPromo = ref('COMBO DÚO 2X1')
const precioRegular = ref<number>(48000)
const precioPromo = ref<number>(32000)
const duracionDias = ref<number>(30)
const pantallasPorPlataforma = ref<number>(1)
const selectedPlatformIds = ref<number[]>([1, 4])

// Manejo de Imagen: Link vs Archivo Local
const imageMode = ref<'template' | 'link' | 'file'>('template')
const customImageUrl = ref('')
const localImageFile = ref<File | null>(null)
const localImagePreview = ref<string | null>(null)

const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

// Seleccionar plantilla
function applyTemplate(tpl: PromoTemplate) {
  selectedTemplateId.value = tpl.id
  nombre.value = tpl.defaultName
  descripcion.value = tpl.defaultDesc
  etiquetaPromo.value = tpl.tag
  precioRegular.value = tpl.defaultPrecioRegular
  precioPromo.value = tpl.defaultPrecioPromo
  if (imageMode.value === 'template') {
    customImageUrl.value = tpl.defaultImage
  }
}

// Imagen calculada final para preview y submit
const finalPreviewImage = computed(() => {
  if (imageMode.value === 'file' && localImagePreview.value) {
    return localImagePreview.value
  }
  if (imageMode.value === 'link' && customImageUrl.value.trim()) {
    return customImageUrl.value.trim()
  }
  const currentTpl = templates.find((t) => t.id === selectedTemplateId.value)
  return currentTpl?.defaultImage || '/hbo_max_mosaic_bg.jpg'
})

// Cálculo de Ahorro
const ahorroMonto = computed(() => Math.max(0, precioRegular.value - precioPromo.value))
const ahorroPorcentaje = computed(() => {
  if (precioRegular.value <= 0) return 0
  return Math.round((ahorroMonto.value / precioRegular.value) * 100)
})

// Plataformas seleccionadas completas
const plataformasSeleccionadas = computed(() => {
  return props.plataformas.filter((p) => selectedPlatformIds.value.includes(p.id))
})

function togglePlatform(id: number) {
  const idx = selectedPlatformIds.value.indexOf(id)
  if (idx >= 0) {
    if (selectedPlatformIds.value.length > 1) {
      selectedPlatformIds.value.splice(idx, 1)
    }
  } else {
    selectedPlatformIds.value.push(id)
  }
}

// Manejador de Archivo Local
function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    localImageFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      localImagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// Envío del Formulario
async function handleSubmit() {
  if (!nombre.value.trim()) {
    errorMessage.value = 'El nombre de la promoción es obligatorio.'
    return
  }
  if (precioPromo.value <= 0) {
    errorMessage.value = 'El precio promocional debe ser mayor a 0.'
    return
  }
  if (precioPromo.value > precioRegular.value) {
    errorMessage.value = 'El precio promocional no puede ser mayor al precio regular.'
    return
  }
  if (selectedPlatformIds.value.length === 0) {
    errorMessage.value = 'Selecciona al menos una plataforma para el combo.'
    return
  }

  isSubmitting.value = true
  errorMessage.value = null

  try {
    let imagenUrl: string | undefined = undefined
    if (imageMode.value === 'link' && customImageUrl.value.trim()) {
      imagenUrl = customImageUrl.value.trim()
    } else if (imageMode.value === 'template') {
      imagenUrl = finalPreviewImage.value
    }

    const payload: CrearComboPayload = {
      nombre: nombre.value.trim(),
      descripcion: descripcion.value.trim() || undefined,
      plataformaIds: selectedPlatformIds.value,
      precioPromo: Number(precioPromo.value),
      precioRegular: Number(precioRegular.value),
      pantallasPorPlataforma: Number(pantallasPorPlataforma.value) || 1,
      duracionDias: Number(duracionDias.value) || 30,
      etiquetaPromo: etiquetaPromo.value.trim() || 'OFERTA ESPECIAL',
      plantilla: selectedTemplateId.value,
      imagenUrl,
      imagenFile: imageMode.value === 'file' ? localImageFile.value : null,
      activo: true,
    }

    await adminService.crearCombo(payload)
    emit('created')
    emit('close')
  } catch (err: any) {
    errorMessage.value = err?.message || 'Error al guardar la promoción.'
  } finally {
    isSubmitting.value = false
  }
}

// Reset al abrir
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      errorMessage.value = null
      applyTemplate(templates[0])
    }
  }
)
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
    <!-- Backdrop con desenfoque profundo -->
    <div
      class="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
      @click="emit('close')"
    />

    <!-- Contenedor Modal de Alto Impacto -->
    <div
      class="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-white/20 bg-neutral-950 p-6 sm:p-8 shadow-[0_25px_80px_rgba(0,0,0,0.95)] z-10 text-white space-y-6"
    >
      <!-- Cabecera -->
      <div class="flex items-start justify-between border-b border-white/10 pb-4">
        <div class="space-y-1">
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold uppercase">
            <Flame class="size-3.5" />
            <span>Configurador de Promociones</span>
          </div>
          <h2 class="font-display text-xl sm:text-2xl font-extrabold tracking-tight">
            Crear Promoción o Combo Multi-Plataforma
          </h2>
          <p class="text-xs sm:text-sm text-slate-400">
            Define una oferta para el catálogo usando plantillas prediseñadas o tu propia imagen por link o archivo local.
          </p>
        </div>

        <button
          type="button"
          class="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          @click="emit('close')"
        >
          <X class="size-5" />
        </button>
      </div>

      <!-- Alerta de Error -->
      <div v-if="errorMessage" class="rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300 flex items-center gap-2">
        <X class="size-4 shrink-0 text-red-400" />
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Contenido en 2 Columnas: Formulario a la izquierda, Live Preview a la derecha -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        <!-- COLUMNA IZQUIERDA: CONFIGURACIÓN -->
        <div class="lg:col-span-7 space-y-5">
          
          <!-- 1. SELECTOR DE PLANTILLAS PREDISEÑADAS -->
          <div class="space-y-2">
            <label class="block text-xs font-mono font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
              <Palette class="size-3.5" />
              <span>Paso 1: Selecciona una plantilla visual</span>
            </label>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                v-for="tpl in templates"
                :key="tpl.id"
                type="button"
                class="rounded-xl border p-2.5 text-left transition-all cursor-pointer relative overflow-hidden group"
                :class="[
                  selectedTemplateId === tpl.id
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.3)] ring-1 ring-cyan-400'
                    : 'border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]'
                ]"
                @click="applyTemplate(tpl)"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                    {{ tpl.name }}
                  </span>
                  <span
                    v-if="selectedTemplateId === tpl.id"
                    class="size-2 rounded-full bg-cyan-400 animate-ping"
                  />
                </div>
                <span class="text-[10px] font-mono text-slate-400 block truncate">
                  {{ tpl.tag }}
                </span>
              </button>
            </div>
          </div>

          <!-- 2. MÉTODO DE IMAGEN: PLANTILLA, LINK O ARCHIVO LOCAL -->
          <div class="space-y-2 pt-2 border-t border-white/10">
            <label class="block text-xs font-mono font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <ImageIcon class="size-3.5" />
              <span>Paso 2: Portada de la promoción</span>
            </label>
            
            <div class="flex rounded-xl border border-white/15 bg-black/60 p-1 gap-1 text-xs font-semibold">
              <button
                type="button"
                class="flex-1 py-1.5 px-2 rounded-lg transition-colors cursor-pointer text-center"
                :class="imageMode === 'template' ? 'bg-white text-black font-bold' : 'text-slate-300 hover:bg-white/10'"
                @click="imageMode = 'template'"
              >
                Plantilla oficial
              </button>
              <button
                type="button"
                class="flex-1 py-1.5 px-2 rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                :class="imageMode === 'link' ? 'bg-white text-black font-bold' : 'text-slate-300 hover:bg-white/10'"
                @click="imageMode = 'link'"
              >
                <Link class="size-3" />
                Por Link (URL)
              </button>
              <button
                type="button"
                class="flex-1 py-1.5 px-2 rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                :class="imageMode === 'file' ? 'bg-white text-black font-bold' : 'text-slate-300 hover:bg-white/10'"
                @click="imageMode = 'file'"
              >
                <Upload class="size-3" />
                Archivo Local
              </button>
            </div>

            <!-- Entrada por Link -->
            <div v-if="imageMode === 'link'" class="space-y-1.5 pt-1">
              <input
                v-model="customImageUrl"
                type="url"
                placeholder="https://ejemplo.com/portada-promo.jpg o /mi-imagen.png"
                class="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              />
              <p class="text-[11px] text-slate-400">
                Pega el enlace directo de la imagen de tu promoción.
              </p>
            </div>

            <!-- Entrada por Archivo Local -->
            <div v-if="imageMode === 'file'" class="space-y-1.5 pt-1">
              <label class="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/25 bg-white/[0.02] hover:bg-white/[0.05] hover:border-cyan-400 p-4 transition-colors cursor-pointer">
                <Upload class="size-6 text-cyan-400 mb-1" />
                <span class="text-xs font-semibold text-white">
                  {{ localImageFile ? localImageFile.name : 'Haz clic para seleccionar imagen local' }}
                </span>
                <span class="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WEBP hasta 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="onFileSelected"
                />
              </label>
            </div>
          </div>

          <!-- 3. PLATAFORMAS INCLUIDAS -->
          <div class="space-y-2 pt-2 border-t border-white/10">
            <label class="block text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Tv class="size-3.5 text-cyan-400" />
              <span>Paso 3: Plataformas incluidas en la oferta</span>
            </label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                v-for="plat in plataformas"
                :key="plat.id"
                type="button"
                class="flex items-center gap-2 p-2 rounded-xl border transition-all cursor-pointer text-left"
                :class="[
                  selectedPlatformIds.includes(plat.id)
                    ? 'border-cyan-400 bg-cyan-950/40 text-white'
                    : 'border-white/10 bg-white/[0.02] text-slate-400 hover:text-white'
                ]"
                @click="togglePlatform(plat.id)"
              >
                <div class="size-6 rounded-md overflow-hidden bg-black/40 flex items-center justify-center shrink-0">
                  <img v-if="plat.logoUrl" :src="plat.logoUrl" :alt="plat.nombre" class="w-full h-full object-contain" />
                  <span v-else class="text-[10px] font-bold">{{ plat.nombre.slice(0, 2) }}</span>
                </div>
                <span class="text-xs font-semibold truncate">{{ plat.nombre }}</span>
              </button>
            </div>
          </div>

          <!-- 4. DATOS DE TEXTO Y PRECIOS -->
          <div class="space-y-3 pt-2 border-t border-white/10">
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Nombre de la promoción</label>
              <input
                v-model="nombre"
                type="text"
                placeholder="Ej. Combo Dúo Cine: Netflix + Max"
                class="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Etiqueta llamativa (Badge)</label>
              <input
                v-model="etiquetaPromo"
                type="text"
                placeholder="Ej. 2X1 DÚO CINE, AHORRA 40%, MÁS VENDIDO"
                class="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Precio Regular (Antes COP)</label>
                <input
                  v-model.number="precioRegular"
                  type="number"
                  min="0"
                  class="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-cyan-300 mb-1">Precio Promo (Lo que paga COP)</label>
                <input
                  v-model.number="precioPromo"
                  type="number"
                  min="0"
                  class="w-full rounded-xl border border-cyan-400/50 bg-cyan-950/30 px-3 py-2 text-xs font-bold text-cyan-300 focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <!-- Resumen de Descuento -->
            <div class="flex items-center justify-between p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-xs">
              <span class="text-slate-300 flex items-center gap-1.5">
                <Percent class="size-3.5 text-emerald-400" />
                Descuento para el cliente:
              </span>
              <span class="font-bold text-emerald-400 font-mono">
                Ahorra {{ formatPrice(ahorroMonto) }} ({{ ahorroPorcentaje }}% OFF)
              </span>
            </div>
          </div>

        </div>

        <!-- COLUMNA DERECHA: LIVE PREVIEW (CÓMO SE VERÁ EN EL CATÁLOGO) -->
        <div class="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div>
            <span class="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Sparkles class="size-3.5 text-amber-400" />
              <span>Vista previa en vivo (Catálogo)</span>
            </span>

            <!-- TARJETA PREVIEW EN VIVO -->
            <div class="rounded-2xl border border-white/20 bg-neutral-900/95 overflow-hidden shadow-2xl relative group">
              <!-- Imagen Portada -->
              <div class="relative aspect-video w-full overflow-hidden bg-black">
                <img
                  :src="finalPreviewImage"
                  :alt="nombre"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/40 pointer-events-none" />

                <!-- Badge de Promoción -->
                <div class="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-mono font-black uppercase tracking-wider shadow-lg">
                  <Flame class="size-3" />
                  <span>{{ etiquetaPromo || 'PROMO' }}</span>
                </div>

                <!-- Logos de las plataformas combinadas -->
                <div class="absolute bottom-2.5 left-2.5 z-10 flex items-center -space-x-1.5">
                  <div
                    v-for="plat in plataformasSeleccionadas"
                    :key="plat.id"
                    class="size-7 rounded-lg border-2 border-black bg-neutral-900 overflow-hidden shadow-md flex items-center justify-center"
                    :style="{ backgroundColor: plat.color || '#8057FF' }"
                  >
                    <img v-if="plat.logoUrl" :src="plat.logoUrl" :alt="plat.nombre" class="w-full h-full object-contain" />
                    <span v-else class="text-[9px] font-bold text-white">{{ plat.nombre.slice(0, 2) }}</span>
                  </div>
                </div>

                <!-- Descuento % -->
                <div class="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-md bg-emerald-500 text-black text-[10px] font-extrabold uppercase font-mono">
                  -{{ ahorroPorcentaje }}%
                </div>
              </div>

              <!-- Contenido de la Tarjeta -->
              <div class="p-4 space-y-3">
                <h4 class="font-display font-bold text-sm text-white line-clamp-1">
                  {{ nombre || 'Nombre de la promoción' }}
                </h4>
                <p class="text-xs text-slate-400 line-clamp-2">
                  {{ descripcion }}
                </p>

                <!-- Bloque de Precios -->
                <div class="pt-2 border-t border-white/10 flex items-baseline justify-between">
                  <div>
                    <span class="text-[10px] text-slate-500 block line-through">
                      {{ formatPrice(precioRegular) }}
                    </span>
                    <span class="font-display text-xl font-extrabold text-white text-cyan-300">
                      {{ formatPrice(precioPromo) }}
                    </span>
                  </div>
                  <span class="text-[11px] font-mono text-purple-300 font-semibold">
                    {{ duracionDias }} días
                  </span>
                </div>

                <!-- Botón preview -->
                <div class="w-full py-2.5 rounded-xl bg-cyan-400 text-black text-center text-xs font-extrabold uppercase tracking-wider pointer-events-none shadow-md">
                  Agregar al carrito
                </div>
              </div>
            </div>
          </div>

          <!-- Botones de Acción -->
          <div class="pt-4 border-t border-white/10 flex items-center gap-3">
            <button
              type="button"
              class="flex-1 py-3 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-colors"
              @click="emit('close')"
            >
              Cancelar
            </button>

            <button
              type="button"
              class="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:brightness-110 text-xs font-black uppercase tracking-wider text-white transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              :disabled="isSubmitting"
              @click="handleSubmit"
            >
              <PackagePlus class="size-4" />
              <span>{{ isSubmitting ? 'Guardando...' : 'Publicar Promoción' }}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>
