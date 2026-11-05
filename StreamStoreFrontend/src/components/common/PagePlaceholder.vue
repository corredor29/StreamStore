<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AppAlert from './AppAlert.vue'

defineProps<{ title: string; phase: number }>()
</script>

<template>
  <section class="container-app py-10">
    <h1 class="mb-4 font-display text-2xl font-bold sm:text-3xl">{{ title }}</h1>
    <AppAlert variant="info" title="Sección en construcción">
      <p>Esta sección se implementa en la Fase {{ phase }}.</p>
    </AppAlert>
    <slot />
    <RouterLink to="/" class="btn-secondary mt-6 inline-flex">Volver al inicio</RouterLink>
  </section>
</template>
