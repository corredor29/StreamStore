<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  CheckCircle2, 
  Clock, 
  Film, 
  Plus, 
  Receipt, 
  RefreshCw, 
  ShieldAlert, 
  Sparkles, 
  Tv, 
  Users 
} from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { adminService } from '@/services/adminService'
import { productService } from '@/services/productService'
import { DEMO_ACCOUNTS } from '@/services/authService'
import type { Compra, CuentaAdmin, Plataforma, ResumenAdmin, Servicio } from '@/types'
import AdminSummaryCards from '@/components/admin/AdminSummaryCards.vue'
import AccountsTable from '@/components/admin/AccountsTable.vue'
import AccountCreateModal from '@/components/admin/AccountCreateModal.vue'
import PlatformCreateModal from '@/components/admin/PlatformCreateModal.vue'
import AdminSalesTable from '@/components/admin/AdminSalesTable.vue'
import AdminServicesTable from '@/components/admin/AdminServicesTable.vue'
import AdminPlatformsOverview from '@/components/admin/AdminPlatformsOverview.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import AppAlert from '@/components/common/AppAlert.vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

type TabKey = 'inventario' | 'plataformas' | 'servicios' | 'ventas'

const activeTab = ref<TabKey>('inventario')

// Estado de modales en 2 pasos
const isPlatformModalOpen = ref(false)
const isAccountModalOpen = ref(false)
const selectedPlatformIdForAccount = ref<number | null>(null)

const isCronExecuting = ref(false)
const cronMessage = ref<string | null>(null)

// Sincronizar pestaña activa con ?tab= de la URL
watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab && ['inventario', 'servicios', 'ventas', 'plataformas'].includes(newTab as string)) {
      activeTab.value = newTab as TabKey
    }
  },
  { immediate: true }
)

function setTab(tab: TabKey) {
  activeTab.value = tab
  router.replace({ query: { ...route.query, tab } })
}

function abrirPaso1() {
  isAccountModalOpen.value = false
  isPlatformModalOpen.value = true
}

function abrirPaso2(platId?: number) {
  if (platId) {
    selectedPlatformIdForAccount.value = platId
  }
  isPlatformModalOpen.value = false
  isAccountModalOpen.value = true
}

async function onPlatformCreated(plat: Plataforma) {
  await loadAdminData()
  // Una vez creada la plataforma en Paso 1, sugerir inmediatamente cargar la cuenta en Paso 2
  selectedPlatformIdForAccount.value = plat.id
  isPlatformModalOpen.value = false
  isAccountModalOpen.value = true
}

const resumen = ref<ResumenAdmin>({
  ventasHoy: 75000,
  ventasMes: 450000,
  totalCuentas: 4,
  cuentasDisponibles: 2,
  pantallasDisponibles: 8,
  serviciosActivos: 2,
})

