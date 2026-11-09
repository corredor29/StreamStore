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

// Las portadas de /targetyas/ son ilustraciones completas; el resto son logos que deben verse enteros
const isCardArt = computed(() => presentationImage.value.includes('/targetyas/'))

const tipoBadge = computed(() => {
  return props.producto.tipo === 'CUENTA_COMPLETA'
    ? {
        label: 'Cuenta completa',
        icon: Users,
        cls: 'bg-purple-50 text-purple-700 border-purple-200',
        overlayCls: 'bg-purple-950/85 text-purple-200 border border-purple-400/50',
      }
    : {
        label: 'Pantalla con PIN',
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
    class="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/12 bg-[#10142a] transition-colors duration-200 hover:border-white/30"
    :aria-labelledby="`product-title-${producto.id}`"
  >
    <!-- Portada: la ilustración llena el área; un logo se muestra entero sobre fondo oscuro -->
    <RouterLink
      :to="`/producto/${producto.id}`"
      class="relative block aspect-[16/10] w-full overflow-hidden bg-[#0a0d1c]"
      tabindex="-1"
      aria-hidden="true"
    >
      <img
        :src="presentationImage"
        alt=""
        class="h-full w-full"
        :class="[isCardArt ? 'object-cover' : 'object-contain p-8', { 'grayscale opacity-60': isAgotado }]"
        loading="lazy"
      />
    </RouterLink>

    <div class="flex flex-1 flex-col gap-3 p-4 sm:p-5">
      <div class="flex-1">
        <span class="mb-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold" :class="tipoBadge.overlayCls">
          <component :is="tipoBadge.icon" class="size-3.5" aria-hidden="true" />
          {{ tipoBadge.label }}
        </span>
        <h3 :id="`product-title-${producto.id}`" class="font-display text-base font-bold leading-snug text-white line-clamp-2">
          <RouterLink :to="`/producto/${producto.id}`" class="rounded hover:text-[#7ee8f8]">
            {{ producto.nombre }}
          </RouterLink>
        </h3>
        <p class="mt-1 flex items-center gap-1.5 text-sm text-[#a9b1cc]">
          <Clock class="size-3.5" aria-hidden="true" />
          {{ producto.duracionDias }} días
        </p>

        <p class="font-display mt-3 text-2xl font-extrabold tracking-tight text-white">{{ formatPrice(producto.precio) }}</p>
        <p class="mt-1 text-sm font-semibold">
          <span v-if="isAgotado" class="text-[#ff9fb2]">Agotado</span>
          <span v-else-if="producto.stock <= 3" class="text-amber-300">Quedan {{ producto.stock }}</span>
          <span v-else class="text-emerald-300">Disponible</span>
        </p>
      </div>

      <div class="flex items-center gap-2 border-t border-white/10 pt-3">
        <div v-if="!isAgotado && maxSeleccionable > 1" class="w-[4.5rem] shrink-0">
          <label :for="`qty-${producto.id}`" class="sr-only">Cantidad de {{ producto.nombre }}</label>
          <select
            :id="`qty-${producto.id}`"
            v-model.number="cantidad"
            class="h-11 w-full rounded-lg border border-white/20 bg-[#0a0d1c] px-2 text-sm font-semibold text-white hover:border-white/40"
          >
            <option v-for="n in maxSeleccionable" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>

        <button
          type="button"
          class="ss-btn min-h-11 flex-1 !px-3 text-sm"
          :class="isAgotado ? 'border border-white/10 bg-white/5 text-[#8a93b2]' : agregado ? 'bg-emerald-400 text-[#05230f]' : 'ss-btn-primary'"
          :disabled="isAgotado || agregado"
          :aria-label="isAgotado ? `${producto.nombre} agotado` : `Agregar ${producto.nombre} al carrito`"
          @click="onAgregar"
        >
          <template v-if="agregado">
            <Check class="size-4" aria-hidden="true" />
            Agregado
          </template>
          <template v-else-if="isAgotado">Agotado</template>
          <template v-else>
            <ShoppingCart class="size-4" aria-hidden="true" />
            Agregar
          </template>
        </button>
      </div>
    </div>
    <span v-if="agregado" class="sr-only" role="status">{{ producto.nombre }} se agregó al carrito.</span>
  </article>
</template>
