<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowLeft, Check, CheckCircle2, Clock, ShieldCheck, ShoppingCart, Tv, Users } from '@lucide/vue'
import AppLoader from '@/components/common/AppLoader.vue'
import AppAlert from '@/components/common/AppAlert.vue'
import { productService } from '@/services/productService'
import { formatPrice } from '@/composables/useFormat'
import { useCartStore } from '@/stores/cart'
import type { Producto } from '@/types'

const props = defineProps<{
  id: number
}>()

const cart = useCartStore()
const producto = ref<Producto | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const cantidad = ref(1)
const agregado = ref(false)
const feedbackMsg = ref('')

const isAgotado = computed(() => !producto.value || producto.value.stock <= 0)
const maxSeleccionable = computed(() => {
  if (!producto.value) return 1
  return Math.min(producto.value.stock, 5)
})

const tipoBadge = computed(() => {
  if (!producto.value) return { label: '', icon: Tv }
  return producto.value.tipo === 'CUENTA_COMPLETA'
    ? { label: 'Cuenta Completa', icon: Users, desc: 'Adquieres la cuenta total con todas las pantallas disponibles.' }
    : { label: 'Pantalla Individual', icon: Tv, desc: 'Adquieres un perfil exclusivo dentro de una cuenta compartida.' }
})

async function fetchProducto() {
  loading.value = true
  error.value = null
  try {
    producto.value = await productService.getProducto(props.id)
  } catch (err: any) {
    error.value = err?.message || 'No se pudo cargar la información del producto.'
  } finally {
    loading.value = false
  }
}

function onAgregar() {
  if (!producto.value || isAgotado.value) return
  const res = cart.addItem(producto.value, cantidad.value)
  if (res.success) {
    agregado.value = true
    feedbackMsg.value = `¡${producto.value.nombre} agregado al carrito!`
    setTimeout(() => {
      agregado.value = false
      feedbackMsg.value = ''
    }, 2500)
  } else {
    feedbackMsg.value = res.message || 'No se pudo agregar'
    setTimeout(() => {
      feedbackMsg.value = ''
    }, 3500)
  }
}

onMounted(() => {
  fetchProducto()
})
</script>