const cuentas = ref<CuentaAdmin[]>([])
const plataformas = ref<Plataforma[]>([])
const compras = ref<Compra[]>([])
const servicios = ref<Servicio[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

async function loadAdminData() {
  loading.value = true
  error.value = null
  try {
    const [res, cuents, plats, comps, servs] = await Promise.all([
      adminService.resumen().catch(() => null),
      adminService.cuentas().catch(() => []),
      productService.getPlataformas().catch(() => []),
      adminService.compras().catch(() => []),
      adminService.servicios().catch(() => []),
    ])

    cuentas.value = Array.isArray(cuents) && cuents.length > 0 ? cuents : []
    plataformas.value = Array.isArray(plats) && plats.length > 0 ? plats : []
    compras.value = Array.isArray(comps) && comps.length > 0 ? comps : []
    servicios.value = Array.isArray(servs) && servs.length > 0 ? servs : []

    if (res) {
      resumen.value = res
    } else {
      const disponibles = cuentas.value.filter((c) => c.estado === 'DISPONIBLE').length
      const pantallasLibres = cuentas.value.reduce((acc, c) => acc + c.pantallasDisponibles, 0)
      resumen.value = {
        ventasHoy: 75000,
        ventasMes: 450000,
        totalCuentas: cuentas.value.length || 4,
        cuentasDisponibles: disponibles || 2,
        pantallasDisponibles: pantallasLibres || 8,
        serviciosActivos: servicios.value.filter((s) => s.estado === 'ACTIVO').length || 2,
      }
    }
  } catch (err: any) {
    console.error('Error cargando datos de administración:', err)
  } finally {
    loading.value = false
  }
}

async function onEjecutarCron() {
  isCronExecuting.value = true
  cronMessage.value = null
  try {
    const res = await adminService.ejecutarCron()
    cronMessage.value = res.mensaje
    await loadAdminData()
    setTimeout(() => {
      cronMessage.value = null
    }, 4500)
  } catch (err: any) {
    cronMessage.value = err?.message || 'Error al ejecutar tarea programada.'
  } finally {
    isCronExecuting.value = false
  }
}

async function switchToAdminDemo() {
  await auth.login({
    email: DEMO_ACCOUNTS.admin.email,
    password: DEMO_ACCOUNTS.admin.password,
  })
  await loadAdminData()
}

onMounted(() => {
  loadAdminData()
})
</script>

<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Verificación de rol admin amigable -->
    <div
      v-if="!auth.isAdmin"
      class="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8 text-center max-w-md mx-auto my-16 shadow-2xl backdrop-blur space-y-4"
    >
      <div class="size-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
        <ShieldAlert class="size-8" />
      </div>
      <div>
        <h2 class="font-display text-xl font-black text-fg">
          Acceso de Administrador Requerido
        </h2>
        <p class="mt-1.5 text-xs text-muted leading-relaxed">
          Has iniciado sesión como <strong class="text-fg">{{ auth.usuario?.email || 'visitante' }}</strong>. Para acceder a la consola necesitas privilegios de administrador.
        </p>
      </div>
      <button
        type="button"
        class="btn-primary w-full text-xs py-2.5 shadow-lg shadow-brand-500/30 cursor-pointer"
        @click="switchToAdminDemo"
      >
        <Sparkles class="size-3.5" />
        <span>Iniciar como Administrador Demo</span>
      </button>
    </div>

    <!-- Panel Administrativo Completo -->
    <div v-else class="space-y-5">
      <!-- Encabezado Limpio y Directo -->
      <header class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 class="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Panel de Administración
          </h1>
          <p class="mt-1 text-xs sm:text-sm text-slate-400">
            Plataformas, cuentas, clientes y ventas.
          </p>
        </div>

        <!-- Acciones -->
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            class="inline-flex items-center justify-center size-9 rounded-xl border border-white/10 bg-[#0E1322] hover:bg-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
            :disabled="isCronExecuting"
            title="Revisar vencimientos"
            @click="onEjecutarCron"
          >
            <Clock class="size-4" :class="{ 'animate-spin': isCronExecuting }" />
          </button>

          <button
            type="button"
            class="inline-flex items-center justify-center size-9 rounded-xl border border-white/10 bg-[#0E1322] hover:bg-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
            :disabled="loading"
            title="Actualizar datos"
            @click="loadAdminData"
          >
            <RefreshCw class="size-4" :class="{ 'animate-spin': loading }" />
          </button>

          <span class="hidden sm:block w-px h-6 bg-white/10 mx-1" />

          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#0E1322] hover:bg-white/5 text-slate-200 hover:text-white text-xs font-semibold px-3.5 py-2 transition-all cursor-pointer"
            @click="abrirPaso1"
          >
            <Film class="size-3.5 text-cyan-400" />
            <span>Nueva Plataforma</span>
          </button>

          <button
            type="button"
            class="btn-primary inline-flex items-center gap-1.5 text-xs py-2 px-4 font-semibold cursor-pointer"
            @click="() => abrirPaso2()"
          >
            <Plus class="size-4" />
            <span>Nueva Cuenta</span>
          </button>
        </div>
      </header>

      <!-- Feedback de Tarea Cron -->
      <div
        v-if="cronMessage"
        class="flex items-center gap-3 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-3.5 text-xs font-semibold text-emerald-300 animate-fade-in"
      >
        <CheckCircle2 class="size-5 text-emerald-400 shrink-0" />
        <p>{{ cronMessage }}</p>
      </div>

      <!-- Alerta de Error -->
      <AppAlert v-if="error" variant="error" title="Atención">
        <p>{{ error }}</p>
      </AppAlert>

      <!-- Estado de Carga -->
      <AppLoader v-if="loading && cuentas.length === 0" label="Cargando panel de inventario..." />

      <!-- Contenido Principal -->
      <div v-else class="space-y-5">
        <!-- 1. Tarjetas Resumen de Métricas (Super Claras) -->
        <AdminSummaryCards :resumen="resumen" />

        <!-- 2. Pestañas de Navegación Clara -->
        <div role="tablist" class="flex border-b border-white/10 gap-2 overflow-x-auto scrollbar-none">
          <!-- Tab 1: Inventario -->
          <button
            type="button"
            role="tab"
            :aria-selected="activeTab === 'inventario'"
            class="flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer focus:outline-none shrink-0"
            :class="[
              activeTab === 'inventario'
                ? 'border-cyan-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            ]"
            @click="setTab('inventario')"
          >
            <Tv class="size-4" />
            <span>Cuentas</span>
            <span class="rounded bg-white/10 px-1.5 py-0.2 text-[10px] font-mono text-slate-300">
              {{ cuentas.length }}
            </span>
          </button>

          <!-- Tab 2: Plataformas & Catálogo -->
          <button
            type="button"
            role="tab"
            :aria-selected="activeTab === 'plataformas'"
            class="flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer focus:outline-none shrink-0"
            :class="[
              activeTab === 'plataformas'
                ? 'border-cyan-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            ]"
            @click="setTab('plataformas')"
          >
            <Film class="size-4" />
            <span>Plataformas</span>
            <span class="rounded bg-white/10 px-1.5 py-0.2 text-[10px] font-mono text-slate-300">
              {{ plataformas.length }}
            </span>
          </button>

          <!-- Tab 3: Servicios a Clientes -->
          <button
            type="button"
            role="tab"
            :aria-selected="activeTab === 'servicios'"
            class="flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer focus:outline-none shrink-0"
            :class="[
              activeTab === 'servicios'
                ? 'border-cyan-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            ]"
            @click="setTab('servicios')"
          >
            <Users class="size-4" />
            <span>Clientes</span>
            <span class="rounded bg-white/10 px-1.5 py-0.2 text-[10px] font-mono text-slate-300">
              {{ servicios.length }}
            </span>
          </button>

          <!-- Tab 4: Ventas -->
          <button
            type="button"
            role="tab"
            :aria-selected="activeTab === 'ventas'"
            class="flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer focus:outline-none shrink-0"
            :class="[
              activeTab === 'ventas'
                ? 'border-cyan-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            ]"
            @click="setTab('ventas')"
          >
            <Receipt class="size-4" />
            <span>Ventas</span>
            <span class="rounded bg-white/10 px-1.5 py-0.2 text-[10px] font-mono text-slate-300">
              {{ compras.length }}
            </span>
          </button>
        </div>

        <!-- 3. Contenedores de Vistas según Tab Activo -->
        <div>
          <!-- Tab 1: Inventario -->
          <div v-if="activeTab === 'inventario'">
            <AccountsTable
              :cuentas="cuentas"
              :plataformas="plataformas"
              @open-modal="() => abrirPaso2()"
              @cuenta-eliminada="loadAdminData"
            />
          </div>

          <!-- Tab 2: Plataformas -->
          <div v-else-if="activeTab === 'plataformas'">
            <AdminPlatformsOverview
              :plataformas="plataformas"
              :cuentas="cuentas"
              @cargar-cuenta="(plat) => abrirPaso2(plat?.id)"
            />
          </div>

          <!-- Tab 3: Servicios a Clientes -->
          <div v-else-if="activeTab === 'servicios'">
            <AdminServicesTable :servicios="servicios" />
          </div>

          <!-- Tab 4: Ventas -->
          <div v-else-if="activeTab === 'ventas'">
            <AdminSalesTable :compras="compras" />
          </div>
        </div>
      </div>

      <!-- Modal Paso 1: Registrar Plataforma de Streaming -->
      <PlatformCreateModal
        :is-open="isPlatformModalOpen"
        :plataformas-existentes="plataformas"
        @close="isPlatformModalOpen = false"
        @created="onPlatformCreated"
      />

      <!-- Modal Paso 2: Cargar Cuenta al Catálogo -->
      <AccountCreateModal
        :is-open="isAccountModalOpen"
        :plataformas="plataformas"
        :initial-plataforma-id="selectedPlatformIdForAccount"
        @close="isAccountModalOpen = false"
        @created="loadAdminData"
        @abrir-paso1="abrirPaso1"
      />
    </div>
  </div>
</template>
