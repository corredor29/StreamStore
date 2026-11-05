<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { LogOut, ShoppingBag, Tv, User } from '@lucide/vue'
import AppHeader from '@/components/layout/AppHeader.vue'
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
  <div class="flex min-h-dvh flex-col bg-bg text-fg">
    <SkipLink />
    <AppHeader />
    <div class="container-app flex flex-1 flex-col gap-8 py-8 md:flex-row">
      <!-- Barra lateral de navegación del cliente -->
      <aside aria-label="Navegación de usuario" class="md:w-64 md:shrink-0">
        <div class="card p-4">
          <!-- Datos del usuario conectado -->
          <div class="flex items-center gap-3 border-b border-line pb-4">
            <div class="grid size-10 place-items-center rounded-xl bg-brand-500/20 text-brand-300">
              <User class="size-5" aria-hidden="true" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate font-display text-sm font-bold text-fg">
                {{ auth.usuario?.nombre || 'Usuario' }}
              </p>
              <p class="truncate text-xs text-muted">
                {{ auth.usuario?.email }}
              </p>
            </div>
          </div>

          <!-- Enlaces de navegación interna -->
          <nav class="mt-4 space-y-1">
            <RouterLink
              to="/mi-cuenta"
              class="side-link flex items-center gap-2.5"
              exact-active-class="side-link-active"
            >
              <Tv class="size-4" aria-hidden="true" />
              <span>Mis Servicios</span>
            </RouterLink>

            <RouterLink
              to="/catalogo"
              class="side-link flex items-center gap-2.5"
            >
              <ShoppingBag class="size-4" aria-hidden="true" />
              <span>Comprar más planes</span>
            </RouterLink>

            <button
              type="button"
              class="side-link flex w-full items-center gap-2.5 text-danger hover:bg-danger/10 hover:text-danger text-left mt-4"
              @click="onLogout"
            >
              <LogOut class="size-4" aria-hidden="true" />
              <span>Cerrar sesión</span>
            </button>
          </nav>
        </div>
      </aside>

      <!-- Contenido principal -->
      <main id="main" tabindex="-1" class="min-w-0 flex-1 outline-none">
        <RouterView />
      </main>
    </div>
  </div>
</template>
