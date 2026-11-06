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

const platformColor = computed(() => props.producto.plataforma?.color || '#8057FF')

// Detectar si la plataforma cuenta con una tarjeta gráfica en la carpeta targetyas
const isTargetyaCard = computed(() => {
  const slug = (props.producto.plataforma?.slug || props.producto.plataforma?.nombre || '').toLowerCase()
  return (
    slug.includes('disney') ||
    slug.includes('dp') ||
    slug.includes('max') ||
    slug.includes('hbo') ||
    slug.includes('prime') ||
    slug.includes('amazon') ||
    slug.includes('crunchyroll') ||
    slug.includes('anime') ||
    slug.includes('spotify') ||
    slug.includes('musica')
  )
})

// Ruta del recurso visual: tarjeta de targetyas o foto de referencia
const tarjetaCover = computed(() => {
  const slug = (props.producto.plataforma?.slug || props.producto.plataforma?.nombre || '').toLowerCase()
  if (slug.includes('disney') || slug.includes('dp')) return '/targetyas/disneycard.png'
  if (slug.includes('max') || slug.includes('hbo')) return '/targetyas/HBO_Max.webp'
  if (slug.includes('prime') || slug.includes('amazon')) return '/targetyas/prime_video.avif'
  if (slug.includes('crunchyroll') || slug.includes('anime')) return '/targetyas/Crunchyroll.webp'
  if (slug.includes('spotify') || slug.includes('musica')) return '/targetyas/spotify_premiun.webp'
  if (slug.includes('netflix') || slug.includes('nf')) return '/watching_netflix.jpg'
  if (slug.includes('paramount') || slug.includes('paramont')) return '/hero_cinema_wall.jpg'
  if (slug.includes('apple') || slug.includes('appletv')) return '/watching_prime.jpg'
  return '/hero_cinema_wall.jpg'
})

// Filtro de iluminación para logos sobre fondos oscuros
const logoFilter = computed(() => {
  const slug = (props.producto.plataforma?.slug || '').toLowerCase()
  if (slug.includes('max')) return 'brightness(0) invert(1) drop-shadow(0 4px 16px rgba(123,47,247,0.9)) drop-shadow(0 0 8px rgba(255,255,255,0.7))'
  if (slug.includes('disney')) return 'brightness(0) invert(1) drop-shadow(0 4px 16px rgba(17,60,207,0.9)) drop-shadow(0 0 8px rgba(255,255,255,0.7))'
  if (slug.includes('prime')) return 'brightness(0) invert(1) drop-shadow(0 4px 16px rgba(0,168,225,0.9)) drop-shadow(0 0 8px rgba(255,255,255,0.7))'
  if (slug.includes('paramount')) return 'brightness(0) invert(1) drop-shadow(0 4px 16px rgba(0,100,255,0.9)) drop-shadow(0 0 8px rgba(255,255,255,0.7))'
  if (slug.includes('apple')) return 'brightness(0) invert(1) drop-shadow(0 4px 16px rgba(255,255,255,0.9)) drop-shadow(0 0 8px rgba(255,255,255,0.7))'
  return 'drop-shadow(0 4px 18px rgba(0,0,0,0.95)) drop-shadow(0 0 6px rgba(255,255,255,0.4))'
})

