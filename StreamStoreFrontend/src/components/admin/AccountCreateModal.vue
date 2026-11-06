<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { 
  Check, 
  Coins, 
  Flame, 
  Image as ImageIcon, 
  KeyRound, 
  Layers, 
  Lock, 
  Mail, 
  Minus, 
  PackagePlus, 
  Plus, 
  Sparkles, 
  Trash2, 
  Tv, 
  Upload, 
  X 
} from '@lucide/vue'
import type { CrearComboPayload, CrearCuentaPayload, Plataforma } from '@/types'
import { adminService } from '@/services/adminService'
import AppAlert from '@/components/common/AppAlert.vue'
import { formatPrice } from '@/composables/useFormat'

const props = withDefaults(
  defineProps<{
    plataformas: Plataforma[]
    isOpen: boolean
    initialMode?: 'cuenta' | 'combo'
  }>(),
  {
    initialMode: 'cuenta',
  }
)

const emit = defineEmits<{
  close: []
  created: []
  comboCreated: []
}>()

// Modo del Modal: Cuenta Individual vs Combo / Promoción
const modalMode = ref<'cuenta' | 'combo'>('cuenta')

// ========== ESTADO PARA MODO CUENTA ==========
const nombrePlataforma = ref('')
const plataformaId = ref<number | null>(null)
const correoMaestro = ref('')
const claveMaestra = ref('')
const totalPantallas = ref<number>(4)
const pantallasList = ref<Array<{ numero: number; perfil: string; pin: string }>>([
  { numero: 1, perfil: 'Perfil 1 (Principal)', pin: '' },
  { numero: 2, perfil: 'Perfil 2', pin: '' },
  { numero: 3, perfil: 'Perfil 3', pin: '' },
  { numero: 4, perfil: 'Perfil 4', pin: '' },
])

const coverPreview = ref<string | null>(null)
const selectedCoverFile = ref<File | null>(null)
const coverInputMode = ref<'upload' | 'url'>('upload')
const coverUrlInput = ref('')
const showSuggestions = ref(false)
const isDragging = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

// ========== ESTADO PARA MODO COMBO / PROMOCIÓN ==========
const comboNombre = ref('')
const comboPlataformasSeleccionadas = ref<number[]>([1, 4]) // Default: Netflix (1) + Max (4)
const comboPrecioPromo = ref<number>(32000)
const comboPrecioRegular = ref<number>(48000)
const comboPantallasPorPlat = ref<number>(1)
const comboDuracion = ref<number>(30)
const comboEtiqueta = ref<string>('COMBO DÚO 2X1')
const comboDescripcion = ref('')

const isSubmitting = ref(false)
const serverError = ref<string | null>(null)

// Ajuste dinámico de la lista de pantallas al cambiar totalPantallas
function adjustScreens(count: number) {
  const newCount = Math.max(1, Math.min(10, count))
  totalPantallas.value = newCount
  const current = [...pantallasList.value]

  if (newCount > current.length) {
    for (let i = current.length + 1; i <= newCount; i++) {
      current.push({
        numero: i,
        perfil: `Perfil ${i}`,
        pin: '',
      })
    }
  } else if (newCount < current.length) {
    current.splice(newCount)
  }
  pantallasList.value = current
}

// Sugerencias de plataformas
const plataformasSugeridas = computed(() => {
  const query = nombrePlataforma.value.trim().toLowerCase()
  if (!query) return props.plataformas.slice(0, 6)
  return props.plataformas.filter((p) => p.nombre.toLowerCase().includes(query))
})

const plataformaExistente = computed(() => {
  const query = nombrePlataforma.value.trim().toLowerCase()
  if (!query) return null
  return props.plataformas.find((p) => p.nombre.toLowerCase() === query) || null
})

function onNombreInput() {
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

function selectSugerencia(plat: Plataforma) {
  nombrePlataforma.value = plat.nombre
  plataformaId.value = plat.id
  showSuggestions.value = false
  if (plat.coverUrl && !coverPreview.value) {
    coverPreview.value = plat.coverUrl
  }
}

// Portadas
function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    selectedCoverFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      coverPreview.value = (e.target?.result as string) || null
    }
    reader.readAsDataURL(file)
  }
}

function removeCover() {
  coverPreview.value = null
  selectedCoverFile.value = null
  coverUrlInput.value = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
}

