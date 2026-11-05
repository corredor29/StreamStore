<script setup lang="ts">
import { computed, reactive } from 'vue'
import { Calendar, CreditCard, Info, Lock, Smartphone, Sparkles, User } from '@lucide/vue'
import { CARD_BANK_SKINS, type CardBankSkin, type MarcaTarjeta, type MetodoPago } from '@/types'
import type { usePaymentCard } from '@/composables/usePaymentCard'

const props = defineProps<{
  metodo: MetodoPago
  paymentCard: ReturnType<typeof usePaymentCard>
  isProcessing: boolean
}>()

const emit = defineEmits<{
  submitPayment: [payload: { metodo: MetodoPago; marca?: MarcaTarjeta; ultimos4?: string }]
}>()

const {
  card,
  brand,
  bankSkin,
  setNumero,
  setNombre,
  setExpiracion,
  setCvv,
  flipToBack,
  flipToFront,
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
  // Limpiar errores
  Object.keys(errors).forEach((k) => (errors[k] = ''))

  if (props.metodo === 'TARJETA') {
    const rawNum = card.numero.replace(/\D/g, '')
    const minLength = brand.value === 'amex' ? 15 : 16

    if (!rawNum || rawNum.length < minLength) {
      errors.numero = `Ingresa un número de tarjeta de prueba válido (${minLength} dígitos).`
    }
    if (!card.nombre.trim() || card.nombre.trim().length < 3) {
      errors.nombre = 'Ingresa el nombre del titular.'
    }
    const mesNum = parseInt(card.mes, 10)
    if (!card.mes || isNaN(mesNum) || mesNum < 1 || mesNum > 12 || !card.anio || card.anio.length < 2) {
      errors.expiracion = 'Ingresa una fecha válida (MM/AA).'
    }
    const minCvv = brand.value === 'amex' ? 4 : 3
    if (!card.cvv || card.cvv.length < minCvv) {
      errors.cvv = `CVV debe tener ${minCvv} dígitos.`
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
      errors.codigoOtp = 'Ingresa el código OTP de prueba (4 dígitos).'
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
    <!-- ================= FORMULARIO TARJETA ================= -->
    <div v-if="metodo === 'TARJETA'" class="space-y-4">
      <!-- Selector de Piel de Banco (Inspirado en SmartInventory) -->
      <div>
        <label class="field-label flex items-center justify-between">
          <span>Diseño visual de tarjeta (Skin):</span>
          <span class="text-[10px] text-muted">Personaliza la previsualización 3D</span>
        </label>
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          <button
            v-for="skin in CARD_BANK_SKINS"
            :key="skin.id"
            type="button"
            class="flex flex-col items-center justify-center p-2 rounded-xl border text-xs transition-all duration-200"
            :class="
              bankSkin === skin.id
                ? 'border-brand-400 bg-brand-500/15 font-bold text-fg shadow-sm scale-[1.02]'
                : 'border-line bg-surface hover:border-brand-400/40 text-muted hover:text-fg'
            "
            @click="setBankSkin(skin.id as CardBankSkin)"
          >
            <span class="truncate">{{ skin.label }}</span>
            <span class="text-[9px] opacity-70">{{ skin.hint }}</span>
          </button>
        </div>
      </div>

      <!-- Accesos rápidos de tarjetas de prueba -->
      <div class="rounded-xl border border-brand-400/30 bg-surface-2 p-3 text-xs">
        <div class="flex items-center gap-1.5 font-semibold text-brand-200">
          <Sparkles class="size-3.5" aria-hidden="true" />
          <span>Tarjetas de prueba colombianas e internacionales (1-Clic):</span>
        </div>
        <div class="mt-2.5 flex flex-wrap gap-1.5">
          <button
            type="button"
            class="rounded-lg border border-line bg-surface px-2 py-1 text-[11px] text-fg hover:border-brand-400 transition-colors"
            @click="setTestCard('visa')"
          >
            💳 Visa Clásica
          </button>
          <button
            type="button"
            class="rounded-lg border border-line bg-surface px-2 py-1 text-[11px] text-fg hover:border-brand-400 transition-colors"
            @click="setTestCard('mastercard')"
          >
            💳 Mastercard
          </button>
          <button
            type="button"
            class="rounded-lg border border-purple-500/30 bg-purple-950/20 px-2 py-1 text-[11px] text-purple-200 hover:border-purple-400 transition-colors"
            @click="setTestCard('nu')"
          >
            🟣 Nu Bank
          </button>
          <button
            type="button"
            class="rounded-lg border border-yellow-500/30 bg-yellow-950/20 px-2 py-1 text-[11px] text-yellow-200 hover:border-yellow-400 transition-colors"
            @click="setTestCard('bancolombia')"
          >
            🟡 Bancolombia
          </button>
          <button
            type="button"
            class="rounded-lg border border-emerald-500/30 bg-emerald-950/20 px-2 py-1 text-[11px] text-emerald-200 hover:border-emerald-400 transition-colors"
            @click="setTestCard('falabella')"
          >
            🟢 CMR Falabella
          </button>
          <button
            type="button"
            class="rounded-lg border border-blue-500/30 bg-blue-950/20 px-2 py-1 text-[11px] text-blue-200 hover:border-blue-400 transition-colors"
            @click="setTestCard('bbva')"
          >
            🔵 BBVA Aqua
          </button>
          <button
            type="button"
            class="rounded-lg border border-line bg-surface px-2 py-1 text-[11px] text-fg hover:border-brand-400 transition-colors"
            @click="setTestCard('amex')"
          >
            Amex (15d)
          </button>
          <button
            type="button"
            class="rounded-lg border border-danger/40 bg-surface px-2 py-1 text-[11px] text-danger hover:border-danger transition-colors"
            @click="setTestCard('rejected')"
          >
            Simular Rechazo (0000)
          </button>
        </div>
      </div>

      <!-- Campo Número de Tarjeta -->
      <div>
        <label for="card-number" class="field-label">Número de tarjeta</label>
        <div class="relative">
          <input
            id="card-number"
            :value="card.numero"
            type="text"
            inputmode="numeric"
            placeholder="**** **** **** ****"
            autocomplete="cc-number"
            class="field-input pl-10 font-mono tracking-wider"
            :aria-invalid="!!errors.numero"
            :aria-describedby="errors.numero ? 'card-number-error' : undefined"
            @input="(e) => setNumero((e.target as HTMLInputElement).value)"
            @focus="flipToFront"
          />
          <CreditCard class="absolute left-3 top-3 size-4 text-muted" aria-hidden="true" />
        </div>
        <p v-if="errors.numero" id="card-number-error" class="field-error" role="alert">
          {{ errors.numero }}
        </p>
      </div>

      <!-- Campo Nombre del Titular -->
      <div>
        <label for="card-holder" class="field-label">Nombre del titular</label>
        <div class="relative">
          <input
            id="card-holder"
            :value="card.nombre"
            type="text"
            placeholder="Como aparece en la tarjeta"
            autocomplete="cc-name"
            class="field-input pl-10 uppercase"
            :aria-invalid="!!errors.nombre"
            :aria-describedby="errors.nombre ? 'card-holder-error' : undefined"
            @input="(e) => setNombre((e.target as HTMLInputElement).value)"
            @focus="flipToFront"
          />
          <User class="absolute left-3 top-3 size-4 text-muted" aria-hidden="true" />
        </div>
        <p v-if="errors.nombre" id="card-holder-error" class="field-error" role="alert">
          {{ errors.nombre }}
        </p>
      </div>

      <!-- Fila: Expiración y CVV (Giro 3D sincronizado) -->
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
              class="field-input pl-10 text-center font-mono"
              :aria-invalid="!!errors.expiracion"
              :aria-describedby="errors.expiracion ? 'card-expiry-error' : undefined"
              @focus="flipToFront"
            />
            <Calendar class="absolute left-3 top-3 size-4 text-muted" aria-hidden="true" />
          </div>
          <p v-if="errors.expiracion" id="card-expiry-error" class="field-error" role="alert">
            {{ errors.expiracion }}
          </p>
        </div>

        <!-- CVV con foco que detona giro de tarjeta -->
        <div>
          <label for="card-cvv" class="field-label">CVV / CVC</label>
          <div class="relative">
            <input
              id="card-cvv"
              :value="card.cvv"
              type="password"
              inputmode="numeric"
              :placeholder="brand === 'amex' ? '****' : '***'"
              :maxlength="brand === 'amex' ? 4 : 3"
              autocomplete="cc-csc"
              class="field-input pl-10 text-center font-mono"
              :aria-invalid="!!errors.cvv"
              :aria-describedby="errors.cvv ? 'card-cvv-error' : undefined"
              @input="(e) => setCvv((e.target as HTMLInputElement).value)"
              @focus="flipToBack"
              @blur="flipToFront"
            />
            <Lock class="absolute left-3 top-3 size-4 text-muted" aria-hidden="true" />
          </div>
          <p v-if="errors.cvv" id="card-cvv-error" class="field-error" role="alert">
            {{ errors.cvv }}
          </p>
        </div>
      </div>
    </div>

    <!-- ================= FORMULARIO DAVIPLATA ================= -->
    <div v-else class="space-y-4">
      <div class="rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-xs">
        <p class="font-bold text-red-200">Pago simulado mediante Daviplata</p>
        <p class="mt-1 text-muted">
          Ingresa el número celular asociado a tu Daviplata y confirma con el código de seguridad OTP.
        </p>
        <button
          type="button"
          class="btn-secondary mt-3 text-xs"
          @click="fillDaviplataDemo"
        >
          Auto-completar datos demo Daviplata
        </button>
      </div>

      <!-- Celular Daviplata -->
      <div>
        <label for="daviplata-cel" class="field-label">Número celular Daviplata</label>
        <div class="relative">
          <input
            id="daviplata-cel"
            v-model="daviplata.celular"
            type="tel"
            placeholder="300 123 4567"
            maxlength="10"
            class="field-input pl-10 font-mono"
            :aria-invalid="!!errors.celular"
            :aria-describedby="errors.celular ? 'daviplata-cel-error' : undefined"
          />
          <Smartphone class="absolute left-3 top-3 size-4 text-muted" aria-hidden="true" />
        </div>
        <p v-if="errors.celular" id="daviplata-cel-error" class="field-error" role="alert">
          {{ errors.celular }}
        </p>
      </div>

      <!-- OTP Daviplata -->
      <div>
        <label for="daviplata-otp" class="field-label">Código OTP de confirmación</label>
        <div class="relative">
          <input
            id="daviplata-otp"
            v-model="daviplata.codigoOtp"
            type="password"
            placeholder="••••"
            maxlength="6"
            class="field-input pl-10 font-mono tracking-widest text-center"
            :aria-invalid="!!errors.codigoOtp"
            :aria-describedby="errors.codigoOtp ? 'daviplata-otp-error' : undefined"
          />
          <Lock class="absolute left-3 top-3 size-4 text-muted" aria-hidden="true" />
        </div>
        <p v-if="errors.codigoOtp" id="daviplata-otp-error" class="field-error" role="alert">
          {{ errors.codigoOtp }}
        </p>
      </div>
    </div>

    <!-- Aviso de Simulación Educativa Segura (Inspirado en SmartInventory) -->
    <div class="mt-5 rounded-xl border border-cyan-500/20 bg-cyan-950/20 p-3 text-[11px] text-cyan-200/90 leading-relaxed flex items-start gap-2.5">
      <Info class="size-4 shrink-0 text-cyan-400 mt-0.5" aria-hidden="true" />
      <div>
        <strong class="font-semibold text-cyan-300">Modo de Simulación Seguro:</strong>
        El número de tarjeta y CVV solo se renderizan visualmente en la tarjeta 3D. No se envían a ningún servidor ni se realiza ningún cobro monetario real.
      </div>
    </div>

    <!-- Botón de Envío -->
    <button
      type="button"
      class="btn-primary mt-6 w-full py-3.5 text-base font-bold shadow-lg shadow-brand-500/25"
      :disabled="isProcessing"
      :aria-busy="isProcessing"
      @click="validateAndSubmit"
    >
      <span v-if="isProcessing">Procesando pago simulado...</span>
      <span v-else>Confirmar y Pagar Orden</span>
    </button>
  </div>
</template>
