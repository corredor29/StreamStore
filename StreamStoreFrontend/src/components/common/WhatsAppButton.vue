<script setup lang="ts">
import { MessageCircle } from '@lucide/vue'

withDefaults(
  defineProps<{
    phoneNumber?: string
    message?: string
  }>(),
  {
    phoneNumber: '573001234567',
    message: 'Hola StreamStore, quiero información sobre las cuentas y pantallas disponibles.',
  }
)
</script>

<template>
  <a
    :href="`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`"
    target="_blank"
    rel="noopener noreferrer"
    class="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-950/40 transition-all duration-200 hover:scale-105 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-bg"
    aria-label="Atención al cliente por WhatsApp (se abre en una nueva pestaña)"
  >
    <MessageCircle class="size-5 shrink-0" aria-hidden="true" />
    <span class="hidden sm:inline">¿Dudas? Escríbenos</span>
  </a>
</template>
