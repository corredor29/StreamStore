<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { 
  Check, 
  Coins, 
  Eye, 
  EyeOff, 
  
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
import type { CrearComboPayload, CrearCuentaPayload, CuentaAdmin, Plataforma } from '@/types'
import { adminService } from '@/services/adminService'
import AppAlert from '@/components/common/AppAlert.vue'
import { formatPrice } from '@/composables/useFormat'

const props = withDefaults(
  defineProps<{
    plataformas: Plataforma[]
    cuentas?: CuentaAdmin[]
    isOpen: boolean
    initialPlataformaId?: number | null
  }>(),
  {
    initialPlataformaId: null,
    cuentas: () => [],
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
const precioCompleta = ref<number>(35000)
const precioPantalla = ref<number>(12000)
const duracionDias = ref<number>(30)
// Qué tiene hoy el catálogo de la plataforma elegida, para mostrar si el cambio afecta a lo publicado
const catalogoActual = ref<{ completa?: number; pantalla?: number; dias?: number } | null>(null)
const cargandoCatalogo = ref(false)

async function cargarCatalogo(platId: number | null) {
  catalogoActual.value = null
  if (!platId) return
  cargandoCatalogo.value = true
  try {
    const prods = await adminService.productosDePlataforma(platId)
    if (plataformaId.value !== platId) return
    catalogoActual.value = {
      completa: prods.cuenta_completa?.precio,
      pantalla: prods.pantalla?.precio,
      dias: prods.cuenta_completa?.duracionDias ?? prods.pantalla?.duracionDias,
    }
    if (prods.cuenta_completa) precioCompleta.value = prods.cuenta_completa.precio
    if (prods.pantalla) precioPantalla.value = prods.pantalla.precio
    if (catalogoActual.value.dias) duracionDias.value = catalogoActual.value.dias
  } catch {
    catalogoActual.value = null
  } finally {
    cargandoCatalogo.value = false
  }
}

const cambiaCatalogo = computed(() => {
  const c = catalogoActual.value
  if (!c) return false
  return (c.completa !== undefined && c.completa !== precioCompleta.value)
    || (c.pantalla !== undefined && c.pantalla !== precioPantalla.value)
    || (c.dias !== undefined && c.dias !== duracionDias.value)
})
const DURACIONES = [
  { dias: 30, corto: '30 días', largo: '1 mes' },
  { dias: 60, corto: '60 días', largo: '2 meses' },
  { dias: 90, corto: '90 días', largo: '3 meses' },
  { dias: 180, corto: '180 días', largo: '6 meses' },
  { dias: 365, corto: '365 días', largo: '1 año' },
] as const

// Configuración de Pantallas / Perfiles
const totalPantallas = ref<number>(4)
const pantallasList = ref<Array<{ numero: number; perfil: string; pin: string }>>([
  { numero: 1, perfil: 'Perfil 1', pin: '' },
  { numero: 2, perfil: 'Perfil 2', pin: '' },
  { numero: 3, perfil: 'Perfil 3', pin: '' },
  { numero: 4, perfil: 'Perfil 4', pin: '' },
])



const isSubmitting = ref(false)
const serverError = ref<string | null>(null)
const errorBox = ref<HTMLElement | null>(null)
// El aviso está arriba del formulario: llevarlo a la vista aunque el admin esté junto al botón de guardar
watch(serverError, async (msg) => {
  if (!msg) return
  await nextTick()
  errorBox.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
})

// Filtrar plataformas para el selector
const plataformasFiltradas = computed(() => {
  const q = searchPlataforma.value.trim().toLowerCase()
  if (!q) return props.plataformas
  return props.plataformas.filter((p) => p.nombre.toLowerCase().includes(q))
})

const plataformaActual = computed(() => {
  return props.plataformas.find((p) => p.id === plataformaId.value) || null
})

// Cuentas que ya tiene la plataforma elegida, para no repetir correo y ver el stock de cada una
const cuentasDePlataforma = computed(() =>
  props.cuentas
    .filter((c) => c.plataformaId === plataformaId.value && c.estado !== 'INACTIVA')
    .sort((a, b) => b.id - a.id),
)
const correoRepetido = computed(() => {
  const correo = correoMaestro.value.trim().toLowerCase()
  return Boolean(correo) && cuentasDePlataforma.value.some((c) => (c.correo || '').toLowerCase() === correo)
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



// Reset al abrir el modal
watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      serverError.value = null
      searchPlataforma.value = ''
      correoMaestro.value = ''
      claveMaestra.value = ''
      precioCompleta.value = 35000
      precioPantalla.value = 12000
      duracionDias.value = 30
      adjustScreens(4)

      if (props.initialPlataformaId) {
        plataformaId.value = props.initialPlataformaId
      } else if (props.plataformas.length > 0 && !plataformaId.value) {
        plataformaId.value = props.plataformas[0].id
      }
      cargarCatalogo(plataformaId.value)
    }
  }
)

watch(plataformaId, (id) => {
  if (props.isOpen) cargarCatalogo(id)
})

watch(
  () => props.initialPlataformaId,
  (newId) => {
    if (newId) plataformaId.value = newId
  }
)



async function onSubmit() {
  serverError.value = null

  if (!plataformaId.value) {
    serverError.value = 'Selecciona una plataforma.'
    return
  }

  const correo = correoMaestro.value.trim()
  const clave = claveMaestra.value.trim()
  if (Boolean(correo) !== Boolean(clave)) {
    serverError.value = 'Escribe el correo y la contraseña juntos, o deja ambos vacíos para entregarlos después.'
    return
  }
  if (correoRepetido.value) {
    serverError.value = `${plataformaActual.value?.nombre ?? 'Esta plataforma'} ya tiene una cuenta con ese correo. Usa un correo diferente.`
    return
  }
  if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    serverError.value = 'El correo de la cuenta no es válido.'
    return
  }
  if (clave && clave.length < 4) {
    serverError.value = 'La contraseña debe tener al menos 4 caracteres.'
    return
  }
  if (!(Number(precioCompleta.value) >= 1000) || !(Number(precioPantalla.value) >= 1000)) {
    serverError.value = 'Escribe los dos precios (cuenta completa y pantalla), de al menos $ 1.000.'
    return
  }
  const pinMalo = pantallasList.value.find((p) => p.pin.trim() && !/^\d{4,6}$/.test(p.pin.trim()))
  if (pinMalo) {
    serverError.value = `El PIN del perfil #${pinMalo.numero} debe tener de 4 a 6 dígitos.`
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
      precio: Number(precioCompleta.value),
      precioPantalla: Number(precioPantalla.value),
      duracionDias: Number(duracionDias.value) || 30,
      totalPantallas: totalPantallas.value,
      pantallas: pantallasList.value.map((p) => ({
        perfil: p.perfil.trim() || `Perfil ${p.numero}`,
        pin: p.pin.trim() || undefined,
      })),
    }

    // 1. Guardar la cuenta de streaming
    await adminService.crearCuenta(payload)

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
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 select-none"
    role="dialog"
    aria-modal="true"
  >
    <div class="hud-panel w-full max-w-2xl max-h-[92vh] overflow-y-auto p-5 sm:p-7 space-y-6">
      <!-- Encabezado Paso 2 -->
      <div class="flex items-start justify-between border-b border-ad-line pb-4">
        <div>
          <h2 class="font-display text-lg sm:text-xl font-semibold text-ad-text tracking-tight">
            Nueva Cuenta
          </h2>
          <p class="text-xs text-ad-dim mt-0.5">
            Plataforma, credenciales, perfiles y precio de venta.
          </p>
        </div>

        <button
          type="button"
          class="text-ad-dim hover:text-ad-text p-1.5 rounded-lg hover:bg-ad-hover transition-colors cursor-pointer"
          @click="emit('close')"
        >
          <X class="size-5" />
        </button>
      </div>

      <!-- Alerta de Error -->
      <div v-if="serverError" ref="errorBox" role="alert">
        <AppAlert variant="error" title="No se pudo guardar la cuenta">
          <p>{{ serverError }}</p>
        </AppAlert>
      </div>

      <form class="space-y-6" autocomplete="off" @submit.prevent="onSubmit">
        <!-- SECCIÓN 1: SELECCIONAR PLATAFORMA EXISTENTE (PASO 1) -->
        <div class="space-y-2.5">
          <div class="flex items-center justify-between">
            <label class="text-xs font-semibold text-ad-text flex items-center gap-1.5">
              <Tv class="size-3.5 text-ad-accent-text" />
              <span>Plataforma *</span>
            </label>
            <button
              type="button"
              class="text-[11px] font-semibold text-ad-accent-text hover:text-ad-accent-text transition-colors flex items-center gap-1 cursor-pointer"
              @click="emit('abrirPaso1')"
            >
              <Plus class="size-3" />
              <span>Nueva plataforma</span>
            </button>
          </div>

          <!-- Si no hay plataformas registradas -->
          <div
            v-if="plataformas.length === 0"
            class="rounded-xl border border-dashed border-ad-line bg-ad-hover p-4 text-center space-y-2"
          >
            <p class="text-xs text-ad-text">
              No hay plataformas creadas todavía. Crea una plataforma primero para poder cargar cuentas.
            </p>
            <button
              type="button"
              class="btn-primary text-xs py-1.5 px-3 inline-flex items-center gap-1 cursor-pointer"
              @click="emit('abrirPaso1')"
            >
              <Plus class="size-3.5" />
              <span>Crear plataforma</span>
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
              class="w-full rounded-lg border border-ad-line bg-ad-panel px-3 py-1.5 text-xs text-ad-text placeholder-ad-faint focus:border-ad-accent focus:outline-none"
            />

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-44 overflow-y-auto pr-1">
              <button
                v-for="plat in plataformasFiltradas"
                :key="plat.id"
                type="button"
                class="flex items-center gap-2.5 p-2 rounded-lg border text-left text-xs transition-all cursor-pointer"
                :class="[
                  plataformaId === plat.id
                    ? 'border-ad-accent bg-ad-accent/10 text-ad-text'
                    : 'border-ad-line bg-ad-panel text-ad-text hover:border-ad-line hover:text-ad-text'
                ]"
                @click="plataformaId = plat.id"
              >
                <!-- Avatar o Logo -->
                <div
                  v-if="plat.coverUrl"
                  class="size-7 rounded overflow-hidden bg-black shrink-0 border border-ad-line"
                >
                  <img :src="plat.coverUrl" :alt="plat.nombre" class="w-full h-full object-cover" />
                </div>
                <div
                  v-else
                  class="size-7 rounded flex items-center justify-center tabular-nums font-semibold text-[10px] text-ad-text shrink-0"
                  :style="{ backgroundColor: plat.color || '#06b6d4' }"
                >
                  {{ plat.nombre.slice(0, 2).toUpperCase() }}
                </div>

                <div class="truncate flex-1">
                  <span class="font-semibold block truncate">{{ plat.nombre }}</span>
                  <span class="text-[10px] text-ad-faint block">ID: #{{ plat.id }}</span>
                </div>

                <Check v-if="plataformaId === plat.id" class="size-4 text-ad-accent-text shrink-0" />
              </button>
            </div>
          </div>
        </div>

        <!-- Cuentas que ya tiene la plataforma: la nueva se suma a estas -->
        <div v-if="plataformaId" class="rounded-xl border border-white/10 bg-black/30">
          <div class="flex items-center justify-between px-3.5 py-2.5">
            <p class="text-xs font-semibold text-ad-text">
              Cuentas de {{ plataformaActual?.nombre }}
              <span class="ml-1 rounded-md border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] text-ad-dim">{{ cuentasDePlataforma.length }}</span>
            </p>
            <p class="text-[10px] text-ad-dim">La nueva será la nº {{ cuentasDePlataforma.length + 1 }}</p>
          </div>
          <ul v-if="cuentasDePlataforma.length" class="max-h-36 divide-y divide-white/5 overflow-y-auto border-t border-white/10">
            <li
              v-for="c in cuentasDePlataforma"
              :key="c.id"
              class="flex items-center justify-between gap-3 px-3.5 py-2 text-[11px]"
              :class="{ 'bg-rose-500/10': correoRepetido && (c.correo || '').toLowerCase() === correoMaestro.trim().toLowerCase() }"
            >
              <span class="flex min-w-0 items-center gap-2">
                <span class="font-mono text-ad-faint">#{{ c.id }}</span>
                <span v-if="c.correo" class="truncate font-mono text-ad-text">{{ c.correo }}</span>
                <span v-else class="text-amber-300">Sin credenciales</span>
              </span>
              <span
                class="shrink-0 font-mono"
                :class="c.pantallasDisponibles === 0 ? 'text-rose-400' : 'text-emerald-400'"
              >{{ c.pantallasDisponibles }}/{{ c.totalPantallas }} libres</span>
            </li>
          </ul>
          <p v-else class="border-t border-white/10 px-3.5 py-2.5 text-[11px] text-ad-dim">
            Todavía no tiene cuentas: esta será la primera.
          </p>
        </div>

        <!-- SECCIÓN 2: CREDENCIALES DE ACCESO MAESTRO -->
        <div class="hud-panel p-4 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold text-ad-text flex items-center gap-1.5">
              <Lock class="size-3.5 text-ad-accent-text" />
              <span>Credenciales Maestras de la Cuenta</span>
            </span>
            <span class="text-[10px] text-ad-faint tabular-nums">Solo visible por el administrador</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="text-[11px] text-ad-dim block mb-1">Correo de la cuenta</label>
              <div class="relative">
                <input
                  v-model="correoMaestro"
                  type="email"
                  name="cuenta-streaming-correo"
                  autocomplete="off"
                  data-lpignore="true"
                  data-1p-ignore
                  placeholder="ej. netflix.cuenta@streamstore.net"
                  class="w-full rounded-lg border border-ad-line bg-ad-panel pl-8 pr-3 py-1.5 text-xs text-ad-text placeholder-ad-faint focus:border-ad-accent focus:outline-none"
                />
                <Mail class="absolute left-2.5 top-2 size-3.5 text-ad-faint" />
              </div>
              <p v-if="correoRepetido" class="mt-1 text-[10px] font-semibold text-rose-400">
                Ese correo ya está en {{ plataformaActual?.nombre }}. Usa uno diferente.
              </p>
            </div>

            <div>
              <label class="text-[11px] text-ad-dim block mb-1">Contraseña maestra</label>
              <div class="relative">
                <input
                  v-model="claveMaestra"
                  :type="mostrarClave ? 'text' : 'password'"
                  name="cuenta-streaming-clave"
                  autocomplete="new-password"
                  data-lpignore="true"
                  data-1p-ignore
                  placeholder="ej. Pass#2026"
                  class="w-full rounded-lg border border-ad-line bg-ad-panel pl-8 pr-8 py-1.5 text-xs text-ad-text placeholder-ad-faint focus:border-ad-accent focus:outline-none tabular-nums"
                />
                <Lock class="absolute left-2.5 top-2 size-3.5 text-ad-faint" />
                <button
                  type="button"
                  class="absolute right-2.5 top-2 text-ad-dim hover:text-ad-text cursor-pointer"
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
          <div class="sm:col-span-2 flex items-start justify-between gap-3">
            <div>
              <p class="text-xs font-semibold text-ad-text">Precio en el catálogo de {{ plataformaActual?.nombre || 'la plataforma' }}</p>
              <p class="text-[11px] text-ad-dim">
                Es lo que pagan los clientes nuevos. Aplica a todas las cuentas de esta plataforma.
              </p>
            </div>
            <span v-if="cargandoCatalogo" class="shrink-0 text-[10px] text-ad-faint">Cargando precios…</span>
            <span
              v-else-if="cambiaCatalogo"
              class="shrink-0 rounded-md border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-bold text-amber-300"
            >Se actualizará el catálogo</span>
          </div>

          <div>
            <label for="precio-completa" class="text-xs font-semibold text-ad-text mb-1.5 flex items-center justify-between">
              <span class="chip-completa">Cuenta completa</span>
              <span class="text-[10px] tabular-nums text-ad-dim">
                {{ catalogoActual?.completa !== undefined ? `Hoy ${formatPrice(catalogoActual.completa)}` : 'Producto nuevo' }}
              </span>
            </label>
            <div class="relative">
              <input
                id="precio-completa"
                v-model.number="precioCompleta"
                type="number"
                step="500"
                min="1000"
                class="w-full rounded-lg border border-ad-line bg-ad-panel pl-8 pr-3 py-1.5 text-xs tabular-nums font-semibold text-ad-text focus:border-ad-accent focus:outline-none"
              />
              <Coins class="absolute left-2.5 top-2 size-3.5 text-ad-faint" />
            </div>
          </div>

          <div>
            <label for="precio-pantalla" class="text-xs font-semibold text-ad-text mb-1.5 flex items-center justify-between">
              <span class="chip-pantalla">1 pantalla (PIN)</span>
              <span class="text-[10px] tabular-nums text-ad-dim">
                {{ catalogoActual?.pantalla !== undefined ? `Hoy ${formatPrice(catalogoActual.pantalla)}` : 'Producto nuevo' }}
              </span>
            </label>
            <div class="relative">
              <input
                id="precio-pantalla"
                v-model.number="precioPantalla"
                type="number"
                step="500"
                min="1000"
                class="w-full rounded-lg border border-ad-line bg-ad-panel pl-8 pr-3 py-1.5 text-xs tabular-nums font-semibold text-ad-text focus:border-ad-accent focus:outline-none"
              />
              <Coins class="absolute left-2.5 top-2 size-3.5 text-ad-faint" />
            </div>
          </div>

          <fieldset class="sm:col-span-2">
            <legend class="text-xs font-semibold text-ad-text mb-1.5 flex w-full items-center justify-between">
              <span>Duración del Servicio</span>
              <span class="text-[10px] tabular-nums text-ad-dim">
                {{ catalogoActual?.dias !== undefined && catalogoActual.dias !== duracionDias ? `Hoy ${catalogoActual.dias} días → ` : '' }}{{ duracionDias }} días por compra
              </span>
            </legend>
            <div role="radiogroup" aria-label="Duración del servicio" class="grid grid-cols-5 gap-1.5">
              <button
                v-for="d in DURACIONES"
                :key="d.dias"
                type="button"
                role="radio"
                :aria-checked="duracionDias === d.dias"
                class="rounded-lg border py-1.5 text-center transition-colors cursor-pointer"
                :class="duracionDias === d.dias
                  ? 'border-cyan-400 bg-cyan-400/10 text-white'
                  : 'border-ad-line bg-ad-panel text-ad-dim hover:border-white/25 hover:text-white'"
                @click="duracionDias = d.dias"
              >
                <span class="block text-xs font-bold">{{ d.corto }}</span>
                <span class="block text-[10px] opacity-80">{{ d.largo }}</span>
              </button>
            </div>
          </fieldset>
        </div>

        <!-- SECCIÓN 4: CANTIDAD DE PANTALLAS / PERFILES Y PINES -->
        <div class="space-y-3 border-t border-ad-line pt-4">
          <div class="flex items-center justify-between">
            <div>
              <label class="text-xs font-semibold text-ad-text block">
                Cantidad de Pantallas / Perfiles Simultáneos
              </label>
              <p class="text-[11px] text-ad-dim">
                Define cuántos perfiles individuales se generarán para esta cuenta.
              </p>
            </div>

            <!-- Stepper interactivo [-] [ 4 ] [+] -->
            <div class="flex items-center gap-1.5 bg-ad-panel p-1 rounded-lg border border-ad-line">
              <button
                type="button"
                class="size-6 rounded bg-ad-hover flex items-center justify-center text-ad-text hover:text-ad-text hover:bg-ad-hover transition-colors cursor-pointer disabled:opacity-30"
                :disabled="totalPantallas <= 1"
                @click="adjustScreens(totalPantallas - 1)"
              >
                <Minus class="size-3" />
              </button>
              <span class="tabular-nums text-xs font-semibold px-2 text-ad-text min-w-6 text-center">
                {{ totalPantallas }}
              </span>
              <button
                type="button"
                class="size-6 rounded bg-ad-hover flex items-center justify-center text-ad-text hover:text-ad-text hover:bg-ad-hover transition-colors cursor-pointer disabled:opacity-30"
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
              class="py-1 rounded-lg text-xs tabular-nums font-semibold border transition-all cursor-pointer"
              :class="[
                totalPantallas === num
                  ? 'border-ad-accent bg-ad-accent/15 text-ad-accent-text'
                  : 'border-ad-line bg-ad-panel text-ad-dim hover:border-ad-line hover:text-ad-text'
              ]"
              @click="adjustScreens(num)"
            >
              {{ num }} {{ num === 1 ? 'pantalla' : 'pantallas' }}
            </button>
          </div>

          <!-- Desglose de perfiles y pines -->
          <div class="space-y-1.5 pt-1">
            <span class="text-[10px] tabular-nums font-semibold text-ad-dim block">
              Configuración de perfiles y pines individuales:
            </span>
            <div class="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              <div
                v-for="pantalla in pantallasList"
                :key="pantalla.numero"
                class="rounded-lg border border-ad-line bg-ad-panel p-2 flex items-center gap-2 text-xs"
              >
                <span class="size-5 rounded bg-ad-hover border border-ad-line flex items-center justify-center tabular-nums font-semibold text-ad-accent-text text-[10px] shrink-0">
                  #{{ pantalla.numero }}
                </span>

                <input
                  v-model="pantalla.perfil"
                  type="text"
                  placeholder="Nombre perfil"
                  class="rounded border border-ad-line bg-ad-panel py-1 px-2 text-xs text-ad-text flex-1 focus:border-ad-accent focus:outline-none"
                />

                <div class="relative w-28 shrink-0">
                  <input
                    v-model="pantalla.pin"
                    type="text"
                    maxlength="6"
                    placeholder="PIN (opc.)"
                    class="w-full rounded border border-ad-line bg-ad-panel py-1 pl-6 pr-2 text-xs text-ad-text tabular-nums focus:border-ad-accent focus:outline-none"
                  />
                  <KeyRound class="absolute left-1.5 top-1.5 size-3 text-ad-faint" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Acciones del Modal -->
        <div class="flex items-center justify-end gap-3 border-t border-ad-line pt-4">
          <button
            type="button"
            class="px-4 py-2 rounded-lg border border-ad-line bg-ad-hover hover:bg-ad-hover text-xs font-semibold text-ad-text hover:text-ad-text transition-colors cursor-pointer"
            @click="emit('close')"
          >
            Cancelar
          </button>

          <button
            type="submit"
            class="btn-primary text-xs py-2 px-5 font-semibold cursor-pointer"
            :disabled="isSubmitting"
          >
            <span v-if="isSubmitting">Cargando al catálogo...</span>
            <span v-else>
              Guardar Cuenta al Catálogo
            </span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
