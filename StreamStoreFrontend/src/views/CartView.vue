<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from '@lucide/vue'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/composables/useFormat'
import AppAlert from '@/components/common/AppAlert.vue'
import { useClientFonts } from '@/composables/useClientFonts'
import '@/styles/client-ui.css'

useClientFonts()

const cart = useCartStore()
const router = useRouter()

const items = computed(() => cart.items)
const total = computed(() => cart.total)
const count = computed(() => cart.count)

// Detectar si hay algún ítem cuya cantidad supere el stock actual
const stockIssues = computed(() => {
  return items.value.filter((i) => i.cantidad > i.producto.stock)
})

function increment(itemId: number, currentQty: number, maxStock: number) {
  if (currentQty >= maxStock) return
  cart.updateQuantity(itemId, currentQty + 1)
}

function decrement(itemId: number, currentQty: number) {
  if (currentQty <= 1) {
    cart.removeItem(itemId)
  } else {
    cart.updateQuantity(itemId, currentQty - 1)
  }
}

function removeItem(itemId: number) {
  cart.removeItem(itemId)
}

function goToCheckout() {
  if (stockIssues.value.length > 0) return
  router.push('/checkout')
}
</script>

<template>
  <div class="ss-page bg-[#05060d]">
    <div class="container-app py-8 sm:py-12">
      <header class="mb-8">
        <h1 class="ss-title ss-h1 text-white">Tu carrito</h1>
        <p class="ss-lead mt-2">Revisa los planes y las cantidades antes de pagar.</p>
      </header>

      <AppAlert v-if="stockIssues.length > 0" variant="warning" title="Hay más unidades que stock disponible" class="mb-6">
        <p>Ajusta las cantidades marcadas para poder continuar al pago.</p>
      </AppAlert>

      <div v-if="items.length > 0" class="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <section aria-label="Planes en el carrito" class="lg:col-span-8">
          <ul class="divide-y divide-white/10 border-y border-white/10">
            <li
              v-for="item in items"
              :key="item.id"
              class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-3 py-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center"
            >
              <div
                class="grid size-12 place-items-center rounded-xl font-display text-lg font-bold text-white"
                :style="{ backgroundColor: item.producto.plataforma?.color || '#7c4dff' }"
                aria-hidden="true"
              >
                {{ item.producto.plataforma?.nombre?.charAt(0) || 'S' }}
              </div>

              <div class="min-w-0">
                <h2 class="font-display text-base font-bold leading-snug text-white">{{ item.producto.nombre }}</h2>
                <p class="mt-0.5 text-sm text-[#a9b1cc]">
                  {{ item.producto.tipo === 'CUENTA_COMPLETA' ? 'Cuenta completa' : 'Pantalla con PIN' }}, {{ item.producto.duracionDias }} días.
                  {{ formatPrice(item.producto.precio) }} c/u
                </p>
                <p v-if="item.cantidad > item.producto.stock" class="mt-1 text-sm font-semibold text-[#ff9fb2]">
                  Solo quedan {{ item.producto.stock }} disponibles.
                </p>
              </div>

              <div class="col-span-2 flex items-center justify-between gap-4 sm:col-span-1 sm:justify-end">
                <div class="flex items-center rounded-xl border border-white/20" role="group" :aria-label="`Cantidad de ${item.producto.nombre}`">
                  <button
                    type="button"
                    class="grid size-11 place-items-center rounded-l-xl text-[#d7dcf0] hover:bg-white/5 hover:text-white"
                    :aria-label="item.cantidad <= 1 ? `Quitar ${item.producto.nombre}` : 'Disminuir cantidad'"
                    @click="decrement(item.id, item.cantidad)"
                  >
                    <Minus class="size-4" aria-hidden="true" />
                  </button>
                  <span class="w-9 text-center text-base font-bold text-white" aria-live="polite">{{ item.cantidad }}</span>
                  <button
                    type="button"
                    class="grid size-11 place-items-center rounded-r-xl text-[#d7dcf0] hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                    :disabled="item.cantidad >= item.producto.stock"
                    aria-label="Aumentar cantidad"
                    @click="increment(item.id, item.cantidad, item.producto.stock)"
                  >
                    <Plus class="size-4" aria-hidden="true" />
                  </button>
                </div>

                <p class="min-w-[6.5rem] text-right">
                  <span class="block text-xs text-[#a9b1cc]">Subtotal</span>
                  <span class="font-display text-lg font-bold text-white">{{ formatPrice(item.subtotal) }}</span>
                </p>

                <button
                  type="button"
                  class="grid size-11 place-items-center rounded-xl text-[#a9b1cc] hover:bg-[#ff7a93]/10 hover:text-[#ff9fb2]"
                  :aria-label="`Quitar ${item.producto.nombre} del carrito`"
                  @click="removeItem(item.id)"
                >
                  <Trash2 class="size-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          </ul>

          <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
            <RouterLink to="/catalogo" class="inline-flex min-h-10 items-center gap-1.5 rounded-lg text-sm font-semibold text-[#d7dcf0] hover:text-white">
              <ArrowLeft class="size-4" aria-hidden="true" />
              Seguir comprando
            </RouterLink>
            <button type="button" class="min-h-10 rounded-lg px-2 text-sm text-[#a9b1cc] underline underline-offset-4 hover:text-[#ff9fb2]" @click="cart.clear()">
              Vaciar carrito
            </button>
          </div>
        </section>

        <aside aria-label="Total de la compra" class="lg:col-span-4">
          <div class="ss-panel p-6 lg:sticky lg:top-24">
            <h2 class="ss-title ss-h2 text-white">Resumen</h2>
            <dl class="mt-5 space-y-3 border-b border-white/10 pb-4 text-sm">
              <div class="flex justify-between gap-4">
                <dt class="text-[#a9b1cc]">Unidades</dt>
                <dd class="font-semibold text-white">{{ count }}</dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-[#a9b1cc]">Entrega</dt>
                <dd class="font-semibold text-emerald-300">Digital, en tu cuenta</dd>
              </div>
            </dl>
            <div class="my-5 flex items-baseline justify-between gap-4">
              <span class="font-bold text-white">Total</span>
              <span class="font-display text-3xl font-extrabold tracking-tight text-white">{{ formatPrice(total) }}</span>
            </div>
            <button type="button" class="ss-btn ss-btn-primary ss-btn-block" :disabled="stockIssues.length > 0" @click="goToCheckout">
              Continuar al pago
            </button>
            <p class="mt-4 text-sm text-[#a9b1cc]">El carrito no reserva unidades: el stock se confirma al pagar.</p>
          </div>
        </aside>
      </div>

      <div v-else class="ss-empty mx-auto max-w-lg">
        <ShoppingBag class="size-10 text-[#a9b1cc]" aria-hidden="true" />
        <h2 class="ss-title ss-h2 text-white">Tu carrito está vacío</h2>
        <p class="text-sm text-[#a9b1cc]">Elige una plataforma en el catálogo y agrégala aquí.</p>
        <RouterLink to="/catalogo" class="ss-btn ss-btn-primary mt-1">Ver el catálogo</RouterLink>
      </div>
    </div>
  </div>
</template>
