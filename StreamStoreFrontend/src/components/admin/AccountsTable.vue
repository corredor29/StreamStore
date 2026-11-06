<script setup lang="ts">
import { computed, ref } from 'vue'
import { 
  Check, 
  ChevronDown, 
  ChevronRight, 
  Copy, 
  Filter, 
  KeyRound, 
  Layers, 
  Lock, 
  Mail, 
  Plus, 
  Search, 
  Sparkles, 
  Tv, 
  X 
} from '@lucide/vue'
import type { CuentaAdmin, Plataforma } from '@/types'

const props = defineProps<{
  cuentas: CuentaAdmin[]
  plataformas: Plataforma[]
}>()

const emit = defineEmits<{
  openModal: []
}>()

const expandedAccounts = ref<Record<number, boolean>>({})
const copiedNotice = ref<string | null>(null)

const plataformaFiltro = ref<string>('TODAS')
const estadoFiltro = ref<string>('TODOS')
const searchQuery = ref('')
const sortBy = ref<'id-desc' | 'disponibles-desc' | 'disponibles-asc' | 'plataforma'>('id-desc')

function toggleExpand(id: number) {
  expandedAccounts.value[id] = !expandedAccounts.value[id]
}

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text)
    copiedNotice.value = `¡${label} copiado!`
    setTimeout(() => {
      copiedNotice.value = null
    }, 2000)
  } catch (err) {}
}

function getEstadoBadge(estado: CuentaAdmin['estado']) {
  switch (estado) {
    case 'DISPONIBLE':
      return { 
        label: 'Disponible', 
        dot: 'bg-emerald-400',
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10'
      }
    case 'PARCIAL':
      return { 
        label: 'Parcial', 
        dot: 'bg-amber-400',
        text: 'text-amber-400',
        bg: 'bg-amber-500/10'
      }
    case 'VENDIDA':
      return { 
        label: 'Agotada', 
        dot: 'bg-purple-400',
        text: 'text-purple-300',
        bg: 'bg-purple-500/10'
      }
    default:
      return { 
        label: 'Inactiva', 
        dot: 'bg-slate-400',
        text: 'text-slate-400',
        bg: 'bg-slate-500/10'
      }
  }
}

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
</script>

