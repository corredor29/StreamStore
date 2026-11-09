<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { 
  ChevronDown, 
  Clock, 
  LogOut, 
  ShieldCheck, 
  ShoppingBag, 
  ShoppingCart, 
  Sparkles, 
  Tv,
} from '@lucide/vue'
import AppLogo from './AppLogo.vue'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'

const cart = useCartStore()
const auth = useAuthStore()
const router = useRouter()

const userMenuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)

function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value
}

function closeUserMenu() {
  userMenuOpen.value = false
}

function onLogout() {
  closeUserMenu()
  auth.logout()
  router.push('/login')
}

function handleClickOutside(event: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    closeUserMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-white/10 bg-black/95 backdrop-blur-md">
    <div class="container-app flex h-16 items-center justify-between gap-4">
      <!-- Lado Izquierdo: Logotipo Oficial -->
      <div class="flex items-center gap-6">
        <AppLogo />

        <!-- Enlaces centrales de navegación -->
        <nav class="hidden md:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-slate-300">
          <RouterLink
            to="/"
            class="hover:text-white transition-colors"
            active-class="text-white"
          >
            Inicio
          </RouterLink>

          <RouterLink
            to="/catalogo"
            class="flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
            active-class="text-cyan-400"
          >
            <Sparkles class="size-3 text-cyan-400" aria-hidden="true" />
            <span>Catálogo</span>
          </RouterLink>

          <RouterLink
            v-if="auth.isAuthenticated"
            to="/mi-cuenta"
            class="flex items-center gap-1.5 hover:text-white transition-colors"
            active-class="text-brand-300"
          >
            <Tv class="size-3" aria-hidden="true" />
            <span>Mis Servicios</span>
          </RouterLink>
        </nav>
      </div>

      <!-- Lado Derecho: Carrito y Menú de Usuario -->
      <div class="flex items-center gap-3">
        <!-- Carrito de compras -->
        <RouterLink
          to="/carrito"
          class="relative grid size-10 place-items-center rounded-full border border-white/15 bg-white/5 hover:border-white/40 hover:bg-white/10 text-white transition-all cursor-pointer"
          :aria-label="`Carrito de compras con ${cart.count} productos`"
        >
          <ShoppingCart class="size-4" aria-hidden="true" />
          <span
            v-if="cart.count > 0"
            class="absolute -right-1 -top-1 grid min-w-5 h-5 place-items-center rounded-full bg-cyan-500 px-1 text-[10px] font-black font-mono text-neutral-950 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
            aria-hidden="true"
          >
            {{ cart.count }}
          </span>
        </RouterLink>

        <!-- Menú de Usuario Autenticado con Dropdown -->
        <div v-if="auth.isAuthenticated" ref="menuRef" class="relative">
          <button
            type="button"
            class="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold text-white hover:border-white transition-all cursor-pointer"
            :class="{ 'border-cyan-400 bg-white/15': userMenuOpen }"
            @click.stop="toggleUserMenu"
          >
            <div class="size-5 rounded-full bg-cyan-400/20 text-cyan-300 flex items-center justify-center font-black text-[10px]">
              {{ (auth.usuario?.nombre || 'U').charAt(0).toUpperCase() }}
            </div>
            <span>{{ auth.isAdmin ? 'Admin' : (auth.usuario?.nombre || 'Usuario').split(' ')[0] }}</span>
            <ChevronDown class="size-3.5 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': userMenuOpen }" />
          </button>

          <!-- Dropdown Desplegable con Datos del Perfil -->
          <transition
            enter-active-class="transition duration-150 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <div
              v-if="userMenuOpen"
              class="absolute right-0 mt-2 w-72 origin-top-right rounded-2xl border border-white/15 bg-neutral-950 p-3 shadow-2xl backdrop-blur-2xl z-50 text-xs"
            >
              <!-- Datos de la cuenta -->
              <div class="border-b border-white/10 pb-3 mb-2 px-2 pt-1">
                <p class="font-display font-black text-white text-sm truncate">
                  {{ auth.usuario?.nombre || 'Laura Cliente' }}
                </p>
                <p class="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                  {{ auth.usuario?.email }}
                </p>
                <div class="mt-2 flex items-center gap-1.5 text-[10px] font-mono font-bold text-cyan-300">
                  <span class="size-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span>{{ auth.isAdmin ? 'Administrador Sistema' : 'Cliente Verificado' }}</span>
                </div>
              </div>

              <!-- Enlaces directos -->
              <div class="space-y-1">
                <RouterLink
                  to="/mi-cuenta"
                  class="flex items-center gap-2.5 rounded-xl px-3 py-2 text-slate-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  @click="closeUserMenu"
                >
                  <Tv class="size-4 text-cyan-400" />
                  <span>Mis Servicios Activos</span>
                </RouterLink>

                <RouterLink
                  to="/mi-cuenta"
                  class="flex items-center gap-2.5 rounded-xl px-3 py-2 text-slate-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  @click="closeUserMenu"
                >
                  <Clock class="size-4 text-brand-300" />
                  <span>Historial de Compras</span>
                </RouterLink>

                <RouterLink
                  to="/catalogo"
                  class="flex items-center gap-2.5 rounded-xl px-3 py-2 text-slate-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  @click="closeUserMenu"
                >
                  <ShoppingBag class="size-4 text-emerald-400" />
                  <span>Explorar Catálogo</span>
                </RouterLink>

                <RouterLink
                  v-if="auth.isAdmin"
                  to="/admin"
                  class="flex items-center gap-2.5 rounded-xl px-3 py-2 text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer"
                  @click="closeUserMenu"
                >
                  <ShieldCheck class="size-4" />
                  <span>Panel Administrador</span>
                </RouterLink>
              </div>

              <!-- Cerrar Sesión -->
              <div class="mt-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  class="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 text-left transition-colors cursor-pointer font-bold"
                  @click="onLogout"
                >
                  <LogOut class="size-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          </transition>
        </div>

        <!-- Botón Iniciar Sesión para visitantes -->
        <RouterLink
          v-else
          to="/login"
          class="inline-flex items-center justify-center rounded-full bg-white hover:bg-slate-200 text-neutral-950 px-5 sm:px-6 py-2 text-xs font-black tracking-wider uppercase transition-all duration-200 shadow-md hover:shadow-white/20 active:scale-95"
        >
          Iniciar Sesión
        </RouterLink>
      </div>
    </div>
  </header>
</template>
