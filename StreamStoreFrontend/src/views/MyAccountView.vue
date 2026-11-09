<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { 
  AlertTriangle, 
  CheckCircle2, 
  Layers,
  Receipt, 
  RefreshCw, 
  Search, 
  ShoppingBag, 
  Tv, 
  X,
  XCircle 
} from '@lucide/vue'
import { accountService } from '@/services/accountService'
import { purchaseService } from '@/services/purchaseService'
import type { Compra, Servicio } from '@/types'
import ServiceCard from '@/components/account/ServiceCard.vue'
import PurchaseHistory from '@/components/account/PurchaseHistory.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import AppAlert from '@/components/common/AppAlert.vue'
import { useClientFonts } from '@/composables/useClientFonts'
import '@/styles/client-ui.css'

useClientFonts()

const activeTab = ref<'servicios' | 'compras'>('servicios')
const estadoFiltro = ref<string>('TODOS')
const searchQuery = ref('')

const servicios = ref<Servicio[]>([])
const compras = ref<Compra[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

async function loadData() {
  loading.value = true
  error.value = null
  try {
    const [servs, comps] = await Promise.all([
      accountService.misServicios(),
      purchaseService.mias(),
    ])
    servicios.value = servs
    compras.value = comps
  } catch (err: any) {
    error.value = err?.message || 'Error al cargar la información de tu cuenta.'
  } finally {
    loading.value = false
  }
}

// Filtro reactivo de servicios con protección nula
const serviciosFiltrados = computed(() => {
  return servicios.value.filter((s) => {
    // Filtro por estado
    const matchesEstado = estadoFiltro.value === 'TODOS' || s.estado === estadoFiltro.value

    // Búsqueda por texto (plataforma, correo, perfil)
    const q = searchQuery.value.toLowerCase().trim()
    const platName = s.plataforma?.nombre || ''
    const correo = s.correoAcceso || ''
    const perfil = s.perfil || ''

    const matchesSearch =
      !q ||
      platName.toLowerCase().includes(q) ||
      correo.toLowerCase().includes(q) ||
      perfil.toLowerCase().includes(q)

    return matchesEstado && matchesSearch
  })
})

// Contadores de servicios por estado
const conteoEstados = computed(() => {
  const activos = servicios.value.filter((s) => s.estado === 'ACTIVO').length
  const porVencer = servicios.value.filter((s) => s.estado === 'POR_VENCER').length
  const vencidos = servicios.value.filter((s) => s.estado === 'VENCIDO').length
  return { activos, porVencer, vencidos, total: servicios.value.length }
})

function toggleFiltroEstado(estado: string) {
  if (estadoFiltro.value === estado) {
    estadoFiltro.value = 'TODOS'
  } else {
    estadoFiltro.value = estado
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="ss-page space-y-8 pb-10">
    <!-- ================= ENCABEZADO PRINCIPAL DE MI CUENTA ================= -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
      <div>
        <h1 class="ss-title ss-h1 text-white">Mi cuenta</h1>
        <p class="ss-lead mt-1">Tus servicios con sus credenciales y PIN, y el historial de compras.</p>
      </div>

      <div class="grid grid-cols-2 gap-3 sm:flex sm:items-center">
        <button
          type="button"
          class="ss-btn ss-btn-secondary whitespace-nowrap text-sm"
          :disabled="loading"
          @click="loadData"
        >
          <RefreshCw class="size-3.5" :class="{ 'animate-spin': loading }" aria-hidden="true" />
          <span>Actualizar</span>
        </button>

        <RouterLink
          to="/catalogo"
          class="ss-btn ss-btn-primary whitespace-nowrap text-sm"
        >
          <ShoppingBag class="size-3.5" />
          <span>Comprar planes</span>
        </RouterLink>
      </div>
    </div>

    <!-- ================= PESTAÑAS DE NAVEGACIÓN ================= -->
    <div role="tablist" aria-label="Secciones del panel" class="flex gap-1 border-b border-white/10 sm:gap-3">
      <button
        id="tab-servicios"
        type="button"
        role="tab"
        :aria-selected="activeTab === 'servicios'"
        aria-controls="panel-servicios"
        class="flex min-h-12 flex-1 items-center justify-center gap-2 whitespace-nowrap border-b-2 px-2 py-3 text-sm font-bold transition-colors cursor-pointer sm:flex-none sm:px-5"
        :class="[
          activeTab === 'servicios'
            ? 'border-cyan-400 text-cyan-300'
            : 'border-transparent text-slate-400 hover:text-white'
        ]"
        @click="activeTab = 'servicios'"
      >
        <Tv class="size-4" aria-hidden="true" />
        <span>Servicios<span class="hidden sm:inline"> activos y vencidos</span></span>
        <span
          class="rounded-full px-2.5 py-0.5 text-xs font-black transition-colors"
          :class="activeTab === 'servicios' ? 'bg-cyan-500 text-neutral-950' : 'bg-white/10 text-slate-300'"
        >
          {{ servicios.length }}
        </span>
      </button>

      <button
        id="tab-compras"
        type="button"
        role="tab"
        :aria-selected="activeTab === 'compras'"
        aria-controls="panel-compras"
        class="flex min-h-12 flex-1 items-center justify-center gap-2 whitespace-nowrap border-b-2 px-2 py-3 text-sm font-bold transition-colors cursor-pointer sm:flex-none sm:px-5"
        :class="[
          activeTab === 'compras'
            ? 'border-cyan-400 text-cyan-300'
            : 'border-transparent text-slate-400 hover:text-white'
        ]"
        @click="activeTab = 'compras'"
      >
        <Receipt class="size-4" aria-hidden="true" />
        <span><span class="hidden sm:inline">Historial de </span>Compras</span>
        <span
          class="rounded-full px-2.5 py-0.5 text-xs font-black transition-colors"
          :class="activeTab === 'compras' ? 'bg-cyan-500 text-neutral-950' : 'bg-white/10 text-slate-300'"
        >
          {{ compras.length }}
        </span>
      </button>
    </div>

    <!-- Indicador de Carga -->
    <AppLoader v-if="loading && servicios.length === 0" label="Cargando tus servicios y compras..." />

    <!-- Alerta de Error -->
    <AppAlert v-else-if="error" variant="error" title="No pudimos cargar tu cuenta" class="mb-6">
      <p>{{ error }}</p>
      <button type="button" class="btn-secondary mt-3 text-xs" @click="loadData">
        Reintentar
      </button>
    </AppAlert>

    <!-- ================= CONTENIDO PESTAÑA: MIS SERVICIOS ================= -->
    <section
      v-else-if="activeTab === 'servicios'"
      id="panel-servicios"
      role="tabpanel"
      aria-labelledby="tab-servicios"
      class="space-y-6"
    >
      <!-- ================= 4 TARJETAS MÉTRICAS / KPIS RESUMEN (FILTRABLES) ================= -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- 1. Total Servicios -->
        <button
          type="button"
          class="rounded-2xl border p-4.5 text-left transition-all duration-300 cursor-pointer backdrop-blur-xl relative overflow-hidden group"
          :class="[
            estadoFiltro === 'TODOS'
              ? 'border-cyan-400/50 bg-gradient-to-br from-cyan-950/40 via-neutral-900/90 to-black/95 shadow-[0_0_25px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/30'
              : 'border-white/10 bg-neutral-900/60 hover:border-white/25 hover:bg-neutral-900/80'
          ]"
          :aria-pressed="estadoFiltro === 'TODOS'"
          @click="toggleFiltroEstado('TODOS')"
        >
          <div class="flex items-center justify-between">
            <span class="text-sm text-slate-400 font-bold">Suscripciones</span>
            <div class="hidden size-8 shrink-0 rounded-xl bg-white/5 border border-white/10 sm:flex items-center justify-center text-cyan-400">
              <Layers class="size-4" />
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="font-display text-3xl font-black text-white">{{ conteoEstados.total }}</span>
            <span class="text-xs text-slate-300 font-medium">contratados</span>
          </div>
          <p class="text-xs text-cyan-400 mt-1">Ver todos</p>
        </button>

        <!-- 2. Activos -->
        <button
          type="button"
          class="rounded-2xl border p-4.5 text-left transition-all duration-300 cursor-pointer backdrop-blur-xl relative overflow-hidden group"
          :class="[
            estadoFiltro === 'ACTIVO'
              ? 'border-emerald-400/50 bg-gradient-to-br from-emerald-950/40 via-neutral-900/90 to-black/95 shadow-[0_0_25px_rgba(16,185,129,0.18)] ring-1 ring-emerald-400/30'
              : 'border-white/10 bg-neutral-900/60 hover:border-emerald-500/30 hover:bg-neutral-900/80'
          ]"
          :aria-pressed="estadoFiltro === 'ACTIVO'"
          @click="toggleFiltroEstado('ACTIVO')"
        >
          <div class="flex items-center justify-between">
            <span class="text-sm text-emerald-400 font-bold">Activos</span>
            <div class="hidden size-8 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/30 sm:flex items-center justify-center text-emerald-400">
              <CheckCircle2 class="size-4" />
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="font-display text-3xl font-black text-emerald-400">{{ conteoEstados.activos }}</span>
            <span class="text-xs text-slate-300 font-medium">en línea</span>
          </div>
          <p class="text-xs text-emerald-400 mt-1">Funcionando</p>
        </button>

        <!-- 3. Por Vencer -->
        <button
          type="button"
          class="rounded-2xl border p-4.5 text-left transition-all duration-300 cursor-pointer backdrop-blur-xl relative overflow-hidden group"
          :class="[
            estadoFiltro === 'POR_VENCER'
              ? 'border-amber-400/50 bg-gradient-to-br from-amber-950/40 via-neutral-900/90 to-black/95 shadow-[0_0_25px_rgba(245,158,11,0.2)] ring-1 ring-amber-400/30'
              : 'border-white/10 bg-neutral-900/60 hover:border-amber-500/30 hover:bg-neutral-900/80'
          ]"
          :aria-pressed="estadoFiltro === 'POR_VENCER'"
          @click="toggleFiltroEstado('POR_VENCER')"
        >
          <div class="flex items-center justify-between">
            <span class="text-sm text-amber-400 font-bold">Por vencer</span>
            <div class="hidden size-8 shrink-0 rounded-xl bg-amber-500/10 border border-amber-500/30 sm:flex items-center justify-center text-amber-400">
              <AlertTriangle class="size-4" />
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="font-display text-3xl font-black text-amber-400">{{ conteoEstados.porVencer }}</span>
            <span class="text-xs text-slate-300 font-medium">próximos</span>
          </div>
          <p class="text-xs text-amber-400 mt-1">Vencen en menos de 3 días</p>
        </button>

        <!-- 4. Vencidos -->
        <button
          type="button"
          class="rounded-2xl border p-4.5 text-left transition-all duration-300 cursor-pointer backdrop-blur-xl relative overflow-hidden group"
          :class="[
            estadoFiltro === 'VENCIDO'
              ? 'border-rose-400/50 bg-gradient-to-br from-rose-950/40 via-neutral-900/90 to-black/95 shadow-[0_0_25px_rgba(244,63,94,0.18)] ring-1 ring-rose-400/30'
              : 'border-white/10 bg-neutral-900/60 hover:border-rose-500/30 hover:bg-neutral-900/80'
          ]"
          :aria-pressed="estadoFiltro === 'VENCIDO'"
          @click="toggleFiltroEstado('VENCIDO')"
        >
          <div class="flex items-center justify-between">
            <span class="text-sm text-rose-400 font-bold">Vencidos</span>
            <div class="hidden size-8 shrink-0 rounded-xl bg-rose-500/10 border border-rose-500/30 sm:flex items-center justify-center text-rose-400">
              <XCircle class="size-4" />
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="font-display text-3xl font-black text-rose-400">{{ conteoEstados.vencidos }}</span>
            <span class="text-xs text-slate-300 font-medium">a renovar</span>
          </div>
          <p class="text-xs text-rose-400 mt-1">Requieren renovación</p>
        </button>
      </div>

      <!-- ================= BARRA DE FILTROS Y BÚSQUEDA RÁPIDA ================= -->
      <div class="flex justify-end">
        <!-- Búsqueda rápida con botón de limpiar -->
        <div class="ss-control w-full md:w-80">
          <label for="buscar-servicios" class="sr-only">Buscar servicios</label>
          <Search class="ss-input-icon" aria-hidden="true" />
          <input
            id="buscar-servicios"
            v-model="searchQuery"
            type="search"
            placeholder="Buscar por plataforma, correo o perfil"
            class="ss-input has-icon has-action !min-h-11 text-sm"
          />
          <button v-if="searchQuery" type="button" class="ss-input-action" aria-label="Borrar búsqueda" @click="searchQuery = ''">
            <X class="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <!-- Indicador de resultados activos -->
      <div v-if="estadoFiltro !== 'TODOS' || searchQuery" class="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Mostrando <strong class="text-white">{{ serviciosFiltrados.length }}</strong> de {{ servicios.length }} servicios
        </span>
        <button
          type="button"
          class="text-cyan-400 hover:underline font-medium cursor-pointer"
          @click="estadoFiltro = 'TODOS'; searchQuery = ''"
        >
          Limpiar filtros
        </button>
      </div>

      <!-- ================= CUADRÍCULA DE SERVICIOS REDISTRIBUIDA (3 COLUMNAS EN XL) ================= -->
      <div
        v-if="serviciosFiltrados.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        <ServiceCard
          v-for="servicio in serviciosFiltrados"
          :key="servicio.id"
          :servicio="servicio"
        />
      </div>

      <!-- Estado Vacío -->
      <div
        v-else
        class="rounded-3xl border border-white/10 bg-neutral-900/60 p-12 text-center max-w-lg mx-auto backdrop-blur-xl"
      >
        <div class="grid size-14 place-items-center rounded-2xl bg-white/5 text-slate-400 mx-auto mb-4">
          <Tv class="size-7" aria-hidden="true" />
        </div>
        <h2 class="font-display text-lg font-black text-white">
          {{ servicios.length === 0 ? 'Todavía no tienes servicios' : 'Ningún servicio coincide' }}
        </h2>
        <p class="mt-1 text-xs text-slate-400 leading-relaxed">
          {{ servicios.length === 0 ? 'Cuando compres un plan, sus credenciales aparecerán aquí.' : 'Cambia el filtro o borra la búsqueda.' }}
        </p>
        <div class="mt-6 flex items-center justify-center gap-3">
          <button
            v-if="estadoFiltro !== 'TODOS' || searchQuery"
            type="button"
            class="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-bold text-white hover:bg-white/10 cursor-pointer"
            @click="estadoFiltro = 'TODOS'; searchQuery = ''"
          >
            Limpiar filtros
          </button>
          <RouterLink
            to="/catalogo"
            class="rounded-full bg-white hover:bg-slate-200 text-neutral-950 font-black text-xs px-5 py-2 shadow-lg"
          >
            Ver el catálogo
          </RouterLink>
        </div>
      </div>

    </section>

    <!-- ================= CONTENIDO PESTAÑA: HISTORIAL DE COMPRAS ================= -->
    <section
      v-else-if="activeTab === 'compras'"
      id="panel-compras"
      role="tabpanel"
      aria-labelledby="tab-compras"
      class="space-y-6"
    >
      <div v-if="compras.length > 0">
        <PurchaseHistory :compras="compras" />
      </div>

      <div
        v-else
        class="rounded-3xl border border-white/10 bg-neutral-900/60 p-12 text-center max-w-lg mx-auto backdrop-blur-xl"
      >
        <div class="grid size-14 place-items-center rounded-2xl bg-white/5 text-slate-400 mx-auto mb-4">
          <ShoppingBag class="size-7" aria-hidden="true" />
        </div>
        <h2 class="font-display text-lg font-black text-white">Aún no tienes compras</h2>
        <p class="mt-1 text-xs text-slate-400 leading-relaxed">
          Tus pedidos y comprobantes aparecerán aquí después de tu primera compra.
        </p>
        <RouterLink
          to="/catalogo"
          class="inline-flex rounded-full bg-white hover:bg-slate-200 text-neutral-950 font-black text-xs px-5 py-2 mt-6 shadow-lg"
        >
          Ver el catálogo
        </RouterLink>
      </div>
    </section>
  </div>
</template>
