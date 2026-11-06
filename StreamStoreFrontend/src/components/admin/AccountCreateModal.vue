<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { 
  Check, 
  Coins, 
  Eye, 
  EyeOff, 
  Flame, 
  KeyRound, 
  Layers, 
  Lock, 
  Mail, 
  Minus, 
  Plus, 
  Sparkles, 
  Tv, 
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
    initialPlataformaId?: number | null
  }>(),
  {
    initialPlataformaId: null,
  }
)

const emit = defineEmits<{
  close: []
  created: []
  abrirPaso1: []
}>()

// Plataforma seleccionada del Paso 1
const plataformaId = ref<number | null>(null)
const searchPlataforma = ref('')

// Credenciales Maestras
const correoMaestro = ref('')
const claveMaestra = ref('')
const mostrarClave = ref(false)

// Configuración de Venta y Catálogo
const precioCatalogo = ref<number>(35000)
const duracionDias = ref<number>(30)

// Configuración de Pantallas / Perfiles
const totalPantallas = ref<number>(4)
const pantallasList = ref<Array<{ numero: number; perfil: string; pin: string }>>([
  { numero: 1, perfil: 'Perfil 1', pin: '' },
  { numero: 2, perfil: 'Perfil 2', pin: '' },
  { numero: 3, perfil: 'Perfil 3', pin: '' },
  { numero: 4, perfil: 'Perfil 4', pin: '' },
])

// Modo Combo integrado (desplegable)
const esCombo = ref(false)
const comboPlataformasSeleccionadas = ref<number[]>([])
const comboNombre = ref('')
const comboPrecioPromo = ref<number>(32000)
const comboPrecioRegular = ref<number>(48000)
const comboEtiqueta = ref('COMBO 2X1')
const comboDescripcion = ref('')

const isSubmitting = ref(false)
const serverError = ref<string | null>(null)

// Filtrar plataformas para el selector
const plataformasFiltradas = computed(() => {
  const q = searchPlataforma.value.trim().toLowerCase()
  if (!q) return props.plataformas
  return props.plataformas.filter((p) => p.nombre.toLowerCase().includes(q))
})

const plataformaActual = computed(() => {
  return props.plataformas.find((p) => p.id === plataformaId.value) || null
})

// Ajuste dinámico de pantallas
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

// Alternar plataforma en el combo
function toggleComboPlat(id: number) {
  const idx = comboPlataformasSeleccionadas.value.indexOf(id)
  if (idx !== -1) {
    comboPlataformasSeleccionadas.value.splice(idx, 1)
  } else {
    comboPlataformasSeleccionadas.value.push(id)
  }
  autoGenerarNombreCombo()
}

function autoGenerarNombreCombo() {
  const platPrincipal = plataformaActual.value?.nombre || 'Plataforma'
  const otras = comboPlataformasSeleccionadas.value
    .map((id) => props.plataformas.find((p) => p.id === id)?.nombre)
    .filter(Boolean) as string[]

  const todos = [platPrincipal, ...otras]
  if (todos.length > 1) {
    comboNombre.value = `Combo ${todos.length === 2 ? 'Dúo' : todos.length === 3 ? 'Trío' : 'Especial'}: ${todos.join(' + ')}`
  }
}

// Reset al abrir el modal
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      serverError.value = null
      searchPlataforma.value = ''
      correoMaestro.value = ''
      claveMaestra.value = ''
      precioCatalogo.value = 35000
      duracionDias.value = 30
      adjustScreens(4)
      esCombo.value = false
      comboPlataformasSeleccionadas.value = []
      comboNombre.value = ''
      comboPrecioPromo.value = 32000
      comboPrecioRegular.value = 48000
      comboEtiqueta.value = 'COMBO 2X1'
      comboDescripcion.value = ''

      if (props.initialPlataformaId) {
        plataformaId.value = props.initialPlataformaId
      } else if (props.plataformas.length > 0 && !plataformaId.value) {
        plataformaId.value = props.plataformas[0].id
      }
    }
  }
)

watch(
  () => props.initialPlataformaId,
  (newId) => {
    if (newId) plataformaId.value = newId
  }
)

watch(esCombo, (activo) => {
  if (activo) {
    // Si activa combo y no hay plataformas secundarias seleccionadas, pre-seleccionar la primera diferente
    if (comboPlataformasSeleccionadas.value.length === 0) {
      const otra = props.plataformas.find((p) => p.id !== plataformaId.value)
      if (otra) comboPlataformasSeleccionadas.value.push(otra.id)
    }
    autoGenerarNombreCombo()
  }
})

