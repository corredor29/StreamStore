<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Check, ShoppingCart, Tv, Users } from '@lucide/vue'
import type { Producto } from '@/types'
import { formatPrice } from '@/composables/useFormat'
import { useCartStore } from '@/stores/cart'

const props = defineProps<{
  producto: Producto
}>()

const cart = useCartStore()
const cantidad = ref(1)
const agregado = ref(false)
const feedbackMsg = ref('')

const isAgotado = computed(() => props.producto.stock <= 0)
const maxSeleccionable = computed(() => Math.min(props.producto.stock, 5))

const tipoBadge = computed(() => {
  return props.producto.tipo === 'CUENTA_COMPLETA'
    ? { label: 'Cuenta Completa', icon: Users, cls: 'bg-brand-500/20 text-brand-200 border-brand-500/30' }
    : { label: 'Pantalla Individual', icon: Tv, cls: 'bg-blue-500/20 text-blue-200 border-blue-500/30' }
})

const platformColor = computed(() => props.producto.plataforma?.color || '#7c4dff')

function onAgregar() {
  if (isAgotado.value) return
  const res = cart.addItem(props.producto, cantidad.value)
  if (res.success) {
    agregado.value = true
    feedbackMsg.value = `¡${props.producto.nombre} agregado al carrito!`
    setTimeout(() => {
      agregado.value = false
      feedbackMsg.value = ''
    }, 2000)
  } else {
    feedbackMsg.value = res.message || 'No se pudo agregar'
    setTimeout(() => {
      feedbackMsg.value = ''
    }, 3000)
  }
}
</script>

<template>
  <article
    class="card group relative flex flex-col justify-between overflow-hidden transition-all duration-200 hover:border-brand-400/50 hover:shadow-lg hover:shadow-brand-500/10"
    :class="{ 'opacity-75': isAgotado }"
    :aria-labelledby="`product-title-${producto.id}`"
  >
    <!-- Borde superior con acento de color de la plataforma -->
    <div
      class="absolute left-0 top-0 h-1 w-full"
      :style="{ backgroundColor: platformColor }"
      aria-hidden="true"
    />

    <div>
      <!-- Encabezado con Plataforma y Tipo -->
      <div class="flex items-start justify-between gap-2">
        <span
          class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider"
          :class="tipoBadge.cls"
        >
          <component :is="tipoBadge.icon" class="size-3.5" aria-hidden="true" />
          {{ tipoBadge.label }}
        </span>

        <span
          v-if="isAgotado"
          class="rounded-full bg-danger/20 px-2.5 py-0.5 text-xs font-bold text-danger"
        >
          AGOTADO
        </span>
        <span
          v-else-if="producto.stock <= 3"
          class="rounded-full bg-warning/20 px-2 py-0.5 text-xs font-medium text-warning"
        >
          ¡Últimas {{ producto.stock }}!
        </span>
        <span
          v-else
          class="rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success"
        >
          {{ producto.stock }} disponibles
        </span>
      </div>

      <!-- Nombre del producto -->
      <h3
        :id="`product-title-${producto.id}`"
        class="mt-3 font-display text-lg font-bold text-fg transition-colors group-hover:text-brand-300"
      >
        <RouterLink :to="`/productos/${producto.id}`" class="focus:outline-none">
          {{ producto.nombre }}
        </RouterLink>
      </h3>

      <p class="mt-1 text-xs text-muted">
        Plataforma: <strong class="text-fg">{{ producto.plataforma?.nombre }}</strong> · Duración: {{ producto.duracionDias }} días
      </p>

      <p v-if="producto.descripcion" class="mt-2 text-sm text-muted line-clamp-2">
        {{ producto.descripcion }}
      </p>
    </div>

    <!-- Precios y acciones de compra -->
    <div class="mt-6 border-t border-line/60 pt-4">
      <div class="mb-3 flex items-baseline justify-between">
        <span class="text-xs text-muted">Precio final</span>
        <span class="font-display text-xl font-extrabold text-fg">
          {{ formatPrice(producto.precio) }}
        </span>
      </div>

      <!-- Selector de cantidad y botón agregar -->
      <div class="flex items-center gap-2">
        <div v-if="!isAgotado" class="w-20 shrink-0">
          <label :for="`qty-${producto.id}`" class="sr-only">Cantidad</label>
          <select
            :id="`qty-${producto.id}`"
            v-model.number="cantidad"
            class="w-full rounded-lg border border-line bg-surface-2 px-2.5 py-2 text-sm text-fg focus:border-brand-400 focus:outline-none"
            :aria-label="`Cantidad para ${producto.nombre}`"
          >
            <option v-for="n in maxSeleccionable" :key="n" :value="n">
              {{ n }}
            </option>
          </select>
        </div>

        <button
          type="button"
          class="btn flex-1 transition-all"
          :class="[
            isAgotado
              ? 'cursor-not-allowed bg-surface-2 text-muted'
              : agregado
                ? 'bg-success text-black'
                : 'btn-primary'
          ]"
          :disabled="isAgotado"
          :aria-disabled="isAgotado"
          @click="onAgregar"
        >
          <template v-if="agregado">
            <Check class="size-4" aria-hidden="true" />
            <span>¡Agregado!</span>
          </template>
          <template v-else-if="isAgotado">
            <span>Agotado</span>
          </template>
          <template v-else>
            <ShoppingCart class="size-4" aria-hidden="true" />
            <span>Agregar</span>
          </template>
        </button>
      </div>

      <!-- Feedback de accesibilidad -->
      <div
        v-if="feedbackMsg"
        role="status"
        aria-live="polite"
        class="mt-2 text-center text-xs font-medium"
        :class="agregado ? 'text-success' : 'text-danger'"
      >
        {{ feedbackMsg }}
      </div>
    </div>
  </article>
</template>
