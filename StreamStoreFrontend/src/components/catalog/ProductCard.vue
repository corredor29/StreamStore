<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Check, Clock, ShoppingCart, Tv, Users } from '@lucide/vue'
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
    ? { label: 'Cuenta Completa', icon: Users, cls: 'bg-brand-500/20 text-brand-300 border-brand-500/30' }
    : { label: '1 Pantalla (PIN)', icon: Tv, cls: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' }
})

const platformColor = computed(() => props.producto.plataforma?.color || '#8057FF')

// Gradiente de poster temático según plataforma
const posterBg = computed(() => {
  const slug = props.producto.plataforma?.slug || ''
  if (slug.includes('netflix')) {
    return 'linear-gradient(135deg, #1f0507 0%, #40070B 50%, #0d0102 100%)'
  }
  if (slug.includes('disney')) {
    return 'linear-gradient(135deg, #051433 0%, #0d2866 50%, #020714 100%)'
  }
  if (slug.includes('max')) {
    return 'linear-gradient(135deg, #1b0638 0%, #360a75 50%, #0a0217 100%)'
  }
  if (slug.includes('prime')) {
    return 'linear-gradient(135deg, #021a24 0%, #07384d 50%, #010c12 100%)'
  }
  if (slug.includes('spotify')) {
    return 'linear-gradient(135deg, #03240f 0%, #0b4721 50%, #011207 100%)'
  }
  if (slug.includes('crunchyroll')) {
    return 'linear-gradient(135deg, #2e1101 0%, #5e2404 50%, #140700 100%)'
  }
  return 'linear-gradient(135deg, #151B32 0%, #1C2440 100%)'
})

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
    class="card group relative flex flex-col justify-between overflow-hidden border-line hover:border-brand-400/60 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/15 p-0 bg-surface"
    :class="{ 'opacity-70 grayscale-[20%]': isAgotado }"
    :aria-labelledby="`product-title-${producto.id}`"
  >
    <!-- POSTER BANNER TEMÁTICO DE PLATAFORMA (Stitch Board 3) -->
    <div
      class="relative h-36 sm:h-40 w-full overflow-hidden flex flex-col justify-between p-4 border-b border-line"
      :style="{ background: posterBg }"
    >
      <!-- Acento superior de color de plataforma -->
      <div
        class="absolute left-0 top-0 h-1 w-full"
        :style="{ backgroundColor: platformColor }"
        aria-hidden="true"
      />

      <!-- Badges superiores: Modalidad y Stock -->
      <div class="flex items-center justify-between gap-2 relative z-10">
        <span
          class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider"
          :class="tipoBadge.cls"
        >
          <component :is="tipoBadge.icon" class="size-3" aria-hidden="true" />
          {{ tipoBadge.label }}
        </span>

        <span
          v-if="isAgotado"
          class="rounded-full bg-danger/25 border border-danger/40 px-2 py-0.5 text-[10px] font-mono font-bold text-danger"
        >
          AGOTADO
        </span>
        <span
          v-else-if="producto.stock <= 3"
          class="rounded-full bg-warning/20 border border-warning/40 px-2 py-0.5 text-[10px] font-mono font-bold text-warning"
        >
          ¡Últimas {{ producto.stock }}!
        </span>
        <span
          v-else
          class="rounded-full bg-success/20 border border-success/40 px-2 py-0.5 text-[10px] font-mono font-bold text-success"
        >
          {{ producto.stock }} disponibles
        </span>
      </div>

      <!-- Marca central de la plataforma en el banner -->
      <div class="relative z-10 flex items-end justify-between">
        <div>
          <span class="text-[10px] font-mono uppercase tracking-[0.2em] text-white/60 block">
            Plataforma
          </span>
          <p class="font-display text-xl font-black text-white tracking-tight drop-shadow">
            {{ producto.plataforma?.nombre }}
          </p>
        </div>

        <div class="flex items-center gap-1 text-[11px] font-mono text-white/80 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-md border border-white/10">
          <Clock class="size-3 text-cyan-300" />
          <span>{{ producto.duracionDias }} Días</span>
        </div>
      </div>
    </div>

    <!-- CUERPO DE LA TARJETA -->
    <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
      <div>
        <h3
          :id="`product-title-${producto.id}`"
          class="font-display text-base font-bold text-fg group-hover:text-cyan-300 transition-colors line-clamp-1"
        >
          <RouterLink :to="`/producto/${producto.id}`" class="focus:outline-none">
            {{ producto.nombre }}
          </RouterLink>
        </h3>
        <p class="text-xs text-muted mt-1 leading-relaxed line-clamp-2">
          Entrega inmediata de credenciales con PIN de perfil privado y garantía total activa durante los 30 días.
        </p>
      </div>

      <!-- Fila de Precio y Controles de Carrito -->
      <div class="pt-3 border-t border-line/60">
        <div class="flex items-baseline justify-between mb-3">
          <span class="text-[10px] font-mono uppercase text-muted">Precio Colombia</span>
          <p class="font-display text-2xl font-black text-fg text-right">
            {{ formatPrice(producto.precio) }}
            <span class="text-[10px] font-sans font-normal text-muted">COP</span>
          </p>
        </div>

        <!-- Acciones: Selector de Cantidad + Botón Agregar -->
        <div class="flex items-center gap-2">
          <div v-if="!isAgotado && maxSeleccionable > 1" class="w-16 shrink-0">
            <label :for="`qty-${producto.id}`" class="sr-only">Cantidad</label>
            <select
              :id="`qty-${producto.id}`"
              v-model.number="cantidad"
              class="w-full rounded-xl border border-line bg-surface-2 px-2 py-2 text-xs font-mono font-bold text-fg focus:border-brand-400 focus:outline-none"
            >
              <option v-for="n in maxSeleccionable" :key="n" :value="n">
                {{ n }} ud
              </option>
            </select>
          </div>

          <button
            type="button"
            class="btn flex-1 py-2.5 text-xs font-bold uppercase tracking-wider"
            :class="
              isAgotado
                ? 'cursor-not-allowed bg-surface-2 text-muted border border-line'
                : agregado
                  ? 'bg-success text-neutral-900 font-black'
                  : 'btn-primary'
            "
            :disabled="isAgotado || agregado"
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
              <ShoppingCart class="size-3.5" aria-hidden="true" />
              <span>Agregar</span>
            </template>
          </button>
        </div>
      </div>
    </div>
  </article>
</template>
