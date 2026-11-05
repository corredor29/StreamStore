<script setup lang="ts">
import { CreditCard, Smartphone } from '@lucide/vue'
import type { MetodoPago } from '@/types'
import { METODOS_PAGO } from '@/services/purchaseService'

defineProps<{
  modelValue: MetodoPago
}>()

const emit = defineEmits<{
  'update:modelValue': [value: MetodoPago]
}>()
</script>

<template>
  <div role="radiogroup" aria-label="Selecciona tu método de pago" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <div
      v-for="metodo in METODOS_PAGO"
      :key="metodo.id"
      class="relative cursor-pointer overflow-hidden rounded-xl border-2 p-4 transition-all duration-300"
      :class="[
        modelValue === metodo.id
          ? 'border-brand-400 bg-brand-500/10 shadow-[0_0_20px_rgba(124,77,255,0.2)]'
          : 'border-line/80 bg-surface hover:border-brand-400/50 hover:bg-surface-2/60'
      ]"
      role="radio"
      :aria-checked="modelValue === metodo.id"
      tabindex="0"
      @click="emit('update:modelValue', metodo.id)"
      @keydown.space.prevent="emit('update:modelValue', metodo.id)"
      @keydown.enter.prevent="emit('update:modelValue', metodo.id)"
    >
      <!-- Acento activo en la esquina superior -->
      <div
        v-if="modelValue === metodo.id"
        class="absolute right-0 top-0 size-8 overflow-hidden"
      >
        <div class="absolute -right-4 -top-4 size-8 rotate-45 bg-brand-400" />
      </div>

      <div class="flex items-center gap-3.5">
        <div
          class="grid size-11 shrink-0 place-items-center rounded-xl transition-all duration-300 shadow-sm"
          :class="
            modelValue === metodo.id
              ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-brand-500/30'
              : 'bg-surface-2 text-muted border border-line'
          "
        >
          <CreditCard v-if="metodo.id === 'TARJETA'" class="size-5" aria-hidden="true" />
          <Smartphone v-else class="size-5" aria-hidden="true" />
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between">
            <p class="font-display text-sm font-bold tracking-tight text-fg">
              {{ metodo.label }}
            </p>
          </div>
          <p class="mt-0.5 text-xs text-muted truncate">
            {{ metodo.descripcion }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
