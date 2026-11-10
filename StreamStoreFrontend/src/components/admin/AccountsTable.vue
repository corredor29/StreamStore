<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import CustomSelect from '@/components/common/CustomSelect.vue'
import { 
  Check, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  Copy, 
  Eye, 
  KeyRound, 
  Layers, 
  Search, 
  Trash2, 
  Tv, 
  X 
} from '@lucide/vue'
import type { CuentaAdmin, Plataforma } from '@/types'
import { adminService } from '@/services/adminService'
import { portadaPlataforma } from '@/utils/platformArt'

const props = defineProps<{
  cuentas: CuentaAdmin[]
  plataformas: Plataforma[]
}>()

const emit = defineEmits<{
  openModal: []
  cuentaEliminada: []
}>()

const expandedAccounts = ref<Record<number, boolean>>({})
const copiedNotice = ref<string | null>(null)
const deletingId = ref<number | null>(null)

const plataformaFiltro = ref<string>('TODAS')
const estadoFiltro = ref<string>('TODOS')
const searchQuery = ref('')
const sortBy = ref<'id-desc' | 'disponibles-desc' | 'disponibles-asc' | 'plataforma'>('id-desc')

// Paginación interactiva
const itemsPerPage = ref(6)
const currentPage = ref(1)

function toggleExpand(id: number) {
  expandedAccounts.value[id] = !expandedAccounts.value[id]
}

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text)
    copiedNotice.value = `${label} copiado exitosamente`
    setTimeout(() => {
      copiedNotice.value = null
    }, 2000)
  } catch (err) {}
}

async function handleEliminarCuenta(cuenta: CuentaAdmin) {
  const nombre = cuenta.plataforma?.nombre || `Cuenta #${cuenta.id}`
  const vendidas = cuenta.totalPantallas - cuenta.pantallasDisponibles
  const aviso = vendidas > 0
    ? `\n\nTiene ${vendidas} pantalla(s) vendida(s): si algún cliente aún tiene acceso no se podrá eliminar, y si ya vencieron se desactivará para conservar el historial.`
    : ''
  if (!confirm(`¿Eliminar la cuenta ${nombre} #${cuenta.id} del inventario?${aviso}`)) {
    return
  }

  deletingId.value = cuenta.id
  try {
    const res = await adminService.eliminarCuenta(cuenta.id)
    copiedNotice.value = res.mensaje
    setTimeout(() => (copiedNotice.value = null), 3500)
    emit('cuentaEliminada')
  } catch (err: any) {
    alert(err?.message || 'No se pudo eliminar la cuenta.')
  } finally {
    deletingId.value = null
  }
}

function getEstadoBadge(estado: CuentaAdmin['estado']) {
  switch (estado) {
    case 'DISPONIBLE':
      return { 
        label: 'Disponible', 
        dot: 'bg-ad-ok',
        text: 'text-ad-ok',
        bg: 'bg-ad-ok/10 border-ad-ok/20'
      }
    case 'PARCIAL':
      return { 
        label: 'En uso parcial', 
        dot: 'bg-ad-warn',
        text: 'text-ad-warn',
        bg: 'bg-ad-warn/10 border-ad-warn/20'
      }
    case 'VENDIDA':
      return { 
        label: 'Agotada', 
        dot: 'bg-ad-err',
        text: 'text-ad-err',
        bg: 'bg-ad-err/10 border-ad-err/20'
      }
    default:
      return { 
        label: 'Inactiva', 
        dot: 'bg-ad-hover',
        text: 'text-ad-dim',
        bg: 'bg-ad-hover border-ad-line'
      }
  }
}


const opcionesPlataforma = computed(() => [
  { value: 'TODAS', label: `Todas las plataformas (${props.cuentas.length})` },
  ...props.plataformas.map((p: Plataforma) => ({ value: p.slug || p.nombre, label: p.nombre })),
])

