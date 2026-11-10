<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { CheckCircle2, Clock, Film, Plus, RefreshCw, ShieldAlert } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import { adminService } from '@/services/adminService'
import { productService } from '@/services/productService'
import type { Compra, CuentaAdmin, Plataforma, ResumenAdmin, ServicioAdmin, ComboPromo } from '@/types'
import AdminCombosTable from '@/components/admin/AdminCombosTable.vue'
import PromotionCreateModal from '@/components/admin/PromotionCreateModal.vue'
import DeliverCredentialsModal from '@/components/admin/DeliverCredentialsModal.vue'
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

type TabKey = 'inventario' | 'plataformas' | 'promociones' | 'servicios' | 'ventas'

const activeTab = ref<TabKey>('inventario')

// Estado de modales en 2 pasos
const isPlatformModalOpen = ref(false)
const isAccountModalOpen = ref(false)
const isPromoModalOpen = ref(false)
const combos = ref<ComboPromo[]>([])
const selectedPlatformIdForAccount = ref<number | null>(null)

const isCronExecuting = ref(false)
const cronMessage = ref<string | null>(null)

// Sincronizar pestaña activa con ?tab= de la URL
watch(
  () => route.query.tab,
  (newTab) => {
    if (newTab && ['inventario', 'plataformas', 'promociones', 'servicios', 'ventas'].includes(newTab as string)) {
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
  ventasHoy: 0,
  ventasMes: 0,
  totalCuentas: 0,
  cuentasDisponibles: 0,
  pantallasDisponibles: 0,
  serviciosActivos: 0,
})

const cuentas = ref<CuentaAdmin[]>([])
const plataformas = ref<Plataforma[]>([])
const compras = ref<Compra[]>([])
const servicios = ref<ServicioAdmin[]>([])
const servicioAEntregar = ref<ServicioAdmin | null>(null)
const entregasPendientes = computed(() => servicios.value.filter((s) => s.estadoEntrega === 'PENDIENTE' && s.estado !== 'VENCIDO').length)


async function onPromoCreated() {
  combos.value = await adminService.combos().catch(() => combos.value)
}

async function onToggleCombo(id: number) {
  await adminService.toggleCombo(id).catch(() => {})
  combos.value = await adminService.combos().catch(() => combos.value)
}

async function onEliminarCombo(id: number) {
  if (!confirm('¿Seguro que deseas eliminar esta promoción?')) return
  await adminService.eliminarCombo(id).catch(() => {})
  combos.value = await adminService.combos().catch(() => combos.value)
}

async function onEntregado(mensaje: string) {
  servicioAEntregar.value = null
  cronMessage.value = mensaje
  setTimeout(() => (cronMessage.value = null), 4500)
  servicios.value = await adminService.servicios().catch(() => servicios.value)
}
const loading = ref(true)
const pestanas = computed(() => [
  { key: 'inventario' as const, label: 'Cuentas', count: cuentas.value.length },
  { key: 'plataformas' as const, label: 'Plataformas', count: plataformas.value.length },
  { key: 'servicios' as const, label: 'Clientes y entregas', count: servicios.value.length },
  { key: 'ventas' as const, label: 'Ventas', count: compras.value.length },
])
const error = ref<string | null>(null)
const conectado = ref<boolean | null>(null)
const ultimaSync = ref<Date | null>(null)
const horaSync = computed(() =>
  ultimaSync.value ? ultimaSync.value.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) : '--:--:--',
)
const pantallasTotales = computed(() =>
  cuentas.value.filter((c) => c.estado !== 'INACTIVA').reduce((acc, c) => acc + c.totalPantallas, 0),
)
// Las cifras las calcula el backend en MySQL; solo en modo demo (sin servidor) se derivan del inventario cargado
const resumenPanel = computed<ResumenAdmin>(() => {
  if (resumen.value.desdeServidor) return resumen.value
  const activas = cuentas.value.filter((c) => c.estado !== 'INACTIVA')
  return {
    ...resumen.value,
    totalCuentas: activas.length,
    // «Sin vender» = ninguna pantalla vendida todavía
    cuentasDisponibles: activas.filter((c) => c.totalPantallas > 0 && c.pantallasDisponibles === c.totalPantallas).length,
    pantallasDisponibles: activas.reduce((acc, c) => acc + c.pantallasDisponibles, 0),
    serviciosActivos: servicios.value.filter((s) => s.estado !== 'VENCIDO').length,
  }
})

