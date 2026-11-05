<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ShoppingCart, User } from '@lucide/vue'
import AppLogo from './AppLogo.vue'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'

const cart = useCartStore()
const auth = useAuthStore()
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
    <div class="container-app flex h-16 items-center justify-between gap-4">
      <div class="flex items-center gap-6">
        <AppLogo />
        <nav aria-label="Navegación principal" class="hidden md:flex items-center gap-1">
          <RouterLink to="/" class="nav-link">Inicio</RouterLink>
          <RouterLink to="/catalogo" class="nav-link">Catálogo</RouterLink>
        </nav>
      </div>

      <nav aria-label="Acciones de usuario" class="flex items-center gap-2 sm:gap-3">
        <RouterLink to="/catalogo" class="nav-link md:hidden">Catálogo</RouterLink>

        <!-- Carrito con contador reactivo -->
        <RouterLink
          to="/carrito"
          class="nav-link relative"
          :aria-label="`Carrito de compras con ${cart.count} productos`"
        >
          <ShoppingCart class="size-5" aria-hidden="true" />
          <span
            v-if="cart.count > 0"
            class="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-brand-500 px-1 text-xs font-bold text-white shadow-sm"
            aria-hidden="true"
          >
            {{ cart.count }}
          </span>
        </RouterLink>

        <!-- Acceso a Mi cuenta / Login -->
        <RouterLink
          v-if="auth.isAuthenticated"
          :to="auth.isAdmin ? '/admin' : '/mi-cuenta'"
          class="nav-link flex items-center gap-1.5"
        >
          <User class="size-5" aria-hidden="true" />
          <span class="hidden sm:inline">{{ auth.isAdmin ? 'Admin' : 'Mi cuenta' }}</span>
        </RouterLink>
        <RouterLink v-else to="/login" class="btn-primary h-9 px-4 text-xs sm:text-sm">
          Ingresar
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