const opcionesEstadoCuentas = [
  { value: 'TODOS', label: 'Todos los estados' },
  { value: 'DISPONIBLE', label: 'Disponibles' },
  { value: 'PARCIAL', label: 'En uso parcial' },
  { value: 'VENDIDA', label: 'Agotadas' },
]

const opcionesSortCuentas = [
  { value: 'id-desc', label: 'Más recientes primero' },
  { value: 'disponibles-desc', label: 'Mayor stock libre' },
  { value: 'disponibles-asc', label: 'Menor stock libre' },
  { value: 'plataforma', label: 'Nombre (A-Z)' },
]

// Filtro y Ordenamiento
const cuentasFiltradas = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()

  return props.cuentas
    .filter((c) => {
      const matchesPlat =
        plataformaFiltro.value === 'TODAS' ||
        c.plataforma?.slug === plataformaFiltro.value ||
        c.plataformaId === Number(plataformaFiltro.value) ||
        (c.plataforma?.nombre && c.plataforma.nombre.toLowerCase() === plataformaFiltro.value.toLowerCase())

      const matchesEstado =
        estadoFiltro.value === 'TODOS' || c.estado === estadoFiltro.value

      const matchesSearch =
        !q ||
        (c.correo && c.correo.toLowerCase().includes(q)) ||
        (c.plataforma?.nombre && c.plataforma.nombre.toLowerCase().includes(q)) ||
        c.id.toString() === q.replace('#', '')

      return matchesPlat && matchesEstado && matchesSearch
    })
    .sort((a, b) => {
      if (sortBy.value === 'id-desc') return b.id - a.id
      if (sortBy.value === 'disponibles-desc') return b.pantallasDisponibles - a.pantallasDisponibles
      if (sortBy.value === 'disponibles-asc') return a.pantallasDisponibles - b.pantallasDisponibles
      if (sortBy.value === 'plataforma') {
        const nomA = a.plataforma?.nombre || ''
        const nomB = b.plataforma?.nombre || ''
        return nomA.localeCompare(nomB)
      }
      return 0
    })
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(cuentasFiltradas.value.length / itemsPerPage.value))
})

const cuentasPaginadas = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return cuentasFiltradas.value.slice(start, start + itemsPerPage.value)
})

// Solo se rellena cuando hay más de una página, para que no cambie la altura al navegar
const filasRelleno = computed(() => {
  if (totalPages.value <= 1) return 0
  return Math.max(0, itemsPerPage.value - cuentasPaginadas.value.length)
})

// Reiniciar a página 1 cuando los filtros cambien
watch([plataformaFiltro, estadoFiltro, searchQuery, sortBy], () => {
  currentPage.value = 1
})