<template>
  <div class="space-y-3">
    <!-- Toast de Notificación Copiado -->
    <div
      v-if="copiedNotice"
      class="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border border-white/15 bg-[#141B2D] px-3.5 py-2 text-xs font-semibold text-white shadow-xl shadow-black/80"
    >
      <Check class="size-4 text-emerald-400" />
      <span>{{ copiedNotice }}</span>
    </div>

    <!-- Barra de Herramientas Unificada (Estilo Stripe/Linear) -->
    <div class="rounded-xl border border-white/10 bg-[#0D121F] p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      <!-- Izquierda: Buscador Integrado -->
      <div class="relative flex-1 max-w-md">
        <Search class="absolute left-3 top-2.5 size-4 text-slate-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar cuenta por correo, plataforma o ID..."
          class="w-full rounded-lg border border-white/10 bg-[#141B2D] pl-9 pr-8 py-2 text-xs text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none transition-colors"
        />
        <button
          v-if="searchQuery"
          type="button"
          class="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
          @click="searchQuery = ''"
        >
          <X class="size-3.5" />
        </button>
      </div>

      <!-- Derecha: Filtros Compactos Dropdown & Contador -->
      <div class="flex flex-wrap items-center gap-2 text-xs">
        <!-- Selector Plataforma -->
        <select
          v-model="plataformaFiltro"
          class="rounded-lg border border-white/10 bg-[#141B2D] px-3 py-2 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none cursor-pointer"
        >
          <option value="TODAS">Todas las plataformas ({{ props.cuentas.length }})</option>
          <option v-for="plat in plataformas" :key="plat.id" :value="plat.slug || plat.nombre">
            {{ plat.nombre }}
          </option>
        </select>

        <!-- Selector Estado -->
        <select
          v-model="estadoFiltro"
          class="rounded-lg border border-white/10 bg-[#141B2D] px-3 py-2 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none cursor-pointer"
        >
          <option value="TODOS">Todos los estados</option>
          <option value="DISPONIBLE">Disponibles</option>
          <option value="PARCIAL">Parciales</option>
          <option value="VENDIDA">Agotadas</option>
        </select>

        <!-- Selector Orden -->
        <select
          v-model="sortBy"
          class="rounded-lg border border-white/10 bg-[#141B2D] px-3 py-2 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none cursor-pointer"
        >
          <option value="id-desc">Más recientes</option>
          <option value="disponibles-desc">Mayor stock libre</option>
          <option value="disponibles-asc">Menor stock libre</option>
          <option value="plataforma">Nombre (A-Z)</option>
        </select>

        <span class="text-slate-400 font-mono text-[11px] ml-1 hidden sm:inline">
          {{ cuentasFiltradas.length }} de {{ props.cuentas.length }}
        </span>
      </div>
    </div>

    <!-- TABLA DE DATOS PROFESIONAL (ALTA DENSIDAD, SIN BLOQUES FLOTANTES REPETITIVOS) -->
    <div class="rounded-xl border border-white/10 bg-[#0D121F] overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <!-- Encabezado de la Tabla -->
          <thead class="bg-[#121829] border-b border-white/10 text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
            <tr>
              <th class="py-3 px-4 w-12 text-center">ID</th>
              <th class="py-3 px-4">Plataforma</th>
              <th class="py-3 px-4">Correo Maestro / Acceso</th>
              <th class="py-3 px-4 text-center">Perfiles Libres</th>
              <th class="py-3 px-4 text-center">Estado</th>
              <th class="py-3 px-4 text-right">Acción</th>
            </tr>
          </thead>

          <!-- Filas de Cuentas -->
          <tbody class="divide-y divide-white/[0.06]">
            <template v-for="cuenta in cuentasFiltradas" :key="cuenta.id">
              <!-- Fila Principal de la Cuenta -->
              <tr
                class="hover:bg-[#141B2E] transition-colors cursor-pointer group"
                :class="{ 'bg-[#141B2E]': expandedAccounts[cuenta.id] }"
                @click="toggleExpand(cuenta.id)"
              >
                <!-- ID -->
                <td class="py-3.5 px-4 text-center font-mono text-slate-400 text-xs font-semibold">
                  #{{ cuenta.id }}
                </td>

                <!-- Plataforma con Logo/Pill -->
                <td class="py-3.5 px-4 whitespace-nowrap">
                  <div class="flex items-center gap-2.5">
                    <div
                      class="size-6 rounded flex items-center justify-center text-[10px] font-bold text-white uppercase shrink-0"
                      :style="{ backgroundColor: cuenta.plataforma?.color || '#8057FF' }"
                    >
                      {{ (cuenta.plataforma?.nombre || 'SS').slice(0, 2) }}
                    </div>
                    <span class="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {{ cuenta.plataforma?.nombre || 'Plataforma' }}
                    </span>
                  </div>
                </td>

                <!-- Correo Maestro -->
                <td class="py-3.5 px-4">
                  <div class="flex items-center gap-2">
                    <span
                      v-if="cuenta.correo && !cuenta.correo.includes('pendiente')"
                      class="font-mono text-slate-200 text-xs font-medium truncate max-w-xs"
                    >
                      {{ cuenta.correo }}
                    </span>
                    <span v-else class="text-amber-400/90 text-xs font-medium">
                      Asignación post-compra
                    </span>

                    <button
                      v-if="cuenta.correo && !cuenta.correo.includes('pendiente')"
                      type="button"
                      class="text-slate-400 hover:text-white p-1 rounded transition-colors"
                      title="Copiar correo"
                      @click.stop="copyText(cuenta.correo, 'Correo')"
                    >
                      <Copy class="size-3" />
                    </button>
                  </div>
                </td>

                <!-- Capacidad / Perfiles Libres -->
                <td class="py-3.5 px-4 text-center whitespace-nowrap">
                  <div class="inline-flex items-center gap-2">
                    <span class="font-mono font-bold text-xs" :class="cuenta.pantallasDisponibles > 0 ? 'text-white' : 'text-slate-400'">
                      {{ cuenta.pantallasDisponibles }} / {{ cuenta.totalPantallas }}
                    </span>
                    <!-- Barra de progreso discreta -->
                    <div class="w-16 h-1.5 rounded-full bg-slate-700/60 overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all"
                        :class="cuenta.pantallasDisponibles === 0 ? 'bg-purple-500' : cuenta.pantallasDisponibles <= 1 ? 'bg-amber-400' : 'bg-emerald-400'"
                        :style="{ width: `${(cuenta.pantallasDisponibles / cuenta.totalPantallas) * 100}%` }"
                      />
                    </div>
                  </div>
                </td>

                <!-- Estado (Badge Sobrio, sin neón) -->
                <td class="py-3.5 px-4 text-center whitespace-nowrap">
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                    :class="[getEstadoBadge(cuenta.estado).bg, getEstadoBadge(cuenta.estado).text]"
                  >
                    <span class="size-1.5 rounded-full" :class="getEstadoBadge(cuenta.estado).dot" />
                    {{ getEstadoBadge(cuenta.estado).label }}
                  </span>
                </td>

                <!-- Botón Desplegar Perfiles -->
                <td class="py-3.5 px-4 text-right whitespace-nowrap">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1 text-slate-300 hover:text-white font-medium text-xs px-2.5 py-1 rounded-md hover:bg-white/5 transition-colors"
                    @click.stop="toggleExpand(cuenta.id)"
                  >
                    <span>{{ expandedAccounts[cuenta.id] ? 'Cerrar' : 'Perfiles' }}</span>
                    <ChevronDown
                      class="size-3.5 transition-transform duration-200"
                      :class="{ 'rotate-180': expandedAccounts[cuenta.id] }"
                    />
                  </button>
                </td>
              </tr>

              <!-- Desglose de Perfiles en Fila Acordeón Expandida -->
              <tr v-if="expandedAccounts[cuenta.id]" class="bg-[#090D17]">
                <td colspan="6" class="p-4 sm:p-5 border-t border-b border-white/[0.08]">
                  <div class="space-y-3">
                    <div class="flex items-center justify-between text-xs">
                      <span class="font-bold uppercase tracking-wider text-slate-400 text-[11px]">
                        Perfiles Configurados en Cuenta #{{ cuenta.id }} ({{ cuenta.plataforma?.nombre }})
                      </span>
                      <button
                        v-if="cuenta.correo"
                        type="button"
                        class="text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1"
                        @click="copyText(`Servicio: ${cuenta.plataforma?.nombre}\nEmail: ${cuenta.correo}\nPerfiles: ${cuenta.totalPantallas}`, 'Ficha')"
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
                        class="rounded-lg border p-2.5 text-xs flex flex-col justify-between gap-1.5"
                        :class="[
                          p.estado === 'DISPONIBLE'
                            ? 'border-white/10 bg-[#111726]'
                            : 'border-purple-500/30 bg-purple-950/20'
                        ]"
                      >
                        <div class="flex items-center justify-between">
                          <span class="font-mono text-slate-400 text-[10px] font-bold">
                            Pantalla #{{ p.numero }}
                          </span>
                          <span
                            class="text-[10px] font-semibold"
                            :class="p.estado === 'DISPONIBLE' ? 'text-emerald-400' : 'text-purple-300'"
                          >
                            {{ p.estado === 'DISPONIBLE' ? 'Libre' : 'Ocupada' }}
                          </span>
                        </div>

                        <p class="font-medium text-white truncate text-xs">
                          {{ p.perfil }}
                        </p>

                        <div class="flex items-center justify-between pt-1 border-t border-white/5 text-[11px]">
                          <span class="text-slate-400">PIN: <strong class="font-mono text-white">{{ p.pin || 'Sin PIN' }}</strong></span>
                          <button
                            v-if="p.pin"
                            type="button"
                            class="text-slate-400 hover:text-white p-0.5"
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
          </tbody>
        </table>
      </div>

      <!-- Estado Vacío -->
      <div v-if="cuentasFiltradas.length === 0" class="p-12 text-center text-slate-400 space-y-2">
        <Layers class="size-8 mx-auto text-slate-600" />
        <p class="text-sm font-semibold text-white">No se encontraron cuentas con los filtros actuales</p>
        <p class="text-xs">Prueba restableciendo los filtros de búsqueda.</p>
        <div class="pt-2">
          <button
            type="button"
            class="text-xs text-cyan-400 hover:underline"
            @click="plataformaFiltro = 'TODAS'; estadoFiltro = 'TODOS'; searchQuery = ''"
          >
            Restablecer todos los filtros
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
