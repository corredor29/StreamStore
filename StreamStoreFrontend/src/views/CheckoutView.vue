<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowLeft, CheckCircle2, ShieldCheck, ShoppingBag } from '@lucide/vue'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { formatPrice } from '@/composables/useFormat'
import { usePaymentCard } from '@/composables/usePaymentCard'
import { purchaseService } from '@/services/purchaseService'
import type { Compra, MetodoPago, PagoPayload, PagoResultado } from '@/types'
import PaymentMethodSelector from '@/components/checkout/PaymentMethodSelector.vue'
import PaymentCard3D from '@/components/checkout/PaymentCard3D.vue'
import PaymentForm from '@/components/checkout/PaymentForm.vue'
import AppAlert from '@/components/common/AppAlert.vue'

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
  <div class="container-app py-8 sm:py-12">
    <!-- ================= PANTALLA DE COMPRA EXITOSA ================= -->
    <div
      v-if="resultadoCompra"
      class="card mx-auto max-w-xl p-8 text-center"
    >
      <div class="mx-auto grid size-16 place-items-center rounded-2xl bg-success/20 text-success">
        <CheckCircle2 class="size-10" aria-hidden="true" />
      </div>

      <h1 class="mt-4 font-display text-2xl font-extrabold text-fg sm:text-3xl">
        ¡Pago Aprobado Exitosamente!
      </h1>
      <p class="mt-2 text-sm text-muted">
        Tu pedido <strong class="text-fg font-mono">#{{ resultadoCompra.id }}</strong> ha sido confirmado y tus credenciales ya se encuentran activadas.
      </p>

      <div class="my-6 rounded-xl border border-line bg-surface-2 p-4 text-left text-xs space-y-2">
        <div class="flex justify-between">
          <span class="text-muted">Total pagado:</span>
          <span class="font-bold text-fg text-sm">{{ formatPrice(resultadoCompra.total) }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted">Cliente:</span>
          <span class="font-medium text-fg">{{ auth.usuario?.nombre }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-muted">Estado del servicio:</span>
          <span class="font-bold text-success uppercase">ACTIVO</span>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <RouterLink to="/mi-cuenta" class="btn-primary py-3 px-6">
          Ver Mis Servicios y Credenciales
        </RouterLink>
        <RouterLink to="/catalogo" class="btn-secondary py-3 px-6">
          Volver a la tienda
        </RouterLink>
      </div>
    </div>

    <!-- ================= PANTALLA DE CHECKOUT ================= -->
    <div v-else>
      <!-- Regreso al carrito -->
      <RouterLink
        to="/carrito"
        class="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-fg"
      >
        <ArrowLeft class="size-4" aria-hidden="true" />
        <span>Modificar carrito</span>
      </RouterLink>

      <header class="mb-8">
        <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-300">
          <ShieldCheck class="size-4" aria-hidden="true" />
          <span>Checkout protegido</span>
        </div>
        <h1 class="mt-1 font-display text-3xl font-extrabold text-fg sm:text-4xl">
          Finalizar compra
        </h1>
        <p class="mt-1 text-sm text-muted">
          Comprando como: <strong class="text-fg">{{ auth.usuario?.nombre }}</strong> ({{ auth.usuario?.email }})
        </p>
      </header>

      <!-- Alertas de Error o Rechazo -->
      <AppAlert
        v-if="pagoRechazadoMsg"
        variant="error"
        title="Pago Rechazado (Simulación)"
        class="mb-6"
      >
        <p>{{ pagoRechazadoMsg }}</p>
        <p class="mt-1 text-xs text-muted">
          Puedes intentar de nuevo con una tarjeta de prueba aprobada (ej. Visa o Mastercard).
        </p>
      </AppAlert>

      <AppAlert
        v-if="orderError"
        variant="error"
        title="Problema al procesar la orden"
        class="mb-6"
      >
        <p>{{ orderError }}</p>
      </AppAlert>

      <!-- Si el carrito está vacío en checkout -->
      <div v-if="items.length === 0" class="card p-12 text-center max-w-md mx-auto">
        <ShoppingBag class="size-12 mx-auto text-muted" aria-hidden="true" />
        <h2 class="mt-4 font-display text-lg font-bold text-fg">No hay productos en el carrito</h2>
        <RouterLink to="/catalogo" class="btn-primary mt-6">
          Ir al catálogo
        </RouterLink>
      </div>

      <!-- Cuadrícula Principal de Checkout -->
      <div v-else class="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <!-- Columna Izquierda: Tarjeta 3D + Formulario de Pago -->
        <div class="lg:col-span-7 space-y-8">
          <!-- Selector de Método de Pago -->
          <section aria-label="Método de pago">
            <h2 class="mb-3 font-display text-base font-bold text-fg">
              1. Selecciona tu método de pago
            </h2>
            <PaymentMethodSelector v-model="metodoSeleccionado" />
          </section>

          <!-- Componente Tarjeta 3D (Solo visible con Tarjeta) -->
          <section
            v-if="metodoSeleccionado === 'TARJETA'"
            aria-label="Previsualización 3D de tarjeta bancaria"
            class="pt-2"
          >
            <h2 class="mb-4 text-xs font-semibold uppercase tracking-wider text-muted text-center sm:text-left">
              Tarjeta interactiva 3D (reacción en vivo)
            </h2>
            <PaymentCard3D
              :brand="paymentCard.brand.value"
              :bank-skin="paymentCard.bankSkin.value"
              :display-numero="paymentCard.displayNumero.value"
              :display-nombre="paymentCard.displayNombre.value"
              :display-expiracion="paymentCard.displayExpiracion.value"
              :display-cvv="paymentCard.displayCvv.value"
              :is-flipped="paymentCard.isFlipped.value"
            />
          </section>

          <!-- Formulario Sincronizado -->
          <section aria-label="Datos de pago" class="card p-6">
            <h2 class="mb-4 font-display text-base font-bold text-fg">
              {{ metodoSeleccionado === 'TARJETA' ? '2. Datos de la tarjeta de prueba' : '2. Datos de tu Daviplata' }}
            </h2>
            <PaymentForm
              :metodo="metodoSeleccionado"
              :payment-card="paymentCard"
              :is-processing="isProcessing"
              @submit-payment="onProcessPayment"
            />
          </section>
        </div>

        <!-- Columna Derecha: Pre-Factura y Resumen de Pedido -->
        <div class="lg:col-span-5">
          <aside aria-label="Detalle de facturación" class="card sticky top-24 overflow-hidden border border-line">
            <!-- Barra superior de acento degradado (estilo SmartInventory) -->
            <div class="h-1.5 w-full bg-gradient-to-r from-brand-500 via-cyan-400 to-emerald-400" />

            <div class="p-6">
              <!-- Encabezado de Pre-factura -->
              <div class="flex items-start justify-between border-b border-line pb-4">
                <div>
                  <span class="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400 font-bold">
                    Pre-Factura Digital
                  </span>
                  <h2 class="font-display text-lg font-black text-fg tracking-tight">
                    Resumen de Compra
                  </h2>
                </div>
                <div class="text-right">
                  <span class="text-[9px] font-mono uppercase text-muted block">Referencia</span>
                  <span class="font-mono text-xs font-bold text-fg">{{ refFactura }}</span>
                  <span class="text-[10px] font-mono text-muted block mt-0.5">{{ fechaFactura }}</span>
                </div>
              </div>

              <!-- Lista de Ítems -->
              <div class="divide-y divide-line/60 my-4 max-h-72 overflow-y-auto pr-1">
                <div
                  v-for="item in items"
                  :key="item.id"
                  class="py-3 flex items-center justify-between text-xs"
                >
                  <div class="min-w-0 pr-2">
                    <p class="font-bold text-fg truncate">{{ item.producto.nombre }}</p>
                    <p class="text-[11px] text-muted">
                      {{ item.cantidad }}x {{ formatPrice(item.producto.precio) }} · {{ item.producto.duracionDias }} días
                    </p>
                  </div>
                  <span class="font-mono font-bold text-cyan-300 shrink-0">
                    {{ formatPrice(item.subtotal) }}
                  </span>
                </div>
              </div>

              <!-- Desglose de Costos -->
              <div class="space-y-2 border-t border-line pt-4 text-xs">
                <div class="flex justify-between text-muted">
                  <span>Subtotal ({{ count }} ítems):</span>
                  <span class="font-mono text-fg font-bold">{{ formatPrice(total) }}</span>
                </div>
                <div class="flex justify-between text-muted">
                  <span>Impuestos (IVA 0% - Servicios Digitales):</span>
                  <span class="font-mono text-fg font-semibold">$0 COP</span>
                </div>
                <div class="flex justify-between text-muted">
                  <span>Entrega de credenciales:</span>
                  <span class="text-success font-semibold flex items-center gap-1">
                    <span class="size-1.5 rounded-full bg-success animate-ping" />
                    Inmediata
                  </span>
                </div>
              </div>

              <!-- Total General -->
              <div class="my-5 flex items-baseline justify-between border-t border-line pt-4">
                <span class="font-display text-base font-bold text-fg">Total a pagar</span>
                <span class="font-display text-2xl sm:text-3xl font-black text-fg tracking-tight">
                  {{ formatPrice(total) }}
                </span>
              </div>

              <!-- Garantía y Simulación -->
              <div class="space-y-2">
                <div class="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-2.5 text-[11px] text-emerald-200/90 flex items-center gap-2">
                  <ShieldCheck class="size-4 shrink-0 text-emerald-400" aria-hidden="true" />
                  <span>Garantía de activación instantánea al confirmar el pago.</span>
                </div>

                <div class="rounded-xl bg-surface-2 p-3 text-[11px] text-muted">
                  <p>🔒 <strong>Entorno Seguro de Pruebas:</strong> Las transacciones bancarias son simuladas. No se efectúan débitos a cuentas bancarias reales.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </div>
</template>
