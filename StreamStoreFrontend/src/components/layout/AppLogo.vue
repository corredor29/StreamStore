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
    <!-- Logotipo Oficial StreamStore (Icono transparente sin cuadro tosco) -->
    <div
      class="relative flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105"
      :class="[
        size === 'sm' ? 'size-7' : size === 'lg' ? 'size-11' : 'size-9',
      ]"
    >
      <img
        src="/streamstore_icon.png"
        alt="StreamStore Logo"
        class="h-full w-full object-contain drop-shadow-[0_0_12px_rgba(128,87,255,0.6)]"
      />
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
