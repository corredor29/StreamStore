<script setup lang="ts">
import { computed, ref } from 'vue'
import { 
  Check, 
  ChevronDown, 
  Copy, 
  Filter, 
  Grid, 
  KeyRound, 
  Layers, 
  List, 
  Lock, 
  Mail, 
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
const viewMode = ref<'cards' | 'compact'>('cards')

function toggleExpand(id: number) {
  expandedAccounts.value[id] = !expandedAccounts.value[id]
}

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text)
    copiedNotice.value = `¡${label} copiado!`
    setTimeout(() => {
      copiedNotice.value = null
    }, 2200)
  } catch (err) {
    console.warn('Error al copiar:', err)
  }
}

function getEstadoBadge(estado: CuentaAdmin['estado']) {
  switch (estado) {
    case 'DISPONIBLE':
      return { 
        label: 'Disponible', 
        cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
      }
    case 'PARCIAL':
      return { 
        label: 'Parcial', 
        cls: 'bg-amber-500/15 text-amber-400 border border-amber-500/30' 
      }
    case 'VENDIDA':
      return { 
        label: 'Agotada', 
        cls: 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
      }
    case 'INACTIVA':
      return { 
        label: 'Inactiva', 
        cls: 'bg-red-500/15 text-red-400 border border-red-500/30' 
      }
    default:
      return { 
        label: estado, 
        cls: 'bg-surface-2 text-muted border border-line' 
      }
  }
}

