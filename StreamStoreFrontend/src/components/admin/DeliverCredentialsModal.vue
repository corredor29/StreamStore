<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Eye, EyeOff, KeyRound, Mail, Send, X } from '@lucide/vue'
import type { EntregarCredencialesPayload, ServicioAdmin } from '@/types'
import { adminService } from '@/services/adminService'
import { normalizeError } from '@/services/api'
import AppAlert from '@/components/common/AppAlert.vue'

const props = defineProps<{ servicio: ServicioAdmin | null }>()
const emit = defineEmits<{ close: []; entregado: [mensaje: string] }>()

const email = ref('')
const password = ref('')
const verPassword = ref(false)
const pantallas = ref<{ numero: number; perfil: string; pin: string }[]>([])
const notificar = ref(true)
const enviando = ref(false)
const error = ref<string | null>(null)

const esPantalla = computed(() => props.servicio?.tipo === 'PANTALLA')
const esReenvio = computed(() => props.servicio?.estadoEntrega === 'ENTREGADO')
// Si la cuenta ya tiene credenciales no hace falta reescribirlas: se reenvían tal cual
const credencialesOpcionales = computed(() => Boolean(props.servicio?.cuentaTieneCredenciales))

watch(
  () => props.servicio,
  (s) => {
    error.value = null
    verPassword.value = false
    notificar.value = true
    email.value = s?.credenciales?.email ?? ''
    password.value = s?.credenciales?.password ?? ''
    pantallas.value = (s?.pantallasCuenta ?? []).map((p) => ({ ...p }))
  },
  { immediate: true },
)

const pinInvalido = (pin: string) => pin !== '' && !/^\d{4,6}$/.test(pin)

const validacion = computed(() => {
  const tieneEmail = email.value.trim() !== ''
  const tienePass = password.value !== ''
  if (!credencialesOpcionales.value && (!tieneEmail || !tienePass)) return 'Escribe el correo y la contraseña de la cuenta.'
  if (tieneEmail !== tienePass) return 'Escribe el correo y la contraseña juntos.'
  if (tieneEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) return 'El correo no es válido.'
  if (tienePass && password.value.length < 4) return 'La contraseña debe tener al menos 4 caracteres.'
  if (pantallas.value.some((p) => pinInvalido(p.pin))) return 'Cada PIN debe tener de 4 a 6 dígitos.'
  if (pantallas.value.some((p) => p.perfil.trim() === '')) return 'Cada pantalla necesita un nombre de perfil.'
  return null
})

function construirPayload(): EntregarCredencialesPayload {
  const s = props.servicio!
  const payload: EntregarCredencialesPayload = { notificar: notificar.value }
  const cambioCredenciales = email.value.trim() !== (s.credenciales?.email ?? '') || password.value !== (s.credenciales?.password ?? '')
  if (email.value.trim() && password.value && (cambioCredenciales || !s.cuentaTieneCredenciales)) {
    payload.email = email.value.trim()
    payload.password = password.value
  }
  const cambios = pantallas.value
    .map((p) => {
      const original = s.pantallasCuenta.find((o) => o.numero === p.numero)
      const pin = p.pin !== (original?.pin ?? '') && p.pin !== '' ? p.pin : undefined
      const perfil = p.perfil.trim() !== (original?.perfil ?? '') ? p.perfil.trim() : undefined
      return { numero: p.numero, pin, perfil }
    })
    .filter((p) => p.pin !== undefined || p.perfil !== undefined)
  if (esPantalla.value) {
    if (cambios[0]?.pin) payload.pin = cambios[0].pin
    if (cambios[0]?.perfil) payload.perfil = cambios[0].perfil
  } else if (cambios.length) {
    payload.pantallas = cambios
  }
  return payload
}