// Reset al abrir
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      modalMode.value = props.initialMode || 'cuenta'
      serverError.value = null
      if (modalMode.value === 'cuenta') {
        nombrePlataforma.value = ''
        plataformaId.value = null
        correoMaestro.value = ''
        claveMaestra.value = ''
        adjustScreens(4)
      } else {
        comboNombre.value = 'Combo Dúo: Netflix + Max HBO'
        comboPlataformasSeleccionadas.value = [1, 4]
        comboPrecioPromo.value = 32000
        comboPrecioRegular.value = 48000
        comboEtiqueta.value = 'COMBO DÚO 2X1'
      }
    }
  }
)

// Alternar selección de plataformas en modo Combo
function togglePlataformaCombo(id: number) {
  const idx = comboPlataformasSeleccionadas.value.indexOf(id)
  if (idx !== -1) {
    if (comboPlataformasSeleccionadas.value.length > 1) {
      comboPlataformasSeleccionadas.value.splice(idx, 1)
    }
  } else {
    comboPlataformasSeleccionadas.value.push(id)
  }
  // Auto-actualizar nombre del combo si es por defecto
  const nombres = comboPlataformasSeleccionadas.value
    .map((pid) => props.plataformas.find((p) => p.id === pid)?.nombre || '')
    .filter(Boolean)
  comboNombre.value = `Combo ${nombres.length === 2 ? 'Dúo' : nombres.length === 3 ? 'Trío' : 'Especial'}: ${nombres.join(' + ')}`
}

