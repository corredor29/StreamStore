<script setup lang="ts">
import { computed, reactive } from 'vue'
import { CARD_BANKS, type MarcaTarjeta, type MetodoPago } from '@/types'
import type { usePaymentCard } from '@/composables/usePaymentCard'
import PaymentCard3D from './PaymentCard3D.vue'

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
function onFocusNumero() {
  if (bankSkin.value === 'bancolombia' || bankSkin.value === 'nu') {
    flipToBack()
  } else {
    flipToFront()
  }
}

function onFocusTitular() {
  if (bankSkin.value === 'bancolombia') {
    flipToBack()
  } else {
    // En Nu, Genérica y BBVA el titular está en el frente
    flipToFront()
  }
}

function onFocusExpiracion() {
  if (bankSkin.value === 'bancolombia' || bankSkin.value === 'nu') {
    flipToBack()
  } else {
    flipToFront()
  }
}

function onFocusCvv() {
  flipToBack()
}

function onBlurCvv() {
  if (bankSkin.value === 'bancolombia' || bankSkin.value === 'nu') {
    flipToBack()
  } else {
    flipToFront()
  }
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
  <div class="space-y-5 font-sans">
    <!-- ================= ENCABEZADO METODO DE PAGO ================= -->
    <div>
      <p class="text-[11px] font-mono tracking-[0.2em] text-[#ff4655] uppercase font-bold">
        METODO DE PAGO
      </p>
      <p class="text-xs text-gray-400 font-mono mt-0.5">
        Selecciona una opcion para continuar *
      </p>
    </div>

    <!-- SELECTOR DE METODO DE PAGO (NEQUI vs TARJETA DÉBITO) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <!-- Opción 1: NEQUI -->
      <div
        class="border p-4 rounded-sm cursor-pointer transition-all flex items-center justify-between"
        :class="
          metodo === 'NEQUI'
            ? 'border-[#FF007A] bg-[#220730]'
            : 'border-gray-800 bg-[#0d1117] hover:border-gray-700'
        "
        @click="emit('update:metodo', 'NEQUI')"
      >
        <div class="flex items-center gap-3">
          <span class="text-xl">📱</span>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono text-sm font-bold text-white uppercase">Nequi</span>
              <span v-if="metodo === 'NEQUI'" class="text-[9px] font-mono uppercase text-[#FF007A] font-bold">
                SELECCIONADO
              </span>
            </div>
            <p class="text-[11px] font-mono text-gray-400 mt-0.5">
              Billetera digital Nequi Colombia
            </p>
          </div>
        </div>

        <div
          class="size-4 rounded-full border flex items-center justify-center shrink-0 ml-2"
          :class="metodo === 'NEQUI' ? 'border-[#FF007A]' : 'border-gray-600'"
        >
          <div v-if="metodo === 'NEQUI'" class="size-2 rounded-full bg-[#FF007A]" />
        </div>
      </div>

      <!-- Opción 2: TARJETA DÉBITO -->
      <div
        class="border p-4 rounded-sm cursor-pointer transition-all flex items-center justify-between"
        :class="
          metodo === 'TARJETA'
            ? 'border-[#00ece0] bg-[#121b24]'
            : 'border-gray-800 bg-[#0d1117] hover:border-gray-700'
        "
        @click="emit('update:metodo', 'TARJETA')"
      >
        <div class="flex items-center gap-3">
          <span class="text-xl">💳</span>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono text-sm font-bold text-white uppercase">Tarjeta Débito</span>
              <span v-if="metodo === 'TARJETA'" class="text-[9px] font-mono uppercase text-[#00ece0] font-bold">
                SELECCIONADO
              </span>
            </div>
            <p class="text-[11px] font-mono text-gray-400 mt-0.5">
              Bancolombia, Nu, Genérica o BBVA
            </p>
          </div>
        </div>

        <div
          class="size-4 rounded-full border flex items-center justify-center shrink-0 ml-2"
          :class="metodo === 'TARJETA' ? 'border-[#00ece0]' : 'border-gray-600'"
        >
          <div v-if="metodo === 'TARJETA'" class="size-2 rounded-full bg-[#00ece0]" />
        </div>
      </div>
    </div>

    <!-- ================= FLUJO TARJETA DÉBITO ================= -->
    <div v-if="metodo === 'TARJETA'" class="space-y-4">
      <!-- SELECTOR BANCO / DISEÑO DE TARJETA -->
      <div>
        <span class="block text-[9px] font-mono uppercase tracking-wider text-gray-500 mb-1.5">
          BANCO / DISEÑO DE TARJETA
        </span>
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="banco in CARD_BANKS"
            :key="banco.id"
            type="button"
            class="py-2 px-1 text-center font-mono rounded-sm border transition-all flex flex-col items-center justify-center"
            :class="
              bankSkin === banco.id
                ? 'bg-white/5 font-bold text-white shadow-sm'
                : 'border-gray-800 bg-[#0d1117] text-gray-400 hover:border-gray-700'
            "
            :style="{
              borderColor: bankSkin === banco.id ? banco.accent : undefined
            }"
            @click="setBankSkin(banco.id)"
          >
            <span class="text-[11px] uppercase tracking-wide truncate w-full">{{ banco.label }}</span>
            <span class="text-[9px] opacity-75 truncate w-full">{{ banco.hint }}</span>
          </button>
        </div>
      </div>

      <!-- CONTENEDOR HERO OSCURO DE LA TARJETA 3D -->
      <div class="bg-[#0a0c10] border border-gray-800/90 rounded-2xl py-6 px-4 sm:px-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
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

        <div class="mt-3 flex items-center justify-between w-full max-w-[370px] text-[10px] font-mono text-gray-400">
          <span class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-[#00ece0] animate-pulse" />
            <span>Vista interactiva 3D</span>
          </span>
          <button
            type="button"
            class="hover:text-[#00ece0] transition-colors underline flex items-center gap-1 text-gray-300 cursor-pointer"
            @click="toggleFlip"
          >
            <span>🔄</span>
            <span v-if="bankSkin === 'bancolombia'">
              {{ isFlipped ? 'Ver frontal (diseño = Ba)' : 'Ver reverso (datos impresos)' }}
            </span>
            <span v-else-if="bankSkin === 'nu'">
              {{ isFlipped ? 'Ver frontal (nombre y logo nu)' : 'Ver reverso (número y CVC)' }}
            </span>
            <span v-else>
              {{ isFlipped ? 'Voltear al frente' : 'Girar para ver CVC' }}
            </span>
          </button>
        </div>
      </div>

      <!-- CAMPOS DEL FORMULARIO DE TARJETA -->
      <div class="space-y-4 pt-1">
        <!-- Campo Número de Tarjeta -->
        <div>
          <label for="card-number" class="block text-[10px] font-mono uppercase text-gray-400 mb-1">
            NUMERO DE TARJETA
          </label>
          <input
            id="card-number"
            :value="card.numero"
            type="text"
            inputmode="numeric"
            placeholder="•••• •••• •••• ••••"
            autocomplete="cc-number"
            class="w-full bg-[#0d1117] border border-gray-700 text-white text-sm font-mono px-3.5 py-2.5 outline-none focus:border-[#00ece0] transition-colors disabled:opacity-40 rounded-sm"
            :class="{ 'border-rose-500': !!errors.numero }"
            @input="handleNumeroInput"
            @focus="onFocusNumero"
          />
          <p v-if="errors.numero" class="text-xs text-rose-400 font-mono mt-1">
            {{ errors.numero }}
          </p>
        </div>

        <!-- Campo Titular -->
        <div>
          <label for="card-holder" class="block text-[10px] font-mono uppercase text-gray-400 mb-1">
            TITULAR
          </label>
          <input
            id="card-holder"
            :value="card.nombre"
            type="text"
            placeholder="Como aparece en la tarjeta (solo letras)"
            autocomplete="cc-name"
            class="w-full bg-[#0d1117] border border-gray-700 text-white text-sm font-mono uppercase px-3.5 py-2.5 outline-none focus:border-[#00ece0] transition-colors disabled:opacity-40 rounded-sm"
            :class="{ 'border-rose-500': !!errors.nombre }"
            @input="handleNombreInput"
            @focus="onFocusTitular"
          />
          <p v-if="errors.nombre" class="text-xs text-rose-400 font-mono mt-1">
            {{ errors.nombre }}
          </p>
        </div>

        <!-- Fila: VENCE y CVV -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="card-expiry" class="block text-[10px] font-mono uppercase text-gray-400 mb-1">
              VENCE
            </label>
            <input
              id="card-expiry"
              :value="expiracionDisplay"
              type="text"
              placeholder="MM/AA"
              maxlength="5"
              autocomplete="cc-exp"
              class="w-full bg-[#0d1117] border border-gray-700 text-white text-sm font-mono px-3.5 py-2.5 outline-none focus:border-[#00ece0] transition-colors disabled:opacity-40 rounded-sm text-center"
              :class="{ 'border-rose-500': !!errors.expiracion }"
              @input="handleExpiracionInput"
              @focus="onFocusExpiracion"
            />
            <p v-if="errors.expiracion" class="text-xs text-rose-400 font-mono mt-1">
              {{ errors.expiracion }}
            </p>
          </div>

          <div>
            <label for="card-cvv" class="block text-[10px] font-mono uppercase text-gray-400 mb-1">
              CVV / CVC
            </label>
            <input
              id="card-cvv"
              :value="card.cvv"
              type="password"
              inputmode="numeric"
              placeholder="123"
              maxlength="4"
              autocomplete="cc-csc"
              class="w-full bg-[#0d1117] border border-gray-700 text-white text-sm font-mono px-3.5 py-2.5 outline-none focus:border-[#00ece0] transition-colors disabled:opacity-40 rounded-sm text-center"
              :class="{ 'border-rose-500': !!errors.cvv }"
              @input="handleCvvInput"
              @focus="onFocusCvv"
              @blur="onBlurCvv"
            />
            <p v-if="errors.cvv" class="text-xs text-rose-400 font-mono mt-1">
              {{ errors.cvv }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= FLUJO NEQUI ================= -->
    <div v-else class="space-y-4">
      <div class="border border-[#FF007A]/40 bg-[#250930] p-4 rounded-sm text-xs font-mono">
        <div class="flex items-center gap-2">
          <span class="text-base">📱</span>
          <span class="text-[#FF007A] font-bold uppercase tracking-wider">Pasarela Móvil Nequi</span>
        </div>
        <p class="text-gray-300 mt-1 leading-relaxed">
          Ingresa el número celular asociado a tu cuenta Nequi (10 dígitos colombianos) y confirma con la notificación push o clave dinámica.
        </p>
      </div>

      <div>
        <label for="nequi-cel" class="block text-[10px] font-mono uppercase text-gray-400 mb-1">
          NUMERO CELULAR NEQUI
        </label>
        <input
          id="nequi-cel"
          :value="nequi.celular"
          type="tel"
          inputmode="numeric"
          placeholder="300 123 4567"
          maxlength="10"
          class="w-full bg-[#0d1117] border border-gray-700 text-white text-sm font-mono px-3.5 py-2.5 outline-none focus:border-[#FF007A] transition-colors rounded-sm"
          :class="{ 'border-rose-500': !!errors.celular }"
          @input="handleNequiCelular"
        />
        <p v-if="errors.celular" class="text-xs text-rose-400 font-mono mt-1">
          {{ errors.celular }}
        </p>
      </div>

      <div>
        <label for="nequi-otp" class="block text-[10px] font-mono uppercase text-gray-400 mb-1">
          CLAVE DINÁMICA / CÓDIGO DE CONFIRMACIÓN
        </label>
        <input
          id="nequi-otp"
          :value="nequi.codigoOtp"
          type="password"
          inputmode="numeric"
          placeholder="••••••"
          maxlength="6"
          class="w-full bg-[#0d1117] border border-gray-700 text-white text-base font-mono tracking-widest px-3.5 py-2.5 outline-none focus:border-[#FF007A] transition-colors rounded-sm text-center"
          :class="{ 'border-rose-500': !!errors.codigoOtp }"
          @input="handleNequiOtp"
        />
        <p v-if="errors.codigoOtp" class="text-xs text-rose-400 font-mono mt-1">
          {{ errors.codigoOtp }}
        </p>
      </div>
    </div>

    <!-- BOTON FINALIZAR COMPRA -->
    <div class="pt-3">
      <button
        type="button"
        class="w-full py-4 px-6 text-sm font-mono font-black uppercase tracking-wider text-white transition-all rounded-sm shadow-xl cursor-pointer"
        style="background: #942b3b; clip-path: polygon(10px 0, 100% 0, 100% 100%, 0 100%, 0 10px);"
        :disabled="isProcessing"
        @click="validateAndSubmit"
      >
        <span v-if="isProcessing">PROCESANDO PAGO...</span>
        <span v-else>FINALIZAR COMPRA</span>
      </button>

      <p class="text-[9px] font-mono uppercase tracking-widest text-center text-gray-500 mt-2">
        ENTREGA DIGITAL INSTANTANEA DE PANTALLAS Y CREDENCIALES TRAS AUTORIZAR
      </p>
    </div>
  </div>
</template>
