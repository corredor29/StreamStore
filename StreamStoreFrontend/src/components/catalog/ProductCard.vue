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
const agregado = ref(false)
const cantidad = ref(1)

const isAgotado = computed(() => props.producto.stock <= 0)
const maxSeleccionable = computed(() => Math.min(props.producto.stock, 5))

// Obtener la imagen o logo de presentación sobre fondo blanco estilo Lion Tech Store
const presentationImage = computed(() => {
  const slug = (props.producto.plataforma?.slug || props.producto.plataforma?.nombre || '').toLowerCase()
  const name = (props.producto.nombre || '').toLowerCase()

  if (slug.includes('disney') || slug.includes('dp') || name.includes('disney')) {
    return '/targetyas/disneycard.png'
  }
  if (slug.includes('netflix') || slug.includes('nf') || name.includes('netflix')) {
    return '/targetyas/netflixcard.svg'
  }
  if (slug.includes('max') || slug.includes('hbo') || name.includes('max')) {
    return '/targetyas/HBO_Max.webp'
  }
  if (slug.includes('prime') || slug.includes('amazon') || name.includes('prime') || slug.includes('pv')) {
    return '/targetyas/prime_video_card.svg'
  }
  if (slug.includes('crunchyroll') || slug.includes('anime') || name.includes('crunchyroll')) {
    return '/targetyas/Crunchyroll.webp'
  }
  if (slug.includes('spotify') || slug.includes('musica') || name.includes('spotify')) {
    return '/targetyas/spotify_premiun.webp'
  }
  if (slug.includes('paramount') || slug.includes('paramont') || name.includes('paramount')) {
    return '/brand_logos/paramont.png'
  }
  if (slug.includes('apple') || slug.includes('appletv') || name.includes('apple')) {
    return '/brand_logos/appletv.webp'
  }
  return props.producto.plataforma?.logoUrl || '/brand_logos/streamstore_icon.png'
})

const isWideGraphic = computed(() => {
  const img = presentationImage.value
  return img.includes('disneycard') || img.includes('prime_video') || img.includes('spotify_premiun')
})

const displayTitle = computed(() => {
  const raw = props.producto.nombre || ''
  return raw.toUpperCase()
})

const tipoBadge = computed(() => {
  return props.producto.tipo === 'CUENTA_COMPLETA'
    ? {
        label: 'Cuenta Completa',
        icon: Users,
        cls: 'bg-purple-50 text-purple-700 border-purple-200',
        overlayCls: 'bg-purple-950/85 text-purple-200 border border-purple-400/50',
      }
    : {
        label: '1 Pantalla (PIN)',
        icon: Tv,
        cls: 'bg-cyan-50 text-cyan-800 border-cyan-200',
        overlayCls: 'bg-cyan-950/85 text-cyan-200 border border-cyan-400/50',
      }
})

function onAgregar() {
  if (isAgotado.value) return
  const res = cart.addItem(props.producto, cantidad.value)
  if (res.success) {
    agregado.value = true
    setTimeout(() => {
      agregado.value = false
    }, 2000)
  }
}
</script>

<template>
  <article
    class="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-neutral-900/90 border border-white/10 shadow-xl hover:border-cyan-500/50 hover:shadow-[0_15px_35px_rgba(6,182,212,0.15)] transition-all duration-300 h-full backdrop-blur-xl"
    :class="{ 'opacity-60 grayscale-[30%]': isAgotado }"
    :aria-labelledby="`product-title-${producto.id}`"
  >
    <!-- TOP: PORTADA DE BORDE A BORDE (LLENA TODA LA CABECERA SIN ESPACIOS EN BLANCO) -->
    <RouterLink
      :to="`/producto/${producto.id}`"
      class="relative h-44 sm:h-48 w-full overflow-hidden block select-none cursor-pointer bg-black group"
    >
      <!-- Tarjeta gráfica oficial ocupando el 100% del contenedor -->
      <img
        :src="presentationImage"
        :alt="producto.nombre"
        class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 select-none"
        loading="lazy"
      />

      <!-- Sutil gradiente oscuro para legibilidad óptima de badges -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

      <!-- Badges superiores flotantes con efecto glassmorphism -->
      <div class="absolute top-2.5 left-2.5 z-10">
        <span
          class="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider shadow-md backdrop-blur-md"
          :class="tipoBadge.overlayCls"
        >
          <component :is="tipoBadge.icon" class="size-3" aria-hidden="true" />
          {{ tipoBadge.label }}
        </span>
      </div>

      <div class="absolute top-2.5 right-2.5 z-10">
        <span class="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-mono font-bold text-white bg-black/60 border border-white/20 shadow-md backdrop-blur-md">
          <Clock class="size-3 text-cyan-300" />
          {{ producto.duracionDias }}d
        </span>
      </div>
    </RouterLink>

    <!-- CUERPO DE LA TARJETA (DARK MODE PREMIUM STREAMSTORE) -->
    <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-neutral-900/60 space-y-3">
      <div>
        <h3
          :id="`product-title-${producto.id}`"
          class="font-display text-xs sm:text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors uppercase tracking-tight line-clamp-2 min-h-[2.5rem] leading-snug"
        >
          <RouterLink :to="`/producto/${producto.id}`">
            {{ displayTitle }}
          </RouterLink>
        </h3>

        <!-- Precio prominente en negrita -->
        <p class="font-display text-xl sm:text-2xl font-black text-white tracking-tight mt-1 flex items-baseline gap-1">
          <span>{{ formatPrice(producto.precio) }}</span>
        </p>

        <!-- Indicador de Stock -->
        <div class="mt-1 flex items-center gap-1.5 text-xs font-semibold">
          <template v-if="isAgotado">
            <span class="text-rose-400 font-bold">Agotado</span>
          </template>
          <template v-else-if="producto.stock <= 3">
            <span class="text-amber-400 font-bold">¡Últimas {{ producto.stock }} en stock!</span>
          </template>
          <template v-else>
            <span class="text-emerald-400 font-medium">En stock</span>
          </template>
        </div>
      </div>

      <!-- Fila de Agregar al Carrito -->
      <div class="pt-3 border-t border-white/10 flex items-center gap-2">
        <!-- Selector de cantidad -->
        <div v-if="!isAgotado && maxSeleccionable > 1" class="w-16">
          <label :for="`qty-${producto.id}`" class="sr-only">Cantidad</label>
          <select
            :id="`qty-${producto.id}`"
            v-model.number="cantidad"
            class="w-full rounded-lg border border-white/15 bg-white/5 px-2 py-2 text-xs font-mono font-bold text-white hover:border-white/30 focus:border-cyan-400 focus:outline-none cursor-pointer"
          >
            <option v-for="n in maxSeleccionable" :key="n" :value="n" class="bg-neutral-900 text-white">
              {{ n }} ud
            </option>
          </select>
        </div>

        <!-- Botón de compra -->
        <button
          type="button"
          class="flex-1 py-2 px-3 rounded-lg font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95 select-none"
          :class="
            isAgotado
              ? 'cursor-not-allowed bg-white/5 text-slate-500 border border-white/10'
              : agregado
                ? 'bg-emerald-500 text-neutral-950 font-black shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-neutral-950 font-black shadow-[0_0_20px_rgba(6,182,212,0.3)]'
          "
          :disabled="isAgotado || agregado"
          @click="onAgregar"
        >
          <template v-if="agregado">
            <Check class="size-4 stroke-[3]" aria-hidden="true" />
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
  </article>
</template>
