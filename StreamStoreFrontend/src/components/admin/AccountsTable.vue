<script setup lang="ts">
import { computed, ref } from 'vue'
import { 
  Check, 
  ChevronDown, 
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

async function handleEliminarCuenta(cuenta: CuentaAdmin) {
  const nombre = cuenta.plataforma?.nombre || `Cuenta #${cuenta.id}`
  if (!confirm(`¿Estás seguro de eliminar la ${nombre} (ID #${cuenta.id}) del inventario?`)) {
    return
  }

  deletingId.value = cuenta.id
  try {
    await adminService.eliminarCuenta(cuenta.id)
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
        dot: 'bg-emerald-400',
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/10 border-emerald-500/20'
      }
    case 'PARCIAL':
      return { 
        label: 'En uso parcial', 
        dot: 'bg-amber-400',
        text: 'text-amber-400',
        bg: 'bg-amber-500/10 border-amber-500/20'
      }
    case 'VENDIDA':
      return { 
        label: 'Agotada', 
        dot: 'bg-rose-400',
        text: 'text-rose-300',
        bg: 'bg-rose-500/10 border-rose-500/20'
      }
    default:
      return { 
        label: 'Inactiva', 
        dot: 'bg-slate-400',
        text: 'text-slate-400',
        bg: 'bg-slate-500/10 border-slate-500/20'
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

    <!-- Barra de Herramientas y Filtros -->
    <div class="rounded-xl border border-white/10 bg-[#0E1322] p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">
      <!-- Buscador -->
      <div class="relative flex-1 max-w-md">
        <Search class="absolute left-3 top-2.5 size-4 text-slate-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por correo, plataforma o #ID..."
          class="w-full rounded-lg border border-white/10 bg-[#0B0F19] pl-9 pr-8 py-2 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none transition-colors"
        />
        <button
          v-if="searchQuery"
          type="button"
          class="absolute right-2.5 top-2.5 text-slate-400 hover:text-white cursor-pointer"
          @click="searchQuery = ''"
        >
          <X class="size-3.5" />
        </button>
      </div>

      <!-- Filtros Dropdown -->
      <div class="flex flex-wrap items-center gap-2 text-xs">
        <!-- Selector Plataforma -->
        <select
          v-model="plataformaFiltro"
          class="rounded-lg border border-white/10 bg-[#0B0F19] px-3 py-2 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none cursor-pointer"
        >
          <option value="TODAS">Todas las plataformas ({{ props.cuentas.length }})</option>
          <option v-for="plat in plataformas" :key="plat.id" :value="plat.slug || plat.nombre">
            {{ plat.nombre }}
          </option>
        </select>

        <!-- Selector Estado -->
        <select
          v-model="estadoFiltro"
          class="rounded-lg border border-white/10 bg-[#0B0F19] px-3 py-2 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none cursor-pointer"
        >
          <option value="TODOS">Todos los estados</option>
          <option value="DISPONIBLE">Disponibles</option>
          <option value="PARCIAL">En uso parcial</option>
          <option value="VENDIDA">Agotadas</option>
        </select>

        <!-- Selector Orden -->
        <select
          v-model="sortBy"
          class="rounded-lg border border-white/10 bg-[#0B0F19] px-3 py-2 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none cursor-pointer"
        >
          <option value="id-desc">Más recientes primero</option>
          <option value="disponibles-desc">Mayor stock libre</option>
          <option value="disponibles-asc">Menor stock libre</option>
          <option value="plataforma">Nombre (A-Z)</option>
        </select>

        <span class="text-slate-400 font-mono text-[11px] ml-1 hidden sm:inline">
          {{ cuentasFiltradas.length }} de {{ props.cuentas.length }}
        </span>
      </div>
    </div>

    <!-- TABLA DE INVENTARIO CLARA Y DIRECTA -->
    <div class="rounded-xl border border-white/10 bg-[#0E1322] overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="bg-[#0B0F19] border-b border-white/10 text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
            <tr>
              <th class="py-3 px-4 w-12 text-center">ID</th>
              <th class="py-3 px-4">Plataforma</th>
              <th class="py-3 px-4">Correo Maestro / Acceso</th>
              <th class="py-3 px-4 text-center">Pantallas Libres</th>
              <th class="py-3 px-4 text-center">Estado</th>
              <th class="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-white/[0.06]">
            <template v-for="cuenta in cuentasFiltradas" :key="cuenta.id">
              <tr
                class="hover:bg-white/[0.02] transition-colors cursor-pointer group"
                :class="{ 'bg-white/[0.03]': expandedAccounts[cuenta.id] }"
                @click="toggleExpand(cuenta.id)"
              >
                <!-- ID -->
                <td class="py-3.5 px-4 text-center font-mono text-slate-400 text-xs font-semibold">
                  #{{ cuenta.id }}
                </td>

                <!-- Plataforma -->
                <td class="py-3.5 px-4 whitespace-nowrap">
                  <div class="flex items-center gap-2.5">
                    <div
                      v-if="cuenta.plataforma?.coverUrl"
                      class="size-7 rounded overflow-hidden bg-black shrink-0 border border-white/10"
                    >
                      <img :src="cuenta.plataforma.coverUrl" :alt="cuenta.plataforma.nombre" class="w-full h-full object-cover" />
                    </div>
                    <div
                      v-else
                      class="size-7 rounded flex items-center justify-center text-[10px] font-bold text-white uppercase shrink-0 font-mono"
                      :style="{ backgroundColor: cuenta.plataforma?.color || '#06b6d4' }"
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
                    <span v-else class="inline-flex items-center gap-1 rounded bg-amber-400/10 border border-amber-400/20 text-amber-300 px-2 py-0.5 text-[11px] font-medium">
                      🔑 Asignación automática post-compra
                    </span>

                    <button
                      v-if="cuenta.correo && !cuenta.correo.includes('pendiente')"
                      type="button"
                      class="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
                      title="Copiar correo"
                      @click.stop="copyText(cuenta.correo, 'Correo')"
                    >
                      <Copy class="size-3" />
                    </button>
                  </div>
                </td>

                <!-- Capacidad / Pantallas -->
                <td class="py-3.5 px-4 text-center whitespace-nowrap">
                  <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border"
                    :class="[
                      cuenta.pantallasDisponibles === 0
                        ? 'border-rose-500/20 bg-rose-500/10 text-rose-300'
                        : cuenta.pantallasDisponibles < cuenta.totalPantallas
                        ? 'border-amber-500/20 bg-amber-500/10 text-amber-300'
                        : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                    ]"
                  >
                    <Tv class="size-3" />
                    <span class="font-mono font-bold text-xs">
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
                      class="inline-flex items-center gap-1 text-slate-300 hover:text-white font-medium text-xs px-2.5 py-1 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
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
                      class="text-slate-400 hover:text-rose-400 p-1.5 rounded-md hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Eliminar esta cuenta del inventario"
                      :disabled="deletingId === cuenta.id"
                      @click.stop="handleEliminarCuenta(cuenta)"
                    >
                      <Trash2 class="size-3.5" :class="{ 'animate-pulse text-rose-400': deletingId === cuenta.id }" />
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Desglose de Perfiles en Fila Expandida -->
              <tr v-if="expandedAccounts[cuenta.id]" class="bg-[#0B0F19]">
                <td colspan="6" class="p-4 sm:p-5 border-t border-b border-white/[0.08]">
                  <div class="space-y-3">
                    <div class="flex items-center justify-between text-xs">
                      <span class="font-bold text-white text-xs flex items-center gap-1.5">
                        <KeyRound class="size-3.5 text-cyan-400" />
                        <span>Perfiles Configurados en Cuenta #{{ cuenta.id }} ({{ cuenta.plataforma?.nombre }})</span>
                      </span>
                      <button
                        v-if="cuenta.correo"
                        type="button"
                        class="text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
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
                        class="rounded-lg border p-2.5 text-xs flex flex-col justify-between gap-1.5"
                        :class="[
                          p.estado === 'DISPONIBLE'
                            ? 'border-white/10 bg-[#0E1322]'
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
                            {{ p.estado === 'DISPONIBLE' ? 'Libre' : 'Asignada' }}
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
                            class="text-slate-400 hover:text-white p-0.5 cursor-pointer"
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
        <p class="text-sm font-semibold text-white">No hay cuentas que coincidan con los filtros</p>
        <p class="text-xs">Prueba restableciendo los filtros o busca con otro término.</p>
        <div class="pt-2">
          <button
            type="button"
            class="text-xs text-cyan-400 hover:underline cursor-pointer"
            @click="plataformaFiltro = 'TODAS'; estadoFiltro = 'TODOS'; searchQuery = ''"
          >
            Restablecer todos los filtros
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
