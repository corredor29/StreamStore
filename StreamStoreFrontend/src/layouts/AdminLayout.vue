<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { 
  ChevronRight, 
  ExternalLink, 
  Film,
  Layers, 
  LogOut, 
  Menu, 
  Receipt, 
  ShieldCheck, 
  Store, 
  Tv, 
  Users, 
  X 
} from '@lucide/vue'
import AppLogo from '@/components/layout/AppLogo.vue'
import SkipLink from '@/components/layout/SkipLink.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const isMobileMenuOpen = ref(false)

const userInitial = computed(() => {
  const name = auth.usuario?.nombre || 'Admin'
  return name.charAt(0).toUpperCase()
})

const activeTab = computed(() => {
  return (route.query.tab as string) || 'inventario'
})

function onLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="flex min-h-dvh flex-col lg:flex-row bg-[#080B16] text-fg antialiased selection:bg-brand-500/30 selection:text-white">
    <SkipLink />

    <!-- Barra Superior para Móviles / Tablets -->
    <header class="lg:hidden flex items-center justify-between border-b border-line/60 bg-surface/90 backdrop-blur px-4 py-3 sticky top-0 z-40">
      <div class="flex items-center gap-3">
        <AppLogo />
        <span class="rounded bg-brand-500/15 border border-brand-500/30 px-2 py-0.5 text-[10px] font-black text-brand-300 uppercase tracking-widest">
          Console
        </span>
      </div>
      <button
        type="button"
        class="rounded-xl border border-line bg-surface-2 p-2 text-muted hover:text-fg hover:bg-surface-2/80 transition-colors"
        :aria-expanded="isMobileMenuOpen"
        aria-label="Abrir menú de navegación"
        @click="isMobileMenuOpen = !isMobileMenuOpen"
      >
        <Menu v-if="!isMobileMenuOpen" class="size-5" />
        <X v-else class="size-5" />
      </button>
    </header>

    <!-- Overlay Móvil -->
    <div
      v-if="isMobileMenuOpen"
      class="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity"
      @click="isMobileMenuOpen = false"
    />

    <!-- Sidebar Principal Administrativa -->
    <aside
      class="fixed inset-y-0 left-0 z-50 w-72 flex flex-col justify-between border-r border-line/70 bg-[#0C1022] transform transition-transform duration-300 lg:static lg:translate-x-0"
      :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    >
      <div class="flex flex-col flex-1 overflow-y-auto">
        <!-- Logo & Encabezado del Panel -->
        <div class="flex h-18 items-center justify-between px-5 border-b border-line/60 bg-[#090D1C]">
          <div class="flex items-center gap-2.5">
            <AppLogo />
            <div class="flex flex-col">
              <span class="text-[10px] font-black tracking-widest text-brand-400 uppercase leading-none">
                Enterprise
              </span>
              <span class="text-[9px] text-muted font-mono leading-tight">v2.4 Pro</span>
            </div>
          </div>
          <button
            type="button"
            class="lg:hidden text-muted hover:text-fg p-1"
            @click="isMobileMenuOpen = false"
          >
            <X class="size-5" />
          </button>
        </div>

        <!-- Tarjeta de Administrador Activo -->
        <div class="p-4 mx-3 mt-4 rounded-xl border border-line/60 bg-surface/50 backdrop-blur">
          <div class="flex items-center gap-3">
            <div class="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 font-display text-sm font-black text-white shadow-md shadow-brand-500/25">
              {{ userInitial }}
              <span class="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-[#0C1022] bg-emerald-400 shadow-sm" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5">
                <span class="inline-flex items-center gap-1 rounded bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 text-[10px] font-black text-amber-400">
                  <ShieldCheck class="size-2.5" />
                  ADMIN
                </span>
                <span class="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span class="size-1 rounded-full bg-emerald-400 animate-pulse" /> Activo
                </span>
              </div>
              <p class="truncate font-display text-xs font-bold text-fg mt-0.5">
                {{ auth.usuario?.nombre || 'Administrador' }}
              </p>
              <p class="truncate text-[11px] text-muted font-mono">
                {{ auth.usuario?.email }}
              </p>
            </div>
          </div>
        </div>

        <!-- Menú de Navegación por Grupos -->
        <nav aria-label="Menú de administración" class="px-3 py-4 space-y-6">
          <!-- Grupo 1: Operaciones Principales -->
          <div class="space-y-1">
            <p class="px-3 text-[10px] font-black uppercase tracking-wider text-muted/60 mb-2">
              Gestión Operativa
            </p>

            <RouterLink
              :to="{ path: '/admin', query: { tab: 'inventario' } }"
              class="side-link flex items-center justify-between group"
              :class="{ 'side-link-active': activeTab === 'inventario' }"
              @click="isMobileMenuOpen = false"
            >
              <div class="flex items-center gap-2.5">
                <Tv class="size-4 text-brand-300 group-hover:text-brand-200 transition-colors" />
                <span class="font-medium text-xs sm:text-sm">Inventario de Cuentas</span>
              </div>
              <ChevronRight class="size-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
            </RouterLink>

            <RouterLink
              :to="{ path: '/admin', query: { tab: 'servicios' } }"
              class="side-link flex items-center justify-between group"
              :class="{ 'side-link-active': activeTab === 'servicios' }"
              @click="isMobileMenuOpen = false"
            >
              <div class="flex items-center gap-2.5">
                <Users class="size-4 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                <span class="font-medium text-xs sm:text-sm">Servicios y Clientes</span>
              </div>
              <ChevronRight class="size-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
            </RouterLink>

            <RouterLink
              :to="{ path: '/admin', query: { tab: 'ventas' } }"
              class="side-link flex items-center justify-between group"
              :class="{ 'side-link-active': activeTab === 'ventas' }"
              @click="isMobileMenuOpen = false"
            >
              <div class="flex items-center gap-2.5">
                <Receipt class="size-4 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                <span class="font-medium text-xs sm:text-sm">Ventas & Facturación</span>
              </div>
              <ChevronRight class="size-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
            </RouterLink>

            <RouterLink
              :to="{ path: '/admin', query: { tab: 'plataformas' } }"
              class="side-link flex items-center justify-between group"
              :class="{ 'side-link-active': activeTab === 'plataformas' }"
              @click="isMobileMenuOpen = false"
            >
              <div class="flex items-center gap-2.5">
                <Film class="size-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
                <span class="font-medium text-xs sm:text-sm">Plataformas & Catálogo</span>
              </div>
              <ChevronRight class="size-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
            </RouterLink>
          </div>

          <!-- Grupo 2: Accesos Directos -->
          <div class="space-y-1">
            <p class="px-3 text-[10px] font-black uppercase tracking-wider text-muted/60 mb-2">
              Enlaces Externos
            </p>

            <RouterLink
              to="/"
              class="side-link flex items-center justify-between group hover:text-cyan-300"
              @click="isMobileMenuOpen = false"
            >
              <div class="flex items-center gap-2.5">
                <Store class="size-4 text-muted group-hover:text-cyan-400 transition-colors" />
                <span class="font-medium text-xs sm:text-sm">Ir a la Tienda</span>
              </div>
              <ExternalLink class="size-3 text-muted" />
            </RouterLink>

            <RouterLink
              to="/catalogo"
              class="side-link flex items-center justify-between group hover:text-cyan-300"
              @click="isMobileMenuOpen = false"
            >
              <div class="flex items-center gap-2.5">
                <Layers class="size-4 text-muted group-hover:text-cyan-400 transition-colors" />
                <span class="font-medium text-xs sm:text-sm">Catálogo Público</span>
              </div>
              <ExternalLink class="size-3 text-muted" />
            </RouterLink>
          </div>
        </nav>
      </div>

      <!-- Pie de Sidebar: Estado del Sistema & Logout -->
      <div class="p-3 border-t border-line/60 bg-[#090D1C] space-y-3">
        <!-- Widget de Estado Operativo -->
        <div class="rounded-xl border border-line/60 bg-surface/40 p-2.5 flex items-center justify-between text-[11px]">
          <div class="flex items-center gap-2">
            <span class="size-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse" />
            <span class="text-muted font-medium">Servidor Backend</span>
          </div>
          <span class="font-mono text-emerald-400 font-bold">ONLINE</span>
        </div>

        <!-- Botón Cerrar Sesión -->
        <button
          type="button"
          class="flex w-full items-center justify-center gap-2 rounded-xl border border-danger/20 bg-danger/5 hover:bg-danger/15 text-danger px-3 py-2 text-xs font-bold transition-colors cursor-pointer"
          @click="onLogout"
        >
          <LogOut class="size-3.5" aria-hidden="true" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>

    <!-- Contenido Principal -->
    <main id="main" tabindex="-1" class="min-w-0 flex-1 px-4 sm:px-6 lg:px-8 py-6 lg:py-8 outline-none">
      <RouterView />
    </main>
  </div>
</template>
