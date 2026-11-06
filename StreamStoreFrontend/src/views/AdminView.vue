<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  CheckCircle2, 
  Clock, 
  Film, 
  Flame, 
  PackagePlus, 
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
import type { ComboPromo, Compra, CuentaAdmin, Plataforma, ResumenAdmin, Servicio } from '@/types'
import AdminSummaryCards from '@/components/admin/AdminSummaryCards.vue'
import AccountsTable from '@/components/admin/AccountsTable.vue'
import AccountCreateModal from '@/components/admin/AccountCreateModal.vue'
import AdminCombosTable from '@/components/admin/AdminCombosTable.vue'
import AdminSalesTable from '@/components/admin/AdminSalesTable.vue'
import AdminServicesTable from '@/components/admin/AdminServicesTable.vue'
import AdminPlatformsOverview from '@/components/admin/AdminPlatformsOverview.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import AppAlert from '@/components/common/AppAlert.vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

type TabKey = 'inventario' | 'combos' | 'servicios' | 'ventas' | 'plataformas'

const activeTab = ref<TabKey>('inventario')
const isModalOpen = ref(false)
const modalInitialMode = ref<'cuenta' | 'combo'>('cuenta')

const isCronExecuting = ref(false)
const cronMessage = ref<string | null>(null)

// Sincronizar pestaña activa con ?tab= de la URL
watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab && ['inventario', 'combos', 'servicios', 'ventas', 'plataformas'].includes(newTab as string)) {
      activeTab.value = newTab as TabKey
    }
  },
  { immediate: true }
)

function setTab(tab: TabKey) {
  activeTab.value = tab
  router.replace({ query: { ...route.query, tab } })
}

