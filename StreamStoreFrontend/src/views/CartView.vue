<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from '@lucide/vue'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/composables/useFormat'
import AppAlert from '@/components/common/AppAlert.vue'

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
  <div class="container-app py-8 sm:py-12">
    <!-- Encabezado -->
    <header class="mb-8">
      <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-300">
        <ShoppingBag class="size-4" aria-hidden="true" />
        <span>Tu carrito</span>
      </div>
      <h1 class="mt-1 font-display text-3xl font-extrabold text-fg sm:text-4xl">
        Resumen de compra
      </h1>
      <p class="mt-1 text-sm text-muted">
        Revisa los planes seleccionados antes de proceder al pago seguro.
      </p>
    </header>

    <!-- Alerta de conflicto de stock si aplica -->
    <AppAlert
      v-if="stockIssues.length > 0"
      variant="warning"
      title="Aviso de inventario disponible"
      class="mb-6"
    >
      <p>
        Algunos productos seleccionados superan el stock máximo disponible en este momento. Ajusta la cantidad para continuar.
      </p>
    </AppAlert>

    <!-- Estado con productos en el carrito -->
    <div v-if="items.length > 0" class="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <!-- Lista de Productos -->
      <section aria-label="Lista de productos en el carrito" class="lg:col-span-8 space-y-4">
        <article
          v-for="item in items"
          :key="item.id"
          class="card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5"
        >
          <div class="flex items-start gap-4 min-w-0">
            <!-- Barra lateral de color de plataforma -->
            <div
              class="size-12 rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-md"
              :style="{ backgroundColor: item.producto.plataforma?.color || '#7c4dff' }"
            >
              {{ item.producto.plataforma?.nombre?.charAt(0) || 'S' }}
            </div>

            <div class="min-w-0">
              <span class="text-[11px] font-semibold uppercase tracking-wider text-brand-300">
                {{ item.producto.plataforma?.nombre }} · {{ item.producto.tipo === 'CUENTA_COMPLETA' ? 'Cuenta Completa' : 'Pantalla' }}
              </span>
              <h2 class="font-display text-base font-bold text-fg truncate">
                {{ item.producto.nombre }}
              </h2>
              <p class="text-xs text-muted">
                Precio unitario: {{ formatPrice(item.producto.precio) }} · {{ item.producto.duracionDias }} días
              </p>
              <p v-if="item.cantidad > item.producto.stock" class="text-xs font-semibold text-danger mt-1">
                ⚠️ Solo quedan {{ item.producto.stock }} disponibles
              </p>
            </div>
          </div>

          <!-- Controles de cantidad y subtotal -->
          <div class="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 border-line/60 pt-3 sm:pt-0">
            <!-- Selector de Cantidad -->
            <div class="flex items-center rounded-lg border border-line bg-surface-2">
              <button
                type="button"
                class="px-2.5 py-1.5 text-muted hover:text-fg disabled:opacity-30"
                aria-label="Disminuir cantidad"
                @click="decrement(item.id, item.cantidad)"
              >
                <Minus class="size-3.5" aria-hidden="true" />
              </button>
              <span class="w-8 text-center font-mono text-sm font-bold text-fg">
                {{ item.cantidad }}
              </span>
              <button
                type="button"
                class="px-2.5 py-1.5 text-muted hover:text-fg disabled:opacity-30"
                :disabled="item.cantidad >= item.producto.stock"
                aria-label="Aumentar cantidad"
                @click="increment(item.id, item.cantidad, item.producto.stock)"
              >
                <Plus class="size-3.5" aria-hidden="true" />
              </button>
            </div>

            <!-- Subtotal -->
            <div class="text-right min-w-[90px]">
              <span class="block text-xs text-muted">Subtotal</span>
              <span class="font-display text-base font-bold text-fg">
                {{ formatPrice(item.subtotal) }}
              </span>
            </div>

            <!-- Eliminar ítem -->
            <button
              type="button"
              class="text-muted hover:text-danger p-1 transition-colors"
              aria-label="Eliminar del carrito"
              @click="removeItem(item.id)"
            >
              <Trash2 class="size-4" aria-hidden="true" />
            </button>
          </div>
        </article>

        <!-- Botones de acción secundaria -->
        <div class="flex items-center justify-between pt-2">
          <RouterLink
            to="/catalogo"
            class="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-300 hover:text-brand-200"
          >
            <ArrowLeft class="size-4" aria-hidden="true" />
            <span>Seguir agregando productos</span>
          </RouterLink>

          <button
            type="button"
            class="text-xs text-muted hover:text-danger underline underline-offset-4"
            @click="cart.clear()"
          >
            Vaciar todo el carrito
          </button>
        </div>
      </section>

      <!-- Resumen Lateral Fijo -->
      <aside aria-label="Total de la compra" class="lg:col-span-4">
        <div class="card sticky top-24 p-6">
          <h2 class="font-display text-lg font-bold text-fg">Resumen del pedido</h2>

          <div class="mt-6 space-y-3 text-sm border-b border-line pb-4">
            <div class="flex justify-between text-muted">
              <span>Cantidad de productos</span>
              <span class="font-mono font-semibold text-fg">{{ count }}</span>
            </div>
            <div class="flex justify-between text-muted">
              <span>Entrega</span>
              <span class="font-semibold text-success">Inmediata (Digital)</span>
            </div>
          </div>

          <div class="my-6 flex items-baseline justify-between">
            <span class="font-display text-base font-bold text-fg">Total a pagar</span>
            <span class="font-display text-2xl font-extrabold text-fg sm:text-4xl">
              {{ formatPrice(total) }}
            </span>
          </div>

          <button
            type="button"
            class="btn-primary w-full py-3.5 text-base font-bold shadow-lg shadow-brand-500/25"
            :disabled="stockIssues.length > 0"
            @click="goToCheckout"
          >
            <span>Continuar al pago</span>
            <ArrowRight class="size-4" aria-hidden="true" />
          </button>

          <div class="mt-4 rounded-xl bg-surface-2 p-3 text-xs text-muted space-y-1.5">
            <p>🛡️ <strong>Garantía:</strong> Reemplazo inmediato garantizado ante fallas.</p>
            <p>⚡ <strong>Inventario en vivo:</strong> El carrito no reserva inventario; el stock final se valida al pagar.</p>
          </div>
        </div>
      </aside>
    </div>

    <!-- Estado Carrito Vacío -->
    <div
      v-else
      class="card flex flex-col items-center justify-center py-20 text-center max-w-lg mx-auto"
    >
      <div class="grid size-16 place-items-center rounded-2xl bg-surface-2 text-muted">
        <ShoppingBag class="size-8" aria-hidden="true" />
      </div>
      <h2 class="mt-4 font-display text-xl font-bold text-fg">Tu carrito está vacío</h2>
      <p class="mt-2 text-sm text-muted">
        Aún no has agregado planes o cuentas de streaming a tu pedido.
      </p>
      <RouterLink to="/catalogo" class="btn-primary mt-6">
        Explorar catálogo de planes
      </RouterLink>
    </div>
  </div>
</template>
