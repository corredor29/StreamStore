<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { 
  AlertTriangle, 
  CheckCircle2, 
  Filter, 
  Receipt, 
  RefreshCw, 
  Search, 
  ShoppingBag, 
  Tv, 
  XCircle 
} from '@lucide/vue'
import { accountService } from '@/services/accountService'
import { purchaseService } from '@/services/purchaseService'
import type { Compra, Servicio } from '@/types'
import ServiceCard from '@/components/account/ServiceCard.vue'
import PurchaseHistory from '@/components/account/PurchaseHistory.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import AppAlert from '@/components/common/AppAlert.vue'

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

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="space-y-6">
    <!-- ENCABEZADO DIRECTO Y LIMPIO -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
      <div>
        <h1 class="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
          Mis Servicios
        </h1>
        <p class="text-xs text-slate-400 mt-1">
          Accede a tus cuentas, credenciales de streaming y PIN de perfiles activos.
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold px-3.5 py-2 transition-all cursor-pointer"
          :disabled="loading"
          @click="loadData"
        >
          <RefreshCw class="size-3.5" :class="{ 'animate-spin': loading }" aria-hidden="true" />
          <span>Actualizar</span>
        </button>

        <RouterLink
          to="/catalogo"
          class="inline-flex items-center gap-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-neutral-950 text-xs font-black px-4 py-2 transition-all shadow-md"
        >
          <ShoppingBag class="size-3.5" />
          <span>Comprar más planes</span>
        </RouterLink>
      </div>
    </div>

    <!-- Pestañas de Navegación del Panel -->
    <div role="tablist" aria-label="Secciones del panel" class="flex border-b border-white/10 gap-3">
      <button
        id="tab-servicios"
        type="button"
        role="tab"
        :aria-selected="activeTab === 'servicios'"
        aria-controls="panel-servicios"
        class="flex items-center gap-2.5 border-b-2 px-5 py-3.5 text-xs sm:text-sm font-black transition-all cursor-pointer focus:outline-none"
        :class="[
          activeTab === 'servicios'
            ? 'border-cyan-400 text-cyan-300'
            : 'border-transparent text-slate-400 hover:text-white'
        ]"
        @click="activeTab = 'servicios'"
      >
        <Tv class="size-4" aria-hidden="true" />
        <span>Mis Servicios</span>
        <span
          class="rounded-full px-2 py-0.5 text-xs font-bold"
          :class="activeTab === 'servicios' ? 'bg-cyan-500 text-neutral-950 font-black' : 'bg-white/10 text-slate-300'"
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
        class="flex items-center gap-2.5 border-b-2 px-5 py-3.5 text-xs sm:text-sm font-black transition-all cursor-pointer focus:outline-none"
        :class="[
          activeTab === 'compras'
            ? 'border-cyan-400 text-cyan-300'
            : 'border-transparent text-slate-400 hover:text-white'
        ]"
        @click="activeTab = 'compras'"
      >
        <Receipt class="size-4" aria-hidden="true" />
        <span>Historial de Compras</span>
        <span
          class="rounded-full px-2 py-0.5 text-xs font-bold"
          :class="activeTab === 'compras' ? 'bg-cyan-500 text-neutral-950 font-black' : 'bg-white/10 text-slate-300'"
        >
          {{ compras.length }}
        </span>
      </button>
    </div>

    <!-- Indicador de Carga -->
    <AppLoader v-if="loading && servicios.length === 0" label="Cargando tus servicios y compras..." />

    <!-- Alerta de Error -->
    <AppAlert v-else-if="error" variant="error" title="Problema al cargar datos" class="mb-6">
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
      <!-- Barra de Filtros y Búsqueda -->
      <div class="rounded-2xl border border-white/10 bg-neutral-900/60 p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 backdrop-blur-xl">
        <!-- Filtros por estado -->
        <div class="flex flex-wrap items-center gap-2">
          <span class="mr-1 flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            <Filter class="size-3.5" aria-hidden="true" />
            Estado:
          </span>

          <!-- Todos -->
          <button
            type="button"
            class="rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer"
            :class="[
              estadoFiltro === 'TODOS'
                ? 'bg-white text-neutral-950 shadow-md'
                : 'border border-white/15 bg-white/5 text-slate-400 hover:text-white'
            ]"
            @click="estadoFiltro = 'TODOS'"
          >
            Todos ({{ conteoEstados.total }})
          </button>

          <!-- Activos (Verde) -->
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer"
            :class="[
              estadoFiltro === 'ACTIVO'
                ? 'bg-emerald-400 text-neutral-950 shadow-md'
                : 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
            ]"
            @click="estadoFiltro = 'ACTIVO'"
          >
            <CheckCircle2 class="size-3" aria-hidden="true" />
            Activos ({{ conteoEstados.activos }})
          </button>

          <!-- Por vencer (Amarillo) -->
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer"
            :class="[
              estadoFiltro === 'POR_VENCER'
                ? 'bg-amber-400 text-neutral-950 shadow-md'
                : 'border border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
            ]"
            @click="estadoFiltro = 'POR_VENCER'"
          >
            <AlertTriangle class="size-3" aria-hidden="true" />
            Por Vencer ({{ conteoEstados.porVencer }})
          </button>

          <!-- Vencidos (Rojo) -->
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer"
            :class="[
              estadoFiltro === 'VENCIDO'
                ? 'bg-rose-500 text-white shadow-md'
                : 'border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
            ]"
            @click="estadoFiltro = 'VENCIDO'"
          >
            <XCircle class="size-3" aria-hidden="true" />
            Vencidos ({{ conteoEstados.vencidos }})
          </button>
        </div>

        <!-- Búsqueda rápida -->
        <div class="relative md:w-64">
          <input
            v-model="searchQuery"
            type="search"
            placeholder="Buscar por plataforma o correo..."
            class="w-full rounded-full border border-white/15 bg-black/50 py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
            aria-label="Buscar servicios"
          />
          <Search class="absolute left-3 top-2.5 size-3.5 text-slate-500" aria-hidden="true" />
        </div>
      </div>

      <!-- Cuadrícula de Servicios -->
      <div
        v-if="serviciosFiltrados.length > 0"
        class="grid grid-cols-1 lg:grid-cols-2 gap-6"
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
          No hay servicios con los filtros aplicados
        </h2>
        <p class="mt-1 text-xs text-slate-400 leading-relaxed">
          {{ servicios.length === 0 ? 'Aún no tienes suscripciones o cuentas activas.' : 'Prueba cambiando o limpiando los filtros de búsqueda.' }}
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
            Explorar catálogo de planes
          </RouterLink>
        </div>
      </div>

      <!-- Banner Inferior de Catálogo -->
      <div class="rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-neutral-900/60 to-[#8057FF]/10 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-xl">
        <div class="flex items-center gap-4">
          <div class="grid size-12 place-items-center rounded-2xl bg-cyan-500/20 text-cyan-300 font-bold shrink-0">
            <Sparkles class="size-6" />
          </div>
          <div>
            <h3 class="font-display text-base font-black text-white">¿Necesitas otra pantalla o suscripción?</h3>
            <p class="text-xs text-slate-400">Entrega automática inmediata en menos de 10 segundos tras confirmar tu pago.</p>
          </div>
        </div>

        <RouterLink
          to="/catalogo"
          class="inline-flex items-center justify-center rounded-full bg-white hover:bg-slate-200 text-neutral-950 font-black text-xs px-6 py-3 transition-all shrink-0 shadow-[0_0_25px_rgba(255,255,255,0.25)] hover:scale-105 active:scale-95"
        >
          <span>Ir al Catálogo Oficial</span>
        </RouterLink>
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
        <h2 class="font-display text-lg font-black text-white">No tienes compras registradas</h2>
        <p class="mt-1 text-xs text-slate-400 leading-relaxed">
          Tus órdenes y comprobantes de pago aparecerán en esta sección cuando realices una orden.
        </p>
        <RouterLink
          to="/catalogo"
          class="inline-flex rounded-full bg-white hover:bg-slate-200 text-neutral-950 font-black text-xs px-5 py-2 mt-6 shadow-lg"
        >
          Comprar un plan ahora
        </RouterLink>
      </div>
    </section>
  </div>
</template>
