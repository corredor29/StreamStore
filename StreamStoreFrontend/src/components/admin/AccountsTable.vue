<script setup lang="ts">
import { computed, ref } from 'vue'
import { 
  ChevronDown, 
  KeyRound, 
  Layers, 
  Search, 
  Tv 
} from '@lucide/vue'
import type { CuentaAdmin, Plataforma } from '@/types'

const props = defineProps<{
  cuentas: CuentaAdmin[]
  plataformas: Plataforma[]
}>()

const expandedAccounts = ref<Record<number, boolean>>({})
const plataformaFiltro = ref<string>('TODAS')
const estadoFiltro = ref<string>('TODOS')
const searchQuery = ref('')

function toggleExpand(id: number) {
  expandedAccounts.value[id] = !expandedAccounts.value[id]
}

function getEstadoBadge(estado: CuentaAdmin['estado']) {
  switch (estado) {
    case 'DISPONIBLE':
      return { label: 'DISPONIBLE', cls: 'bg-success/15 text-success border-success/30' }
    case 'PARCIAL':
      return { label: 'PARCIAL', cls: 'bg-warning/20 text-warning border-warning/40' }
    case 'VENDIDA':
      return { label: 'VENDIDA', cls: 'bg-purple-500/20 text-purple-300 border-purple-500/30' }
    case 'INACTIVA':
      return { label: 'INACTIVA', cls: 'bg-danger/15 text-danger border-danger/30' }
  }
}

const cuentasFiltradas = computed(() => {
  return props.cuentas.filter((c) => {
    const matchesPlat =
      plataformaFiltro.value === 'TODAS' ||
      c.plataforma?.slug === plataformaFiltro.value ||
      c.plataformaId === Number(plataformaFiltro.value)

    const matchesEstado =
      estadoFiltro.value === 'TODOS' || c.estado === estadoFiltro.value

    const q = searchQuery.value.toLowerCase().trim()
    const matchesSearch =
      !q ||
      (c.correo && c.correo.toLowerCase().includes(q)) ||
      (c.plataforma?.nombre && c.plataforma.nombre.toLowerCase().includes(q))

    return matchesPlat && matchesEstado && matchesSearch
  })
})
</script>

