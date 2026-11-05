<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowLeft, CheckCircle2, Lock, ShieldCheck, ShoppingBag, Sparkles, Tv } from '@lucide/vue'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { formatPrice } from '@/composables/useFormat'
import { usePaymentCard } from '@/composables/usePaymentCard'
import { purchaseService } from '@/services/purchaseService'
import type { Compra, MetodoPago, PagoPayload, PagoResultado } from '@/types'
import PaymentMethodSelector from '@/components/checkout/PaymentMethodSelector.vue'
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
      class="card mx-auto max-w-xl p-8 sm:p-10 text-center relative overflow-hidden border-success/30 shadow-[0_0_50px_rgba(52,211,153,0.15)]"
    >
      <div class="absolute -right-16 -top-16 size-48 rounded-full bg-success/10 blur-3xl pointer-events-none" />

      <div class="mx-auto grid size-20 place-items-center rounded-3xl bg-success/20 text-success border border-success/30 shadow-inner">
        <CheckCircle2 class="size-11" aria-hidden="true" />
      </div>

      <span class="mt-5 inline-block text-[11px] font-mono uppercase tracking-[0.25em] text-success font-bold">
        Transacción Exitosa
      </span>

      <h1 class="mt-1 font-display text-2xl font-black text-fg sm:text-3xl tracking-tight">
        ¡Pago Aprobado y Activado!
      </h1>
      <p class="mt-2 text-sm text-muted">
        Tu orden <strong class="text-cyan-300 font-mono">#{{ resultadoCompra.id }}</strong> ha sido confirmada en tiempo real. Tus pantallas y credenciales ya están generadas.
      </p>

      <div class="my-6 rounded-2xl border border-line bg-surface-2/60 p-5 text-left text-xs space-y-3 shadow-inner">
        <div class="flex justify-between items-center pb-2 border-b border-line/60">
          <span class="text-muted">Total abonado:</span>
          <span class="font-mono font-bold text-fg text-base text-cyan-300">{{ formatPrice(resultadoCompra.total) }}</span>
        </div>
        <div class="flex justify-between items-center pb-2 border-b border-line/60">
          <span class="text-muted">Cliente:</span>
          <span class="font-semibold text-fg">{{ auth.usuario?.nombre }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-muted">Estado del servicio:</span>
          <span class="font-mono font-bold text-success uppercase flex items-center gap-1.5">
            <span class="size-2 rounded-full bg-success animate-ping" />
            ACTIVO INMEDIATO
          </span>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <RouterLink to="/mi-cuenta" class="btn-primary py-3.5 px-6 shadow-lg shadow-brand-500/25">
          <Tv class="size-4" />
          <span>Ver Mis Servicios y Credenciales</span>
        </RouterLink>
        <RouterLink to="/catalogo" class="btn-secondary py-3.5 px-6">
          Volver a la tienda
        </RouterLink>
      </div>
    </div>

    <!-- ================= PANTALLA PRINCIPAL DE CHECKOUT ================= -->
    <div v-else class="space-y-8">
      <!-- BREADCRUMB / STEPPER SUPERIOR -->
      <nav aria-label="Progreso de compra" class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-6">
        <div>
          <RouterLink
            to="/carrito"
            class="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft class="size-3.5" aria-hidden="true" />
            <span>Volver al carrito</span>
          </RouterLink>
          <h1 class="mt-2 font-display text-2xl sm:text-4xl font-black uppercase tracking-tight text-fg">
            Finalizar Suscripción
          </h1>
          <p class="mt-1 text-xs text-muted">
            Sesión activa: <strong class="text-fg">{{ auth.usuario?.nombre }}</strong> ({{ auth.usuario?.email }})
          </p>
        </div>

        <!-- Stepper visual estilo Cyberpunk -->
        <div class="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider">
          <span class="text-muted/60">01 Carrito</span>
          <span class="text-muted/40">/</span>
          <span class="text-cyan-300 font-bold px-2 py-1 rounded bg-cyan-950/40 border border-cyan-500/30">
            02 Pasarela & Pago
          </span>
          <span class="text-muted/40">/</span>
          <span class="text-muted/60">03 Activación</span>
        </div>
      </nav>

      <!-- Alertas de Error o Rechazo -->
      <AppAlert
        v-if="pagoRechazadoMsg"
        variant="error"
        title="Pago Rechazado por el Emisor Simulado"
      >
        <p>{{ pagoRechazadoMsg }}</p>
        <p class="mt-1 text-xs text-muted">
          Tip: Haz clic en cualquiera de los botones de tarjeta aprobada (ej. Visa, Nu o Bancolombia) para simular una aprobación exitosa.
        </p>
      </AppAlert>

      <AppAlert
        v-if="orderError"
        variant="error"
        title="Error al procesar la orden"
      >
        <p>{{ orderError }}</p>
      </AppAlert>

      <!-- Estado Carrito Vacío -->
      <div v-if="items.length === 0" class="card p-12 text-center max-w-md mx-auto">
        <ShoppingBag class="size-12 mx-auto text-muted" aria-hidden="true" />
        <h2 class="mt-4 font-display text-lg font-bold text-fg">No hay productos en el carrito</h2>
        <p class="mt-1 text-xs text-muted">Agrega pantallas o cuentas de streaming para continuar.</p>
        <RouterLink to="/catalogo" class="btn-primary mt-6">
          Explorar catálogo
        </RouterLink>
      </div>

      <!-- Cuadrícula Principal de Checkout -->
      <div v-else class="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        <!-- Columna Izquierda: Método de Pago + Estudio de Tarjeta y Formulario (7 columnas) -->
        <div class="lg:col-span-7 space-y-6">
          <!-- 1. Selección de Método -->
          <section aria-label="Método de pago" class="card p-5 sm:p-6 space-y-3">
            <div class="flex items-center justify-between border-b border-line/60 pb-3">
              <h2 class="font-display text-sm font-bold uppercase tracking-wider text-fg flex items-center gap-2">
                <span class="size-5 rounded-full bg-brand-500 text-white text-[10px] grid place-items-center font-mono font-bold">1</span>
                <span>Selecciona tu Pasarela</span>
              </h2>
              <span class="text-[10px] font-mono text-muted">Sin comisiones extra</span>
            </div>
            <PaymentMethodSelector v-model="metodoSeleccionado" />
          </section>

          <!-- 2. Formulario y Estudio de Tarjeta (Todo en un bloque unificado) -->
          <section aria-label="Detalles de autorización" class="space-y-4">
            <div class="flex items-center justify-between px-1">
              <h2 class="font-display text-sm font-bold uppercase tracking-wider text-fg flex items-center gap-2">
                <span class="size-5 rounded-full bg-cyan-500 text-neutral-900 text-[10px] grid place-items-center font-mono font-bold">2</span>
                <span>{{ metodoSeleccionado === 'TARJETA' ? 'Estudio y Autorización de Tarjeta' : 'Confirmación Daviplata' }}</span>
              </h2>
              <div class="flex items-center gap-1 text-[10px] font-mono text-success">
                <Lock class="size-3" />
                <span>Simulación Segura</span>
              </div>
            </div>

            <PaymentForm
              :metodo="metodoSeleccionado"
              :payment-card="paymentCard"
              :is-processing="isProcessing"
              :total-price="total"
              @submit-payment="onProcessPayment"
            />
          </section>
        </div>

        <!-- Columna Derecha: Pre-Factura Digital Streaming (5 columnas) -->
        <div class="lg:col-span-5 sticky top-24">
          <aside
            aria-label="Pre-factura digital"
            class="relative overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
          >
            <!-- Acento Holográfico Superior -->
            <div class="h-2 w-full bg-gradient-to-r from-brand-500 via-cyan-400 to-emerald-400" />

            <div class="p-6">
              <!-- Encabezado de la Pre-factura (Stitch Board 4) -->
              <div class="flex items-start justify-between border-b border-line/80 pb-4">
                <div>
                  <div class="flex items-center gap-1.5">
                    <Sparkles class="size-3.5 text-cyan-400" />
                    <span class="text-[10px] font-mono uppercase tracking-[0.25em] text-cyan-400 font-bold">
                      Pre-Factura Digital
                    </span>
                  </div>
                  <h3 class="font-display text-lg font-black tracking-tight text-fg mt-0.5">
                    Resumen de Compra
                  </h3>
                  <span class="text-[9px] font-mono text-muted/70 block mt-0.5">
                    StreamStore S.A.S. · NIT 901.234.567-8 · Bogotá
                  </span>
                </div>

                <div class="text-right">
                  <span class="block text-[9px] font-mono uppercase text-muted">Referencia</span>
                  <span class="font-mono text-xs font-bold text-fg">{{ refFactura }}</span>
                  <span class="block text-[10px] font-mono text-muted mt-0.5">{{ fechaFactura }}</span>
                </div>
              </div>

              <!-- Lista de Ítems del Pedido -->
              <div class="divide-y divide-line/40 my-4 max-h-72 overflow-y-auto pr-1">
                <div
                  v-for="item in items"
                  :key="item.id"
                  class="py-3 flex items-start justify-between text-xs gap-3"
                >
                  <div class="min-w-0 flex-1">
                    <p class="font-bold text-fg truncate text-sm">
                      {{ item.producto.nombre }}
                    </p>
                    <div class="flex items-center gap-2 mt-1 text-[11px] text-muted">
                      <span class="px-1.5 py-0.5 rounded bg-surface-2 border border-line font-mono text-[10px]">
                        {{ item.producto.tipo === 'CUENTA_COMPLETA' ? 'Cuenta Completa' : '1 Pantalla' }}
                      </span>
                      <span>{{ item.cantidad }}x · {{ item.producto.duracionDias }} días</span>
                    </div>
                  </div>

                  <span class="font-mono font-bold text-cyan-300 shrink-0 text-sm">
                    {{ formatPrice(item.subtotal) }}
                  </span>
                </div>
              </div>

              <!-- Desglose de Precios (Línea punteada de ticket) -->
              <div class="space-y-2 border-t-2 border-dashed border-line pt-4 text-xs">
                <div class="flex justify-between text-muted">
                  <span>Subtotal ({{ count }} productos):</span>
                  <span class="font-mono text-fg font-semibold">{{ formatPrice(total) }}</span>
                </div>
                <div class="flex justify-between text-muted">
                  <span>Impuestos (IVA 0% - Digital):</span>
                  <span class="font-mono text-fg font-semibold">$0 COP</span>
                </div>
                <div class="flex justify-between text-muted items-center">
                  <span>Entrega de credenciales:</span>
                  <span class="font-semibold text-success flex items-center gap-1.5 font-mono text-[11px]">
                    <span class="size-1.5 rounded-full bg-success animate-ping" />
                    Inmediata (en 5s)
                  </span>
                </div>
              </div>

              <!-- Total a Pagar -->
              <div class="my-5 flex items-baseline justify-between border-t border-line/80 pt-4">
                <div>
                  <span class="block font-display text-sm font-bold uppercase tracking-wider text-fg">
                    Total a Pagar
                  </span>
                  <span class="text-[10px] text-muted font-mono">Pesos Colombianos (COP)</span>
                </div>
                <span class="font-display text-3xl font-black text-fg tracking-tight text-white drop-shadow">
                  {{ formatPrice(total) }}
                </span>
              </div>

              <!-- Garantías del Servicio -->
              <div class="space-y-2">
                <div class="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3 text-[11px] text-emerald-200/90 flex items-start gap-2.5">
                  <ShieldCheck class="size-4 shrink-0 text-emerald-400 mt-0.5" aria-hidden="true" />
                  <div>
                    <strong class="font-semibold text-emerald-300">Garantía StreamStore:</strong>
                    Recibirás correo, clave y PIN asignado de forma instantánea en tu panel de cliente al aprobar la transacción.
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </div>
</template>
