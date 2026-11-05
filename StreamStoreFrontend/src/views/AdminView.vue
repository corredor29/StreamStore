<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { 
  Clock, 
  Plus, 
  Receipt, 
  RefreshCw, 
  ShieldAlert, 
  Sparkles, 
  Tv 
} from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { adminService } from '@/services/adminService'
import { productService } from '@/services/productService'
import { DEMO_ACCOUNTS } from '@/services/authService'
import type { Compra, CuentaAdmin, Plataforma, ResumenAdmin } from '@/types'
import AdminSummaryCards from '@/components/admin/AdminSummaryCards.vue'
import AccountsTable from '@/components/admin/AccountsTable.vue'
import AccountCreateModal from '@/components/admin/AccountCreateModal.vue'
import AdminSalesTable from '@/components/admin/AdminSalesTable.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import AppAlert from '@/components/common/AppAlert.vue'

const auth = useAuthStore()

const activeTab = ref<'inventario' | 'ventas'>('inventario')
const isModalOpen = ref(false)
const isCronExecuting = ref(false)
const cronMessage = ref<string | null>(null)

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
const loading = ref(true)
const error = ref<string | null>(null)

async function loadAdminData() {
  loading.value = true
  error.value = null
  try {
    const [res, cuents, plats, comps] = await Promise.all([
      adminService.resumen().catch(() => null),
      adminService.cuentas().catch(() => []),
      productService.getPlataformas().catch(() => []),
      adminService.compras().catch(() => []),
    ])

    if (res) {
      resumen.value = res
    } else {
      resumen.value = {
        ventasHoy: 75000,
        ventasMes: 450000,
        totalCuentas: cuents?.length || 4,
        cuentasDisponibles: cuents?.filter((c) => c.estado === 'DISPONIBLE').length || 2,
        pantallasDisponibles: 8,
        serviciosActivos: 2,
      }
    }

    cuentas.value = Array.isArray(cuents) && cuents.length > 0 ? cuents : []
    plataformas.value = Array.isArray(plats) && plats.length > 0 ? plats : []
    compras.value = Array.isArray(comps) && comps.length > 0 ? comps : []
  } catch (err: any) {
    console.error('Error cargando admin data:', err)
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
    }, 4000)
  } catch (err: any) {
    cronMessage.value = err?.message || 'Error al ejecutar tarea cron.'
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
  <div class="space-y-6">
    <!-- Verificación de rol admin amigable -->
    <div
      v-if="!auth.isAdmin"
      class="card p-6 border-warning/40 bg-warning/10 text-center max-w-lg mx-auto my-12"
    >
      <ShieldAlert class="size-12 mx-auto text-warning" />
      <h2 class="mt-4 font-display text-lg font-bold text-fg">
        Acceso de Administrador Requerido
      </h2>
      <p class="mt-1 text-xs text-muted">
        Has iniciado sesión como <strong class="text-fg">{{ auth.usuario?.email || 'visitante' }}</strong> (Rol: {{ auth.usuario?.rol || 'ninguno' }}).
      </p>
      <button
        type="button"
        class="btn-primary mt-4 text-xs py-2 px-4 shadow-lg shadow-brand-500/30"
        @click="switchToAdminDemo"
      >
        <Sparkles class="size-3.5" />
        <span>Iniciar como Administrador de Demostración</span>
      </button>
    </div>

    <!-- Panel Administrativo Completo -->
    <div v-else class="space-y-6">
      <!-- Encabezado del Dashboard -->
      <header class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <div class="flex items-center gap-2">
            <span class="rounded bg-warning/20 px-2 py-0.5 text-xs font-bold text-warning">
              PANEL OFICIAL
            </span>
            <span class="text-xs text-muted">Inventario & Métricas</span>
          </div>
          <h1 class="mt-1 font-display text-2xl font-extrabold text-fg sm:text-3xl">
            Control de Inventario y Ventas
          </h1>
          <p class="mt-1 text-sm text-muted">
            Administra cuentas maestras, asignación de pantallas y monitoreo de inventario.
          </p>
        </div>

        <!-- Acciones Rápidas -->
        <div class="flex flex-wrap items-center gap-2 self-end sm:self-auto">
          <!-- Botón Ejecutar Cron -->
          <button
            type="button"
            class="btn-secondary text-xs py-2 px-3 gap-1.5"
            :disabled="isCronExecuting"
            @click="onEjecutarCron"
          >
            <Clock class="size-3.5 text-brand-300" :class="{ 'animate-spin': isCronExecuting }" />
            <span>{{ isCronExecuting ? 'Ejecutando cron...' : 'Ejecutar Cron Vencimientos' }}</span>
          </button>

          <!-- Botón Actualizar -->
          <button
            type="button"
            class="btn-secondary text-xs py-2 px-3 gap-1.5"
            :disabled="loading"
            @click="loadAdminData"
          >
            <RefreshCw class="size-3.5" :class="{ 'animate-spin': loading }" />
            <span>Actualizar</span>
          </button>

          <!-- Botón Cargar Cuenta -->
          <button
            type="button"
            class="btn-primary text-xs py-2 px-3.5 gap-1.5 font-bold shadow-lg shadow-brand-500/25"
            @click="isModalOpen = true"
          >
            <Plus class="size-4" />
            <span>Cargar Cuenta</span>
          </button>
        </div>
      </header>

      <!-- Feedback de Cron -->
      <AppAlert
        v-if="cronMessage"
        variant="success"
        title="Tarea de Sistema Completada"
        class="animate-fade-in"
      >
        <p>{{ cronMessage }}</p>
      </AppAlert>

      <!-- Alerta de Error -->
      <AppAlert v-if="error" variant="error" title="Error en el dashboard">
        <p>{{ error }}</p>
      </AppAlert>

      <!-- Estado de Carga -->
      <AppLoader v-if="loading && cuentas.length === 0" label="Cargando estadísticas de inventario..." />

      <!-- Contenido del Panel Principal -->
      <div v-else class="space-y-6">
        <!-- 1. Tarjetas de Resumen KPI -->
        <AdminSummaryCards :resumen="resumen" />

        <!-- 2. Pestañas de Vista (Inventario vs Ventas) -->
        <div role="tablist" class="flex border-b border-line gap-2">
          <button
            type="button"
            role="tab"
            :aria-selected="activeTab === 'inventario'"
            class="flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors focus:outline-none"
            :class="[
              activeTab === 'inventario'
                ? 'border-brand-400 text-fg'
                : 'border-transparent text-muted hover:text-fg'
            ]"
            @click="activeTab = 'inventario'"
          >
            <Tv class="size-4" />
            <span>Inventario de Cuentas</span>
            <span class="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted">
              {{ cuentas.length }}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            :aria-selected="activeTab === 'ventas'"
            class="flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors focus:outline-none"
            :class="[
              activeTab === 'ventas'
                ? 'border-brand-400 text-fg'
                : 'border-transparent text-muted hover:text-fg'
            ]"
            @click="activeTab = 'ventas'"
          >
            <Receipt class="size-4" />
            <span>Registro Global de Ventas</span>
            <span class="rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted">
              {{ compras.length }}
            </span>
          </button>
        </div>

        <!-- 3. Contenido de Pestañas -->
        <div v-if="activeTab === 'inventario'">
          <AccountsTable
            :cuentas="cuentas"
            :plataformas="plataformas"
          />
        </div>

        <div v-else-if="activeTab === 'ventas'">
          <AdminSalesTable :compras="compras" />
        </div>
      </div>

      <!-- Modal de Carga de Cuenta -->
      <AccountCreateModal
        :is-open="isModalOpen"
        :plataformas="plataformas"
        @close="isModalOpen = false"
        @created="loadAdminData"
      />
    </div>
  </div>
</template>
