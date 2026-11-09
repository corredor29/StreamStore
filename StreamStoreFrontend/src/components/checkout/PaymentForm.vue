<script setup lang="ts">
import { computed, reactive } from 'vue'
import { CARD_BANKS, type MarcaTarjeta, type MetodoPago } from '@/types'
import type { usePaymentCard } from '@/composables/usePaymentCard'
import PaymentCard3D from './PaymentCard3D.vue'
import { CreditCard, RotateCcw, Smartphone } from '@lucide/vue'
import { formatPrice } from '@/composables/useFormat'

const props = defineProps<{
  metodo: MetodoPago
  paymentCard: ReturnType<typeof usePaymentCard>
  isProcessing: boolean
  totalPrice?: number
}>()

const emit = defineEmits<{
  submitPayment: [payload: { metodo: MetodoPago; marca?: MarcaTarjeta; ultimos4?: string }]
  'update:metodo': [metodo: MetodoPago]
}>()

const {
  card,
  brand,
  bankSkin,
  cardKind,
  isFlipped,
  displayNumero,
  displayNombre,
  displayExpiracion,
  displayCvv,
  setNumero,
  setNombre,
  setExpiracion,
  setCvv,
  flipToBack,
  flipToFront,
  toggleFlip,
  setBankSkin,
} = props.paymentCard

// Estado para Nequi
const nequi = reactive({
  celular: '',
  codigoOtp: '',
})

const errors = reactive<Record<string, string>>({
  numero: '',
  nombre: '',
  expiracion: '',
  cvv: '',
  celular: '',
  codigoOtp: '',
})

// Presentación de expiración en formato MM/AA
const expiracionDisplay = computed(() => {
  if (!card.mes && !card.anio) return ''
  return card.anio ? `${card.mes}/${card.anio}` : card.mes
})

// Control inteligente de enfoque según la disposición física de cada banco:
// - Bancolombia: Número, Titular, Vence y CVC van todos impresos al reverso.
// - Nu: Número, Válida hasta y CVC van al reverso; el Titular va en el frente.
// - Genérica y BBVA: Número, Titular y Vence van en el frente; el CVC va al reverso.
// Enfoque visual: todas las tarjetas muestran siempre el frente al escribir número, titular o fecha.
// Solo giran hacia el reverso cuando el usuario se posiciona en el campo CVV.
function onFocusNumero() {
  flipToFront()
}

function onFocusTitular() {
  flipToFront()
}

function onFocusExpiracion() {
  flipToFront()
}

function onFocusCvv() {
  flipToBack()
}

function onBlurCvv() {
  flipToFront()
}

// Filtros estrictos de entrada:
// 1. Número de tarjeta: SOLO dígitos numéricos
function handleNumeroInput(e: Event) {
  const target = e.target as HTMLInputElement
  const clean = target.value.replace(/\D/g, '').slice(0, 16)
  target.value = clean
  setNumero(clean)
  if (errors.numero) errors.numero = ''
}

// 2. Titular: SOLO letras y espacios (cero números)
function handleNombreInput(e: Event) {
  const target = e.target as HTMLInputElement
  const clean = target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '').slice(0, 30)
  target.value = clean
  setNombre(clean)
  if (errors.nombre) errors.nombre = ''
}

// 3. Expiración: Detecta 4 números (ej: 0234) y los convierte automáticamente en "02/34"
function handleExpiracionInput(e: Event) {
  const target = e.target as HTMLInputElement
  const digits = target.value.replace(/\D/g, '').slice(0, 4)
  if (digits.length <= 2) {
    setExpiracion(digits)
    target.value = digits
  } else {
    const mm = digits.slice(0, 2)
    const aa = digits.slice(2, 4)
    setExpiracion(digits)
    target.value = `${mm}/${aa}`
  }
  if (errors.expiracion) errors.expiracion = ''
}

// 4. CVV: SOLO números
function handleCvvInput(e: Event) {
  const target = e.target as HTMLInputElement
  const clean = target.value.replace(/\D/g, '').slice(0, 4)
  target.value = clean
  setCvv(clean)
  if (errors.cvv) errors.cvv = ''
}

// 5. Celular Nequi: SOLO números (10 dígitos)
function handleNequiCelular(e: Event) {
  const target = e.target as HTMLInputElement
  const clean = target.value.replace(/\D/g, '').slice(0, 10)
  target.value = clean
  nequi.celular = clean
  if (errors.celular) errors.celular = ''
}

