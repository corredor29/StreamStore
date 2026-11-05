<script setup lang="ts">
import { computed } from 'vue'
import { Filter, Layers } from '@lucide/vue'
import type { Plataforma } from '@/types'

const props = defineProps<{
  plataformas: Plataforma[]
  plataformaSeleccionada: string
  tipoSeleccionado: string
}>()

const emit = defineEmits<{
  'update:plataforma': [value: string]
  'update:tipo': [value: string]
  'reset': []
}>()

const tieneFiltrosActivos = computed(() => {
  return props.plataformaSeleccionada !== '' || props.tipoSeleccionado !== ''
})
</script>

<template>
  <div class="card mb-8">
    <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
      <!-- Filtro por Plataforma -->
      <div class="flex flex-wrap items-center gap-2">
        <span class="mr-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
          <Filter class="size-3.5" aria-hidden="true" />
          Plataforma:
        </span>

        <button
          type="button"
          class="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
          :class="[
            plataformaSeleccionada === ''
              ? 'bg-brand-500 font-semibold text-white shadow-sm shadow-brand-500/30'
              : 'border border-line bg-surface-2 text-muted hover:border-brand-400 hover:text-fg'
          ]"
          :aria-pressed="plataformaSeleccionada === ''"
          @click="emit('update:plataforma', '')"
        >
          Todas
        </button>

        <button
          v-for="plat in plataformas"
          :key="plat.id"
          type="button"
          class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
          :class="[
            plataformaSeleccionada === plat.slug
              ? 'bg-brand-500 font-semibold text-white shadow-sm shadow-brand-500/30'
              : 'border border-line bg-surface-2 text-muted hover:border-brand-400 hover:text-fg'
          ]"
          :aria-pressed="plataformaSeleccionada === plat.slug"
          @click="emit('update:plataforma', plat.slug)"
        >
          <span
            class="size-2 rounded-full"
            :style="{ backgroundColor: plat.color || '#fff' }"
            aria-hidden="true"
          />
          {{ plat.nombre }}
        </button>
      </div>

      <!-- Filtro por Modalidad (Tipo) -->
      <div class="flex flex-wrap items-center gap-2">
        <span class="mr-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted">
          <Layers class="size-3.5" aria-hidden="true" />
          Modalidad:
        </span>

        <button
          type="button"
          class="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
          :class="[
            tipoSeleccionado === ''
              ? 'bg-brand-500 font-semibold text-white shadow-sm shadow-brand-500/30'
              : 'border border-line bg-surface-2 text-muted hover:border-brand-400 hover:text-fg'
          ]"
          :aria-pressed="tipoSeleccionado === ''"
          @click="emit('update:tipo', '')"
        >
          Todas
        </button>

        <button
          type="button"
          class="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
          :class="[
            tipoSeleccionado === 'CUENTA_COMPLETA'
              ? 'bg-brand-500 font-semibold text-white shadow-sm shadow-brand-500/30'
              : 'border border-line bg-surface-2 text-muted hover:border-brand-400 hover:text-fg'
          ]"
          :aria-pressed="tipoSeleccionado === 'CUENTA_COMPLETA'"
          @click="emit('update:tipo', 'CUENTA_COMPLETA')"
        >
          Cuenta Completa
        </button>

        <button
          type="button"
          class="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
          :class="[
            tipoSeleccionado === 'PANTALLA'
              ? 'bg-brand-500 font-semibold text-white shadow-sm shadow-brand-500/30'
              : 'border border-line bg-surface-2 text-muted hover:border-brand-400 hover:text-fg'
          ]"
          :aria-pressed="tipoSeleccionado === 'PANTALLA'"
          @click="emit('update:tipo', 'PANTALLA')"
        >
          Pantalla Individual
        </button>

        <button
          v-if="tieneFiltrosActivos"
          type="button"
          class="ml-auto text-xs text-brand-300 underline underline-offset-4 hover:text-brand-200"
          @click="emit('reset')"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  </div>
</template>
