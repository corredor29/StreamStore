<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="container-app grid place-items-center py-24 text-center">
    <p class="font-display text-6xl font-bold text-brand-300">404</p>
    <h1 class="mt-4 text-2xl font-semibold">Página no encontrada</h1>
    <p class="mt-2 text-muted">La dirección que buscas no existe o fue movida.</p>
    <RouterLink to="/" class="btn-primary mt-6">Volver al inicio</RouterLink>
  </section>
</template>
