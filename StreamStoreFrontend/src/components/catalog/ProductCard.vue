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
    return '/brand_logos/netflix.webp'
  }
  if (slug.includes('max') || slug.includes('hbo') || name.includes('max')) {
    return '/targetyas/HBO_Max.webp'
  }
  if (slug.includes('prime') || slug.includes('amazon') || name.includes('prime') || slug.includes('pv')) {
    return '/targetyas/prime_video.avif'
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
    ? { label: 'Cuenta Completa', icon: Users, cls: 'bg-purple-50 text-purple-700 border-purple-200' }
    : { label: '1 Pantalla (PIN)', icon: Tv, cls: 'bg-cyan-50 text-cyan-800 border-cyan-200' }
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
    class="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 h-full"
    :class="{ 'opacity-60 grayscale-[30%]': isAgotado }"
    :aria-labelledby="`product-title-${producto.id}`"
  >
    <!-- TOP: PRESENTACIÓN GRÁFICA / LOGO SOBRE FONDO BLANCO (ESTILO LION TECH STORE) -->
    <RouterLink
      :to="`/producto/${producto.id}`"
      class="relative h-48 sm:h-52 w-full overflow-hidden block select-none cursor-pointer bg-white flex items-center justify-center p-6 border-b border-slate-100 group"
    >
      <!-- Logo o Tarjeta Oficial de la Plataforma -->
      <img
        :src="presentationImage"
        :alt="producto.nombre"
        class="transition-transform duration-300 ease-out group-hover:scale-105 select-none"
        :class="isWideGraphic ? 'max-h-24 sm:max-h-28 max-w-[85%] object-contain' : 'max-h-20 sm:max-h-24 max-w-[75%] object-contain'"
        loading="lazy"
      />

      <!-- Badges superiores flotantes: Modalidad y Duración -->
      <div class="absolute top-2.5 left-2.5 z-10">
        <span
          class="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider shadow-xs"
          :class="tipoBadge.cls"
        >
          <component :is="tipoBadge.icon" class="size-3" aria-hidden="true" />
          {{ tipoBadge.label }}
        </span>
      </div>

      <div class="absolute top-2.5 right-2.5 z-10">
        <span class="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200 shadow-xs">
          <Clock class="size-3 text-slate-500" />
          {{ producto.duracionDias }}d
        </span>
      </div>
    </RouterLink>

    <!-- CUERPO DE LA TARJETA (ESTILO LION TECH STORE) -->
    <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white space-y-3">
      <div>
        <h3
          :id="`product-title-${producto.id}`"
          class="font-display text-xs sm:text-sm font-bold text-slate-800 group-hover:text-cyan-600 transition-colors uppercase tracking-tight line-clamp-2 min-h-[2.5rem] leading-snug"
        >
          <RouterLink :to="`/producto/${producto.id}`">
            {{ displayTitle }}
          </RouterLink>
        </h3>

        <!-- Precio prominente en negrita -->
        <p class="font-display text-xl sm:text-2xl font-black text-slate-950 tracking-tight mt-2">
          {{ formatPrice(producto.precio) }}
        </p>

        <!-- Indicador de Stock: 'en stock' estilo Lion Tech Store -->
        <div class="mt-1 flex items-center gap-1.5 text-xs font-semibold">
          <template v-if="isAgotado">
            <span class="text-rose-600 font-medium">agotado</span>
          </template>
          <template v-else-if="producto.stock <= 3">
            <span class="text-amber-600 font-medium">¡últimas {{ producto.stock }} en stock!</span>
          </template>
          <template v-else>
            <span class="text-emerald-600 font-medium lowercase">en stock</span>
          </template>
        </div>
      </div>

      <!-- Fila de Agregar al Carrito -->
      <div class="pt-3 border-t border-slate-100 flex items-center gap-2">
        <!-- Selector de cantidad -->
        <div v-if="!isAgotado && maxSeleccionable > 1" class="w-16">
          <label :for="`qty-${producto.id}`" class="sr-only">Cantidad</label>
          <select
            :id="`qty-${producto.id}`"
            v-model.number="cantidad"
            class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-mono font-bold text-slate-800 focus:border-slate-400 focus:outline-none cursor-pointer"
          >
            <option v-for="n in maxSeleccionable" :key="n" :value="n">
              {{ n }} ud
            </option>
          </select>
        </div>

        <!-- Botón de compra -->
        <button
          type="button"
          class="flex-1 py-2 px-3 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          :class="
            isAgotado
              ? 'cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200'
              : agregado
                ? 'bg-emerald-600 text-white font-black'
                : 'bg-slate-900 hover:bg-black text-white font-bold'
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
  </article>
</template>