// 6. Clave dinámica Nequi: SOLO números
function handleNequiOtp(e: Event) {
  const target = e.target as HTMLInputElement
  const clean = target.value.replace(/\D/g, '').slice(0, 6)
  target.value = clean
  nequi.codigoOtp = clean
  if (errors.codigoOtp) errors.codigoOtp = ''
}

function validateAndSubmit() {
  Object.keys(errors).forEach((k) => (errors[k] = ''))

  if (props.metodo === 'TARJETA') {
    const rawNum = card.numero.replace(/\D/g, '')
    const minLength = brand.value === 'amex' ? 15 : 16

    if (!rawNum || rawNum.length < minLength) {
      errors.numero = `Número de tarjeta incompleto (${minLength} dígitos).`
    }
    if (!card.nombre.trim() || card.nombre.trim().length < 3) {
      errors.nombre = 'Ingresa el nombre del titular.'
    }
    const mesNum = parseInt(card.mes, 10)
    if (!card.mes || isNaN(mesNum) || mesNum < 1 || mesNum > 12 || !card.anio || card.anio.length < 2) {
      errors.expiracion = 'Fecha inválida (MM/AA).'
    }
    const minCvv = brand.value === 'amex' ? 4 : 3
    if (!card.cvv || card.cvv.length < minCvv) {
      errors.cvv = `CVV incompleto (${minCvv} dígitos).`
    }

    if (Object.values(errors).some(Boolean)) return

    emit('submitPayment', {
      metodo: 'TARJETA',
      marca: brand.value,
      ultimos4: rawNum.slice(-4),
    })
  } else {
    const cleanCel = nequi.celular.replace(/\D/g, '')
    if (!cleanCel || cleanCel.length < 10) {
      errors.celular = 'Ingresa tu número celular Nequi de 10 dígitos.'
    }
    if (!nequi.codigoOtp || nequi.codigoOtp.length < 4) {
      errors.codigoOtp = 'Ingresa tu clave dinámica o código de confirmación (4 a 6 dígitos).'
    }

    if (Object.values(errors).some(Boolean)) return

    emit('submitPayment', {
      metodo: 'NEQUI',
      ultimos4: cleanCel.slice(-4),
    })
  }
}
</script>