function abrirModal(mode: 'cuenta' | 'combo') {
  modalInitialMode.value = mode
  isModalOpen.value = true
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
const combos = ref<ComboPromo[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

async function loadAdminData() {
  loading.value = true
  error.value = null
  try {
    const [res, cuents, plats, comps, servs, cmbs] = await Promise.all([
      adminService.resumen().catch(() => null),
      adminService.cuentas().catch(() => []),
      productService.getPlataformas().catch(() => []),
      adminService.compras().catch(() => []),
      adminService.servicios().catch(() => []),
      adminService.combos().catch(() => []),
    ])

    cuentas.value = Array.isArray(cuents) && cuents.length > 0 ? cuents : []
    plataformas.value = Array.isArray(plats) && plats.length > 0 ? plats : []
    compras.value = Array.isArray(comps) && comps.length > 0 ? comps : []
    servicios.value = Array.isArray(servs) && servs.length > 0 ? servs : []
    combos.value = Array.isArray(cmbs) && cmbs.length > 0 ? cmbs : []

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

async function handleToggleCombo(id: number) {
  await adminService.toggleCombo(id)
  combos.value = await adminService.combos()
}

async function handleEliminarCombo(id: number) {
  if (confirm('¿Deseas eliminar esta promoción?')) {
    await adminService.eliminarCombo(id)
    combos.value = await adminService.combos()
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
    <div v-else class="space-y-6">
      <!-- Encabezado de la Consola -->
      <header class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-line/70">
        <div>
          <div class="flex items-center gap-2">
            <span class="rounded bg-brand-500/15 border border-brand-500/30 px-2 py-0.5 text-[10px] font-black text-brand-300 uppercase tracking-widest">
              StreamStore Console
            </span>
            <span class="text-xs text-muted font-mono">Control de Operaciones</span>
          </div>
          <h1 class="mt-1.5 font-display text-2xl sm:text-3xl font-extrabold text-fg tracking-tight">
            Panel de Inventario y Ventas
          </h1>
          <p class="mt-1 text-xs sm:text-sm text-muted">
            Monitoreo en tiempo real de cuentas maestras, asignación de perfiles, combos y facturación.
          </p>
        </div>

        <!-- Acciones Principales -->
        <div class="flex flex-wrap items-center gap-2.5 self-stretch sm:self-auto">
          <!-- Botón Ejecutar Cron -->
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl border border-line bg-surface-2 hover:bg-surface-2/80 text-fg text-xs font-semibold px-3 py-2 transition-all cursor-pointer"
            :disabled="isCronExecuting"
            @click="onEjecutarCron"
          >
            <Clock class="size-3.5 text-amber-400" :class="{ 'animate-spin': isCronExecuting }" />
            <span>{{ isCronExecuting ? 'Ejecutando...' : 'Ejecutar Cron Vencimientos' }}</span>
          </button>

          <!-- Botón Sincronizar -->
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl border border-line bg-surface-2 hover:bg-surface-2/80 text-fg text-xs font-semibold px-3 py-2 transition-all cursor-pointer"
            :disabled="loading"
            @click="loadAdminData"
          >
            <RefreshCw class="size-3.5 text-brand-300" :class="{ 'animate-spin': loading }" />
            <span>Actualizar</span>
          </button>

          <!-- Botón Crear Combo / Promoción -->
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-bold px-3.5 py-2 shadow-md shadow-rose-500/20 transition-all cursor-pointer"
            @click="abrirModal('combo')"
          >
            <Flame class="size-3.5" />
            <span>Crear Combo Promo</span>
          </button>

          <!-- Botón Cargar Nueva Cuenta -->
          <button
            type="button"
            class="btn-primary text-xs py-2 px-4 gap-1.5 font-bold shadow-lg shadow-brand-500/25 cursor-pointer"
            @click="abrirModal('cuenta')"
          >
            <Plus class="size-4" />
            <span>Cargar Cuenta</span>
          </button>
        </div>
      </header>

      <!-- Feedback de Tarea Cron -->
      <div
        v-if="cronMessage"
        class="flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-xs font-semibold text-emerald-300 animate-fade-in"
      >
        <CheckCircle2 class="size-5 text-emerald-400 shrink-0" />
        <p>{{ cronMessage }}</p>
      </div>

      <!-- Alerta de Error -->
      <AppAlert v-if="error" variant="error" title="Error en el dashboard">
        <p>{{ error }}</p>
      </AppAlert>

      <!-- Estado de Carga -->
      <AppLoader v-if="loading && cuentas.length === 0" label="Sincronizando inventario y ventas..." />

      <!-- Contenido Principal -->
      <div v-else class="space-y-6">
        <!-- 1. Tarjetas Ejecutivas de Rendimiento -->
        <AdminSummaryCards :resumen="resumen" />

        <!-- 2. Pestañas de Navegación Profesional -->
        <div role="tablist" class="flex border-b border-white/10 gap-1 overflow-x-auto scrollbar-none">
          <!-- Tab 1: Inventario de Cuentas -->
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
            <span>Inventario de Cuentas</span>
            <span class="rounded bg-white/10 px-1.5 py-0.2 text-[10px] font-mono text-slate-300">
              {{ cuentas.length }}
            </span>
          </button>

          <!-- Tab 2: Promociones & Combos -->
          <button
            type="button"
            role="tab"
            :aria-selected="activeTab === 'combos'"
            class="flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer focus:outline-none shrink-0"
            :class="[
              activeTab === 'combos'
                ? 'border-rose-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            ]"
            @click="setTab('combos')"
          >
            <Flame class="size-4 text-rose-400" />
            <span>Promociones & Combos</span>
            <span class="rounded bg-rose-500/20 text-rose-300 px-1.5 py-0.2 text-[10px] font-mono font-bold">
              {{ combos.length }}
            </span>
          </button>

          <!-- Tab 3: Servicios y Clientes -->
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
            <span>Servicios de Clientes</span>
            <span class="rounded bg-white/10 px-1.5 py-0.2 text-[10px] font-mono text-slate-300">
              {{ servicios.length }}
            </span>
          </button>

          <!-- Tab 4: Registro de Ventas -->
          <button
            type="button"
            role="tab"
            :aria-selected="activeTab === 'ventas'"
            class="flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer focus:outline-none shrink-0"
            :class="[
              activeTab === 'ventas'
                ? 'border-emerald-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            ]"
            @click="setTab('ventas')"
          >
            <Receipt class="size-4" />
            <span>Registro de Ventas</span>
            <span class="rounded bg-white/10 px-1.5 py-0.2 text-[10px] font-mono text-slate-300">
              {{ compras.length }}
            </span>
          </button>

          <!-- Tab 5: Catálogo y Plataformas -->
          <button
            type="button"
            role="tab"
            :aria-selected="activeTab === 'plataformas'"
            class="flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer focus:outline-none shrink-0"
            :class="[
              activeTab === 'plataformas'
                ? 'border-purple-400 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            ]"
            @click="setTab('plataformas')"
          >
            <Film class="size-4" />
            <span>Plataformas & Catálogo</span>
            <span class="rounded bg-white/10 px-1.5 py-0.2 text-[10px] font-mono text-slate-300">
              {{ plataformas.length }}
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
              @open-modal="abrirModal('cuenta')"
            />
          </div>

          <!-- Tab 2: Promociones y Combos -->
          <div v-else-if="activeTab === 'combos'">
            <AdminCombosTable
              :combos="combos"
              :plataformas="plataformas"
              @abrir-modal-combo="abrirModal('combo')"
              @toggle-activo="handleToggleCombo"
              @eliminar-combo="handleEliminarCombo"
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

          <!-- Tab 5: Plataformas -->
          <div v-else-if="activeTab === 'plataformas'">
            <AdminPlatformsOverview
              :plataformas="plataformas"
              :cuentas="cuentas"
              @cargar-cuenta="abrirModal('cuenta')"
            />
          </div>
        </div>
      </div>

      <!-- Modal de Carga de Cuenta o Combo -->
      <AccountCreateModal
        :is-open="isModalOpen"
        :initial-mode="modalInitialMode"
        :plataformas="plataformas"
        @close="isModalOpen = false"
        @created="loadAdminData"
        @combo-created="loadAdminData"
      />
    </div>
  </div>
</template>
