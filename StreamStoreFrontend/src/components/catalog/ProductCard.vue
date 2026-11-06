<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Check, ShoppingCart } from '@lucide/vue'
import type { Producto } from '@/types'
import { formatPrice } from '@/composables/useFormat'
import { useCartStore } from '@/stores/cart'

const props = defineProps<{
  producto: Producto
}>()

const cart = useCartStore()
const agregado = ref(false)

const isAgotado = computed(() => props.producto.stock <= 0)

function onAgregar() {
  if (isAgotado.value) return
  const res = cart.addItem(props.producto, 1)
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
    class="group relative flex flex-col justify-between overflow-hidden rounded-xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 h-[370px] p-4 cursor-pointer"
    :class="{ 'opacity-70 grayscale-[20%]': isAgotado }"
    :aria-labelledby="`product-title-${producto.id}`"
  >
    <!-- TOP 65%: CANVAS BLANCO LIMPIO CON LOGO GIGANTE CENTRADO (ESTILO LION STORE) -->
    <RouterLink
      :to="`/producto/${producto.id}`"
      class="flex-1 w-full flex items-center justify-center p-3 select-none"
    >
      <img
        v-if="producto.plataforma?.logoUrl"
        :src="producto.plataforma.logoUrl"
        :alt="producto.plataforma?.nombre"
        class="max-h-24 max-w-[85%] object-contain group-hover:scale-105 transition-transform duration-300"
      />
      <span v-else class="font-display text-2xl font-black text-slate-900 tracking-tight">
        {{ producto.plataforma?.nombre }}
      </span>
    </RouterLink>

    <!-- BOTTOM 35%: TÍTULO, PRECIO Y EN STOCK (EXACTO A LA REFERENCIA) -->
    <div class="pt-3 border-t border-slate-100 flex flex-col justify-between">
      <div>
        <h3
          :id="`product-title-${producto.id}`"
          class="font-sans text-[13px] font-semibold text-slate-700 uppercase leading-snug line-clamp-2 group-hover:text-cyan-700 transition-colors"
        >
          <RouterLink :to="`/producto/${producto.id}`">
            {{ producto.nombre }}
          </RouterLink>
        </h3>
      </div>

      <div class="mt-2.5 flex items-baseline justify-between">
        <p class="font-display text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          {{ formatPrice(producto.precio) }}
        </p>

        <!-- Botón rápido de agregar al carrito -->
        <button
          type="button"
          class="inline-flex items-center justify-center size-8 rounded-lg transition-all cursor-pointer shadow-xs"
          :class="
            isAgotado
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : agregado
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white'
          "
          :disabled="isAgotado || agregado"
          :title="isAgotado ? 'Agotado' : 'Agregar al carrito'"
          @click.stop="onAgregar"
        >
          <Check v-if="agregado" class="size-4" />
          <ShoppingCart v-else class="size-4" />
        </button>
      </div>

      <!-- ESTADO 'en stock' EXACTO A LA REFERENCIA -->
      <div class="mt-1 text-[11px] font-normal text-slate-500">
        <span v-if="isAgotado" class="text-rose-600 font-medium">agotado</span>
        <span v-else-if="producto.stock <= 3" class="text-amber-700 font-medium">¡últimas {{ producto.stock }} en stock!</span>
        <span v-else class="text-slate-500">en stock</span>
      </div>
    </div>
  </article>
</template>
