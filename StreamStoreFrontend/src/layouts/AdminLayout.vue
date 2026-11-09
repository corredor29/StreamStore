<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { ArrowUpRight, Film, LogOut, Menu, Receipt, Tv, Users, X } from '@lucide/vue'
import AppLogo from '@/components/layout/AppLogo.vue'
import SkipLink from '@/components/layout/SkipLink.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const isMobileMenuOpen = ref(false)

const userInitial = computed(() => (auth.usuario?.nombre || 'Admin').charAt(0).toUpperCase())
const activeTab = computed(() => (route.query.tab as string) || 'inventario')

const secciones = [
  { tab: 'inventario', label: 'Cuentas', icon: Tv },
  { tab: 'plataformas', label: 'Plataformas', icon: Film },
  { tab: 'servicios', label: 'Clientes y entregas', icon: Users },
  { tab: 'ventas', label: 'Ventas', icon: Receipt },
] as const

function onLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="admin-ui flex min-h-dvh flex-col lg:flex-row antialiased">
    <SkipLink />

    <header class="lg:hidden sticky top-0 z-40 flex items-center justify-between border-b border-ad-line bg-ad-panel/95 px-4 py-2.5">
      <AppLogo />
      <button
        type="button"
        class="rounded-sm p-2 text-ad-dim hover:bg-ad-hover hover:text-ad-accent-text"
        :aria-expanded="isMobileMenuOpen"
        aria-label="Abrir menú"
        @click="isMobileMenuOpen = !isMobileMenuOpen"
      >
        <Menu v-if="!isMobileMenuOpen" class="size-5" />
        <X v-else class="size-5" />
      </button>
    </header>

    <div v-if="isMobileMenuOpen" class="lg:hidden fixed inset-0 z-40 bg-black/70" @click="isMobileMenuOpen = false" />

    <aside
      class="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-ad-line bg-ad-panel/95 transition-transform duration-200 lg:translate-x-0"
      :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    >
      <div class="flex h-16 items-center justify-between border-b border-ad-line px-4">
        <AppLogo />
        <button type="button" class="lg:hidden rounded-sm p-1 text-ad-dim hover:text-ad-text" aria-label="Cerrar menú" @click="isMobileMenuOpen = false">
          <X class="size-5" />
        </button>
      </div>

      <div class="flex items-center justify-between border-b border-ad-line px-4 py-2">
        <span class="hud-label !text-[10px]">Consola</span>
        <span class="hud-label !text-[10px] !text-ad-accent-text">Admin</span>
      </div>

      <nav aria-label="Administración" class="flex-1 overflow-y-auto px-2 pt-4 pb-4">
        <p class="hud-label px-3 pb-2 !text-[10px]">Módulos</p>
        <ul class="space-y-0.5">
          <li v-for="s in secciones" :key="s.tab">
            <RouterLink
              :to="{ path: '/admin', query: { tab: s.tab } }"
              class="admin-nav"
              :class="{ 'admin-nav-active': activeTab === s.tab }"
              :aria-current="activeTab === s.tab ? 'page' : undefined"
              @click="isMobileMenuOpen = false"
            >
              <component :is="s.icon" class="size-4 shrink-0" />
              <span class="flex-1">{{ s.label }}</span>
              <span v-if="activeTab === s.tab" class="led text-ad-accent" aria-hidden="true" />
            </RouterLink>
          </li>
        </ul>

        <p class="hud-label px-3 pt-7 pb-2 !text-[10px]">Tienda</p>
        <ul class="space-y-0.5">
          <li>
            <RouterLink to="/" class="admin-nav" @click="isMobileMenuOpen = false">
              <span class="flex-1">Ir a la tienda</span><ArrowUpRight class="size-3.5 opacity-60" />
            </RouterLink>
          </li>
          <li>
            <RouterLink to="/catalogo" class="admin-nav" @click="isMobileMenuOpen = false">
              <span class="flex-1">Catálogo público</span><ArrowUpRight class="size-3.5 opacity-60" />
            </RouterLink>
          </li>
        </ul>
      </nav>

      <div class="border-t border-ad-line p-3">
        <div class="flex items-center gap-3 px-1">
          <span class="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-cyan-500 font-hud text-sm font-bold text-white">
            {{ userInitial }}
          </span>
          <div class="min-w-0 flex-1 leading-tight">
            <p class="truncate text-[13px] font-medium text-ad-text">{{ auth.usuario?.nombre || 'Administrador' }}</p>
            <p class="truncate font-mono text-[11px] text-ad-dim">{{ auth.usuario?.email }}</p>
          </div>
          <button
            type="button"
            class="rounded-sm p-1.5 text-ad-dim hover:bg-ad-err/10 hover:text-ad-err"
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            @click="onLogout"
          >
            <LogOut class="size-4" />
          </button>
        </div>
      </div>
    </aside>

    <main id="main" tabindex="-1" class="min-w-0 flex-1 lg:ml-64 px-4 sm:px-6 lg:px-10 py-6 lg:py-8 outline-none">
      <RouterView />
    </main>
  </div>
</template>
