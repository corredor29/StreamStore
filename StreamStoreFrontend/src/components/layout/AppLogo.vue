<script setup lang="ts">
import { RouterLink } from 'vue-router'

withDefaults(
  defineProps<{
    variant?: 'full' | 'icon' | 'compact'
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    variant: 'full',
    size: 'md',
  }
)
</script>

<template>
  <RouterLink
    to="/"
    class="group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none"
    aria-label="Ir al inicio de StreamStore"
  >
    <!-- Isotipo Vectorial Original StreamStore (Pantallas interconectadas + Play geométrico) -->
    <div
      class="relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-md shadow-brand-500/20 transition-transform duration-300 group-hover:scale-105"
      :class="[
        size === 'sm' ? 'size-8' : size === 'lg' ? 'size-12' : 'size-9',
      ]"
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="ssLogoGrad1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stop-color="#8057FF" />
            <stop offset="1" stop-color="#06B6D4" />
          </linearGradient>
          <linearGradient id="ssLogoGrad2" x1="40" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
            <stop stop-color="#06B6D4" />
            <stop offset="1" stop-color="#9B77FF" />
          </linearGradient>
        </defs>

        <!-- Fondo del Isotipo -->
        <rect width="40" height="40" rx="10" fill="#151B32" />
        <rect width="40" height="40" rx="10" stroke="#293250" stroke-width="1.5" />

        <!-- Pantalla Portal Superior (Cyan a Violeta) -->
        <rect x="8" y="9" width="16" height="11" rx="3" fill="url(#ssLogoGrad1)" fill-opacity="0.9" />

        <!-- Pantalla Portal Inferior Superpuesta (Violeta a Cyan) -->
        <rect x="16" y="19" width="16" height="11" rx="3" fill="url(#ssLogoGrad2)" fill-opacity="0.9" />

        <!-- Símbolo Play Geométrico Central en Blanco Nítido -->
        <path
          d="M18 15.5L25 20L18 24.5V15.5Z"
          fill="#FFFFFF"
          filter="drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.4))"
        />

        <!-- Punto de conexión satelital -->
        <circle cx="28" cy="12" r="2" fill="#06B6D4" />
      </svg>
    </div>

    <!-- Nombre de la Marca -->
    <div v-if="variant !== 'icon'" class="flex flex-col leading-none">
      <span class="font-display font-black tracking-tight text-fg flex items-baseline gap-0.5" :class="size === 'lg' ? 'text-2xl' : 'text-lg'">
        <span>Stream</span>
        <span class="bg-gradient-to-r from-brand-400 to-cyan-400 bg-clip-text text-transparent font-extrabold">Store</span>
      </span>
      <span v-if="variant === 'full'" class="text-[8px] font-mono uppercase tracking-[0.22em] text-muted/70 mt-0.5">
        Digital Entertainment
      </span>
    </div>
  </RouterLink>
</template>