<template>
  <div class="container-app py-8 sm:py-12">
    <!-- Enlace de regreso -->
    <RouterLink
      to="/catalogo"
      class="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-fg"
    >
      <ArrowLeft class="size-4" aria-hidden="true" />
      <span>Volver al catálogo</span>
    </RouterLink>

    <AppLoader v-if="loading" label="Cargando producto..." />

    <AppAlert v-else-if="error" variant="error" title="Producto no encontrado">
      <p>{{ error }}</p>
      <RouterLink to="/catalogo" class="btn-secondary mt-3 inline-flex text-xs">
        Explorar otros productos
      </RouterLink>
    </AppAlert>

    <article v-else-if="producto" class="grid grid-cols-1 gap-10 lg:grid-cols-12">
      <!-- Tarjeta principal de presentación del producto -->
      <div class="lg:col-span-7">
        <div class="card relative overflow-hidden p-6 sm:p-8">
          <div
            class="absolute left-0 top-0 h-2 w-full"
            :style="{ backgroundColor: producto.plataforma?.color || '#7c4dff' }"
            aria-hidden="true"
          />

          <div class="flex items-center gap-3">
            <span class="rounded-lg bg-surface-2 px-3 py-1 text-xs font-semibold uppercase text-brand-300">
              {{ producto.plataforma?.nombre }}
            </span>
            <span
              v-if="isAgotado"
              class="rounded-full bg-danger/20 px-2.5 py-0.5 text-xs font-bold text-danger"
            >
              AGOTADO
            </span>
            <span
              v-else
              class="rounded-full bg-success/20 px-2.5 py-0.5 text-xs font-semibold text-success"
            >
              {{ producto.stock }} unidades disponibles
            </span>
          </div>

          <h1 class="mt-4 font-display text-2xl font-bold text-fg sm:text-3xl">
            {{ producto.nombre }}
          </h1>

          <p class="mt-4 text-sm leading-relaxed text-muted sm:text-base">
            {{ producto.descripcion || 'Disfruta de tus series, películas y eventos favoritos con acceso garantizado y soporte directo.' }}
          </p>

          <!-- Beneficios y características -->
          <div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div class="flex items-start gap-3 rounded-xl border border-line bg-surface-2 p-3.5">
              <component :is="tipoBadge.icon" class="mt-0.5 size-5 shrink-0 text-brand-300" aria-hidden="true" />
              <div>
                <h4 class="text-xs font-bold uppercase text-fg">{{ tipoBadge.label }}</h4>
                <p class="text-xs text-muted">{{ tipoBadge.desc }}</p>
              </div>
            </div>

            <div class="flex items-start gap-3 rounded-xl border border-line bg-surface-2 p-3.5">
              <Clock class="mt-0.5 size-5 shrink-0 text-brand-300" aria-hidden="true" />
              <div>
                <h4 class="text-xs font-bold uppercase text-fg">Duración del plan</h4>
                <p class="text-xs text-muted">{{ producto.duracionDias }} días continuos de servicio garantizado.</p>
              </div>
            </div>

            <div class="flex items-start gap-3 rounded-xl border border-line bg-surface-2 p-3.5">
              <ShieldCheck class="mt-0.5 size-5 shrink-0 text-brand-300" aria-hidden="true" />
              <div>
                <h4 class="text-xs font-bold uppercase text-fg">Garantía completa</h4>
                <p class="text-xs text-muted">Soporte y reemplazo inmediato durante todo el período contratado.</p>
              </div>
            </div>

            <div class="flex items-start gap-3 rounded-xl border border-line bg-surface-2 p-3.5">
              <CheckCircle2 class="mt-0.5 size-5 shrink-0 text-brand-300" aria-hidden="true" />
              <div>
                <h4 class="text-xs font-bold uppercase text-fg">Entrega automática</h4>
                <p class="text-xs text-muted">Credenciales visibles en tu panel una vez acreditado el pago.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Caja de compra fija / lateral -->
      <div class="lg:col-span-5">
        <div class="card sticky top-24 p-6 sm:p-8">
          <span class="text-xs font-semibold uppercase tracking-wider text-muted">Resumen de precio</span>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="font-display text-3xl font-extrabold text-fg sm:text-4xl">
              {{ formatPrice(producto.precio) }}
            </span>
            <span class="text-xs text-muted">/ {{ producto.duracionDias }} días</span>
          </div>

          <div class="mt-6 border-t border-line pt-6">
            <label :for="`product-detail-qty-${producto.id}`" class="field-label">
              Cantidad a comprar
            </label>
            <div class="flex items-center gap-3">
              <select
                :id="`product-detail-qty-${producto.id}`"
                v-model.number="cantidad"
                :disabled="isAgotado"
                class="field-input w-28 text-center font-bold"
              >
                <option v-for="n in maxSeleccionable" :key="n" :value="n">
                  {{ n }}
                </option>
              </select>

              <button
                type="button"
                class="btn flex-1 py-3 text-base"
                :class="[
                  isAgotado
                    ? 'cursor-not-allowed bg-surface-2 text-muted'
                    : agregado
                      ? 'bg-success text-black'
                      : 'btn-primary'
                ]"
                :disabled="isAgotado"
                @click="onAgregar"
              >
                <template v-if="agregado">
                  <Check class="size-5" aria-hidden="true" />
                  <span>¡Agregado al carrito!</span>
                </template>
                <template v-else-if="isAgotado">
                  <span>Producto Agotado</span>
                </template>
                <template v-else>
                  <ShoppingCart class="size-5" aria-hidden="true" />
                  <span>Agregar al carrito</span>
                </template>
              </button>
            </div>

            <!-- Feedback -->
            <div
              v-if="feedbackMsg"
              role="status"
              aria-live="polite"
              class="mt-3 text-center text-xs font-medium"
              :class="agregado ? 'text-success' : 'text-danger'"
            >
              {{ feedbackMsg }}
            </div>

            <div class="mt-6 rounded-xl bg-surface-2 p-4 text-xs text-muted space-y-2">
              <p>📌 <strong>Regla de compra:</strong> Las credenciales solo se revelan en tu cuenta cuando la compra está pagada.</p>
              <p>⚡ <strong>Inventario en vivo:</strong> El stock definitivo se valida nuevamente en el checkout al procesar el pago.</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>