const tipoBadge = computed(() => {
  return props.producto.tipo === 'CUENTA_COMPLETA'
    ? { label: 'Cuenta Completa', icon: Users, cls: 'bg-black/70 text-brand-300 border-brand-500/40' }
    : { label: '1 Pantalla (PIN)', icon: Tv, cls: 'bg-black/70 text-cyan-300 border-cyan-500/40' }
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
    class="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-neutral-900 border border-white/10 shadow-xl hover:border-white/30 hover:shadow-2xl transition-all duration-300"
    :class="{ 'opacity-70 grayscale-[20%]': isAgotado }"
    :aria-labelledby="`product-title-${producto.id}`"
  >
    <!-- TOP: TARJETA VISUAL DE PRESENTACIÓN (CARPETA TARGETYAS) -->
    <RouterLink
      :to="`/producto/${producto.id}`"
      class="relative h-48 sm:h-52 w-full overflow-hidden block select-none cursor-pointer bg-neutral-950 flex items-center justify-center group"
    >
      <!-- Si es una tarjeta gráfica de la carpeta targetyas (Disney, Max, Prime, Crunchyroll, Spotify) -->
      <img
        v-if="isTargetyaCard"
        :src="tarjetaCover"
        :alt="producto.nombre"
        class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      />

      <!-- Si es foto cinemática con logo flotante (ej. Netflix) -->
      <template v-else>
        <div
          class="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
          :style="{ backgroundImage: `url('${tarjetaCover}')` }"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-black/70 pointer-events-none" />
        <div class="absolute inset-0 flex items-center justify-center p-6 z-10">
          <img
            v-if="producto.plataforma?.logoUrl"
            :src="producto.plataforma.logoUrl"
            :alt="producto.plataforma?.nombre"
            class="max-h-16 sm:max-h-20 max-w-[80%] object-contain transition-transform duration-300 group-hover:scale-110"
            :style="{ filter: logoFilter }"
          />
          <span v-else class="font-display text-2xl font-black text-white tracking-tight drop-shadow-lg">
            {{ producto.plataforma?.nombre }}
          </span>
        </div>
      </template>

      <!-- Acento superior fino de color neón -->
      <div
        class="absolute left-0 top-0 h-1 w-full z-10"
        :style="{ backgroundColor: platformColor, boxShadow: `0 0 10px ${platformColor}` }"
      />

      <!-- Badges superiores flotantes: Modalidad y Duración -->
      <div class="absolute top-3 left-3 z-10">
        <span
          class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md shadow-md"
          :class="tipoBadge.cls"
        >
          <component :is="tipoBadge.icon" class="size-3" aria-hidden="true" />
          {{ tipoBadge.label }}
        </span>
      </div>

      <div class="absolute top-3 right-3 z-10">
        <span class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold text-slate-200 bg-black/70 border border-white/20 backdrop-blur-md shadow-md">
          <Clock class="size-3 text-cyan-300" />
          {{ producto.duracionDias }}d
        </span>
      </div>
    </RouterLink>

    <!-- CUERPO DE LA TARJETA -->
    <div class="p-5 flex-1 flex flex-col justify-between space-y-4 bg-neutral-900">
      <div>
        <span class="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block mb-1">
          {{ producto.plataforma?.nombre || 'STREAMING' }}
        </span>
        <h3
          :id="`product-title-${producto.id}`"
          class="font-display text-base font-bold text-white group-hover:text-cyan-300 transition-colors uppercase tracking-tight line-clamp-1"
        >
          <RouterLink :to="`/producto/${producto.id}`">
            {{ producto.nombre }}
          </RouterLink>
        </h3>
        <p class="text-xs text-slate-400 mt-1 line-clamp-1">
          Entrega inmediata · PIN privado · Garantía total activa
        </p>
      </div>

      <div class="pt-3 border-t border-white/10 space-y-3">
        <!-- Fila de Precio y Disponibilidad -->
        <div class="flex items-baseline justify-between">
          <div>
            <p class="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
              {{ formatPrice(producto.precio) }}
            </p>
            <!-- Badge de Stock -->
            <div class="mt-1 flex items-center gap-1.5 text-xs font-semibold">
              <template v-if="isAgotado">
                <span class="size-2 rounded-full bg-rose-500 inline-block"></span>
                <span class="text-rose-400 font-medium">Agotado</span>
              </template>
              <template v-else-if="producto.stock <= 3">
                <span class="size-2 rounded-full bg-amber-500 inline-block animate-pulse"></span>
                <span class="text-amber-300 font-medium">¡Últimas {{ producto.stock }}!</span>
              </template>
              <template v-else>
                <span class="size-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                <span class="text-emerald-400 font-medium lowercase">en stock</span>
              </template>
            </div>
          </div>

          <!-- Selector de cantidad -->
          <div v-if="!isAgotado && maxSeleccionable > 1" class="w-16">
            <label :for="`qty-${producto.id}`" class="sr-only">Cantidad</label>
            <select
              :id="`qty-${producto.id}`"
              v-model.number="cantidad"
              class="w-full rounded-lg border border-white/15 bg-black/60 px-2 py-1.5 text-xs font-mono font-bold text-white focus:border-cyan-400 focus:outline-none cursor-pointer"
            >
              <option v-for="n in maxSeleccionable" :key="n" :value="n">
                {{ n }} ud
              </option>
            </select>
          </div>
        </div>

        <!-- Botón de Compra / Agregar al Carrito -->
        <button
          type="button"
          class="w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
          :class="
            isAgotado
              ? 'cursor-not-allowed bg-white/5 text-slate-500 border border-white/10'
              : agregado
                ? 'bg-emerald-500 text-neutral-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'bg-white hover:bg-slate-200 text-neutral-950 font-black hover:shadow-lg'
          "
          :disabled="isAgotado || agregado"
          @click="onAgregar"
        >
          <template v-if="agregado">
            <Check class="size-4" aria-hidden="true" />
            <span>¡Agregado al carrito!</span>
          </template>
          <template v-else-if="isAgotado">
            <span>Agotado</span>
          </template>
          <template v-else>
            <ShoppingCart class="size-3.5" aria-hidden="true" />
            <span>Agregar al Carrito</span>
          </template>
        </button>
      </div>
    </div>
  </article>
</template>
