<script setup lang="ts">
import { computed, reactive } from 'vue'
import {
  Calendar,
  CreditCard,
  Info,
  Lock,
  RotateCw,
  ShieldCheck,
  Smartphone,
  Sparkles,
  User,
} from '@lucide/vue'
import { CARD_BANK_SKINS, type CardBankSkin, type MarcaTarjeta, type MetodoPago } from '@/types'
import type { usePaymentCard } from '@/composables/usePaymentCard'
import PaymentCard3D from './PaymentCard3D.vue'
import { formatPrice } from '@/composables/useFormat'

const props = defineProps<{
  metodo: MetodoPago
  paymentCard: ReturnType<typeof usePaymentCard>
  isProcessing: boolean
  totalPrice?: number
}>()

const emit = defineEmits<{
  submitPayment: [payload: { metodo: MetodoPago; marca?: MarcaTarjeta; ultimos4?: string }]
}>()

const {
  card,
  brand,
  bankSkin,
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
  setTestCard,
  setBankSkin,
} = props.paymentCard

// Estado para Daviplata
const daviplata = reactive({
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

const expiracionInput = computed({
  get: () => {
    if (!card.mes && !card.anio) return ''
    return `${card.mes}${card.anio ? '/' + card.anio : ''}`
  },
  set: (val: string) => {
    setExpiracion(val)
  },
})

function fillDaviplataDemo() {
  daviplata.celular = '3001234567'
  daviplata.codigoOtp = '1234'
  errors.celular = ''
  errors.codigoOtp = ''
}

function validateAndSubmit() {
  // Limpiar errores previos
  Object.keys(errors).forEach((k) => (errors[k] = ''))

  if (props.metodo === 'TARJETA') {
    const rawNum = card.numero.replace(/\D/g, '')
    const minLength = brand.value === 'amex' ? 15 : 16

    if (!rawNum || rawNum.length < minLength) {
      errors.numero = `Ingresa un número de tarjeta válido (${minLength} dígitos).`
    }
    if (!card.nombre.trim() || card.nombre.trim().length < 3) {
      errors.nombre = 'Ingresa el nombre del titular tal como figura en el plástico.'
    }
    const mesNum = parseInt(card.mes, 10)
    if (!card.mes || isNaN(mesNum) || mesNum < 1 || mesNum > 12 || !card.anio || card.anio.length < 2) {
      errors.expiracion = 'Fecha inválida (MM/AA).'
    }
    const minCvv = brand.value === 'amex' ? 4 : 3
    if (!card.cvv || card.cvv.length < minCvv) {
      errors.cvv = `CVV debe contener ${minCvv} dígitos.`
    }

    if (Object.values(errors).some(Boolean)) return

    emit('submitPayment', {
      metodo: 'TARJETA',
      marca: brand.value,
      ultimos4: rawNum.slice(-4),
    })
  } else {
    // Daviplata
    const cleanCel = daviplata.celular.replace(/\D/g, '')
    if (!cleanCel || cleanCel.length < 10) {
      errors.celular = 'Ingresa un número de celular de 10 dígitos.'
    }
    if (!daviplata.codigoOtp || daviplata.codigoOtp.length < 4) {
      errors.codigoOtp = 'Ingresa el código OTP de 4 dígitos.'
    }

    if (Object.values(errors).some(Boolean)) return

    emit('submitPayment', {
      metodo: 'DAVIPLATA',
      ultimos4: cleanCel.slice(-4),
    })
  }
}
</script>

<template>
  <div>
    <!-- ================= FLUJO TARJETA ================= -->
    <div v-if="metodo === 'TARJETA'" class="space-y-6">
      <!-- ESCENARIO DE LA TARJETA 3D (Card Studio) -->
      <div class="relative overflow-hidden rounded-2xl border border-line bg-surface-2/40 p-4 sm:p-6 backdrop-blur-sm shadow-xl">
        <!-- Barra de herramientas superior del Card Studio -->
        <div class="mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-line/60 pb-3">
          <!-- Selector de Banco / Piel -->
          <div class="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            <span class="text-[10px] font-mono uppercase tracking-wider text-muted shrink-0 mr-1">
              Diseño:
            </span>
            <button
              v-for="skin in CARD_BANK_SKINS"
              :key="skin.id"
              type="button"
              class="px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 shrink-0 border"
              :class="
                bankSkin === skin.id
                  ? 'border-brand-400 bg-brand-500/25 text-white font-bold shadow-sm'
                  : 'border-transparent bg-surface text-muted hover:text-fg hover:border-line'
              "
              @click="setBankSkin(skin.id as CardBankSkin)"
            >
              {{ skin.label }}
            </button>
          </div>

          <!-- Botón de volteo manual 3D -->
          <button
            type="button"
            class="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-300 hover:text-cyan-200 transition-colors bg-cyan-950/40 border border-cyan-500/30 px-3 py-1 rounded-lg shrink-0 self-end sm:self-auto"
            @click="toggleFlip"
          >
            <RotateCw class="size-3.5 transition-transform duration-500" :class="{ 'rotate-180': isFlipped }" aria-hidden="true" />
            <span>{{ isFlipped ? 'Ver Frontal' : 'Ver Reverso (CVV)' }}</span>
          </button>
        </div>

        <!-- Componente 3D interactivo -->
        <div class="py-2">
          <PaymentCard3D
            :brand="brand"
            :bank-skin="bankSkin"
            :display-numero="displayNumero"
            :display-nombre="displayNombre"
            :display-expiracion="displayExpiracion"
            :display-cvv="displayCvv"
            :is-flipped="isFlipped"
            @toggle-flip="toggleFlip"
          />
        </div>

        <!-- Barra inferior de accesos rápidos de prueba (1-Clic) -->
        <div class="mt-4 pt-3 border-t border-line/60">
          <div class="flex items-center gap-1.5 text-xs text-muted mb-2">
            <Sparkles class="size-3.5 text-brand-300" aria-hidden="true" />
            <span class="font-medium text-fg text-[11px]">Tarjetas de prueba rápida:</span>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <button
              type="button"
              class="px-2 py-1 rounded-md text-[11px] font-mono border border-line bg-surface text-fg hover:border-brand-400 hover:text-brand-300 transition-colors"
              @click="setTestCard('visa')"
            >
              Visa Demo
            </button>
            <button
              type="button"
              class="px-2 py-1 rounded-md text-[11px] font-mono border border-line bg-surface text-fg hover:border-brand-400 hover:text-brand-300 transition-colors"
              @click="setTestCard('mastercard')"
            >
              Mastercard Demo
            </button>
            <button
              type="button"
              class="px-2 py-1 rounded-md text-[11px] font-mono border border-purple-500/30 bg-purple-950/30 text-purple-200 hover:border-purple-400 transition-colors"
              @click="setTestCard('nu')"
            >
              🟣 Nu Bank
            </button>
            <button
              type="button"
              class="px-2 py-1 rounded-md text-[11px] font-mono border border-yellow-500/30 bg-yellow-950/30 text-yellow-200 hover:border-yellow-400 transition-colors"
              @click="setTestCard('bancolombia')"
            >
              🟡 Bancolombia
            </button>
            <button
              type="button"
              class="px-2 py-1 rounded-md text-[11px] font-mono border border-emerald-500/30 bg-emerald-950/30 text-emerald-200 hover:border-emerald-400 transition-colors"
              @click="setTestCard('falabella')"
            >
              🟢 Falabella CMR
            </button>
            <button
              type="button"
              class="px-2 py-1 rounded-md text-[11px] font-mono border border-blue-500/30 bg-blue-950/30 text-blue-200 hover:border-blue-400 transition-colors"
              @click="setTestCard('bbva')"
            >
              🔵 BBVA Aqua
            </button>
            <button
              type="button"
              class="px-2 py-1 rounded-md text-[11px] font-mono border border-line bg-surface text-fg hover:border-brand-400 hover:text-brand-300 transition-colors"
              @click="setTestCard('amex')"
            >
              Amex 15d
            </button>
            <button
              type="button"
              class="px-2 py-1 rounded-md text-[11px] font-mono border border-danger/40 bg-danger/10 text-danger hover:border-danger transition-colors"
              @click="setTestCard('rejected')"
            >
              Rechazo Demo
            </button>
          </div>
        </div>
      </div>

      <!-- FORMULARIO DE ENTRADA DE DATOS -->
      <div class="rounded-2xl border border-line bg-surface p-5 sm:p-6 space-y-4 shadow-sm">
        <h3 class="font-display text-sm font-bold uppercase tracking-wider text-fg flex items-center justify-between border-b border-line/60 pb-3">
          <span>Detalles del Plástico</span>
          <span class="text-[10px] font-mono text-muted normal-case flex items-center gap-1">
            <ShieldCheck class="size-3.5 text-success" />
            Cifrado TLS 256-Bit
          </span>
        </h3>

        <!-- Número de Tarjeta -->
        <div>
          <label for="card-number" class="field-label flex items-center justify-between">
            <span>Número de tarjeta</span>
            <span v-if="brand !== 'generic'" class="text-[10px] font-mono uppercase text-brand-300 font-bold">
              Franquicia: {{ brand }}
            </span>
          </label>
          <div class="relative">
            <input
              id="card-number"
              :value="card.numero"
              type="text"
              inputmode="numeric"
              placeholder="•••• •••• •••• ••••"
              autocomplete="cc-number"
              class="field-input pl-10 font-mono tracking-widest text-base"
              :aria-invalid="!!errors.numero"
              :aria-describedby="errors.numero ? 'card-number-error' : undefined"
              @input="(e) => setNumero((e.target as HTMLInputElement).value)"
              @focus="flipToFront"
            />
            <CreditCard class="absolute left-3 top-3.5 size-4 text-muted" aria-hidden="true" />
          </div>
          <p v-if="errors.numero" id="card-number-error" class="field-error mt-1 text-xs text-danger" role="alert">
            {{ errors.numero }}
          </p>
        </div>

        <!-- Nombre del Titular -->
        <div>
          <label for="card-holder" class="field-label">Nombre del titular</label>
          <div class="relative">
            <input
              id="card-holder"
              :value="card.nombre"
              type="text"
              placeholder="Ej: MARÍA GÓMEZ"
              autocomplete="cc-name"
              class="field-input pl-10 uppercase tracking-wide"
              :aria-invalid="!!errors.nombre"
              :aria-describedby="errors.nombre ? 'card-holder-error' : undefined"
              @input="(e) => setNombre((e.target as HTMLInputElement).value)"
              @focus="flipToFront"
            />
            <User class="absolute left-3 top-3.5 size-4 text-muted" aria-hidden="true" />
          </div>
          <p v-if="errors.nombre" id="card-holder-error" class="field-error mt-1 text-xs text-danger" role="alert">
            {{ errors.nombre }}
          </p>
        </div>

        <!-- Grid: Expiración y CVV -->
        <div class="grid grid-cols-2 gap-4">
          <!-- Expiración MM/AA -->
          <div>
            <label for="card-expiry" class="field-label">Expiración (MM/AA)</label>
            <div class="relative">
              <input
                id="card-expiry"
                v-model="expiracionInput"
                type="text"
                placeholder="MM/AA"
                maxlength="5"
                autocomplete="cc-exp"
                class="field-input pl-10 text-center font-mono tracking-wider"
                :aria-invalid="!!errors.expiracion"
                :aria-describedby="errors.expiracion ? 'card-expiry-error' : undefined"
                @focus="flipToFront"
              />
              <Calendar class="absolute left-3 top-3.5 size-4 text-muted" aria-hidden="true" />
            </div>
            <p v-if="errors.expiracion" id="card-expiry-error" class="field-error mt-1 text-xs text-danger" role="alert">
              {{ errors.expiracion }}
            </p>
          </div>

          <!-- CVV (Gira la tarjeta al reverso al recibir foco) -->
          <div>
            <label for="card-cvv" class="field-label flex items-center justify-between">
              <span>CVV / CVC</span>
              <span class="text-[10px] text-muted">Reverso</span>
            </label>
            <div class="relative">
              <input
                id="card-cvv"
                :value="card.cvv"
                type="password"
                inputmode="numeric"
                :placeholder="brand === 'amex' ? '••••' : '•••'"
                :maxlength="brand === 'amex' ? 4 : 3"
                autocomplete="cc-csc"
                class="field-input pl-10 text-center font-mono tracking-widest"
                :aria-invalid="!!errors.cvv"
                :aria-describedby="errors.cvv ? 'card-cvv-error' : undefined"
                @input="(e) => setCvv((e.target as HTMLInputElement).value)"
                @focus="flipToBack"
                @blur="flipToFront"
              />
              <Lock class="absolute left-3 top-3.5 size-4 text-muted" aria-hidden="true" />
            </div>
            <p v-if="errors.cvv" id="card-cvv-error" class="field-error mt-1 text-xs text-danger" role="alert">
              {{ errors.cvv }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= FLUJO DAVIPLATA ================= -->
    <div v-else class="space-y-6">
      <div class="rounded-2xl border border-red-500/30 bg-red-950/20 p-5 sm:p-6 space-y-4 shadow-sm">
        <div class="flex items-center justify-between border-b border-red-500/20 pb-3">
          <div class="flex items-center gap-2">
            <div class="size-3 rounded-full bg-red-500 animate-pulse" />
            <span class="font-display font-bold text-red-200">Pasarela Móvil Daviplata</span>
          </div>
          <button
            type="button"
            class="text-[11px] font-mono text-red-300 hover:text-white underline"
            @click="fillDaviplataDemo"
          >
            Auto-completar Demo
          </button>
        </div>

        <p class="text-xs text-red-200/80 leading-relaxed">
          Ingresa el número celular asociado a tu monedero Daviplata. Recibirás un código OTP simulado de 4 dígitos para confirmar el débito.
        </p>

        <!-- Celular Daviplata -->
        <div>
          <label for="daviplata-cel" class="field-label text-red-100">Número celular Daviplata</label>
          <div class="relative">
            <input
              id="daviplata-cel"
              v-model="daviplata.celular"
              type="tel"
              placeholder="300 123 4567"
              maxlength="10"
              class="field-input pl-10 font-mono tracking-wider"
              :aria-invalid="!!errors.celular"
              :aria-describedby="errors.celular ? 'daviplata-cel-error' : undefined"
            />
            <Smartphone class="absolute left-3 top-3.5 size-4 text-red-300" aria-hidden="true" />
          </div>
          <p v-if="errors.celular" id="daviplata-cel-error" class="field-error mt-1 text-xs text-danger" role="alert">
            {{ errors.celular }}
          </p>
        </div>

        <!-- OTP Daviplata -->
        <div>
          <label for="daviplata-otp" class="field-label text-red-100">Código de Confirmación OTP</label>
          <div class="relative">
            <input
              id="daviplata-otp"
              v-model="daviplata.codigoOtp"
              type="password"
              placeholder="••••"
              maxlength="6"
              class="field-input pl-10 font-mono tracking-widest text-center text-lg"
              :aria-invalid="!!errors.codigoOtp"
              :aria-describedby="errors.codigoOtp ? 'daviplata-otp-error' : undefined"
            />
            <Lock class="absolute left-3 top-3.5 size-4 text-red-300" aria-hidden="true" />
          </div>
          <p v-if="errors.codigoOtp" id="daviplata-otp-error" class="field-error mt-1 text-xs text-danger" role="alert">
            {{ errors.codigoOtp }}
          </p>
        </div>
      </div>
    </div>

    <!-- BANNER DE SIMULACIÓN EDUCATIVA Y SEGURIDAD -->
    <div class="mt-5 rounded-xl border border-cyan-500/25 bg-cyan-950/25 p-3 text-[11px] text-cyan-200/90 leading-relaxed flex items-start gap-2.5">
      <Info class="size-4 shrink-0 text-cyan-400 mt-0.5" aria-hidden="true" />
      <div>
        <strong class="font-semibold text-cyan-300">Ambiente de Demostración Segura:</strong>
        Todos los pagos son simulados. El número de tarjeta y CVV solo se renderizan de manera visual en la tarjeta 3D en tu navegador. No se efectúan cargos reales a cuentas bancarias.
      </div>
    </div>

    <!-- BOTÓN DE ACCIÓN PRINCIPAL (CTA) -->
    <button
      type="button"
      class="btn-primary mt-6 w-full py-4 text-base font-extrabold tracking-wide uppercase shadow-lg shadow-brand-500/25 relative overflow-hidden group"
      :disabled="isProcessing"
      :aria-busy="isProcessing"
      @click="validateAndSubmit"
    >
      <span class="relative z-10 flex items-center justify-center gap-2">
        <template v-if="isProcessing">
          <span class="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          <span>Procesando autorización...</span>
        </template>
        <template v-else>
          <span>Autorizar y Activar Credenciales</span>
          <span v-if="totalPrice" class="font-mono text-brand-200">
            · {{ formatPrice(totalPrice) }}
          </span>
        </template>
      </span>
      <div class="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
    </button>
  </div>
</template>