<template>
  <div class="space-y-4">
    <!-- Barra de Búsqueda y Filtros de Cuentas -->
    <div class="card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-3">
        <!-- Filtro Plataforma -->
        <div class="flex items-center gap-2">
          <label for="filter-plat" class="text-xs font-semibold uppercase tracking-wider text-muted">
            Plataforma:
          </label>
          <select
            id="filter-plat"
            v-model="plataformaFiltro"
            class="field-input text-xs py-1.5 w-auto"
          >
            <option value="TODAS">Todas las plataformas</option>
            <option v-for="p in plataformas" :key="p.id" :value="p.slug">
              {{ p.nombre }}
            </option>
          </select>
        </div>

        <!-- Filtro Estado -->
        <div class="flex items-center gap-2">
          <label for="filter-state" class="text-xs font-semibold uppercase tracking-wider text-muted">
            Estado:
          </label>
          <select
            id="filter-state"
            v-model="estadoFiltro"
            class="field-input text-xs py-1.5 w-auto"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="DISPONIBLE">Disponible</option>
            <option value="PARCIAL">Parcial</option>
            <option value="VENDIDA">Vendida</option>
            <option value="INACTIVA">Inactiva</option>
          </select>
        </div>
      </div>

      <!-- Buscador -->
      <div class="relative md:w-64">
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Buscar por correo o plataforma..."
          class="field-input pl-9 text-xs py-2"
          aria-label="Buscar cuentas"
        />
        <Search class="absolute left-3 top-2.5 size-3.5 text-muted" aria-hidden="true" />
      </div>
    </div>

    <!-- Lista de Cuentas -->
    <div v-if="cuentasFiltradas.length > 0" class="space-y-3">
      <div
        v-for="cuenta in cuentasFiltradas"
        :key="cuenta.id"
        class="card border border-line overflow-hidden transition-all duration-200"
      >
        <!-- Fila Principal de la Cuenta -->
        <div
          class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 cursor-pointer hover:bg-surface-2/40 transition-colors"
          @click="toggleExpand(cuenta.id)"
        >
          <div class="flex items-center gap-3 min-w-0">
            <!-- Portada / Badge de Plataforma -->
            <div
              v-if="cuenta.coverUrl || cuenta.plataforma?.coverUrl"
              class="size-11 rounded-lg overflow-hidden shrink-0 border border-line bg-surface-2"
            >
              <img
                :src="cuenta.coverUrl || cuenta.plataforma?.coverUrl!"
                :alt="cuenta.plataforma?.nombre || 'Portada'"
                class="w-full h-full object-cover"
              />
            </div>
            <span
              v-else
              class="rounded-lg px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white shrink-0"
              :style="{ backgroundColor: cuenta.plataforma?.slug === 'netflix' ? '#E50914' : cuenta.plataforma?.slug === 'disney' ? '#113CCF' : cuenta.plataforma?.slug === 'prime' ? '#00A8E1' : '#7B2FF7' }"
            >
              {{ cuenta.plataforma?.nombre || 'Plataforma' }}
            </span>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span v-if="cuenta.coverUrl || cuenta.plataforma?.coverUrl" class="font-bold text-fg text-sm truncate">
                  {{ cuenta.plataforma?.nombre || 'Plataforma' }}
                </span>
                <span v-if="!cuenta.correo || cuenta.correo.includes('pendiente')" class="rounded bg-cyan-950/60 border border-cyan-400/30 text-cyan-300 text-[10px] font-mono px-2 py-0.5">
                  Entrega post-compra
                </span>
              </div>
              <p v-if="cuenta.correo && !cuenta.correo.includes('pendiente')" class="font-mono text-xs sm:text-sm font-semibold text-fg truncate">
                {{ cuenta.correo }}
              </p>
              <p v-else class="text-xs text-muted">
                Credenciales pendientes de asignación
              </p>
              <p class="text-[11px] text-muted">
                ID Inventario: #{{ cuenta.id }}
              </p>
            </div>
          </div>

          <div class="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-line/60 pt-3 sm:pt-0">
            <!-- Barra de Ocupación de Pantallas -->
            <div class="w-36 text-right">
              <div class="flex items-center justify-between text-xs text-muted mb-1">
                <span>Pantallas libres:</span>
                <span class="font-mono font-bold text-fg">
                  {{ cuenta.pantallasDisponibles }}/{{ cuenta.totalPantallas }}
                </span>
              </div>
              <div class="h-1.5 w-full rounded-full bg-surface-2 overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-300"
                  :class="[
                    cuenta.pantallasDisponibles === cuenta.totalPantallas ? 'bg-success' :
                    cuenta.pantallasDisponibles > 0 ? 'bg-warning' : 'bg-purple-500'
                  ]"
                  :style="{ width: `${(cuenta.pantallasDisponibles / cuenta.totalPantallas) * 100}%` }"
                />
              </div>
            </div>

            <!-- Estado -->
            <span
              class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider shrink-0"
              :class="getEstadoBadge(cuenta.estado).cls"
            >
              {{ getEstadoBadge(cuenta.estado).label }}
            </span>

            <ChevronDown
              class="size-5 text-muted transition-transform duration-200 shrink-0"
              :class="{ 'rotate-180 text-brand-300': expandedAccounts[cuenta.id] }"
              aria-hidden="true"
            />
          </div>
        </div>

        <!-- Desglose de Pantallas Individuales -->
        <div
          v-if="expandedAccounts[cuenta.id]"
          class="border-t border-line/60 bg-surface-2/40 p-4 space-y-3"
        >
          <div class="flex items-center justify-between text-xs text-muted">
            <span class="font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Tv class="size-3.5 text-brand-300" />
              Detalle de Perfiles y Pantallas Asignadas
            </span>
            <span>Total: {{ cuenta.pantallas.length }} pantallas</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div
              v-for="pantalla in cuenta.pantallas"
              :key="pantalla.id"
              class="rounded-xl border border-line bg-surface p-3 text-xs flex items-center justify-between gap-2"
            >
              <div class="min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="font-mono font-bold text-muted">#{{ pantalla.numero }}</span>
                  <span class="font-semibold text-fg truncate">{{ pantalla.perfil }}</span>
                </div>
                <div v-if="pantalla.pin" class="flex items-center gap-1 text-[11px] text-muted mt-0.5">
                  <KeyRound class="size-3 text-brand-300" />
                  <span>PIN: <strong class="font-mono text-fg">{{ pantalla.pin }}</strong></span>
                </div>
              </div>

              <span
                class="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0"
                :class="pantalla.estado === 'DISPONIBLE' ? 'bg-success/15 text-success border border-success/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'"
              >
                {{ pantalla.estado }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado Vacío -->
    <div
      v-else
      class="card flex flex-col items-center justify-center py-16 text-center"
    >
      <Layers class="size-12 text-muted" aria-hidden="true" />
      <h3 class="mt-4 font-display text-lg font-bold text-fg">
        No se encontraron cuentas con los filtros seleccionados
      </h3>
      <p class="mt-1 text-sm text-muted">
        Prueba restableciendo los filtros o agrega una nueva cuenta al inventario.
      </p>
    </div>
  </div>
</template>
