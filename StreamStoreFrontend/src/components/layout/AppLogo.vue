<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Tv } from '@lucide/vue'
</script>

<template>
  <RouterLink to="/" class="flex items-center gap-2 rounded-lg font-display text-lg font-bold tracking-tight text-fg">
    <span class="grid size-9 place-items-center rounded-lg bg-brand-500 text-white">
      <Tv class="size-5" aria-hidden="true" />
    </span>
    <span>Stream<span class="text-brand-300">Store</span></span>
  </RouterLink>
</template>
