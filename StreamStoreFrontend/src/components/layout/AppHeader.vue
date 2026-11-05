<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Headphones, ShoppingCart, User } from '@lucide/vue'
import AppLogo from './AppLogo.vue'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'

const cart = useCartStore()
const auth = useAuthStore()
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-line bg-bg/95 backdrop-blur-md">
    <div class="container-app flex h-16 items-center justify-between gap-4">
      <!-- Lado Izquierdo: Logotipo y Navegación Principal -->
      <div class="flex items-center gap-8">
        <AppLogo />

        <nav aria-label="Navegación principal" class="hidden md:flex items-center gap-1">
          <RouterLink to="/" class="nav-link text-xs uppercase tracking-wider font-semibold">
            Inicio
          </RouterLink>
          <RouterLink to="/catalogo" class="nav-link text-xs uppercase tracking-wider font-semibold">
            Catálogo
          </RouterLink>
          <RouterLink
            v-if="auth.isAuthenticated && !auth.isAdmin"
            to="/mi-cuenta"
            class="nav-link text-xs uppercase tracking-wider font-semibold"
          >
            Mis Servicios
          </RouterLink>
          <a
            href="https://wa.me/573001234567?text=Hola,%20necesito%20soporte%20en%20StreamStore"
            target="_blank"
            rel="noopener noreferrer"
            class="nav-link text-xs uppercase tracking-wider font-semibold text-muted hover:text-cyan-300"
          >
            Soporte
          </a>
        </nav>
      </div>

      <!-- Lado Derecho: Carrito, Sesión y Acciones -->
      <nav aria-label="Acciones de usuario" class="flex items-center gap-2 sm:gap-3">
        <RouterLink to="/catalogo" class="nav-link text-xs md:hidden">
          Catálogo
        </RouterLink>

        <!-- Botón de Soporte Rápido Móvil -->
        <a
          href="https://wa.me/573001234567"
          target="_blank"
          rel="noopener noreferrer"
          class="nav-link md:hidden"
          title="Soporte WhatsApp"
        >
          <Headphones class="size-4" />
        </a>

        <!-- Carrito con contador reactivo y efecto neón -->
        <RouterLink
          to="/carrito"
          class="relative grid size-10 place-items-center rounded-xl border border-line bg-surface hover:border-brand-400 hover:text-brand-300 transition-colors"
          :aria-label="`Carrito de compras con ${cart.count} productos`"
        >
          <ShoppingCart class="size-4" aria-hidden="true" />
          <span
            v-if="cart.count > 0"
            class="absolute -right-1.5 -top-1.5 grid min-w-5 h-5 place-items-center rounded-full bg-brand-500 px-1 text-[10px] font-black font-mono text-white shadow-[0_0_10px_rgba(128,87,255,0.6)]"
            aria-hidden="true"
          >
            {{ cart.count }}
          </span>
        </RouterLink>

        <!-- Acceso a Mi cuenta / Admin / Login -->
        <RouterLink
          v-if="auth.isAuthenticated"
          :to="auth.isAdmin ? '/admin' : '/mi-cuenta'"
          class="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-xs font-semibold text-fg hover:border-brand-400 transition-colors"
        >
          <User class="size-4 text-brand-400" aria-hidden="true" />
          <span class="hidden sm:inline">{{ auth.usuario?.nombre.split(' ')[0] }}</span>
        </RouterLink>
        <RouterLink
          v-else
          to="/login"
          class="inline-flex items-center justify-center rounded-full bg-white hover:bg-slate-200 text-neutral-950 px-4 sm:px-6 py-2.5 text-xs font-extrabold tracking-wide transition-all duration-200 shadow-lg shadow-white/10 hover:shadow-white/20 active:scale-95"
        >
          Iniciar Sesión
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