function irAPagina(pagina: number) {
  if (pagina >= 1 && pagina <= totalPages.value) {
    currentPage.value = pagina
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Toast de Notificación Copiado -->
    <div
      v-if="copiedNotice"
      class="hud-panel fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-ad-text"
    >
      <Check class="size-4 text-ad-ok" />
      <span>{{ copiedNotice }}</span>
    </div>

    <!-- Barra de Herramientas y Filtros -->
    <div class="rounded-2xl border border-ad-line to-[#0E1322] p-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      <!-- Buscador -->
      <div class="relative flex-1 max-w-md">
        <Search class="absolute left-3 top-2.5 size-4 text-ad-dim" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por correo, plataforma o #ID..."
          class="w-full rounded-lg border border-ad-line bg-ad-panel pl-9 pr-8 py-2 text-xs text-ad-text placeholder:text-ad-faint focus:border-ad-accent focus:outline-none transition-colors"
        />
        <button
          v-if="searchQuery"
          type="button"
          class="absolute right-2.5 top-2.5 text-ad-dim hover:text-ad-text cursor-pointer"
          @click="searchQuery = ''"
        >
          <X class="size-3.5" />
        </button>
      </div>

      <!-- Filtros Dropdown -->
      <div class="flex flex-wrap items-center gap-2 text-xs">
        <!-- Selector Plataforma -->
        <CustomSelect
          v-model="plataformaFiltro"
          :options="opcionesPlataforma"
          aria-label="Filtrar por plataforma"
        />

        <!-- Selector Estado -->
        <CustomSelect
          v-model="estadoFiltro"
          :options="opcionesEstadoCuentas"
          aria-label="Filtrar por estado"
        />

        <!-- Selector Orden -->
        <CustomSelect
          v-model="sortBy"
          :options="opcionesSortCuentas"
          aria-label="Ordenar cuentas"
        />

        <span class="text-ad-dim tabular-nums text-[11px] ml-1 hidden sm:inline">
          {{ cuentasFiltradas.length }} en total
        </span>
      </div>
    </div>

    <!-- TABLA DE INVENTARIO CON PROFUNDIDAD Y SIN EMOJIS -->
    <div class="hud-panel">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="border-b border-ad-line bg-ad-raised/40 font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-ad-dim">
            <tr>
              <th class="py-3.5 px-4 w-12 text-center">ID</th>
              <th class="py-3.5 px-4">Plataforma</th>
              <th class="py-3.5 px-4">Correo Maestro / Acceso</th>
              <th class="py-3.5 px-4 text-center">Pantallas Libres</th>
              <th class="py-3.5 px-4 text-center">Estado</th>
              <th class="py-3.5 px-4 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-ad-line">
            <template v-for="cuenta in cuentasPaginadas" :key="cuenta.id">
              <tr
                class="h-14 hover:bg-ad-hover transition-colors cursor-pointer group"
                :class="{ 'bg-ad-hover': expandedAccounts[cuenta.id] }"
                @click="toggleExpand(cuenta.id)"
              >
                <!-- ID -->
                <td class="py-3.5 px-4 text-center tabular-nums text-ad-dim text-xs font-semibold">
                  #{{ cuenta.id }}
                </td>

                <!-- Plataforma -->
                <td class="py-3.5 px-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <img
                      :src="portadaPlataforma(cuenta.plataforma?.nombre, cuenta.plataforma?.slug, cuenta.plataforma?.coverUrl)"
                      alt=""
                      class="h-8 w-12 shrink-0 rounded-md border border-white/10 bg-black object-cover"
                    />
                    <span class="font-hud font-bold uppercase tracking-tight text-ad-text group-hover:text-ad-accent-text transition-colors">
                      {{ cuenta.plataforma?.nombre || 'Plataforma' }}
                    </span>
                  </div>
                </td>

                <!-- Correo Maestro con Icono SVG (Sin Emojis) -->
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-2">
                    <span
                      v-if="cuenta.correo && !cuenta.correo.includes('pendiente')"
                      class="tabular-nums text-ad-text text-xs font-medium truncate max-w-xs"
                    >
                      {{ cuenta.correo }}
                    </span>
                    <span v-else class="inline-flex items-center gap-1.5 rounded-lg bg-ad-warn/10 border border-ad-warn/20 text-ad-warn px-2.5 py-0.5 text-[11px] font-medium">
                      <KeyRound class="size-3 text-ad-warn shrink-0" />
                      <span>Asignación automática post-compra</span>
                    </span>

                    <button
                      v-if="cuenta.correo && !cuenta.correo.includes('pendiente')"
                      type="button"
                      class="text-ad-dim hover:text-ad-text p-1 rounded-md transition-colors cursor-pointer"
                      title="Copiar correo"
                      @click.stop="copyText(cuenta.correo, 'Correo')"
                    >
                      <Copy class="size-3" />
                    </button>
                  </div>
                </td>

                <!-- Capacidad / Pantallas -->
                <td class="py-3.5 px-4 text-center whitespace-nowrap">
                  <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border tabular-nums"
                    :class="[
                      cuenta.pantallasDisponibles === 0
                        ? 'border-ad-err/20 bg-ad-err/10 text-ad-err'
                        : cuenta.pantallasDisponibles < cuenta.totalPantallas
                        ? 'border-ad-warn/20 bg-ad-warn/10 text-ad-warn'
                        : 'border-ad-ok/20 bg-ad-ok/10 text-ad-ok'
                    ]"
                  >
                    <Tv class="size-3" />
                    <span class="font-bold text-xs">
                      {{ cuenta.pantallasDisponibles }} de {{ cuenta.totalPantallas }} libres
                    </span>
                  </div>
                </td>

                <!-- Estado -->
                <td class="py-3.5 px-4 text-center whitespace-nowrap">
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border"
                    :class="[getEstadoBadge(cuenta.estado).bg, getEstadoBadge(cuenta.estado).text]"
                  >
                    <span class="size-1.5 rounded-full" :class="getEstadoBadge(cuenta.estado).dot" />
                    {{ getEstadoBadge(cuenta.estado).label }}
                  </span>
                </td>

                <!-- Acciones -->
                <td class="py-3.5 px-4 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-1.5">
                    <!-- Botón Ver Perfiles -->
                    <button
                      type="button"
                      class="inline-flex items-center gap-1 text-ad-text hover:text-ad-text font-medium text-xs px-2.5 py-1 rounded-lg border border-ad-line bg-ad-hover hover:bg-ad-hover transition-colors cursor-pointer"
                      @click.stop="toggleExpand(cuenta.id)"
                    >
                      <Eye class="size-3" />
                      <span>{{ expandedAccounts[cuenta.id] ? 'Ocultar' : 'Perfiles' }}</span>
                      <ChevronDown
                        class="size-3 transition-transform duration-200"
                        :class="{ 'rotate-180': expandedAccounts[cuenta.id] }"
                      />
                    </button>

                    <!-- Botón Eliminar Cuenta -->
                    <button
                      type="button"
                      class="text-ad-dim hover:text-ad-err p-1.5 rounded-lg hover:bg-ad-err/10 transition-colors cursor-pointer"
                      title="Eliminar esta cuenta del inventario"
                      :disabled="deletingId === cuenta.id"
                      @click.stop="handleEliminarCuenta(cuenta)"
                    >
                      <Trash2 class="size-3.5" :class="{ 'animate-pulse text-ad-err': deletingId === cuenta.id }" />
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Desglose de Perfiles en Fila Expandida -->
              <tr v-if="expandedAccounts[cuenta.id]" class="bg-ad-panel">
                <td colspan="6" class="p-4 sm:p-5 border-t border-b border-ad-line">
                  <div class="space-y-3">
                    <div class="flex items-center justify-between text-xs">
                      <span class="font-bold text-ad-text text-xs flex items-center gap-1.5">
                        <KeyRound class="size-3.5 text-ad-accent-text" />
                        <span>Perfiles Configurados en Cuenta #{{ cuenta.id }} ({{ cuenta.plataforma?.nombre }})</span>
                      </span>
                      <button
                        v-if="cuenta.correo"
                        type="button"
                        class="text-ad-accent-text hover:text-ad-accent-text text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        @click="copyText(`Plataforma: ${cuenta.plataforma?.nombre}\nCorreo: ${cuenta.correo}\nPerfiles Totales: ${cuenta.totalPantallas}`, 'Datos de Cuenta')"
                      >
                        <Copy class="size-3" />
                        <span>Copiar Ficha Completa</span>
                      </button>
                    </div>

                    <!-- Cuadrícula de Perfiles -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                      <div
                        v-for="p in cuenta.pantallas"
                        :key="p.id"
                        class="rounded-xl border p-2.5 text-xs flex flex-col justify-between gap-1.5"
                        :class="[
                          p.estado === 'DISPONIBLE'
                            ? 'border-ad-line bg-ad-panel'
                            : 'border-ad-accent/30 bg-ad-accent/20'
                        ]"
                      >
                        <div class="flex items-center justify-between">
                          <span class="tabular-nums text-ad-dim text-[10px] font-semibold">
                            Pantalla #{{ p.numero }}
                          </span>
                          <span
                            class="text-[10px] font-semibold"
                            :class="p.estado === 'DISPONIBLE' ? 'text-ad-ok' : 'text-ad-accent-text'"
                          >
                            {{ p.estado === 'DISPONIBLE' ? 'Libre' : 'Asignada' }}
                          </span>
                        </div>

                        <p class="font-medium text-ad-text truncate text-xs">
                          {{ p.perfil }}
                        </p>

                        <div class="flex items-center justify-between pt-1 border-t border-ad-line text-[11px]">
                          <span class="text-ad-dim">PIN: <strong class="tabular-nums text-ad-text">{{ p.pin || 'Sin PIN' }}</strong></span>
                          <button
                            v-if="p.pin"
                            type="button"
                            class="text-ad-dim hover:text-ad-text p-0.5 cursor-pointer"
                            title="Copiar PIN"
                            @click="copyText(p.pin, `PIN Pantalla #${p.numero}`)"
                          >
                            <Copy class="size-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Filas de relleno: mantienen la altura fija de la página -->
            <tr
              v-for="n in filasRelleno"
              :key="`relleno-${n}`"
              class="h-14 pointer-events-none"
              aria-hidden="true"
            >
              <td colspan="6"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Estado Vacío -->
      <div v-if="cuentasFiltradas.length === 0" class="p-12 text-center text-ad-dim space-y-2">
        <Layers class="size-8 mx-auto text-ad-faint" />
        <p class="text-sm font-semibold text-ad-text">No hay cuentas que coincidan con los filtros</p>
        <p class="text-xs">Prueba restableciendo los filtros o busca con otro término.</p>
        <div class="pt-2">
          <button
            type="button"
            class="text-xs text-ad-accent-text hover:underline cursor-pointer"
            @click="plataformaFiltro = 'TODAS'; estadoFiltro = 'TODOS'; searchQuery = ''"
          >
            Restablecer todos los filtros
          </button>
        </div>
      </div>
    </div>

    <!-- BARRA DE PAGINACIÓN INTERACTIVA (< 1 2 3 4 >) -->
    <div
      v-if="cuentasFiltradas.length > 0"
      class="rounded-2xl border border-ad-line to-[#0E1322] px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
    >
      <div class="text-ad-dim tabular-nums text-[11px]">
        Mostrando cuentas <strong class="text-ad-text">{{ (currentPage - 1) * itemsPerPage + 1 }}</strong> a
        <strong class="text-ad-text">{{ Math.min(currentPage * itemsPerPage, cuentasFiltradas.length) }}</strong> de
        <strong class="text-ad-text">{{ cuentasFiltradas.length }}</strong>
      </div>

      <!-- Controles de Navegación de Página -->
      <div class="flex items-center gap-1.5">
        <!-- Botón Anterior -->
        <button
          type="button"
          class="size-8 rounded-lg border border-ad-line bg-ad-panel hover:bg-ad-hover text-ad-text hover:text-ad-text flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          :disabled="currentPage === 1"
          title="Página anterior"
          @click="irAPagina(currentPage - 1)"
        >
          <ChevronLeft class="size-4" />
        </button>

        <!-- Botones Numéricos de Página -->
        <button
          v-for="page in totalPages"
          :key="page"
          type="button"
          class="size-8 rounded-lg tabular-nums text-xs font-semibold transition-all cursor-pointer"
          :class="[
            currentPage === page
              ? 'bg-ad-accent text-ad-on-accent border border-ad-accent'
              : 'border border-ad-line bg-ad-panel text-ad-dim hover:text-ad-text hover:border-ad-line'
          ]"
          @click="irAPagina(page)"
        >
          {{ page }}
        </button>

        <!-- Botón Siguiente -->
        <button
          type="button"
          class="size-8 rounded-lg border border-ad-line bg-ad-panel hover:bg-ad-hover text-ad-text hover:text-ad-text flex items-center justify-center transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          :disabled="currentPage === totalPages"
          title="Página siguiente"
          @click="irAPagina(currentPage + 1)"
        >
          <ChevronRight class="size-4" />
        </button>
      </div>
    </div>
  </div>
</template>
