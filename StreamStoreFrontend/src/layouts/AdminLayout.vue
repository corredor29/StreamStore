<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { LayoutDashboard, LogOut, ShieldAlert, Store } from '@lucide/vue'
import AppLogo from '@/components/layout/AppLogo.vue'
import SkipLink from '@/components/layout/SkipLink.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

function onLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="flex min-h-dvh flex-col md:flex-row bg-bg text-fg">
    <SkipLink />
    <aside class="border-b border-line bg-surface md:w-64 md:shrink-0 md:border-b-0 md:border-r">
      <div class="flex h-16 items-center px-4 border-b border-line">
        <AppLogo />
      </div>

      <!-- Info del Administrador -->
      <div class="p-4 border-b border-line">
        <div class="flex items-center gap-2">
          <span class="inline-flex items-center gap-1 rounded bg-warning/20 px-2 py-0.5 text-xs font-bold text-warning">
            <ShieldAlert class="size-3" aria-hidden="true" />
            ADMINISTRADOR
          </span>
        </div>
        <p class="mt-2 truncate font-display text-sm font-bold text-fg">
          {{ auth.usuario?.nombre || 'Administrador' }}
        </p>
        <p class="truncate text-xs text-muted">
          {{ auth.usuario?.email }}
        </p>
      </div>

      <!-- Navegación Admin -->
      <nav aria-label="Menú de administración" class="p-3 space-y-1">
        <RouterLink
          to="/admin"
          class="side-link flex items-center gap-2.5"
          exact-active-class="side-link-active"
        >
          <LayoutDashboard class="size-4" aria-hidden="true" />
          <span>Dashboard Inventario</span>
        </RouterLink>

        <RouterLink
          to="/"
          class="side-link flex items-center gap-2.5"
        >
          <Store class="size-4" aria-hidden="true" />
          <span>Ir a la tienda</span>
        </RouterLink>

        <button
          type="button"
          class="side-link flex w-full items-center gap-2.5 text-danger hover:bg-danger/10 hover:text-danger text-left mt-6"
          @click="onLogout"
        >
          <LogOut class="size-4" aria-hidden="true" />
          <span>Cerrar sesión</span>
        </button>
      </nav>
    </aside>

    <main id="main" tabindex="-1" class="container-app min-w-0 flex-1 py-8 outline-none">
      <RouterView />
    </main>
  </div>
</template>