<template>
  <form class="space-y-6" novalidate @submit.prevent="validateAndSubmit">
    <!-- ================= MÉTODO DE PAGO (radios reales: teclado con flechas) ================= -->
    <fieldset>
      <legend class="ss-title ss-h2 text-white">Método de pago</legend>
      <p class="mt-1 text-sm text-[#a9b1cc]">Elige cómo quieres pagar.</p>

      <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label
          class="flex min-h-[4.5rem] cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#2dd4ef]"
          :class="metodo === 'NEQUI' ? 'border-[#ff4fa3] bg-[#ff4fa3]/10' : 'border-white/15 hover:border-white/35'"
        >
          <input
            type="radio"
            name="metodo-pago"
            value="NEQUI"
            class="sr-only"
            :checked="metodo === 'NEQUI'"
            @change="emit('update:metodo', 'NEQUI')"
          />
          <Smartphone class="size-6 shrink-0 text-[#ff8cc4]" aria-hidden="true" />
          <span class="min-w-0 flex-1">
            <span class="block font-bold text-white">Nequi</span>
            <span class="block text-sm text-[#a9b1cc]">Celular y clave dinámica</span>
          </span>
          <span
            class="grid size-5 shrink-0 place-items-center rounded-full border-2"
            :class="metodo === 'NEQUI' ? 'border-[#ff4fa3]' : 'border-white/40'"
            aria-hidden="true"
          >
            <span v-if="metodo === 'NEQUI'" class="size-2.5 rounded-full bg-[#ff4fa3]" />
          </span>
        </label>

        <label
          class="flex min-h-[4.5rem] cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#2dd4ef]"
          :class="metodo === 'TARJETA' ? 'border-[#2dd4ef] bg-[#2dd4ef]/10' : 'border-white/15 hover:border-white/35'"
        >
          <input
            type="radio"
            name="metodo-pago"
            value="TARJETA"
            class="sr-only"
            :checked="metodo === 'TARJETA'"
            @change="emit('update:metodo', 'TARJETA')"
          />
          <CreditCard class="size-6 shrink-0 text-[#7ee8f8]" aria-hidden="true" />
          <span class="min-w-0 flex-1">
            <span class="block font-bold text-white">Tarjeta débito</span>
            <span class="block text-sm text-[#a9b1cc]">Bancolombia, Nu, BBVA u otra</span>
          </span>
          <span
            class="grid size-5 shrink-0 place-items-center rounded-full border-2"
            :class="metodo === 'TARJETA' ? 'border-[#2dd4ef]' : 'border-white/40'"
            aria-hidden="true"
          >
            <span v-if="metodo === 'TARJETA'" class="size-2.5 rounded-full bg-[#2dd4ef]" />
          </span>
        </label>
      </div>
    </fieldset>

    <!-- ================= FLUJO TARJETA DÉBITO ================= -->
    <div v-if="metodo === 'TARJETA'" class="space-y-5">
      <fieldset>
        <legend class="ss-label">Banco de la tarjeta</legend>
        <p class="ss-help mt-0.5">Solo cambia el diseño de la vista previa.</p>
        <div class="mt-2 grid grid-cols-2 gap-2 min-[480px]:grid-cols-4">
          <button
            v-for="banco in CARD_BANKS"
            :key="banco.id"
            type="button"
            class="flex min-h-12 flex-col items-center justify-center rounded-lg border px-2 py-1.5 text-center transition-colors"
            :class="bankSkin === banco.id ? 'bg-white/[0.07] text-white' : 'border-white/15 text-[#c9cfe4] hover:border-white/35'"
            :style="{ borderColor: bankSkin === banco.id ? banco.accent : undefined }"
            :aria-pressed="bankSkin === banco.id"
            @click="setBankSkin(banco.id)"
          >
            <span class="w-full truncate text-sm font-bold">{{ banco.label }}</span>
            <span class="w-full truncate text-xs text-[#a9b1cc]">{{ banco.hint }}</span>
          </button>
        </div>
      </fieldset>

      <!-- Vista previa de la tarjeta: decorativa, los datos se escriben en los campos -->
      <div class="rounded-2xl border border-white/10 bg-[#0a0d1c] px-4 py-6 sm:px-8">
        <PaymentCard3D
          :brand="brand"
          :bank-skin="bankSkin"
          :card-kind="cardKind"
          :display-numero="displayNumero"
          :display-nombre="displayNombre"
          :display-expiracion="displayExpiracion"
          :display-cvv="displayCvv"
          :is-flipped="isFlipped"
          @toggle-flip="toggleFlip"
        />
        <div class="mx-auto mt-4 flex max-w-[400px] justify-center">
          <button
            type="button"
            class="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-[#d7dcf0] hover:bg-white/5 hover:text-white"
            @click="toggleFlip"
          >
            <RotateCcw class="size-4" aria-hidden="true" />
            {{ isFlipped ? 'Ver el frente de la tarjeta' : 'Ver el reverso de la tarjeta' }}
          </button>
        </div>
      </div>

      <div class="ss-field">
        <label for="card-number" class="ss-label">Número de tarjeta</label>
        <input
          id="card-number"
          :value="card.numero"
          type="text"
          inputmode="numeric"
          placeholder="0000 0000 0000 0000"
          autocomplete="cc-number"
          class="ss-input tracking-wider"
          :aria-invalid="!!errors.numero"
          :aria-describedby="errors.numero ? 'card-number-error' : undefined"
          @input="handleNumeroInput"
          @focus="onFocusNumero"
        />
        <p v-if="errors.numero" id="card-number-error" class="ss-error">{{ errors.numero }}</p>
      </div>

      <div class="ss-field">
        <label for="card-holder" class="ss-label">Nombre del titular</label>
        <input
          id="card-holder"
          :value="card.nombre"
          type="text"
          placeholder="Como aparece en la tarjeta"
          autocomplete="cc-name"
          class="ss-input"
          :aria-invalid="!!errors.nombre"
          :aria-describedby="errors.nombre ? 'card-holder-error' : 'card-holder-help'"
          @input="handleNombreInput"
          @focus="onFocusTitular"
        />
        <p v-if="errors.nombre" id="card-holder-error" class="ss-error">{{ errors.nombre }}</p>
        <p v-else id="card-holder-help" class="ss-help">Solo letras y espacios.</p>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="ss-field content-start">
          <label for="card-expiry" class="ss-label">Vencimiento</label>
          <input
            id="card-expiry"
            :value="expiracionDisplay"
            type="text"
            inputmode="numeric"
            placeholder="MM/AA"
            maxlength="5"
            autocomplete="cc-exp"
            class="ss-input"
            :aria-invalid="!!errors.expiracion"
            :aria-describedby="errors.expiracion ? 'card-expiry-error' : undefined"
            @input="handleExpiracionInput"
            @focus="onFocusExpiracion"
          />
          <p v-if="errors.expiracion" id="card-expiry-error" class="ss-error">{{ errors.expiracion }}</p>
        </div>

        <div class="ss-field content-start">
          <label for="card-cvv" class="ss-label">Código de seguridad</label>
          <input
            id="card-cvv"
            :value="card.cvv"
            type="password"
            inputmode="numeric"
            placeholder="CVV"
            maxlength="4"
            autocomplete="cc-csc"
            class="ss-input"
            :aria-invalid="!!errors.cvv"
            :aria-describedby="errors.cvv ? 'card-cvv-error' : 'card-cvv-help'"
            @input="handleCvvInput"
            @focus="onFocusCvv"
            @blur="onBlurCvv"
          />
          <p v-if="errors.cvv" id="card-cvv-error" class="ss-error">{{ errors.cvv }}</p>
          <p v-else id="card-cvv-help" class="ss-help">3 o 4 dígitos al reverso.</p>
        </div>
      </div>
    </div>

    <!-- ================= FLUJO NEQUI ================= -->
    <div v-else class="space-y-5">
      <p class="rounded-xl border border-[#ff4fa3]/35 bg-[#ff4fa3]/10 p-4 text-sm leading-relaxed text-[#ffd6ea]">
        Escribe el celular de tu cuenta Nequi y la clave dinámica que aparece en la app.
      </p>

      <div class="ss-field">
        <label for="nequi-cel" class="ss-label">Celular Nequi</label>
        <input
          id="nequi-cel"
          :value="nequi.celular"
          type="tel"
          inputmode="numeric"
          placeholder="300 123 4567"
          maxlength="10"
          autocomplete="tel-national"
          class="ss-input"
          :aria-invalid="!!errors.celular"
          :aria-describedby="errors.celular ? 'nequi-cel-error' : 'nequi-cel-help'"
          @input="handleNequiCelular"
        />
        <p v-if="errors.celular" id="nequi-cel-error" class="ss-error">{{ errors.celular }}</p>
        <p v-else id="nequi-cel-help" class="ss-help">10 dígitos, sin espacios.</p>
      </div>

      <div class="ss-field">
        <label for="nequi-otp" class="ss-label">Clave dinámica</label>
        <input
          id="nequi-otp"
          :value="nequi.codigoOtp"
          type="password"
          inputmode="numeric"
          placeholder="••••••"
          maxlength="6"
          autocomplete="one-time-code"
          class="ss-input tracking-[0.3em]"
          :aria-invalid="!!errors.codigoOtp"
          :aria-describedby="errors.codigoOtp ? 'nequi-otp-error' : 'nequi-otp-help'"
          @input="handleNequiOtp"
        />
        <p v-if="errors.codigoOtp" id="nequi-otp-error" class="ss-error">{{ errors.codigoOtp }}</p>
        <p v-else id="nequi-otp-help" class="ss-help">De 4 a 6 dígitos.</p>
      </div>
    </div>

    <div class="border-t border-white/10 pt-5">
      <button type="submit" class="ss-btn ss-btn-primary ss-btn-block min-h-12 text-base" :disabled="isProcessing" :aria-busy="isProcessing">
        <span v-if="isProcessing" class="ss-spinner" aria-hidden="true" />
        <template v-if="isProcessing">Procesando pago…</template>
        <template v-else>Pagar{{ totalPrice ? ` ${formatPrice(totalPrice)}` : '' }}</template>
      </button>
      <p class="mt-3 text-center text-sm text-[#a9b1cc]">Tus credenciales aparecen en Mi cuenta cuando se aprueba el pago.</p>
    </div>
  </form>
</template>