async function onSubmit() {
  serverError.value = null

  if (!plataformaId.value) {
    serverError.value = 'Por favor selecciona la plataforma de streaming creada en el Paso 1.'
    return
  }

  if (esCombo.value && comboPlataformasSeleccionadas.value.length === 0) {
    serverError.value = 'Activaste el Modo Combo: debes seleccionar al menos una plataforma secundaria para armar el paquete.'
    return
  }

  isSubmitting.value = true

  try {
    const platObj = plataformaActual.value
    const payload: CrearCuentaPayload = {
      plataformaId: plataformaId.value,
      nombrePlataforma: platObj?.nombre || 'Plataforma',
      correo: correoMaestro.value.trim() || undefined,
      password: claveMaestra.value.trim() || undefined,
      precio: Number(precioCatalogo.value) || 35000,
      duracionDias: Number(duracionDias.value) || 30,
      totalPantallas: totalPantallas.value,
      pantallas: pantallasList.value.map((p) => ({
        perfil: p.perfil.trim() || `Perfil ${p.numero}`,
        pin: p.pin.trim() || undefined,
      })),
      esCombo: esCombo.value,
      comboPlataformaIds: esCombo.value ? comboPlataformasSeleccionadas.value : undefined,
      comboNombre: esCombo.value ? comboNombre.value.trim() : undefined,
      comboPrecio: esCombo.value ? Number(comboPrecioPromo.value) : undefined,
    }

    // 1. Guardar la cuenta de streaming
    await adminService.crearCuenta(payload)

    // 2. Si se activó combo, asegurar registro en la entidad de combos
    if (esCombo.value) {
      const comboIds = Array.from(new Set([plataformaId.value, ...comboPlataformasSeleccionadas.value]))
      const comboPayload: CrearComboPayload = {
        nombre: comboNombre.value.trim() || `Combo ${platObj?.nombre || 'Especial'}`,
        descripcion: comboDescripcion.value.trim() || `Paquete multi-servicio que incluye perfiles de streaming con entrega rápida.`,
        plataformaIds: comboIds,
        precioPromo: Number(comboPrecioPromo.value) || 32000,
        precioRegular: Number(comboPrecioRegular.value) || 48000,
        pantallasPorPlataforma: 1,
        duracionDias: Number(duracionDias.value) || 30,
        etiquetaPromo: comboEtiqueta.value.trim() || 'COMBO OFERTA',
        activo: true,
      }
      await adminService.crearCombo(comboPayload).catch((err) => {
        console.warn('Aviso: no se pudo registrar el combo secundario:', err)
      })
    }

    emit('created')
    emit('close')
  } catch (err: any) {
    serverError.value = err?.message || 'Error al registrar la cuenta en el catálogo.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm select-none"
    role="dialog"
    aria-modal="true"
  >
    <div class="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-xl border border-white/10 bg-[#0E1322] p-5 sm:p-7 shadow-2xl space-y-6">
      <!-- Encabezado Paso 2 -->
      <div class="flex items-start justify-between border-b border-white/10 pb-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="inline-flex items-center gap-1.5 rounded bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 text-[10px] font-mono font-bold px-2 py-0.5 uppercase tracking-wider">
              Paso 2 de 2 • Cargar Cuenta al Catálogo
            </span>
          </div>
          <h2 class="font-display text-lg sm:text-xl font-bold text-white tracking-tight">
            Configurar Cuenta & Perfiles de Streaming
          </h2>
          <p class="text-xs text-slate-400 mt-0.5">
            Selecciona la plataforma creada, ingresa credenciales maestras, asigna perfiles y define el precio para el catálogo.
          </p>
        </div>

        <button
          type="button"
          class="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          @click="emit('close')"
        >
          <X class="size-5" />
        </button>
      </div>

      <!-- Alerta de Error -->
      <AppAlert v-if="serverError" variant="error" title="Atención">
        <p>{{ serverError }}</p>
      </AppAlert>

      <form class="space-y-6" @submit.prevent="onSubmit">
        <!-- SECCIÓN 1: SELECCIONAR PLATAFORMA EXISTENTE (PASO 1) -->
        <div class="space-y-2.5">
          <div class="flex items-center justify-between">
            <label class="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Tv class="size-3.5 text-cyan-400" />
              <span>Plataforma de Streaming (Paso 1) *</span>
            </label>
            <button
              type="button"
              class="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1 cursor-pointer"
              @click="emit('abrirPaso1')"
            >
              <Plus class="size-3" />
              <span>+ Crear nueva plataforma (Paso 1)</span>
            </button>
          </div>

          <!-- Si no hay plataformas registradas -->
          <div
            v-if="plataformas.length === 0"
            class="rounded-xl border border-dashed border-white/15 bg-white/5 p-4 text-center space-y-2"
          >
            <p class="text-xs text-slate-300">
              No hay plataformas creadas todavía. Crea una plataforma primero para poder cargar cuentas.
            </p>
            <button
              type="button"
              class="btn-primary text-xs py-1.5 px-3 inline-flex items-center gap-1 cursor-pointer"
              @click="emit('abrirPaso1')"
            >
              <Plus class="size-3.5" />
              <span>Ir al Paso 1: Crear Plataforma</span>
            </button>
          </div>

          <!-- Cuadrícula de Selección de Plataforma -->
          <div v-else class="space-y-2">
            <!-- Barra de búsqueda rápida si hay más de 4 plataformas -->
            <input
              v-if="plataformas.length > 4"
              v-model="searchPlataforma"
              type="text"
              placeholder="Buscar entre plataformas registradas..."
              class="w-full rounded-lg border border-white/10 bg-[#0B0F19] px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
            />

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-44 overflow-y-auto pr-1">
              <button
                v-for="plat in plataformasFiltradas"
                :key="plat.id"
                type="button"
                class="flex items-center gap-2.5 p-2 rounded-lg border text-left text-xs transition-all cursor-pointer"
                :class="[
                  plataformaId === plat.id
                    ? 'border-cyan-400 bg-cyan-400/10 text-white shadow-sm'
                    : 'border-white/10 bg-[#0B0F19] text-slate-300 hover:border-white/20 hover:text-white'
                ]"
                @click="plataformaId = plat.id"
              >
                <!-- Avatar o Logo -->
                <div
                  v-if="plat.coverUrl"
                  class="size-7 rounded overflow-hidden bg-black shrink-0 border border-white/10"
                >
                  <img :src="plat.coverUrl" :alt="plat.nombre" class="w-full h-full object-cover" />
                </div>
                <div
                  v-else
                  class="size-7 rounded flex items-center justify-center font-mono font-bold text-[10px] text-white shrink-0"
                  :style="{ backgroundColor: plat.color || '#06b6d4' }"
                >
                  {{ plat.nombre.slice(0, 2).toUpperCase() }}
                </div>

                <div class="truncate flex-1">
                  <span class="font-semibold block truncate">{{ plat.nombre }}</span>
                  <span class="text-[10px] text-slate-500 block">ID: #{{ plat.id }}</span>
                </div>

                <Check v-if="plataformaId === plat.id" class="size-4 text-cyan-400 shrink-0" />
              </button>
            </div>
          </div>
        </div>

        <!-- SECCIÓN 2: CREDENCIALES DE ACCESO MAESTRO -->
        <div class="rounded-xl border border-white/10 bg-[#0B0F19] p-4 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-white flex items-center gap-1.5">
              <Lock class="size-3.5 text-cyan-400" />
              <span>Credenciales Maestras de la Cuenta</span>
            </span>
            <span class="text-[10px] text-slate-500 font-mono">Solo visible por el administrador</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="text-[11px] text-slate-400 block mb-1">Correo de la cuenta</label>
              <div class="relative">
                <input
                  v-model="correoMaestro"
                  type="email"
                  placeholder="ej. netflix.cuenta@streamstore.net"
                  class="w-full rounded-lg border border-white/10 bg-[#0E1322] pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                />
                <Mail class="absolute left-2.5 top-2 size-3.5 text-slate-500" />
              </div>
            </div>

            <div>
              <label class="text-[11px] text-slate-400 block mb-1">Contraseña maestra</label>
              <div class="relative">
                <input
                  v-model="claveMaestra"
                  :type="mostrarClave ? 'text' : 'password'"
                  placeholder="ej. Pass#2026"
                  class="w-full rounded-lg border border-white/10 bg-[#0E1322] pl-8 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none font-mono"
                />
                <Lock class="absolute left-2.5 top-2 size-3.5 text-slate-500" />
                <button
                  type="button"
                  class="absolute right-2.5 top-2 text-slate-400 hover:text-white cursor-pointer"
                  @click="mostrarClave = !mostrarClave"
                >
                  <EyeOff v-if="mostrarClave" class="size-3.5" />
                  <Eye v-else class="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- SECCIÓN 3: VALOR EN CATÁLOGO Y DURACIÓN -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center justify-between">
              <span>Valor en Catálogo (COP $) *</span>
              <span class="text-[10px] font-mono text-cyan-400">{{ formatPrice(precioCatalogo) }}</span>
            </label>
            <div class="relative">
              <input
                v-model.number="precioCatalogo"
                type="number"
                step="500"
                min="1000"
                class="w-full rounded-lg border border-white/10 bg-[#0B0F19] pl-8 pr-3 py-1.5 text-xs font-mono font-semibold text-white focus:border-cyan-400 focus:outline-none"
              />
              <Coins class="absolute left-2.5 top-2 size-3.5 text-slate-500" />
            </div>
          </div>

          <div>
            <label class="text-xs font-semibold text-slate-300 block mb-1.5">
              Duración del Servicio
            </label>
            <select
              v-model.number="duracionDias"
              class="w-full rounded-lg border border-white/10 bg-[#0B0F19] px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none cursor-pointer"
            >
              <option :value="30">30 días (1 mes de vigencia)</option>
              <option :value="60">60 días (2 meses de vigencia)</option>
              <option :value="90">90 días (3 meses de vigencia)</option>
              <option :value="180">180 días (6 meses de vigencia)</option>
              <option :value="365">365 días (1 año completo)</option>
            </select>
          </div>
        </div>

        <!-- SECCIÓN 4: CANTIDAD DE PANTALLAS / PERFILES Y PINES -->
        <div class="space-y-3 border-t border-white/10 pt-4">
          <div class="flex items-center justify-between">
            <div>
              <label class="text-xs font-semibold text-white block">
                Cantidad de Pantallas / Perfiles Simultáneos
              </label>
              <p class="text-[11px] text-slate-400">
                Define cuántos perfiles individuales se generarán para esta cuenta.
              </p>
            </div>

            <!-- Stepper interactivo [-] [ 4 ] [+] -->
            <div class="flex items-center gap-1.5 bg-[#0B0F19] p-1 rounded-lg border border-white/10">
              <button
                type="button"
                class="size-6 rounded bg-white/5 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-30"
                :disabled="totalPantallas <= 1"
                @click="adjustScreens(totalPantallas - 1)"
              >
                <Minus class="size-3" />
              </button>
              <span class="font-mono text-xs font-bold px-2 text-white min-w-6 text-center">
                {{ totalPantallas }}
              </span>
              <button
                type="button"
                class="size-6 rounded bg-white/5 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-30"
                :disabled="totalPantallas >= 10"
                @click="adjustScreens(totalPantallas + 1)"
              >
                <Plus class="size-3" />
              </button>
            </div>
          </div>

          <!-- Botones rápidos de selección de pantalla -->
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="num in [1, 2, 4, 5]"
              :key="num"
              type="button"
              class="py-1 rounded-lg text-xs font-mono font-semibold border transition-all cursor-pointer"
              :class="[
                totalPantallas === num
                  ? 'border-cyan-400 bg-cyan-400/15 text-cyan-300'
                  : 'border-white/10 bg-[#0B0F19] text-slate-400 hover:border-white/20 hover:text-white'
              ]"
              @click="adjustScreens(num)"
            >
              {{ num }} {{ num === 1 ? 'pantalla' : 'pantallas' }}
            </button>
          </div>

          <!-- Desglose de perfiles y pines -->
          <div class="space-y-1.5 pt-1">
            <span class="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              Configuración de perfiles y pines individuales:
            </span>
            <div class="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              <div
                v-for="pantalla in pantallasList"
                :key="pantalla.numero"
                class="rounded-lg border border-white/10 bg-[#0B0F19] p-2 flex items-center gap-2 text-xs"
              >
                <span class="size-5 rounded bg-white/5 border border-white/10 flex items-center justify-center font-mono font-bold text-cyan-300 text-[10px] shrink-0">
                  #{{ pantalla.numero }}
                </span>

                <input
                  v-model="pantalla.perfil"
                  type="text"
                  placeholder="Nombre perfil"
                  class="rounded border border-white/10 bg-[#0E1322] py-1 px-2 text-xs text-white flex-1 focus:border-cyan-400 focus:outline-none"
                />

                <div class="relative w-28 shrink-0">
                  <input
                    v-model="pantalla.pin"
                    type="text"
                    maxlength="6"
                    placeholder="PIN (opc.)"
                    class="w-full rounded border border-white/10 bg-[#0E1322] py-1 pl-6 pr-2 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
                  />
                  <KeyRound class="absolute left-1.5 top-1.5 size-3 text-slate-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SECCIÓN 5: BOTÓN Y DESPLEGABLE DE MODO COMBOS -->
        <div class="border-t border-white/10 pt-4 space-y-3">
          <!-- Botón Switch Combos -->
          <div class="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-[#0B0F19]">
            <div class="flex items-center gap-2.5">
              <div class="size-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Flame class="size-4" />
              </div>
              <div>
                <span class="text-xs font-bold text-white block">Modo Combo Promocional</span>
                <span class="text-[11px] text-slate-400 block">
                  Activa para asociar esta cuenta con otras plataformas existentes (ej. Netflix + Max).
                </span>
              </div>
            </div>

            <!-- Toggle Switch -->
            <button
              type="button"
              role="switch"
              :aria-checked="esCombo"
              class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
              :class="esCombo ? 'bg-cyan-500' : 'bg-slate-700'"
              @click="esCombo = !esCombo"
            >
              <span
                class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                :class="esCombo ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </div>

          <!-- Contenido Desplegable cuando 'esCombo' está activo -->
          <div
            v-if="esCombo"
            class="rounded-xl border border-cyan-400/30 bg-cyan-950/20 p-4 space-y-4 animate-fade-in"
          >
            <div>
              <div class="flex items-center gap-1.5 mb-1">
                <span class="text-xs font-bold text-cyan-300">
                  Selecciona las cuentas/plataformas que integran el combo
                </span>
              </div>
              <p class="text-[11px] text-slate-400">
                Marca qué otros servicios se venderán conjuntamente con esta cuenta:
              </p>
            </div>

            <!-- Listado de plataformas existentes con Checkbox -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                v-for="plat in plataformas.filter((p) => p.id !== plataformaId)"
                :key="plat.id"
                type="button"
                class="flex items-center gap-2 p-2 rounded-lg border text-left text-xs transition-all cursor-pointer"
                :class="[
                  comboPlataformasSeleccionadas.includes(plat.id)
                    ? 'border-cyan-400 bg-cyan-400/20 text-white font-bold'
                    : 'border-white/10 bg-[#0E1322] text-slate-400 hover:text-white'
                ]"
                @click="toggleComboPlat(plat.id)"
              >
                <div
                  class="size-5 rounded flex items-center justify-center font-mono text-[9px] text-white shrink-0"
                  :style="{ backgroundColor: plat.color || '#06b6d4' }"
                >
                  {{ plat.nombre.slice(0, 2).toUpperCase() }}
                </div>
                <span class="truncate flex-1">{{ plat.nombre }}</span>
                <Check v-if="comboPlataformasSeleccionadas.includes(plat.id)" class="size-3.5 text-cyan-400 shrink-0" />
              </button>
            </div>

            <!-- Parámetros del Combo -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
              <div>
                <label class="text-[11px] font-semibold text-slate-300 block mb-1">Nombre Comercial del Combo</label>
                <input
                  v-model="comboNombre"
                  type="text"
                  placeholder="ej. Combo Dúo: Netflix + Max"
                  class="w-full rounded-lg border border-white/10 bg-[#0E1322] px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label class="text-[11px] font-semibold text-slate-300 block mb-1">Insignia / Badge de Oferta</label>
                <input
                  v-model="comboEtiqueta"
                  type="text"
                  placeholder="ej. COMBO 2X1, AHORRA 30%"
                  class="w-full rounded-lg border border-white/10 bg-[#0E1322] px-3 py-1.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label class="text-[11px] font-semibold text-cyan-400 block mb-1">Precio Combo Promocional (COP)</label>
                <input
                  v-model.number="comboPrecioPromo"
                  type="number"
                  step="500"
                  class="w-full rounded-lg border border-white/10 bg-[#0E1322] px-3 py-1.5 text-xs font-mono font-bold text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label class="text-[11px] font-semibold text-slate-400 block mb-1">Precio de Referencia (Tachado)</label>
                <input
                  v-model.number="comboPrecioRegular"
                  type="number"
                  step="500"
                  class="w-full rounded-lg border border-white/10 bg-[#0E1322] px-3 py-1.5 text-xs font-mono text-slate-400 focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Acciones del Modal -->
        <div class="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
          <button
            type="button"
            class="px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            @click="emit('close')"
          >
            Cancelar
          </button>

          <button
            type="submit"
            class="btn-primary text-xs py-2 px-5 font-bold cursor-pointer"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting">Cargando al catálogo...</span>
            <span v-else>
              {{ esCombo ? 'Guardar Cuenta y Activar Combo' : 'Guardar Cuenta al Catálogo' }}
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