// Filtro y Ordenamiento
const cuentasFiltradas = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()

  return props.cuentas
    .filter((c) => {
      // 1. Filtro Plataforma
      const matchesPlat =
        plataformaFiltro.value === 'TODAS' ||
        c.plataforma?.slug === plataformaFiltro.value ||
        c.plataformaId === Number(plataformaFiltro.value) ||
        (c.plataforma?.nombre && c.plataforma.nombre.toLowerCase() === plataformaFiltro.value.toLowerCase())

      // 2. Filtro Estado
      const matchesEstado =
        estadoFiltro.value === 'TODOS' || c.estado === estadoFiltro.value

      // 3. Búsqueda
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

// Contadores de estado para pastillas de filtro rápido
const conteos = computed(() => {
  const todas = props.cuentas.length
  const disponibles = props.cuentas.filter((c) => c.estado === 'DISPONIBLE').length
  const parciales = props.cuentas.filter((c) => c.estado === 'PARCIAL').length
  const agotadas = props.cuentas.filter((c) => c.estado === 'VENDIDA').length
  return { todas, disponibles, parciales, agotadas }
})
</script>

<template>
  <div class="space-y-4">
    <!-- Toast de Notificación Copiado -->
    <div
      v-if="copiedNotice"
      class="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-[#0B1528] px-4 py-2.5 text-xs font-bold text-emerald-300 shadow-xl shadow-black/60 animate-fade-in"
    >
      <Check class="size-4 text-emerald-400" />
      <span>{{ copiedNotice }}</span>
    </div>

    <!-- Barra Superior de Control: Filtros y Acciones -->
    <div class="rounded-2xl border border-line/80 bg-surface/80 backdrop-blur p-4 space-y-3 shadow-md">
      <!-- Fila 1: Filtro Rápido por Plataformas (Pastillas interactivas) -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span class="text-[11px] font-black uppercase tracking-wider text-muted/70 shrink-0 mr-1 flex items-center gap-1">
          <Filter class="size-3" /> Plataformas:
        </span>

        <button
          type="button"
          class="shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border"
          :class="[
            plataformaFiltro === 'TODAS'
              ? 'bg-brand-500 text-white border-brand-400 shadow-md shadow-brand-500/25'
              : 'bg-surface-2 text-muted border-line/60 hover:text-fg hover:border-brand-500/40'
          ]"
          @click="plataformaFiltro = 'TODAS'"
        >
          Todas ({{ props.cuentas.length }})
        </button>

        <button
          v-for="plat in plataformas"
          :key="plat.id"
          type="button"
          class="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border"
          :class="[
            plataformaFiltro === plat.slug || plataformaFiltro === plat.nombre
              ? 'bg-brand-500 text-white border-brand-400 shadow-md shadow-brand-500/25'
              : 'bg-surface-2 text-muted border-line/60 hover:text-fg hover:border-brand-500/40'
          ]"
          @click="plataformaFiltro = plat.slug || plat.nombre"
        >
          <span>{{ plat.nombre }}</span>
          <span class="rounded-full bg-black/30 px-1.5 py-0.2 text-[10px] font-mono">
            {{ props.cuentas.filter(c => c.plataforma?.slug === plat.slug || c.plataforma?.nombre === plat.nombre).length }}
          </span>
        </button>
      </div>

      <!-- Fila 2: Estados + Buscador + Ordenamiento + Modo Vista -->
      <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-3 border-t border-line/60">
        <!-- Pastillas de Estado -->
        <div class="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            class="px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            :class="estadoFiltro === 'TODOS' ? 'bg-surface-2 text-fg font-bold' : 'text-muted hover:text-fg'"
            @click="estadoFiltro = 'TODOS'"
          >
            Todos ({{ conteos.todas }})
          </button>
          <button
            type="button"
            class="px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-emerald-400"
            :class="estadoFiltro === 'DISPONIBLE' ? 'bg-emerald-500/20 font-bold border border-emerald-500/30' : 'hover:bg-surface-2/60'"
            @click="estadoFiltro = 'DISPONIBLE'"
          >
            Disponibles ({{ conteos.disponibles }})
          </button>
          <button
            type="button"
            class="px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-amber-400"
            :class="estadoFiltro === 'PARCIAL' ? 'bg-amber-500/20 font-bold border border-amber-500/30' : 'hover:bg-surface-2/60'"
            @click="estadoFiltro = 'PARCIAL'"
          >
            Parciales ({{ conteos.parciales }})
          </button>
          <button
            type="button"
            class="px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-purple-400"
            :class="estadoFiltro === 'VENDIDA' ? 'bg-purple-500/20 font-bold border border-purple-500/30' : 'hover:bg-surface-2/60'"
            @click="estadoFiltro = 'VENDIDA'"
          >
            Agotadas ({{ conteos.agotadas }})
          </button>
        </div>

        <!-- Acciones: Búsqueda, Ordenamiento y Switch Vista -->
        <div class="flex flex-wrap items-center gap-2.5">
          <!-- Buscador -->
          <div class="relative flex-1 sm:w-64">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar por correo, ID o plataforma..."
              class="w-full rounded-xl border border-line bg-surface-2/90 pl-8 pr-7 py-1.5 text-xs text-fg placeholder:text-muted/60 focus:border-brand-400 focus:outline-none"
            />
            <Search class="absolute left-2.5 top-2 size-3.5 text-muted" />
            <button
              v-if="searchQuery"
              type="button"
              class="absolute right-2 top-2 text-muted hover:text-fg"
              @click="searchQuery = ''"
            >
              <X class="size-3.5" />
            </button>
          </div>

          <!-- Selector de Orden -->
          <select
            v-model="sortBy"
            class="rounded-xl border border-line bg-surface-2 px-2.5 py-1.5 text-xs text-fg focus:border-brand-400 focus:outline-none cursor-pointer"
            aria-label="Ordenar inventario por"
          >
            <option value="id-desc">Más recientes primero</option>
            <option value="disponibles-desc">Mayor stock libre</option>
            <option value="disponibles-asc">Menor stock libre</option>
            <option value="plataforma">Plataforma (A-Z)</option>
          </select>

          <!-- Toggle Vista (Tarjetas vs Compacto) -->
          <div class="hidden sm:flex items-center rounded-xl border border-line bg-surface-2 p-0.5">
            <button
              type="button"
              class="p-1 rounded-lg transition-colors cursor-pointer"
              :class="viewMode === 'cards' ? 'bg-brand-500 text-white' : 'text-muted hover:text-fg'"
              title="Vista de Tarjetas Detalladas"
              @click="viewMode = 'cards'"
            >
              <Grid class="size-3.5" />
            </button>
            <button
              type="button"
              class="p-1 rounded-lg transition-colors cursor-pointer"
              :class="viewMode === 'compact' ? 'bg-brand-500 text-white' : 'text-muted hover:text-fg'"
              title="Vista Compacta"
              @click="viewMode = 'compact'"
            >
              <List class="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Resultados del Inventario -->
    <div v-if="cuentasFiltradas.length > 0" class="space-y-3">
      <!-- Item de Cuenta (Tarjeta Profesional) -->
      <div
        v-for="cuenta in cuentasFiltradas"
        :key="cuenta.id"
        class="rounded-2xl border border-line/70 bg-[#12172D] overflow-hidden transition-all duration-200 hover:border-brand-500/40 hover:shadow-lg hover:shadow-brand-500/5"
      >
        <!-- Cabecera de la Cuenta -->
        <div class="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <!-- Columna Izquierda: Identidad de Plataforma y Correo Maestro -->
          <div class="flex items-start sm:items-center gap-3.5 min-w-0">
            <!-- Portada o Logo de Plataforma -->
            <div
              v-if="cuenta.coverUrl || cuenta.plataforma?.coverUrl"
              class="size-12 rounded-xl overflow-hidden shrink-0 border border-line bg-surface-2 shadow-sm"
            >
              <img
                :src="cuenta.coverUrl || cuenta.plataforma?.coverUrl!"
                :alt="cuenta.plataforma?.nombre || 'Plataforma'"
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div
              v-else
              class="size-12 rounded-xl shrink-0 flex items-center justify-center font-display font-black text-xs text-white uppercase shadow-sm"
              :style="{ backgroundColor: cuenta.plataforma?.color || '#8057FF' }"
            >
              {{ (cuenta.plataforma?.nombre || 'SS').slice(0, 3) }}
            </div>

            <!-- Datos de Cuenta -->
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-display font-bold text-fg text-sm sm:text-base">
                  {{ cuenta.plataforma?.nombre || 'Plataforma' }}
                </span>
                <span class="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-muted border border-line/60">
                  ID: #{{ cuenta.id }}
                </span>
                <span
                  class="rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider"
                  :class="getEstadoBadge(cuenta.estado).cls"
                >
                  {{ getEstadoBadge(cuenta.estado).label }}
                </span>
              </div>

              <!-- Correo Maestro con Botón de Copiado Rápido -->
              <div class="mt-1 flex items-center gap-2">
                <div v-if="cuenta.correo && !cuenta.correo.includes('pendiente')" class="flex items-center gap-1.5 group/mail min-w-0">
                  <Mail class="size-3.5 text-muted shrink-0" />
                  <span class="font-mono text-xs sm:text-sm font-semibold text-fg/90 truncate">
                    {{ cuenta.correo }}
                  </span>
                  <button
                    type="button"
                    class="rounded p-1 text-muted hover:text-brand-300 hover:bg-surface-2 transition-colors cursor-pointer"
                    title="Copiar correo maestro"
                    @click.stop="copyText(cuenta.correo!, 'Correo maestro')"
                  >
                    <Copy class="size-3" />
                  </button>
                </div>
                <div v-else class="flex items-center gap-1 text-xs text-amber-300/90 font-medium">
                  <Sparkles class="size-3 text-amber-400" />
                  <span>Credenciales pendientes de auto-asignación</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Columna Derecha: Ocupación de Pantallas & Botón Administrar -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-line/60 pt-3 md:pt-0">
            <!-- Barra limpia de Perfiles Disponibles -->
            <div class="flex flex-col gap-1 sm:text-right">
              <div class="flex items-center sm:justify-end gap-2 text-xs">
                <span class="text-[11px] font-medium text-muted">Perfiles:</span>
                <span class="font-mono font-bold text-fg">
                  {{ cuenta.pantallasDisponibles }} de {{ cuenta.totalPantallas }} libres
                </span>
              </div>

              <!-- Indicadores discretos de cada perfil -->
              <div class="flex items-center sm:justify-end gap-1.5">
                <span
                  v-for="p in cuenta.pantallas"
                  :key="p.id"
                  class="size-2 rounded-full"
                  :class="p.estado === 'DISPONIBLE' ? 'bg-emerald-400' : 'bg-slate-600'"
                  :title="`Pantalla #${p.numero}: ${p.perfil} (${p.estado === 'DISPONIBLE' ? 'Libre' : 'Ocupada'})`"
                />
              </div>
            </div>

            <!-- Botón Desplegar Detalles -->
            <button
              type="button"
              class="flex items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-fg hover:border-brand-400/60 hover:bg-surface-2 transition-colors cursor-pointer self-end sm:self-auto"
              @click="toggleExpand(cuenta.id)"
            >
              <span>{{ expandedAccounts[cuenta.id] ? 'Ocultar' : 'Administrar' }}</span>
              <ChevronDown
                class="size-3.5 text-muted transition-transform duration-200"
                :class="{ 'rotate-180 text-brand-300': expandedAccounts[cuenta.id] }"
              />
            </button>
          </div>
        </div>

        <!-- Cajón Desplegable con Detalles de Perfiles y Credenciales -->
        <div
          v-if="expandedAccounts[cuenta.id]"
          class="border-t border-line/70 bg-[#0B0F20] p-4 sm:p-5 space-y-4 animate-fade-in"
        >
          <!-- Barra de Acciones de Credencial Maestra -->
          <div class="rounded-xl border border-line/60 bg-surface/40 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <Lock class="size-4 text-brand-300" />
              <div>
                <p class="text-xs font-bold text-fg">Credenciales Maestras del Proveedor</p>
                <p class="text-[11px] text-muted">Utilizadas para acceder a la plataforma matriz</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button
                v-if="cuenta.correo"
                type="button"
                class="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-2.5 py-1.5 text-xs font-semibold text-fg hover:text-brand-300 hover:border-brand-400/50 transition-colors cursor-pointer"
                @click="copyText(cuenta.correo!, 'Email')"
              >
                <Copy class="size-3" />
                <span>Copiar Correo</span>
              </button>

              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-lg border border-brand-500/40 bg-brand-500/15 px-3 py-1.5 text-xs font-bold text-brand-300 hover:bg-brand-500/25 transition-colors cursor-pointer"
                @click="copyText(`Servicio: ${cuenta.plataforma?.nombre}\nEmail: ${cuenta.correo || 'N/A'}\nTotal Pantallas: ${cuenta.totalPantallas}`, 'Ficha completa')"
              >
                <Copy class="size-3" />
                <span>Copiar Ficha Completa</span>
              </button>
            </div>
          </div>

          <!-- Cuadrícula de Pantallas y Perfiles Individuales -->
          <div>
            <div class="flex items-center justify-between text-xs text-muted mb-2.5">
              <span class="font-bold uppercase tracking-wider text-fg flex items-center gap-1.5 text-[11px]">
                <Tv class="size-3.5 text-brand-400" />
                Desglose de Pantallas Asignadas
              </span>
              <span class="text-[11px]">Capacidad: {{ cuenta.pantallas.length }} perfiles configurados</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              <div
                v-for="pantalla in cuenta.pantallas"
                :key="pantalla.id"
                class="rounded-xl border p-3 text-xs flex flex-col justify-between gap-2.5 transition-all"
                :class="[
                  pantalla.estado === 'DISPONIBLE'
                    ? 'border-line/70 bg-surface/50 hover:border-emerald-500/40'
                    : 'border-purple-500/30 bg-purple-950/20'
                ]"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <span class="font-mono text-[10px] font-black text-brand-300 uppercase">
                      Pantalla #{{ pantalla.numero }}
                    </span>
                    <p class="font-semibold text-fg text-xs truncate mt-0.5">
                      {{ pantalla.perfil }}
                    </p>
                  </div>

                  <span
                    class="rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider shrink-0"
                    :class="[
                      pantalla.estado === 'DISPONIBLE'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    ]"
                  >
                    {{ pantalla.estado === 'DISPONIBLE' ? 'Libre' : 'Ocupada' }}
                  </span>
                </div>

                <!-- PIN de Perfil si tiene -->
                <div class="pt-2 border-t border-line/50 flex items-center justify-between text-[11px]">
                  <div class="flex items-center gap-1 text-muted">
                    <KeyRound class="size-3 text-brand-400" />
                    <span>PIN:</span>
                    <strong class="font-mono text-fg font-bold">
                      {{ pantalla.pin || 'Sin PIN' }}
                    </strong>
                  </div>

                  <button
                    v-if="pantalla.pin"
                    type="button"
                    class="text-muted hover:text-brand-300 transition-colors p-0.5"
                    title="Copiar PIN"
                    @click.stop="copyText(pantalla.pin, `PIN Pantalla #${pantalla.numero}`)"
                  >
                    <Copy class="size-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado Vacío -->
    <div
      v-else
      class="rounded-2xl border border-line/80 bg-surface/40 p-12 text-center space-y-3"
    >
      <div class="size-12 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto text-muted">
        <Layers class="size-6" />
      </div>
      <h3 class="font-display text-base font-bold text-fg">
        No se encontraron cuentas con los filtros actuales
      </h3>
      <p class="text-xs text-muted max-w-sm mx-auto">
        Prueba restableciendo los filtros o agrega una nueva cuenta maestra para comenzar a surtir el catálogo.
      </p>
      <div class="pt-2">
        <button
          type="button"
          class="btn-secondary text-xs py-2 px-3.5"
          @click="plataformaFiltro = 'TODAS'; estadoFiltro = 'TODOS'; searchQuery = ''"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  </div>
</template>
