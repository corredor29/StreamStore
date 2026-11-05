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
import { useAuthStore } from '@/stores/auth'
import { accountService } from '@/services/accountService'
import { purchaseService } from '@/services/purchaseService'
import type { Compra, Servicio } from '@/types'
import ServiceCard from '@/components/account/ServiceCard.vue'
import PurchaseHistory from '@/components/account/PurchaseHistory.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import AppAlert from '@/components/common/AppAlert.vue'

const auth = useAuthStore()

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

// Filtro reactivo de servicios
const serviciosFiltrados = computed(() => {
  return servicios.value.filter((s) => {
    // Filtro por estado
    const matchesEstado = estadoFiltro.value === 'TODOS' || s.estado === estadoFiltro.value

    // Búsqueda por texto (plataforma, correo, perfil)
    const q = searchQuery.value.toLowerCase().trim()
    const matchesSearch =
      !q ||
      s.plataforma.nombre.toLowerCase().includes(q) ||
      s.correoAcceso.toLowerCase().includes(q) ||
      (s.perfil && s.perfil.toLowerCase().includes(q))

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
    <!-- Encabezado de la Cuenta -->
    <header class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-line pb-6">
      <div>
        <span class="text-xs font-semibold uppercase tracking-wider text-brand-300">
          Panel de cliente
        </span>
        <h1 class="mt-1 font-display text-2xl font-extrabold text-fg sm:text-3xl">
          Hola, {{ auth.usuario?.nombre || 'Cliente' }}
        </h1>
        <p class="mt-1 text-sm text-muted">
          Consulta tus cuentas, perfiles asignados, credenciales de acceso e historial de pedidos.
        </p>
      </div>

      <button
        type="button"
        class="btn-secondary text-xs py-2 px-3 self-end sm:self-auto gap-1.5"
        :disabled="loading"
        @click="loadData"
      >
        <RefreshCw class="size-3.5" :class="{ 'animate-spin': loading }" aria-hidden="true" />
        <span>Actualizar datos</span>
      </button>
    </header>

    <!-- Pestañas de Navegación del Panel -->
    <div role="tablist" aria-label="Secciones del panel" class="flex border-b border-line gap-2">
      <button
        id="tab-servicios"
        type="button"
        role="tab"
        :aria-selected="activeTab === 'servicios'"
        aria-controls="panel-servicios"
        class="flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors focus:outline-none"
        :class="[
          activeTab === 'servicios'
            ? 'border-brand-400 text-fg'
            : 'border-transparent text-muted hover:text-fg'
        ]"
        @click="activeTab = 'servicios'"
      >
        <Tv class="size-4" aria-hidden="true" />
        <span>Mis Servicios</span>
        <span
          class="rounded-full px-2 py-0.5 text-xs font-bold"
          :class="activeTab === 'servicios' ? 'bg-brand-500 text-white' : 'bg-surface-2 text-muted'"
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
        class="flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors focus:outline-none"
        :class="[
          activeTab === 'compras'
            ? 'border-brand-400 text-fg'
            : 'border-transparent text-muted hover:text-fg'
        ]"
        @click="activeTab = 'compras'"
      >
        <Receipt class="size-4" aria-hidden="true" />
        <span>Historial de Compras</span>
        <span
          class="rounded-full px-2 py-0.5 text-xs font-bold"
          :class="activeTab === 'compras' ? 'bg-brand-500 text-white' : 'bg-surface-2 text-muted'"
        >
          {{ compras.length }}
        </span>
      </button>
    </div>

    <!-- Indicador de Carga -->
    <AppLoader v-if="loading && servicios.length === 0" label="Cargando tus servicios..." />

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
      <div class="card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <!-- Filtros por estado -->
        <div class="flex flex-wrap items-center gap-2">
          <span class="mr-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
            <Filter class="size-3.5" aria-hidden="true" />
            Estado:
          </span>

          <!-- Todos -->
          <button
            type="button"
            class="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
            :class="[
              estadoFiltro === 'TODOS'
                ? 'bg-brand-500 font-semibold text-white'
                : 'border border-line bg-surface-2 text-muted hover:text-fg'
            ]"
            @click="estadoFiltro = 'TODOS'"
          >
            Todos ({{ conteoEstados.total }})
          </button>

          <!-- Activos (Verde) -->
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
            :class="[
              estadoFiltro === 'ACTIVO'
                ? 'bg-success text-black font-bold shadow-sm'
                : 'border border-success/30 bg-success/10 text-success hover:bg-success/20'
            ]"
            @click="estadoFiltro = 'ACTIVO'"
          >
            <CheckCircle2 class="size-3" aria-hidden="true" />
            Activos ({{ conteoEstados.activos }})
          </button>

          <!-- Por vencer (Amarillo) -->
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
            :class="[
              estadoFiltro === 'POR_VENCER'
                ? 'bg-warning text-black font-bold shadow-sm'
                : 'border border-warning/30 bg-warning/10 text-warning hover:bg-warning/20'
            ]"
            @click="estadoFiltro = 'POR_VENCER'"
          >
            <AlertTriangle class="size-3" aria-hidden="true" />
            Por Vencer ({{ conteoEstados.porVencer }})
          </button>

          <!-- Vencidos (Rojo) -->
          <button
            type="button"
            class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
            :class="[
              estadoFiltro === 'VENCIDO'
                ? 'bg-danger text-white font-bold shadow-sm'
                : 'border border-danger/30 bg-danger/10 text-danger hover:bg-danger/20'
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
            class="field-input pl-9 text-xs py-2"
            aria-label="Buscar servicios"
          />
          <Search class="absolute left-3 top-2.5 size-3.5 text-muted" aria-hidden="true" />
        </div>
      </div>

      <!-- Cuadrícula de Servicios -->
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
        class="card flex flex-col items-center justify-center py-16 text-center max-w-lg mx-auto"
      >
        <Tv class="size-12 text-muted" aria-hidden="true" />
        <h2 class="mt-4 font-display text-lg font-bold text-fg">
          No hay servicios con los filtros aplicados
        </h2>
        <p class="mt-1 text-sm text-muted">
          {{ servicios.length === 0 ? 'Aún no tienes suscripciones o cuentas activas.' : 'Prueba cambiando o limpiando los filtros de búsqueda.' }}
        </p>
        <div class="mt-6 flex gap-3">
          <button
            v-if="estadoFiltro !== 'TODOS' || searchQuery"
            type="button"
            class="btn-secondary text-xs"
            @click="estadoFiltro = 'TODOS'; searchQuery = ''"
          >
            Limpiar filtros
          </button>
          <RouterLink to="/catalogo" class="btn-primary text-xs">
            Explorar catálogo de planes
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
        class="card flex flex-col items-center justify-center py-16 text-center max-w-lg mx-auto"
      >
        <ShoppingBag class="size-12 text-muted" aria-hidden="true" />
        <h2 class="mt-4 font-display text-lg font-bold text-fg">No tienes compras registradas</h2>
        <p class="mt-1 text-sm text-muted">
          Tus órdenes y comprobantes de pago aparecerán en esta sección.
        </p>
        <RouterLink to="/catalogo" class="btn-primary mt-6 text-xs">
          Comprar un plan ahora
        </RouterLink>
      </div>
    </section>
  </div>
</template>
