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
    ? { label: 'Cuenta Completa', icon: Users, cls: 'bg-slate-100 text-slate-700 border-slate-200' }
    : { label: '1 Pantalla (PIN)', icon: Tv, cls: 'bg-cyan-50 text-cyan-800 border-cyan-200' }
})

const platformColor = computed(() => props.producto.plataforma?.color || '#8057FF')

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
    class="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
    :class="{ 'opacity-70 grayscale-[20%]': isAgotado }"
    :aria-labelledby="`product-title-${producto.id}`"
  >
    <!-- TOP SHOWCASE: Contenedor blanco limpio para que el logo oficial resalte al 100% (Referencia Disney+) -->
    <div class="relative h-48 sm:h-52 w-full bg-white flex items-center justify-center p-6 border-b border-slate-100">
      <!-- Acento superior fino con el color de la plataforma -->
      <div
        class="absolute left-0 top-0 h-1 w-full"
        :style="{ backgroundColor: platformColor }"
        aria-hidden="true"
      />

      <!-- Badges superiores flotantes: Modalidad y Duración -->
      <div class="absolute top-3 left-3 z-10">
        <span
          class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider border shadow-xs"
          :class="tipoBadge.cls"
        >
          <component :is="tipoBadge.icon" class="size-3 text-slate-500" aria-hidden="true" />
          {{ tipoBadge.label }}
        </span>
      </div>

      <div class="absolute top-3 right-3 z-10">
        <span class="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200">
          <Clock class="size-3 text-slate-400" />
          {{ producto.duracionDias }} Días
        </span>
      </div>

      <!-- LOGO OFICIAL GRANDE Y CENTRADO -->
      <div class="h-28 w-full flex items-center justify-center p-2">
        <img
          v-if="producto.plataforma?.logoUrl"
          :src="producto.plataforma.logoUrl"
          :alt="producto.plataforma?.nombre"
          class="max-h-24 max-w-[80%] object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
        />
        <p v-else class="font-display text-2xl font-black text-slate-900 tracking-tight">
          {{ producto.plataforma?.nombre }}
        </p>
      </div>
    </div>

    <!-- CUERPO DE LA TARJETA (Estructura idéntica a la referencia de tienda) -->
    <div class="p-5 flex-1 flex flex-col justify-between bg-white text-slate-800 space-y-4">
      <div>
        <span class="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block mb-1">
          {{ producto.plataforma?.nombre || 'STREAMING OFICIAL' }}
        </span>
        <h3
          :id="`product-title-${producto.id}`"
          class="font-sans text-sm sm:text-base font-bold text-slate-900 group-hover:text-cyan-700 transition-colors uppercase tracking-tight line-clamp-2 leading-snug"
        >
          <RouterLink :to="`/producto/${producto.id}`" class="focus:outline-none">
            {{ producto.nombre }}
          </RouterLink>
        </h3>
        <p class="text-xs text-slate-500 mt-1 line-clamp-1">
          Entrega inmediata · PIN de perfil privado · Garantía total activa
        </p>
      </div>

      <div class="pt-3 border-t border-slate-100 space-y-3">
        <!-- Fila de Precio y Disponibilidad -->
        <div class="flex items-baseline justify-between">
          <div>
            <p class="font-display text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {{ formatPrice(producto.precio) }}
            </p>
            <!-- Badge 'en stock' de referencia -->
            <div class="mt-1 flex items-center gap-1.5 text-xs font-semibold">
              <template v-if="isAgotado">
                <span class="size-2 rounded-full bg-rose-500 inline-block"></span>
                <span class="text-rose-600 font-medium">Agotado</span>
              </template>
              <template v-else-if="producto.stock <= 3">
                <span class="size-2 rounded-full bg-amber-500 inline-block animate-pulse"></span>
                <span class="text-amber-700 font-medium">¡Últimas {{ producto.stock }}!</span>
              </template>
              <template v-else>
                <span class="size-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                <span class="text-emerald-700 font-medium lowercase">en stock</span>
              </template>
            </div>
          </div>

          <!-- Selector de cantidad -->
          <div v-if="!isAgotado && maxSeleccionable > 1" class="w-16">
            <label :for="`qty-${producto.id}`" class="sr-only">Cantidad</label>
            <select
              :id="`qty-${producto.id}`"
              v-model.number="cantidad"
              class="w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-mono font-bold text-slate-800 focus:border-slate-900 focus:outline-none cursor-pointer"
            >
              <option v-for="n in maxSeleccionable" :key="n" :value="n">
                {{ n }} ud
              </option>
            </select>
          </div>
        </div>

        <!-- Botón de compra / agregar -->
        <button
          type="button"
          class="w-full py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
          :class="
            isAgotado
              ? 'cursor-not-allowed bg-slate-100 text-slate-400 border border-slate-200'
              : agregado
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-slate-950 hover:bg-slate-800 text-white hover:shadow-md'
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
