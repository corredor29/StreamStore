<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ShoppingCart, User, Sparkles, Tv } from '@lucide/vue'
import AppLogo from './AppLogo.vue'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'

const cart = useCartStore()
const auth = useAuthStore()
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-white/10 bg-black/90 backdrop-blur-md">
    <div class="container-app flex h-16 items-center justify-between gap-4">
      <!-- Lado Izquierdo: Logotipo Oficial (Estilo HBO Max) -->
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

      <!-- Lado Derecho: Carrito y Botón Iniciar Sesión / Perfil -->
      <div class="flex items-center gap-3">
        <!-- Carrito de compras -->
        <RouterLink
          to="/carrito"
          class="relative grid size-10 place-items-center rounded-full border border-white/15 bg-white/5 hover:border-white/40 hover:bg-white/10 text-white transition-all"
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

        <!-- Perfil si está autenticado -->
        <RouterLink
          v-if="auth.isAuthenticated"
          :to="auth.isAdmin ? '/admin' : '/mi-cuenta'"
          class="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white hover:border-white transition-all"
        >
          <User class="size-3.5 text-cyan-300" aria-hidden="true" />
          <span>{{ auth.isAdmin ? 'Admin' : auth.usuario?.nombre.split(' ')[0] }}</span>
        </RouterLink>

        <!-- Botón Iniciar Sesión -->
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
