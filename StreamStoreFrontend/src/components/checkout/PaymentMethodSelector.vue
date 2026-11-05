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
  <div role="radiogroup" aria-label="Selecciona tu método de pago" class="space-y-3">
    <div
      v-for="metodo in METODOS_PAGO"
      :key="metodo.id"
      class="card cursor-pointer transition-all duration-200 border-2 p-4"
      :class="[
        modelValue === metodo.id
          ? 'border-brand-400 bg-brand-500/10 shadow-sm'
          : 'border-line bg-surface hover:border-line/80'
      ]"
      role="radio"
      :aria-checked="modelValue === metodo.id"
      tabindex="0"
      @click="emit('update:modelValue', metodo.id)"
      @keydown.space.prevent="emit('update:modelValue', metodo.id)"
      @keydown.enter.prevent="emit('update:modelValue', metodo.id)"
    >
      <div class="flex items-center gap-3">
        <div
          class="grid size-10 place-items-center rounded-xl transition-colors"
          :class="modelValue === metodo.id ? 'bg-brand-500 text-white' : 'bg-surface-2 text-muted'"
        >
          <CreditCard v-if="metodo.id === 'TARJETA'" class="size-5" aria-hidden="true" />
          <Smartphone v-else class="size-5" aria-hidden="true" />
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <p class="font-display text-sm font-bold text-fg">
              {{ metodo.label }}
            </p>
            <span
              class="size-4 rounded-full border-2 flex items-center justify-center transition-all"
              :class="modelValue === metodo.id ? 'border-brand-400 bg-brand-400' : 'border-line'"
            >
              <span v-if="modelValue === metodo.id" class="size-1.5 rounded-full bg-bg" />
            </span>
          </div>
          <p class="text-xs text-muted truncate">
            {{ metodo.descripcion }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
