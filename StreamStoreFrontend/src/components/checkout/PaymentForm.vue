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
  setTestCard,
  setBankSkin,
  setCardKind,
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
  Object.keys(errors).forEach((k) => (errors[k] = ''))

  if (props.metodo === 'TARJETA') {
    const rawNum = card.numero.replace(/\D/g, '')
    const minLength = brand.value === 'amex' ? 15 : 16

    if (!rawNum || rawNum.length < minLength) {
      errors.numero = `Numero de tarjeta incompleto (${minLength} digitos).`
    }
    if (!card.nombre.trim() || card.nombre.trim().length < 3) {
      errors.nombre = 'Ingresa el nombre del titular.'
    }
    const mesNum = parseInt(card.mes, 10)
    if (!card.mes || isNaN(mesNum) || mesNum < 1 || mesNum > 12 || !card.anio || card.anio.length < 2) {
      errors.expiracion = 'Fecha invalida (MM/AA).'
    }
    const minCvv = brand.value === 'amex' ? 4 : 3
    if (!card.cvv || card.cvv.length < minCvv) {
      errors.cvv = `CVV incompleto (${minCvv} digitos).`
    }

    if (Object.values(errors).some(Boolean)) return

    emit('submitPayment', {
      metodo: 'TARJETA',
      marca: brand.value,
      ultimos4: rawNum.slice(-4),
    })
  } else {
    const cleanCel = daviplata.celular.replace(/\D/g, '')
    if (!cleanCel || cleanCel.length < 10) {
      errors.celular = 'Ingresa un numero celular de 10 digitos.'
    }
    if (!daviplata.codigoOtp || daviplata.codigoOtp.length < 4) {
      errors.codigoOtp = 'Ingresa el codigo OTP de prueba (4 digitos).'
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
  <div class="space-y-5 font-sans">
    <!-- ================= ENCABEZADO METODO DE PAGO (Screenshots 1, 2, 3) ================= -->
    <div>
      <p class="text-[11px] font-mono tracking-[0.2em] text-[#ff4655] uppercase font-bold">
        METODO DE PAGO
      </p>
      <p class="text-xs text-gray-400 font-mono mt-0.5">
        Selecciona una opcion para continuar *
      </p>
    </div>

    <!-- SELECTOR DE METODO DE PAGO (EFECTIVO / DAVIPLATA vs TARJETA) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <!-- Opción 1: DAVIPLATA / EFECTIVO -->
      <div
        class="border p-4 rounded-sm cursor-pointer transition-all flex items-center justify-between"
        :class="
          metodo === 'DAVIPLATA'
            ? 'border-[#00ece0] bg-[#121b24]'
            : 'border-gray-800 bg-[#0d1117] hover:border-gray-700'
        "
        @click="emit('update:metodo', 'DAVIPLATA')"
      >
        <div class="flex items-center gap-3">
          <span class="text-xl">📱</span>
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono text-sm font-bold text-white uppercase">Daviplata</span>
              <span v-if="metodo === 'DAVIPLATA'" class="text-[9px] font-mono uppercase text-[#00ece0] font-bold">
                SELECCIONADO
              </span>
            </div>
            <p class="text-[11px] font-mono text-gray-400 mt-0.5">
              Monedero movil - activacion automatica
            </p>
          </div>
        </div>

        <div
          class="size-4 rounded-full border flex items-center justify-center shrink-0 ml-2"
          :class="metodo === 'DAVIPLATA' ? 'border-[#00ece0]' : 'border-gray-600'"
        >
          <div v-if="metodo === 'DAVIPLATA'" class="size-2 rounded-full bg-[#00ece0]" />
        </div>
      </div>

      <!-- Opción 2: TARJETA DE CREDITO / DEBITO -->
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
              <span class="font-mono text-sm font-bold text-white uppercase">Tarjeta</span>
              <span v-if="metodo === 'TARJETA'" class="text-[9px] font-mono uppercase text-[#00ece0] font-bold">
                SELECCIONADO
              </span>
            </div>
            <p class="text-[11px] font-mono text-gray-400 mt-0.5">
              Debito o credito - procesamiento inmediato
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

    <!-- ================= FLUJO TARJETA ================= -->
    <div v-if="metodo === 'TARJETA'" class="space-y-4">
      <!-- 1. AVISO DE SIMULACION AMBAR (Screenshots 1, 2, 3) -->
      <div class="border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[10px] font-mono text-amber-300/90 leading-relaxed rounded-sm">
        Simulacion de pago: el numero y CVV son solo visuales. No se envian ni se cobran. Solo se registra el metodo (Credito/Debito).
      </div>

      <!-- 2. SELECTOR CREDITO / DEBITO (Screenshots 1, 2, 3) -->
      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          class="py-2.5 text-center text-xs font-mono font-bold uppercase transition-all rounded-sm border"
          :class="
            cardKind === 'credito'
              ? 'border-[#820AD1] bg-[#820AD1]/25 text-white shadow-sm'
              : 'border-gray-800 bg-[#0d1117] text-gray-400 hover:border-gray-700 hover:text-white'
          "
          @click="setCardKind('credito')"
        >
          CREDITO
        </button>

        <button
          type="button"
          class="py-2.5 text-center text-xs font-mono font-bold uppercase transition-all rounded-sm border"
          :class="
            cardKind === 'debito'
              ? 'border-[#820AD1] bg-[#820AD1]/25 text-white shadow-sm'
              : 'border-gray-800 bg-[#0d1117] text-gray-400 hover:border-gray-700 hover:text-white'
          "
          @click="setCardKind('debito')"
        >
          DEBITO
        </button>
      </div>

      <!-- 3. SELECTOR BANCO / DISEÑO DE TARJETA (Screenshots 1, 2, 3) -->
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

      <!-- 4. CONTENEDOR HERO OSCURO DE LA TARJETA (Screenshots 1, 2, 3) -->
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

        <div class="mt-3 flex items-center justify-between w-full max-w-[370px] text-[10px] font-mono text-gray-500">
          <span>Vista interactiva 3D</span>
          <button
            type="button"
            class="hover:text-[#00ece0] transition-colors underline"
            @click="toggleFlip"
          >
            {{ isFlipped ? 'Voltear al frente' : 'Girar para ver CVV' }}
          </button>
        </div>
      </div>

      <!-- ACCESOS RAPIDOS DE DEMOSTRACION (1-CLIC) -->
      <div class="flex items-center gap-1.5 flex-wrap pt-1 text-[10px] font-mono text-gray-400">
        <span class="text-gray-500">Auto-llenar prueba:</span>
        <button
          type="button"
          class="px-2 py-0.5 rounded border border-gray-800 bg-[#0d1117] text-white hover:border-[#820AD1] transition-colors"
          @click="setTestCard('nu')"
        >
          Nu Bank
        </button>
        <button
          type="button"
          class="px-2 py-0.5 rounded border border-gray-800 bg-[#0d1117] text-white hover:border-[#FFDD00] transition-colors"
          @click="setTestCard('bancolombia')"
        >
          Bancolombia
        </button>
        <button
          type="button"
          class="px-2 py-0.5 rounded border border-gray-800 bg-[#0d1117] text-white hover:border-[#2E7D32] transition-colors"
          @click="setTestCard('falabella')"
        >
          Falabella
        </button>
        <button
          type="button"
          class="px-2 py-0.5 rounded border border-gray-800 bg-[#0d1117] text-white hover:border-[#004481] transition-colors"
          @click="setTestCard('bbva')"
        >
          BBVA
        </button>
        <button
          type="button"
          class="px-2 py-0.5 rounded border border-rose-900/50 bg-rose-950/20 text-rose-300 hover:border-rose-500 transition-colors"
          @click="setTestCard('rejected')"
        >
          Rechazo (0000)
        </button>
      </div>

      <!-- 5. CAMPOS DEL FORMULARIO ESTILO SMARTINVENTORY (Screenshots 1, 2, 3) -->
      <div class="space-y-4 pt-2">
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
            @input="(e) => setNumero((e.target as HTMLInputElement).value)"
            @focus="flipToFront"
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
            placeholder="Como aparece en la tarjeta"
            autocomplete="cc-name"
            class="w-full bg-[#0d1117] border border-gray-700 text-white text-sm font-mono uppercase px-3.5 py-2.5 outline-none focus:border-[#00ece0] transition-colors disabled:opacity-40 rounded-sm"
            :class="{ 'border-rose-500': !!errors.nombre }"
            @input="(e) => setNombre((e.target as HTMLInputElement).value)"
            @focus="flipToFront"
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
              v-model="expiracionInput"
              type="text"
              placeholder="MM/YY"
              maxlength="5"
              autocomplete="cc-exp"
              class="w-full bg-[#0d1117] border border-gray-700 text-white text-sm font-mono px-3.5 py-2.5 outline-none focus:border-[#00ece0] transition-colors disabled:opacity-40 rounded-sm text-center"
              :class="{ 'border-rose-500': !!errors.expiracion }"
              @focus="flipToFront"
            />
            <p v-if="errors.expiracion" class="text-xs text-rose-400 font-mono mt-1">
              {{ errors.expiracion }}
            </p>
          </div>

          <div>
            <label for="card-cvv" class="block text-[10px] font-mono uppercase text-gray-400 mb-1">
              CVV
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
              @input="(e) => setCvv((e.target as HTMLInputElement).value)"
              @focus="flipToBack"
              @blur="flipToFront"
            />
            <p v-if="errors.cvv" class="text-xs text-rose-400 font-mono mt-1">
              {{ errors.cvv }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= FLUJO DAVIPLATA ================= -->
    <div v-else class="space-y-4">
      <div class="border border-red-500/40 bg-red-950/20 p-4 rounded-sm text-xs font-mono">
        <div class="flex items-center justify-between">
          <span class="text-red-300 font-bold uppercase">Pasarela Movil Daviplata</span>
          <button
            type="button"
            class="text-[11px] text-red-200 underline hover:text-white"
            @click="fillDaviplataDemo"
          >
            Auto-llenar Demo
          </button>
        </div>
        <p class="text-gray-400 mt-1 leading-relaxed">
          Ingresa el celular asociado a tu monedero Daviplata y confirma con el codigo OTP simulado.
        </p>
      </div>

      <div>
        <label for="daviplata-cel" class="block text-[10px] font-mono uppercase text-gray-400 mb-1">
          NUMERO CELULAR DAVIPLATA
        </label>
        <input
          id="daviplata-cel"
          v-model="daviplata.celular"
          type="tel"
          placeholder="300 123 4567"
          maxlength="10"
          class="w-full bg-[#0d1117] border border-gray-700 text-white text-sm font-mono px-3.5 py-2.5 outline-none focus:border-[#00ece0] transition-colors rounded-sm"
          :class="{ 'border-rose-500': !!errors.celular }"
        />
        <p v-if="errors.celular" class="text-xs text-rose-400 font-mono mt-1">
          {{ errors.celular }}
        </p>
      </div>

      <div>
        <label for="daviplata-otp" class="block text-[10px] font-mono uppercase text-gray-400 mb-1">
          CODIGO OTP DE CONFIRMACION
        </label>
        <input
          id="daviplata-otp"
          v-model="daviplata.codigoOtp"
          type="password"
          placeholder="••••"
          maxlength="6"
          class="w-full bg-[#0d1117] border border-gray-700 text-white text-base font-mono tracking-widest px-3.5 py-2.5 outline-none focus:border-[#00ece0] transition-colors rounded-sm text-center"
          :class="{ 'border-rose-500': !!errors.codigoOtp }"
        />
        <p v-if="errors.codigoOtp" class="text-xs text-rose-400 font-mono mt-1">
          {{ errors.codigoOtp }}
        </p>
      </div>
    </div>

    <!-- 6. BOTON FINALIZAR COMPRA (Screenshots 1, 2, 3) -->
    <div class="pt-3">
      <button
        type="button"
        class="w-full py-4 px-6 text-sm font-mono font-black uppercase tracking-wider text-white transition-all rounded-sm shadow-xl"
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
