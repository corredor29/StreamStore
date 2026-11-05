import { computed, reactive, ref } from 'vue'
import type { CardBankSkin, MarcaTarjeta } from '@/types'

export interface CardState {
  numero: string
  nombre: string
  mes: string
  anio: string
  cvv: string
}

export function usePaymentCard() {
  const isFlipped = ref(false)
  const bankSkin = ref<CardBankSkin>('streamstore')

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
    const clean = val.replace(/\D/g, '').slice(0, maxLengthNumero.value)
    card.numero = clean
  }

  function setNombre(val: string) {
    card.nombre = val.slice(0, 30)
  }

  function setExpiracion(val: string) {
    // Permite escribir MM/AA con auto-slash
    let clean = val.replace(/[^\d/]/g, '')
    if (clean.length === 2 && !clean.includes('/') && card.mes.length < 2) {
      clean = clean + '/'
    }
    const parts = clean.split('/')
    card.mes = parts[0] ? parts[0].slice(0, 2) : ''
    card.anio = parts[1] ? parts[1].slice(0, 2) : ''
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
  }

  // Preajustes de prueba oficiales para revisión rápida
  function setTestCard(type: 'visa' | 'mastercard' | 'amex' | 'rejected' | 'nu' | 'bancolombia' | 'falabella' | 'bbva') {
    flipToFront()
    if (type === 'visa') {
      bankSkin.value = 'streamstore'
      setNumero('4532015012345678')
      setNombre('CARLOS VISA DEMO')
      card.mes = '12'
      card.anio = '28'
      setCvv('789')
    } else if (type === 'mastercard') {
      bankSkin.value = 'streamstore'
      setNumero('5412751234123456')
      setNombre('MARIA MASTERCARD')
      card.mes = '08'
      card.anio = '29'
      setCvv('456')
    } else if (type === 'amex') {
      bankSkin.value = 'streamstore'
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
    } else if (type === 'nu') {
      bankSkin.value = 'nu'
      setNumero('5162451234567890')
      setNombre('DAVID NU BANK')
      card.mes = '09'
      card.anio = '29'
      setCvv('321')
    } else if (type === 'bancolombia') {
      bankSkin.value = 'bancolombia'
      setNumero('5300987654321098')
      setNombre('VALENTINA BANCOLOMBIA')
      card.mes = '04'
      card.anio = '30'
      setCvv('654')
    } else if (type === 'falabella') {
      bankSkin.value = 'falabella'
      setNumero('5487123498765432')
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
  }
}