async function onSubmit() {
  if (!props.servicio || validacion.value) return
  enviando.value = true
  error.value = null
  try {
    const res = await adminService.entregarCredenciales(props.servicio.id, construirPayload())
    emit('entregado', res.mensaje)
  } catch (e) {
    error.value = normalizeError(e).message
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <div
    v-if="servicio"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60"
    role="dialog"
    aria-modal="true"
    aria-labelledby="entrega-titulo"
    @keydown.esc="emit('close')"
  >
    <div class="hud-panel w-full max-w-lg max-h-[92vh] overflow-y-auto p-5 sm:p-7 space-y-5">
      <div class="flex items-start justify-between border-b border-ad-line pb-4 gap-3">
        <div>
          <h2 id="entrega-titulo" class="font-display text-lg font-semibold text-ad-text">
            {{ esReenvio ? 'Reenviar acceso' : 'Entregar acceso' }} · Servicio #{{ servicio.id }}
          </h2>
          <p class="text-xs text-ad-dim mt-0.5">
            {{ servicio.plataforma }} · {{ esPantalla ? '1 pantalla' : 'Cuenta completa' }} · Compra #{{ servicio.compraId }}
          </p>
        </div>
        <button type="button" class="text-ad-dim hover:text-ad-text p-1 rounded-md cursor-pointer" aria-label="Cerrar" @click="emit('close')">
          <X class="size-5" />
        </button>
      </div>

      <div v-if="servicio.cliente" class="hud-panel px-3.5 py-2.5 text-xs">
        <span class="text-ad-dim">Cliente:</span>
        <strong class="text-ad-text ml-1">{{ servicio.cliente.nombre }}</strong>
        <span class="block tabular-nums text-ad-text mt-0.5">{{ servicio.cliente.email }}</span>
      </div>

      <AppAlert v-if="error" variant="error" title="No se pudo entregar">
        <p>{{ error }}</p>
      </AppAlert>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <fieldset class="space-y-3">
          <legend class="text-xs font-semibold text-ad-text mb-1">
            Datos de la cuenta
            <span v-if="credencialesOpcionales" class="font-normal text-ad-dim">(cámbialos solo si los vas a corregir)</span>
          </legend>
          <label class="block">
            <span class="sr-only">Correo de la cuenta</span>
            <div class="relative">
              <Mail class="absolute left-3 top-2.5 size-4 text-ad-dim" />
              <input
                v-model="email"
                type="email"
                autocomplete="off"
                placeholder="correo@plataforma.com"
                class="w-full rounded-lg border border-ad-line bg-ad-raised pl-9 pr-3 py-2 text-xs text-ad-text tabular-nums placeholder:text-ad-faint focus:border-ad-accent focus:outline-none"
              />
            </div>
          </label>
          <label class="block">
            <span class="sr-only">Contraseña de la cuenta</span>
            <div class="relative">
              <KeyRound class="absolute left-3 top-2.5 size-4 text-ad-dim" />
              <input
                v-model="password"
                :type="verPassword ? 'text' : 'password'"
                autocomplete="new-password"
                placeholder="Contraseña"
                class="w-full rounded-lg border border-ad-line bg-ad-raised pl-9 pr-9 py-2 text-xs text-ad-text tabular-nums placeholder:text-ad-faint focus:border-ad-accent focus:outline-none"
              />
              <button
                type="button"
                class="absolute right-2.5 top-2 text-ad-dim hover:text-ad-text p-0.5 cursor-pointer"
                :aria-label="verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                @click="verPassword = !verPassword"
              >
                <EyeOff v-if="verPassword" class="size-4" />
                <Eye v-else class="size-4" />
              </button>
            </div>
          </label>
        </fieldset>

        <fieldset v-if="pantallas.length" class="space-y-2">
          <legend class="text-xs font-semibold text-ad-text mb-1">
            {{ esPantalla ? 'Perfil y PIN del cliente' : 'Perfiles de la cuenta' }}
          </legend>
          <div v-for="p in pantallas" :key="p.numero" class="grid grid-cols-[auto_1fr_7rem] items-center gap-2">
            <span class="tabular-nums text-[11px] text-ad-dim w-8">#{{ p.numero }}</span>
            <input
              v-model="p.perfil"
              type="text"
              maxlength="60"
              :aria-label="`Perfil de la pantalla ${p.numero}`"
              class="rounded-lg border border-ad-line bg-ad-raised px-3 py-1.5 text-xs text-ad-text focus:border-ad-accent focus:outline-none"
            />
            <input
              v-model="p.pin"
              type="text"
              inputmode="numeric"
              maxlength="6"
              placeholder="PIN"
              :aria-label="`PIN de la pantalla ${p.numero}`"
              class="rounded-lg border bg-ad-raised px-3 py-1.5 text-xs text-ad-text tabular-nums focus:outline-none"
              :class="pinInvalido(p.pin) ? 'border-ad-err/60' : 'border-ad-line focus:border-ad-accent'"
            />
          </div>
        </fieldset>

        <label class="flex items-start gap-2.5 rounded-lg border border-ad-line bg-ad-raised px-3.5 py-2.5 cursor-pointer">
          <input v-model="notificar" type="checkbox" class="mt-0.5 accent-ad-accent" />
          <span class="text-xs text-ad-text">
            Enviar los datos por correo a
            <strong class="tabular-nums text-ad-text">{{ servicio.cliente?.email ?? 'el cliente' }}</strong>
            <span class="block text-[11px] text-ad-dim mt-0.5">El cliente también los verá en «Mis servicios».</span>
          </span>
        </label>

        <p v-if="validacion" class="text-[11px] text-ad-warn">{{ validacion }}</p>

        <div class="flex justify-end gap-2 pt-1">
          <button type="button" class="rounded-lg border border-ad-line px-4 py-2 text-xs font-semibold text-ad-text hover:text-ad-text cursor-pointer" @click="emit('close')">
            Cancelar
          </button>
          <button
            type="submit"
            class="btn-primary inline-flex items-center gap-1.5 text-xs py-2 px-4 font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="enviando || Boolean(validacion)"
          >
            <Send class="size-3.5" />
            <span>{{ enviando ? 'Enviando…' : notificar ? (esReenvio ? 'Guardar y reenviar' : 'Entregar y enviar') : 'Guardar' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
