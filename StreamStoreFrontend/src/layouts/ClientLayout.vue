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
  <div class="flex min-h-dvh flex-col bg-black text-fg selection:bg-brand-500/30 selection:text-white">
    <SkipLink />
    <AppHeader />
    
    <div class="container-app flex flex-1 flex-col gap-8 py-8 md:flex-row">
      <!-- Barra lateral de navegación del cliente -->
      <aside aria-label="Navegación de usuario" class="md:w-64 md:shrink-0">
        <div class="rounded-3xl border border-white/10 bg-neutral-900/80 p-5 backdrop-blur-2xl shadow-2xl space-y-6">
          <!-- Datos del usuario conectado -->
          <div class="flex items-center gap-3.5 border-b border-white/10 pb-5">
            <div class="grid size-12 place-items-center rounded-2xl bg-gradient-to-tr from-[#8057FF] to-[#06B6D4] text-neutral-950 font-black shadow-lg">
              <User class="size-6" aria-hidden="true" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate font-display text-sm font-black text-white">
                {{ auth.usuario?.nombre || 'Usuario' }}
              </p>
              <p class="truncate text-[11px] text-slate-400 font-mono">
                {{ auth.usuario?.email }}
              </p>
              <span class="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30">
                ● Cliente Activo
              </span>
            </div>
          </div>

          <!-- Enlaces de navegación interna -->
          <nav class="space-y-2">
            <RouterLink
              to="/mi-cuenta"
              class="flex items-center gap-3 rounded-2xl px-3.5 py-3 text-xs font-bold transition-all text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
              exact-active-class="bg-white/15 text-white shadow-md border border-white/20"
            >
              <Tv class="size-4 text-cyan-400" aria-hidden="true" />
              <span>Mis Servicios</span>
            </RouterLink>

            <RouterLink
              to="/catalogo"
              class="flex items-center gap-3 rounded-2xl px-3.5 py-3 text-xs font-bold transition-all text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
              active-class="bg-white/15 text-white"
            >
              <ShoppingBag class="size-4 text-brand-300" aria-hidden="true" />
              <span>Comprar más planes</span>
            </RouterLink>

            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-xs font-bold transition-all text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 text-left mt-6 cursor-pointer"
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
