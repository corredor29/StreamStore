<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowLeft, CheckCircle2, ShieldCheck, ShoppingBag, Tv } from '@lucide/vue'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { formatPrice } from '@/composables/useFormat'
import { usePaymentCard } from '@/composables/usePaymentCard'
import { purchaseService } from '@/services/purchaseService'
import type { Compra, MetodoPago, PagoPayload, PagoResultado } from '@/types'
import PaymentForm from '@/components/checkout/PaymentForm.vue'
import AppAlert from '@/components/common/AppAlert.vue'
import { useClientFonts } from '@/composables/useClientFonts'
import '@/styles/client-ui.css'

useClientFonts()

const cart = useCartStore()
const auth = useAuthStore()

const metodoSeleccionado = ref<MetodoPago>('TARJETA')
const paymentCard = usePaymentCard()

const isProcessing = ref(false)
const orderError = ref<string | null>(null)
const pagoRechazadoMsg = ref<string | null>(null)
const resultadoCompra = ref<Compra | null>(null)

const items = computed(() => cart.items)
const total = computed(() => cart.total)
const count = computed(() => cart.count)

const refFactura = ref('STRM-' + Date.now().toString().slice(-6))
const fechaFactura = new Date().toLocaleDateString('es-CO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

async function onProcessPayment(payload: { metodo: MetodoPago; marca?: any; ultimos4?: string }) {
  if (items.value.length === 0) return

  orderError.value = null
  pagoRechazadoMsg.value = null
  isProcessing.value = true

  try {
    // 1. Crear compra pendiente en el backend/servicio
    const nuevaCompra = await purchaseService.crear(items.value)

    // 2. Procesar pago simulado con el payload seguro
    const pagoPayload: PagoPayload = {
      metodo: payload.metodo,
      marca: payload.marca,
      ultimos4: payload.ultimos4,
    }

    const resultado: PagoResultado = await purchaseService.pagar(nuevaCompra.id, pagoPayload)

    if (resultado.aprobado) {
      // Éxito: limpiar carrito y presentar pantalla de confirmación
      resultadoCompra.value = resultado.compra
      cart.clear()
    } else {
      // Rechazado (ej. tarjeta terminada en 0000)
      pagoRechazadoMsg.value = resultado.mensaje || 'El pago fue rechazado por el emisor simulado.'
    }
  } catch (err: any) {
    orderError.value = err?.message || 'Ocurrió un error inesperado al procesar la compra.'
  } finally {
    isProcessing.value = false
  }
}
</script>

<template>
  <div class="ss-page bg-[#05060d]">
    <div class="container-app py-8 sm:py-12">
      <!-- Compra confirmada -->
      <section v-if="resultadoCompra" class="ss-panel mx-auto max-w-xl p-8 text-center sm:p-10" aria-labelledby="titulo-compra-ok">
        <div class="mx-auto grid size-16 place-items-center rounded-2xl bg-emerald-400/15 text-emerald-300">
          <CheckCircle2 class="size-9" aria-hidden="true" />
        </div>
        <h1 id="titulo-compra-ok" class="ss-title ss-h1 mt-5 text-white">Pago aprobado</h1>
        <p class="ss-lead mx-auto mt-2">
          Tu pedido #{{ resultadoCompra.id }} está confirmado. Las credenciales ya están en Mi cuenta.
        </p>

        <dl class="my-7 space-y-3 rounded-xl border border-white/10 p-5 text-left text-sm">
          <div class="flex justify-between gap-4">
            <dt class="text-[#a9b1cc]">Total pagado</dt>
            <dd class="font-bold text-white">{{ formatPrice(resultadoCompra.total) }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-[#a9b1cc]">Cliente</dt>
            <dd class="truncate font-semibold text-white">{{ auth.usuario?.nombre }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-[#a9b1cc]">Estado</dt>
            <dd class="font-semibold text-emerald-300">Activo</dd>
          </div>
        </dl>

        <div class="flex flex-col justify-center gap-3 sm:flex-row">
          <RouterLink to="/mi-cuenta" class="ss-btn ss-btn-primary">
            <Tv class="size-4" aria-hidden="true" />
            Ver mis servicios
          </RouterLink>
          <RouterLink to="/catalogo" class="ss-btn ss-btn-secondary">Seguir comprando</RouterLink>
        </div>
      </section>

      <div v-else class="space-y-8">
        <header class="flex flex-col gap-5 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <RouterLink to="/carrito" class="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-[#a9b1cc] hover:text-white">
              <ArrowLeft class="size-4" aria-hidden="true" />
              Volver al carrito
            </RouterLink>
            <h1 class="ss-title ss-h1 mt-1 text-white">Pago</h1>
            <p class="mt-1 text-sm text-[#a9b1cc]">
              Compras como <strong class="text-white">{{ auth.usuario?.nombre }}</strong> ({{ auth.usuario?.email }})
            </p>
          </div>

          <!-- Pasos reales del proceso de compra -->
          <ol class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm" aria-label="Progreso de compra">
            <li class="text-[#a9b1cc]">1. Carrito</li>
            <li class="text-[#5d6688]" aria-hidden="true">/</li>
            <li class="rounded-md bg-[#8b6cff]/20 px-2 py-0.5 font-bold text-white" aria-current="step">2. Pago</li>
            <li class="text-[#5d6688]" aria-hidden="true">/</li>
            <li class="text-[#a9b1cc]">3. Activación</li>
          </ol>
        </header>

        <AppAlert v-if="pagoRechazadoMsg" variant="error" title="El pago fue rechazado">
          <p>{{ pagoRechazadoMsg }}</p>
          <p class="mt-1 text-sm text-[#c9cfe4]">Revisa los datos o prueba con otro medio de pago. No se hizo ningún cobro.</p>
        </AppAlert>

        <AppAlert v-if="orderError" variant="error" title="No se pudo procesar el pedido">
          <p>{{ orderError }}</p>
        </AppAlert>

        <div v-if="items.length === 0" class="ss-empty mx-auto max-w-md">
          <ShoppingBag class="size-10 text-[#a9b1cc]" aria-hidden="true" />
          <h2 class="ss-title ss-h2 text-white">No hay nada que pagar</h2>
          <p class="text-sm text-[#a9b1cc]">Tu carrito está vacío. Agrega un plan para continuar.</p>
          <RouterLink to="/catalogo" class="ss-btn ss-btn-primary mt-1">Ver el catálogo</RouterLink>
        </div>

        <div v-else class="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          <div class="min-w-0 lg:col-span-7">
            <div class="ss-panel p-5 sm:p-7">
              <PaymentForm
                :metodo="metodoSeleccionado"
                :payment-card="paymentCard"
                :is-processing="isProcessing"
                :total-price="total"
                @update:metodo="(m) => (metodoSeleccionado = m)"
                @submit-payment="onProcessPayment"
              />
            </div>
          </div>

          <aside aria-label="Resumen del pedido" class="min-w-0 lg:col-span-5 lg:sticky lg:top-24">
            <div class="ss-panel overflow-hidden">
              <div class="h-1.5 bg-gradient-to-r from-[#8b6cff] to-[#2dd4ef]" aria-hidden="true" />
              <div class="p-6">
                <div class="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <h2 class="ss-title ss-h2 text-white">Tu pedido</h2>
                    <p class="mt-1 text-xs text-[#8a93b2]">StreamStore S.A.S. · NIT 901.234.567-8 · Bogotá</p>
                  </div>
                  <div class="shrink-0 text-right text-xs text-[#a9b1cc]">
                    <p>Referencia</p>
                    <p class="font-bold text-white">{{ refFactura }}</p>
                    <p class="mt-0.5">{{ fechaFactura }}</p>
                  </div>
                </div>

                <ul class="my-4 max-h-72 divide-y divide-white/10 overflow-y-auto pr-1">
                  <li v-for="item in items" :key="item.id" class="flex items-start justify-between gap-3 py-3">
                    <div class="min-w-0">
                      <p class="text-sm font-bold leading-snug text-white">{{ item.producto.nombre }}</p>
                      <p class="mt-0.5 text-xs text-[#a9b1cc]">
                        {{ item.producto.tipo === 'CUENTA_COMPLETA' ? 'Cuenta completa' : 'Pantalla con PIN' }} · {{ item.cantidad }} × {{ item.producto.duracionDias }} días
                      </p>
                    </div>
                    <span class="shrink-0 text-sm font-bold text-white">{{ formatPrice(item.subtotal) }}</span>
                  </li>
                </ul>

                <dl class="space-y-2 border-t border-dashed border-white/20 pt-4 text-sm">
                  <div class="flex justify-between gap-4">
                    <dt class="text-[#a9b1cc]">Subtotal ({{ count }} {{ count === 1 ? 'unidad' : 'unidades' }})</dt>
                    <dd class="font-semibold text-white">{{ formatPrice(total) }}</dd>
                  </div>
                  <div class="flex justify-between gap-4">
                    <dt class="text-[#a9b1cc]">IVA (servicio digital)</dt>
                    <dd class="font-semibold text-white">$0</dd>
                  </div>
                  <div class="flex justify-between gap-4">
                    <dt class="text-[#a9b1cc]">Entrega</dt>
                    <dd class="font-semibold text-emerald-300">Al aprobarse el pago</dd>
                  </div>
                </dl>

                <div class="mt-5 flex items-baseline justify-between gap-4 border-t border-white/10 pt-4">
                  <span class="font-bold text-white">Total (COP)</span>
                  <span class="font-display text-3xl font-extrabold tracking-tight text-white">{{ formatPrice(total) }}</span>
                </div>

                <p class="mt-5 flex items-start gap-2.5 text-sm text-[#a9b1cc]">
                  <ShieldCheck class="mt-0.5 size-4 shrink-0 text-emerald-300" aria-hidden="true" />
                  Correo, clave y PIN aparecen en Mi cuenta en cuanto se aprueba el pago.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </div>
</template>
