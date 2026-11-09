import { computed, reactive, ref } from 'vue'
import type { CardBankSkin, CardKind, MarcaTarjeta } from '@/types'

export interface CardState {
  numero: string
  nombre: string
  mes: string
  anio: string
  cvv: string
}

export function usePaymentCard() {
  const bankSkin = ref<CardBankSkin>('generica')
  const cardKind = ref<CardKind>('debito')
  // En Bancolombia los datos físicos están al reverso, por lo que inicia mostrando el reverso
  const isFlipped = ref(false)

  const card = reactive<CardState>({
    numero: '',
    nombre: '',
    mes: '',
    anio: '',
    cvv: '',
  })

  // Detección de marca por BIN
  const brand = computed<MarcaTarjeta>(() => {
    const clean = card.numero.replace(/\D/g, '')
    if (/^4/.test(clean)) return 'visa'
    if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/.test(clean)) return 'mastercard'
    if (/^3[47]/.test(clean)) return 'amex'
    return 'generic'
  })

  const isAmex = computed(() => brand.value === 'amex')
  const maxLengthNumero = computed(() => (isAmex.value ? 15 : 16))
  const maxCvvLength = computed(() => (isAmex.value ? 4 : 3))

  // Representación progresiva con asteriscos (ej: 140* **** **** ****)
  const displayNumero = computed(() => {
    const raw = card.numero.replace(/\D/g, '').slice(0, maxLengthNumero.value)
    const totalDigits = maxLengthNumero.value

    if (isAmex.value) {
      // Formato Amex: 4-6-5 (15 dígitos)
      let padded = raw.padEnd(totalDigits, '*')
      return `${padded.slice(0, 4)} ${padded.slice(4, 10)} ${padded.slice(10, 15)}`
    }

    // Formato Estándar: 4-4-4-4 (16 dígitos)
    let padded = raw.padEnd(totalDigits, '*')
    return `${padded.slice(0, 4)} ${padded.slice(4, 8)} ${padded.slice(8, 12)} ${padded.slice(12, 16)}`
  })

  const displayNombre = computed(() => {
    return card.nombre.trim() ? card.nombre.toUpperCase() : 'NOMBRE DEL TITULAR'
  })

  const displayExpiracion = computed(() => {
    const m = card.mes ? card.mes.padStart(2, '0') : 'MM'
    const a = card.anio ? card.anio.slice(-2).padStart(2, '0') : 'AA'
    return `${m}/${a}`
  })

  const displayCvv = computed(() => {
    const raw = card.cvv.replace(/\D/g, '').slice(0, maxCvvLength.value)
    return raw ? '•'.repeat(raw.length) : '•••'
  })

  // Métodos de formateo y actualización
  function setNumero(val: string) {
    // Solo dígitos numéricos, cero letras ni símbolos
    const clean = val.replace(/\D/g, '').slice(0, maxLengthNumero.value)
    card.numero = clean
  }

  function setNombre(val: string) {
    // Solo letras (incluyendo tildes, diéresis y ñ) y espacios, cero números
    const clean = val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '').slice(0, 30)
    card.nombre = clean
  }

  function setExpiracion(val: string) {
    // Extrae exclusivamente dígitos numéricos (máximo 4: 2 para mes y 2 para año)
    // Soporta escribir directo "0234" convirtiéndolo en "02/34"
    const digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length <= 2) {
      card.mes = digits
      card.anio = ''
    } else {
      card.mes = digits.slice(0, 2)
      card.anio = digits.slice(2, 4)
    }
  }

  function setCvv(val: string) {
    card.cvv = val.replace(/\D/g, '').slice(0, maxCvvLength.value)
  }

  function flipToBack() {
    isFlipped.value = true
  }

  function flipToFront() {
    isFlipped.value = false
  }

  function toggleFlip() {
    isFlipped.value = !isFlipped.value
  }

  function setBankSkin(skin: CardBankSkin) {
    bankSkin.value = skin
    // Todas las tarjetas siempre empiezan mostrando el frente
    isFlipped.value = false
  }

  function setCardKind(kind: CardKind) {
    cardKind.value = kind
  }

  // Preajustes de prueba oficiales para revisión rápida
  function setTestCard(type: 'visa' | 'mastercard' | 'amex' | 'rejected' | 'nu' | 'bancolombia' | 'generica' | 'falabella' | 'bbva') {
    if (type === 'bancolombia') {
      bankSkin.value = 'bancolombia'
      setNumero('5300987654321098')
      setNombre('VALENTINA BANCOLOMBIA')
      card.mes = '04'
      card.anio = '30'
      setCvv('654')
      flipToFront()
      return
    }

    if (type === 'nu') {
      bankSkin.value = 'nu'
      setNumero('5529912345678901')
      setNombre('ANDRES FELIPE NAVAS')
      card.mes = '03'
      card.anio = '29'
      setCvv('321')
      flipToFront()
      return
    }

    flipToFront()
    if (type === 'visa') {
      bankSkin.value = 'generica'
      setNumero('4532015012345678')
      setNombre('CARLOS VISA DEMO')
      card.mes = '12'
      card.anio = '28'
      setCvv('789')
    } else if (type === 'mastercard') {
      bankSkin.value = 'generica'
      setNumero('5412751234123456')
      setNombre('MARIA MASTERCARD')
      card.mes = '08'
      card.anio = '29'
      setCvv('456')
    } else if (type === 'amex') {
      bankSkin.value = 'generica'
      setNumero('378282246310005')
      setNombre('ALEX AMEX DEMO')
      card.mes = '11'
      card.anio = '27'
      setCvv('8432')
    } else if (type === 'rejected') {
      setNumero('4000123456780000')
      setNombre('TEST RECHAZO DEMO')
      card.mes = '05'
      card.anio = '28'
      setCvv('999')
    } else if (type === 'generica' || type === 'falabella') {
      bankSkin.value = 'generica'
      setNumero('4587123498765432')
      setNombre('SANTIAGO TARJETA GENERICA')
      card.mes = '10'
      card.anio = '28'
      setCvv('890')
    } else if (type === 'bbva') {
      setNombre('SANTIAGO FALABELLA CMR')
      card.mes = '10'
      card.anio = '28'
      setCvv('890')
    } else if (type === 'bbva') {
      bankSkin.value = 'bbva'
      setNumero('4557987612345678')
      setNombre('CAMILA BBVA AQUA')
      card.mes = '07'
      card.anio = '29'
      setCvv('147')
    }
  }

  return {
    card,
    brand,
    bankSkin,
    cardKind,
    isFlipped,
    displayNumero,
    displayNombre,
    displayExpiracion,
    displayCvv,
    maxLengthNumero,
    maxCvvLength,
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
  }
}
