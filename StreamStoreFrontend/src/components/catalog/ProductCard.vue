<script setup lang="ts">
import { computed, ref } from 'vue'
import CustomSelect from '@/components/common/CustomSelect.vue'
import { RouterLink } from 'vue-router'
import { Check, Clock, Flame, ShoppingCart, Tv, Users } from '@lucide/vue'
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
  if (props.producto.esCombo || props.producto.tipo === 'COMBO') {
    return props.producto.plataforma?.coverUrl || '/hbo_max_mosaic_bg.jpg'
  }
  return props.producto.plataforma?.coverUrl || props.producto.plataforma?.logoUrl || '/brand_logos/streamstore_icon.png'
})

// Las portadas de /targetyas/ son ilustraciones completas; el resto son logos que deben verse enteros
const isCardArt = computed(() => props.producto.esCombo || !!props.producto.plataforma?.coverUrl || presentationImage.value.includes('/targetyas/'))

const tipoBadge = computed(() => {
  if (props.producto.esCombo || props.producto.tipo === 'COMBO') {
    return {
      label: props.producto.etiquetaPromo || 'Combo Promocional',
      icon: Flame,
      cls: 'bg-red-500/20 text-red-300 border-red-500/40',
      overlayCls: 'bg-red-950/90 text-red-200 border border-red-500/60 font-black uppercase text-[10px] tracking-wider',
    }
  }
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

        <!-- Plataformas incluidas en caso de combo -->
        <div v-if="producto.plataformasCombo?.length" class="flex flex-wrap items-center gap-1 mt-1.5">
          <span
            v-for="plat in producto.plataformasCombo"
            :key="plat.id"
            class="inline-flex items-center rounded-md border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-cyan-300"
          >
            {{ plat.nombre }}
          </span>
        </div>

        <!-- Precio regular tachado y badge de ahorro -->
        <div v-if="producto.precioRegular && producto.precioRegular > producto.precio" class="flex items-center gap-2 mt-2">
          <span class="text-xs text-slate-500 line-through">
            {{ formatPrice(producto.precioRegular) }}
          </span>
          <span class="rounded bg-emerald-500/20 border border-emerald-500/40 px-1.5 py-0.5 text-[10px] font-mono font-bold text-emerald-300">
            -{{ Math.round(((producto.precioRegular - producto.precio) / producto.precioRegular) * 100) }}% OFF
          </span>
        </div>

        <p class="font-display mt-1 text-2xl font-extrabold tracking-tight text-white">{{ formatPrice(producto.precio) }}</p>
        <p class="mt-1 text-sm font-semibold">
          <span v-if="isAgotado" class="text-[#ff9fb2]">Agotado</span>
          <span v-else-if="producto.stock <= 3" class="text-amber-300">Quedan {{ producto.stock }}</span>
          <span v-else class="text-emerald-300">Disponible</span>
        </p>
      </div>

      <div class="flex items-center gap-2 border-t border-white/10 pt-3">
        <div v-if="!isAgotado && maxSeleccionable > 1" class="w-[4.5rem] shrink-0">
          <label :for="`qty-${producto.id}`" class="sr-only">Cantidad de {{ producto.nombre }}</label>
          <CustomSelect
            v-model="cantidad"
            :options="Array.from({ length: maxSeleccionable }, (_, i) => ({ value: i + 1, label: `${i + 1} ud` }))"
            compact
            aria-label="Cantidad"
          />
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