async function loadAdminData() {
  loading.value = true
  error.value = null
  try {
    // Cada bloque falla por separado: lo que cargó se muestra y lo que no, se avisa (nunca datos inventados)
    const fallos: string[] = []
    const seguro = <T,>(p: Promise<T>, que: string, vacio: T) =>
      p.catch((e: any) => {
        fallos.push(`${que}: ${e?.message || 'error desconocido'}`)
        return vacio
      })
    const [res, cuents, plats, comps, servs, cmbs] = await Promise.all([
      seguro(adminService.resumen(), 'Resumen', null as ResumenAdmin | null),
      seguro(adminService.cuentas(), 'Cuentas', [] as CuentaAdmin[]),
      seguro(productService.getPlataformas(), 'Plataformas', [] as Plataforma[]),
      seguro(adminService.compras(), 'Ventas', [] as Compra[]),
      seguro(adminService.servicios(), 'Clientes y entregas', [] as ServicioAdmin[]),
      seguro(adminService.combos(), 'Promociones', [] as ComboPromo[]),
    ])
    conectado.value = fallos.length === 0
    ultimaSync.value = new Date()
    if (fallos.length) error.value = `No se pudo cargar parte del panel. ${fallos.join(' · ')}`

    cuentas.value = cuents
    plataformas.value = plats
    compras.value = comps
    servicios.value = servs
    combos.value = cmbs
    if (res) resumen.value = res
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

onMounted(() => {
  // Sin rol admin no se piden datos administrativos (el backend respondería 403 igualmente)
  if (auth.isAdmin) loadAdminData()
})
</script>

<template>
  <div class="space-y-6 w-full max-w-[1440px] mx-auto">
    <!-- Verificación de rol admin amigable -->
    <div
      v-if="!auth.isAdmin"
      class="rounded-lg border border-ad-line bg-ad-panel p-8 text-center max-w-md mx-auto my-16 space-y-4"
    >
      <div class="size-10 rounded-md bg-ad-warn/15 text-ad-warn flex items-center justify-center mx-auto">
        <ShieldAlert class="size-5" />
      </div>
      <div>
        <h2 class="text-base font-semibold text-ad-text">
          Acceso de Administrador Requerido
        </h2>
        <p class="mt-1.5 text-[13px] text-ad-dim leading-relaxed">
          <template v-if="auth.usuario">
            Has iniciado sesión como <strong class="text-ad-text">{{ auth.usuario.email }}</strong>, que no tiene permisos de administrador.
          </template>
          <template v-else>Inicia sesión con una cuenta de administrador para entrar a la consola.</template>
        </p>
      </div>
      <div class="flex flex-col gap-2 sm:flex-row">
        <RouterLink v-if="!auth.usuario" :to="{ path: '/login', query: { redirect: '/admin' } }" class="btn-ad h-9 flex-1">
          Iniciar sesión
        </RouterLink>
        <RouterLink to="/" class="btn-ad-ghost h-9 flex-1">Volver a la tienda</RouterLink>
      </div>
    </div>

    <!-- Panel Administrativo Completo -->
    <div v-else class="space-y-5">
      <header class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div class="flex items-center gap-3">
            <span class="hud-label !text-ad-accent-text">StreamStore // Admin</span>
            <span
              class="inline-flex items-center gap-1.5 hud-label !text-[10px]"
              :class="conectado === false ? '!text-ad-err' : '!text-ad-ok'"
              role="status"
            >
              <span class="led" />
              {{ conectado === false ? 'Sin conexión' : conectado ? 'En línea' : 'Conectando' }}
            </span>
          </div>
          <h1 class="mt-2 font-hud text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white">Panel de control</h1>
          <p class="mt-1 text-[13px] text-ad-dim">
            Inventario, entregas y ventas ·
            <span class="font-mono text-ad-faint">Sync {{ horaSync }}</span>
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            class="inline-flex size-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-ad-dim hover:border-cyan-400/50 hover:text-white disabled:opacity-50 cursor-pointer"
            :disabled="isCronExecuting"
            title="Revisar vencimientos"
            aria-label="Revisar vencimientos"
            @click="onEjecutarCron"
          >
            <Clock class="size-4" :class="{ 'animate-spin': isCronExecuting }" />
          </button>
          <button
            type="button"
            class="inline-flex size-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-ad-dim hover:border-cyan-400/50 hover:text-white disabled:opacity-50 cursor-pointer"
            :disabled="loading"
            title="Sincronizar datos"
            aria-label="Sincronizar datos"
            @click="loadAdminData"
          >
            <RefreshCw class="size-4" :class="{ 'animate-spin': loading }" />
          </button>
          <button
            type="button"
            class="btn-ad-ghost h-9"
            @click="abrirPaso1"
          >
            <Film class="size-4 text-cyan-300" />
            Nueva plataforma
          </button>
          <button
            type="button"
            class="btn-ad h-9"
            @click="() => abrirPaso2()"
          >
            <Plus class="size-4" />
            Nueva cuenta
          </button>
        </div>
      </header>

      <div
        v-if="cronMessage"
        role="status"
        class="hud-panel !rounded-xl flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-ad-text"
      >
        <CheckCircle2 class="size-4 text-ad-ok shrink-0" />
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
        <AdminSummaryCards
          :resumen="resumenPanel"
          :pantallas-totales="resumenPanel.pantallasTotales ?? pantallasTotales"
          :entregas-pendientes="resumenPanel.entregasPendientes ?? entregasPendientes"
        />

        <div role="tablist" aria-label="Secciones" class="flex gap-1 border-b border-ad-line overflow-x-auto overflow-y-hidden no-scrollbar">
          <button
            v-for="t in pestanas"
            :key="t.key"
            type="button"
            role="tab"
            :aria-selected="activeTab === t.key"
            class="-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3.5 pb-3 pt-2.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            :class="activeTab === t.key ? 'border-cyan-400 text-white' : 'border-transparent text-ad-dim hover:text-white'"
            @click="setTab(t.key)"
          >
            {{ t.label }}
            <span
              v-if="t.key === 'servicios' && entregasPendientes > 0"
              class="inline-flex items-center gap-1.5 rounded-sm border border-ad-warn/40 px-1.5 text-[10px] leading-[18px] text-ad-warn"
              :title="`${entregasPendientes} por entregar`"
            ><span class="led" />{{ entregasPendientes }} pendientes</span>
            <span v-else class="rounded-md border border-white/10 bg-white/5 px-1.5 font-mono text-[10px] leading-[18px] text-ad-dim tabular-nums">{{ t.count }}</span>
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

                    <!-- Tab: Promociones -->
          <div v-else-if="activeTab === 'promociones'">
            <AdminCombosTable
              :combos="combos"
              :plataformas="plataformas"
              @abrir-modal-combo="isPromoModalOpen = true"
              @toggle-activo="onToggleCombo"
              @eliminar-combo="onEliminarCombo"
            />
          </div>

          <!-- Tab 3: Servicios a Clientes -->
          <div v-else-if="activeTab === 'servicios'">
            <AdminServicesTable :servicios="servicios" @entregar="(s) => (servicioAEntregar = s)" />
          </div>

          <!-- Tab 4: Ventas -->
          <div v-else-if="activeTab === 'ventas'">
            <AdminSalesTable :compras="compras" />
          </div>
        </div>
      </div>

      <DeliverCredentialsModal
        :servicio="servicioAEntregar"
        @close="servicioAEntregar = null"
        @entregado="onEntregado"
      />

            <!-- Modal Crear Promoción -->
      <PromotionCreateModal
        :is-open="isPromoModalOpen"
        :plataformas="plataformas"
        @close="isPromoModalOpen = false"
        @created="onPromoCreated"
      />

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
        :cuentas="cuentas"
        :initial-plataforma-id="selectedPlatformIdForAccount"
        @close="isAccountModalOpen = false"
        @created="loadAdminData"
        @abrir-paso1="abrirPaso1"
      />
    </div>
  </div>
</template>