// Guardar
async function onSubmit() {
  serverError.value = null
  isSubmitting.value = true

  try {
    if (modalMode.value === 'cuenta') {
      const nombreLimpio = nombrePlataforma.value.trim()
      if (!nombreLimpio) {
        serverError.value = 'Por favor escribe el nombre de la plataforma (ej. Netflix, Disney+, Max).'
        isSubmitting.value = false
        return
      }

      const payload: CrearCuentaPayload = {
        plataformaId: plataformaId.value || undefined,
        nombrePlataforma: nombreLimpio,
        coverUrl: coverPreview.value || undefined,
        coverFile: selectedCoverFile.value || undefined,
        correo: correoMaestro.value.trim() || undefined,
        password: claveMaestra.value.trim() || undefined,
        totalPantallas: totalPantallas.value,
        pantallas: pantallasList.value.map((p) => ({
          perfil: p.perfil.trim() || `Perfil ${p.numero}`,
          pin: p.pin.trim() || undefined,
        })),
      }

      await adminService.crearCuenta(payload)
      emit('created')
      emit('close')
    } else {
      // Guardar Combo / Promoción
      if (comboPlataformasSeleccionadas.value.length < 2) {
        serverError.value = 'Selecciona al menos 2 plataformas para armar un combo promocional.'
        isSubmitting.value = false
        return
      }

      const comboPayload: CrearComboPayload = {
        nombre: comboNombre.value.trim() || 'Combo Multi-Streaming',
        descripcion: comboDescripcion.value.trim() || 'Paquete combinado de plataformas digitales con entrega de perfiles.',
        plataformaIds: comboPlataformasSeleccionadas.value,
        precioPromo: Number(comboPrecioPromo.value) || 29900,
        precioRegular: Number(comboPrecioRegular.value) || 45000,
        pantallasPorPlataforma: Number(comboPantallasPorPlat.value) || 1,
        duracionDias: Number(comboDuracion.value) || 30,
        etiquetaPromo: comboEtiqueta.value.trim() || 'OFERTA ESPECIAL',
        activo: true,
      }

      await adminService.crearCombo(comboPayload)
      emit('comboCreated')
      emit('close')
    }
  } catch (err: any) {
    serverError.value = err?.message || 'Error al guardar los datos en el inventario.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm select-none animate-fade-in"
    role="dialog"
    aria-modal="true"
    @click.self="showSuggestions = false"
  >
    <div class="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-line/80 bg-[#0E1324] p-5 sm:p-7 shadow-2xl space-y-5">
      <!-- Encabezado con Switch de Modo (Cuenta vs Promoción) -->
      <div class="flex items-start justify-between border-b border-line/60 pb-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="rounded bg-brand-500/15 border border-brand-500/30 px-2 py-0.2 text-[10px] font-black text-brand-300 uppercase">
              {{ modalMode === 'cuenta' ? 'Inventario Maestro' : 'Promociones & Ofertas' }}
            </span>
          </div>
          <h2 class="font-display text-lg sm:text-xl font-black text-fg">
            {{ modalMode === 'cuenta' ? 'Cargar Nueva Cuenta de Streaming' : 'Crear Combo o Promoción Multi-Servicio' }}
          </h2>
          <p class="text-xs text-muted mt-0.5">
            {{ modalMode === 'cuenta' ? 'Registra una cuenta matriz y define la cantidad exacta de perfiles y pines.' : 'Arma promociones cruzadas (ej. Netflix + Max) para vender como paquete.' }}
          </p>
        </div>

        <button
          type="button"
          class="text-muted hover:text-fg p-1.5 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer"
          @click="emit('close')"
        >
          <X class="size-5" />
        </button>
      </div>

      <!-- Selector de Modo: [ Cuenta Individual ] vs [ Combo / Promoción ] -->
      <div class="grid grid-cols-2 gap-2 p-1 rounded-xl bg-surface-2 border border-line/60">
        <button
          type="button"
          class="flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
          :class="[
            modalMode === 'cuenta'
              ? 'bg-brand-500 text-white shadow-md'
              : 'text-muted hover:text-fg'
          ]"
          @click="modalMode = 'cuenta'"
        >
          <Tv class="size-3.5" />
          <span>Cuenta Individual (1 Servicio)</span>
        </button>

        <button
          type="button"
          class="flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
          :class="[
            modalMode === 'combo'
              ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-md'
              : 'text-muted hover:text-fg'
          ]"
          @click="modalMode = 'combo'"
        >
          <Flame class="size-3.5" />
          <span>Combo / Promoción (ej. Netflix + Max)</span>
        </button>
      </div>

      <!-- Alerta de Error -->
      <AppAlert v-if="serverError" variant="error" title="Atención" class="my-2">
        <p>{{ serverError }}</p>
      </AppAlert>

      <!-- ============================================================== -->
      <!-- FORMULARIO 1: CUENTA INDIVIDUAL (CON CANTIDAD DE PANTALLAS)     -->
      <!-- ============================================================== -->
      <form v-if="modalMode === 'cuenta'" class="space-y-5" @submit.prevent="onSubmit">
        <!-- Plataforma -->
        <div class="relative space-y-1.5">
          <label class="text-xs font-bold text-fg flex items-center justify-between">
            <span>Plataforma de Streaming *</span>
            <span v-if="plataformaExistente" class="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <Check class="size-3" /> Plataforma registrada
            </span>
          </label>
          <div class="relative">
            <input
              v-model="nombrePlataforma"
              type="text"
              autocomplete="off"
              placeholder="Escribe o selecciona (ej. Netflix, Disney+, Max, Prime...)"
              class="field-input pl-9 text-xs"
              @input="onNombreInput"
              @focus="showSuggestions = true"
            />
            <Tv class="absolute left-3 top-2.5 size-4 text-muted" />
          </div>

          <!-- Sugerencias rápidas -->
          <div
            v-if="showSuggestions && plataformasSugeridas.length > 0"
            class="absolute top-full left-0 right-0 z-30 mt-1 max-h-48 overflow-y-auto rounded-xl border border-line bg-[#151B32] shadow-2xl divide-y divide-line/40"
          >
            <button
              v-for="plat in plataformasSugeridas"
              :key="plat.id"
              type="button"
              class="w-full flex items-center justify-between px-3 py-2 text-left text-xs hover:bg-surface-2 transition-colors cursor-pointer"
              @click="selectSugerencia(plat)"
            >
              <span class="font-semibold text-fg">{{ plat.nombre }}</span>
              <span class="text-[10px] text-muted">Seleccionar ↵</span>
            </button>
          </div>
        </div>

        <!-- Credenciales Maestras Opcionales -->
        <div class="rounded-xl border border-line/60 bg-[#0A0E1A] p-3.5 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-fg flex items-center gap-1.5">
              <Lock class="size-3.5 text-brand-300" />
              Credenciales de Acceso Maestro (Opcionales)
            </span>
            <span class="text-[10px] text-muted">Se pueden asignar ahora o después</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="text-[11px] text-muted block mb-1">Correo de la cuenta</label>
              <input
                v-model="correoMaestro"
                type="email"
                placeholder="ej. netflix.cuenta@streamstore.net"
                class="field-input text-xs py-1.5"
              />
            </div>
            <div>
              <label class="text-[11px] text-muted block mb-1">Contraseña maestra</label>
              <input
                v-model="claveMaestra"
                type="text"
                placeholder="ej. Pass#2026"
                class="field-input text-xs py-1.5"
              />
            </div>
          </div>
        </div>

        <!-- CONTROL DE CANTIDAD DE PANTALLAS (STEPPER PERSONALIZABLE) -->
        <div class="space-y-3 border-t border-line/60 pt-4">
          <div class="flex items-center justify-between">
            <div>
              <label class="text-xs font-bold text-fg block">
                Cantidad de Pantallas / Perfiles
              </label>
              <p class="text-[11px] text-muted">
                Configura cuántos perfiles simultáneos tendrá esta cuenta.
              </p>
            </div>

            <!-- Stepper interactivo [-] [ 4 ] [+] -->
            <div class="flex items-center gap-2 bg-surface-2 p-1 rounded-xl border border-line">
              <button
                type="button"
                class="size-7 rounded-lg bg-surface flex items-center justify-center text-fg hover:bg-surface-2 transition-colors cursor-pointer disabled:opacity-40"
                :disabled="totalPantallas <= 1"
                @click="adjustScreens(totalPantallas - 1)"
              >
                <Minus class="size-3.5" />
              </button>
              <span class="font-mono text-sm font-black px-2 text-fg w-8 text-center">
                {{ totalPantallas }}
              </span>
              <button
                type="button"
                class="size-7 rounded-lg bg-surface flex items-center justify-center text-fg hover:bg-surface-2 transition-colors cursor-pointer disabled:opacity-40"
                :disabled="totalPantallas >= 10"
                @click="adjustScreens(totalPantallas + 1)"
              >
                <Plus class="size-3.5" />
              </button>
            </div>
          </div>

          <!-- Botones rápidos de preset -->
          <div class="grid grid-cols-5 gap-1.5">
            <button
              v-for="num in [1, 2, 4, 5, 7]"
              :key="num"
              type="button"
              class="py-1 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer"
              :class="[
                totalPantallas === num
                  ? 'border-brand-400 bg-brand-500/20 text-brand-300'
                  : 'border-line/60 bg-surface-2/60 text-muted hover:text-fg'
              ]"
              @click="adjustScreens(num)"
            >
              {{ num }} {{ num === 1 ? 'pantalla' : 'pantallas' }}
            </button>
          </div>

          <!-- Desglose individual de cada pantalla (Nombres y Pines) -->
          <div class="space-y-2 mt-3 pt-2">
            <span class="text-[11px] font-bold text-muted uppercase tracking-wider block">
              Detalle de cada Perfil (Opcional):
            </span>
            <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
              <div
                v-for="(pantalla, idx) in pantallasList"
                :key="pantalla.numero"
                class="rounded-xl border border-line/60 bg-[#0A0E1A] p-2.5 flex items-center gap-2 text-xs"
              >
                <span class="size-6 rounded-md bg-surface-2 border border-line flex items-center justify-center font-mono font-black text-brand-300 text-[10px] shrink-0">
                  #{{ pantalla.numero }}
                </span>

                <input
                  v-model="pantalla.perfil"
                  type="text"
                  placeholder="Nombre perfil"
                  class="field-input py-1 px-2.5 text-xs flex-1"
                />

                <div class="relative w-28 shrink-0">
                  <input
                    v-model="pantalla.pin"
                    type="text"
                    maxlength="6"
                    placeholder="PIN (opc.)"
                    class="field-input py-1 pl-6 pr-2 text-xs font-mono"
                  />
                  <KeyRound class="absolute left-2 top-2 size-3 text-muted" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Acciones Guardar Cuenta -->
        <div class="flex items-center justify-end gap-3 border-t border-line/60 pt-4">
          <button type="button" class="btn-secondary text-xs py-2 px-4 cursor-pointer" @click="emit('close')">
            Cancelar
          </button>
          <button type="submit" class="btn-primary text-xs py-2 px-5 font-bold cursor-pointer" :disabled="isSubmitting">
            <span v-if="isSubmitting">Guardando...</span>
            <span v-else>Guardar Cuenta ({{ totalPantallas }} pantallas)</span>
          </button>
        </div>
      </form>

      <!-- ============================================================== -->
      <!-- FORMULARIO 2: CREAR COMBO / PROMOCIÓN (NETFLIX + HBO MAX, ETC)  -->
      <!-- ============================================================== -->
      <form v-else class="space-y-5" @submit.prevent="onSubmit">
        <!-- Selección de Plataformas que integran el combo -->
        <div class="space-y-2">
          <label class="text-xs font-bold text-fg flex items-center justify-between">
            <span>Plataformas Incluidas en el Combo *</span>
            <span class="text-[11px] text-muted">
              {{ comboPlataformasSeleccionadas.length }} plataformas seleccionadas
            </span>
          </label>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              v-for="plat in plataformas"
              :key="plat.id"
              type="button"
              class="flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer"
              :class="[
                comboPlataformasSeleccionadas.includes(plat.id)
                  ? 'border-rose-500 bg-rose-500/15 text-white shadow-md'
                  : 'border-line/70 bg-surface-2 text-muted hover:text-fg'
              ]"
              @click="togglePlataformaCombo(plat.id)"
            >
              <div
                class="size-5 rounded-md flex items-center justify-center text-[10px] text-white shrink-0 font-mono"
                :style="{ backgroundColor: plat.color || '#8057FF' }"
              >
                {{ plat.nombre.slice(0, 2) }}
              </div>
              <span class="truncate flex-1">{{ plat.nombre }}</span>
              <Check v-if="comboPlataformasSeleccionadas.includes(plat.id)" class="size-3.5 text-rose-400 shrink-0" />
            </button>
          </div>
        </div>

        <!-- Título del Combo y Etiqueta de Oferta -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="text-xs font-bold text-fg block mb-1">Nombre Comercial de la Promo *</label>
            <input
              v-model="comboNombre"
              type="text"
              placeholder="ej. Combo Dúo: Netflix + Max HBO"
              class="field-input text-xs"
            />
          </div>

          <div>
            <label class="text-xs font-bold text-fg block mb-1">Insignia / Badge de la Oferta</label>
            <input
              v-model="comboEtiqueta"
              type="text"
              placeholder="ej. COMBO DÚO 2X1, -35% OFF, MÁS VENDIDO"
              class="field-input text-xs"
            />
          </div>
        </div>

        <!-- Precios: Promo vs Regular -->
        <div class="rounded-xl border border-line/60 bg-[#0A0E1A] p-4 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-fg flex items-center gap-1.5">
              <Coins class="size-3.5 text-emerald-400" />
              Estructura de Precios del Combo
            </span>
            <span
              v-if="comboPrecioRegular > comboPrecioPromo"
              class="rounded bg-emerald-500/15 text-emerald-400 px-2 py-0.5 text-[10px] font-mono font-bold"
            >
              Ahorro para el cliente: {{ formatPrice(comboPrecioRegular - comboPrecioPromo) }}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="text-[11px] text-emerald-400 font-bold block mb-1">Precio Promocional (COP) *</label>
              <input
                v-model.number="comboPrecioPromo"
                type="number"
                step="500"
                class="field-input text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label class="text-[11px] text-muted block mb-1">Precio Normal de Referencia (Tachado)</label>
              <input
                v-model.number="comboPrecioRegular"
                type="number"
                step="500"
                class="field-input text-xs font-mono"
              />
            </div>
          </div>
        </div>

        <!-- Pantallas por Servicio & Duración -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="text-xs font-bold text-fg block mb-1">Pantallas por cada servicio</label>
            <select v-model.number="comboPantallasPorPlat" class="field-input text-xs cursor-pointer">
              <option :value="1">1 Pantalla por cada servicio (Recomendado)</option>
              <option :value="2">2 Pantallas por cada servicio</option>
              <option :value="4">Cuenta completa por cada servicio</option>
            </select>
          </div>

          <div>
            <label class="text-xs font-bold text-fg block mb-1">Vigencia del Combo</label>
            <select v-model.number="comboDuracion" class="field-input text-xs cursor-pointer">
              <option :value="30">30 días (1 mes)</option>
              <option :value="60">60 días (2 meses)</option>
              <option :value="90">90 días (3 meses)</option>
            </select>
          </div>
        </div>

        <!-- Descripción -->
        <div>
          <label class="text-xs font-bold text-fg block mb-1">Descripción / Beneficios del Combo</label>
          <textarea
            v-model="comboDescripcion"
            rows="2"
            placeholder="ej. Acceso simultáneo a Netflix Ultra HD y Max HBO en perfiles privados con PIN."
            class="field-input text-xs"
          />
        </div>

        <!-- Acciones Guardar Combo -->
        <div class="flex items-center justify-end gap-3 border-t border-line/60 pt-4">
          <button type="button" class="btn-secondary text-xs py-2 px-4 cursor-pointer" @click="emit('close')">
            Cancelar
          </button>
          <button
            type="submit"
            class="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-bold px-5 py-2 shadow-lg shadow-rose-500/25 cursor-pointer"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting">Publicando combo...</span>
            <span v-else>Publicar Promoción en Tienda</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
