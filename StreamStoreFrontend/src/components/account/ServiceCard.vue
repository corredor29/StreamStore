<script setup lang="ts">
import { computed, ref } from 'vue'
import { 
  AlertTriangle, 
  Check, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Eye, 
  EyeOff, 
  KeyRound, 
  Lock, 
  Mail, 
  User, 
  XCircle 
} from '@lucide/vue'
import type { Servicio } from '@/types'
import { formatDate } from '@/composables/useFormat'

const props = defineProps<{
  servicio: Servicio
}>()

const showPassword = ref(false)
const copiedField = ref<string | null>(null)

const isVencido = computed(() => props.servicio.estado === 'VENCIDO')
const isPorVencer = computed(() => props.servicio.estado === 'POR_VENCER')

const statusConfig = computed(() => {
  switch (props.servicio.estado) {
    case 'ACTIVO':
      return {
        label: 'ACTIVO',
        icon: CheckCircle2,
        badgeCls: 'bg-success/15 text-success border-success/30',
        text: `${props.servicio.diasRestantes} días restantes`,
      }
    case 'POR_VENCER':
      return {
        label: 'POR VENCER',
        icon: AlertTriangle,
        badgeCls: 'bg-warning/20 text-warning border-warning/40 animate-pulse',
        text: `¡Vence en ${props.servicio.diasRestantes} día(s)!`,
      }
    case 'VENCIDO':
      return {
        label: 'VENCIDO',
        icon: XCircle,
        badgeCls: 'bg-danger/15 text-danger border-danger/30',
        text: 'Servicio expirado',
      }
  }
})

async function copyToClipboard(text: string, fieldName: string) {
  try {
    await navigator.clipboard.writeText(text)
    copiedField.value = fieldName
    setTimeout(() => {
      copiedField.value = null
    }, 2000)
  } catch {
    // Fallback manual en caso de bloqueo de permisos
    const el = document.createElement('textarea')
    el.value = text
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
    copiedField.value = fieldName
    setTimeout(() => {
      copiedField.value = null
    }, 2000)
  }
}

function copyAllCredentials() {
  const parts = [
    `Plataforma: ${props.servicio.plataforma.nombre}`,
    `Modalidad: ${props.servicio.tipo === 'CUENTA_COMPLETA' ? 'Cuenta Completa' : 'Pantalla Individual'}`,
    `Correo: ${props.servicio.correoAcceso}`,
    `Contraseña: ${props.servicio.passwordAcceso}`,
  ]
  if (props.servicio.perfil) parts.push(`Perfil: ${props.servicio.perfil}`)
  if (props.servicio.pin) parts.push(`PIN: ${props.servicio.pin}`)
  parts.push(`Vence: ${formatDate(props.servicio.fechaVencimiento)}`)

  copyToClipboard(parts.join('\n'), 'all')
}
</script>

<template>
  <article
    class="card relative flex flex-col justify-between overflow-hidden border-2 transition-all duration-200"
    :class="[
      isVencido ? 'border-danger/30 opacity-80' :
      isPorVencer ? 'border-warning/50 shadow-md shadow-warning/5' :
      'border-line hover:border-brand-400/40'
    ]"
    :aria-labelledby="`service-title-${servicio.id}`"
  >
    <!-- Borde superior con acento de color de plataforma -->
    <div
      class="absolute left-0 top-0 h-1.5 w-full"
      :style="{ backgroundColor: servicio.plataforma.color || '#7c4dff' }"
      aria-hidden="true"
    />

    <div>
      <!-- Encabezado de la tarjeta -->
      <div class="flex items-start justify-between gap-3 pt-2">
        <div>
          <span class="text-[11px] font-semibold uppercase tracking-wider text-muted">
            {{ servicio.tipo === 'CUENTA_COMPLETA' ? 'Cuenta Completa' : 'Pantalla Individual' }}
          </span>
          <h3
            :id="`service-title-${servicio.id}`"
            class="font-display text-lg font-bold text-fg flex items-center gap-2"
          >
            <span
              class="size-2.5 rounded-full"
              :style="{ backgroundColor: servicio.plataforma.color || '#fff' }"
              aria-hidden="true"
            />
            {{ servicio.plataforma.nombre }}
          </h3>
        </div>

        <!-- Badge de Estado (Verde / Amarillo / Rojo) -->
        <div class="text-right">
          <span
            class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider"
            :class="statusConfig.badgeCls"
          >
            <component :is="statusConfig.icon" class="size-3.5" aria-hidden="true" />
            {{ statusConfig.label }}
          </span>
          <span class="block mt-1 text-[11px] font-medium" :class="isPorVencer ? 'text-warning' : isVencido ? 'text-danger' : 'text-muted'">
            {{ statusConfig.text }}
          </span>
        </div>
      </div>

      <!-- Fechas de servicio -->
      <div class="mt-4 flex flex-wrap items-center justify-between gap-2 border-y border-line/60 py-2.5 text-xs text-muted">
        <span class="flex items-center gap-1">
          <Clock class="size-3.5" aria-hidden="true" />
          Adquirido: {{ formatDate(servicio.fechaCompra) }}
        </span>
        <span>
          Vence: <strong class="text-fg">{{ formatDate(servicio.fechaVencimiento) }}</strong>
        </span>
      </div>

      <!-- Bloque de Credenciales Protegidas -->
      <div class="mt-4 space-y-3 rounded-xl bg-surface-2 p-3.5 text-xs">
        <p class="font-bold text-fg text-[11px] uppercase tracking-wider flex items-center justify-between">
          <span class="flex items-center gap-1.5">
            <KeyRound class="size-3.5 text-brand-300" aria-hidden="true" />
            Credenciales de acceso
          </span>
          <span v-if="isVencido" class="text-danger font-medium normal-case">
            Acceso suspendido
          </span>
        </p>

        <!-- Correo de acceso -->
        <div class="flex items-center justify-between gap-2 rounded-lg border border-line bg-surface p-2">
          <div class="flex items-center gap-2 min-w-0">
            <Mail class="size-3.5 text-muted shrink-0" aria-hidden="true" />
            <span class="font-mono text-fg truncate select-all">{{ servicio.correoAcceso }}</span>
          </div>
          <button
            type="button"
            class="text-muted hover:text-brand-300 shrink-0 p-1 rounded hover:bg-surface-2 transition-colors"
            :aria-label="copiedField === 'email' ? 'Correo copiado' : 'Copiar correo de acceso'"
            @click="copyToClipboard(servicio.correoAcceso, 'email')"
          >
            <Check v-if="copiedField === 'email'" class="size-3.5 text-success" />
            <Copy v-else class="size-3.5" />
          </button>
        </div>

        <!-- Contraseña con Mostrar/Ocultar -->
        <div class="flex items-center justify-between gap-2 rounded-lg border border-line bg-surface p-2">
          <div class="flex items-center gap-2 min-w-0">
            <Lock class="size-3.5 text-muted shrink-0" aria-hidden="true" />
            <span class="font-mono text-fg truncate select-all">
              {{ showPassword ? servicio.passwordAcceso : '••••••••••••' }}
            </span>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <!-- Alternar visibilidad -->
            <button
              type="button"
              class="text-muted hover:text-fg p-1 rounded hover:bg-surface-2 transition-colors"
              :aria-label="showPassword ? 'Ocultar contraseña' : 'Ver contraseña'"
              @click="showPassword = !showPassword"
            >
              <component :is="showPassword ? EyeOff : Eye" class="size-3.5" />
            </button>
            <!-- Copiar contraseña -->
            <button
              type="button"
              class="text-muted hover:text-brand-300 p-1 rounded hover:bg-surface-2 transition-colors"
              :aria-label="copiedField === 'password' ? 'Contraseña copiada' : 'Copiar contraseña'"
              @click="copyToClipboard(servicio.passwordAcceso, 'password')"
            >
              <Check v-if="copiedField === 'password'" class="size-3.5 text-success" />
              <Copy v-else class="size-3.5" />
            </button>
          </div>
        </div>

        <!-- Perfil y PIN si aplica -->
        <div v-if="servicio.perfil || servicio.pin" class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <!-- Perfil -->
          <div v-if="servicio.perfil" class="flex items-center justify-between rounded-lg border border-line bg-surface p-2">
            <div class="flex items-center gap-1.5 min-w-0">
              <User class="size-3 text-muted shrink-0" aria-hidden="true" />
              <span class="truncate text-[11px] text-fg font-medium">{{ servicio.perfil }}</span>
            </div>
          </div>

          <!-- PIN -->
          <div v-if="servicio.pin" class="flex items-center justify-between rounded-lg border border-line bg-surface p-2">
            <span class="text-[11px] text-muted">PIN:</span>
            <span class="font-mono font-bold text-brand-200">{{ servicio.pin }}</span>
            <button
              type="button"
              class="text-muted hover:text-brand-300 p-1 rounded hover:bg-surface-2 transition-colors"
              :aria-label="copiedField === 'pin' ? 'PIN copiado' : 'Copiar PIN'"
              @click="copyToClipboard(servicio.pin!, 'pin')"
            >
              <Check v-if="copiedField === 'pin'" class="size-3 text-success" />
              <Copy v-else class="size-3" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Botón de Copiar Todas las Credenciales -->
    <div class="mt-4 pt-3 border-t border-line/60 flex items-center justify-between">
      <button
        type="button"
        class="btn-secondary w-full text-xs py-2 gap-2"
        :class="{ 'border-success text-success': copiedField === 'all' }"
        @click="copyAllCredentials"
      >
        <Check v-if="copiedField === 'all'" class="size-3.5 text-success" aria-hidden="true" />
        <Copy v-else class="size-3.5 text-brand-300" aria-hidden="true" />
        <span>{{ copiedField === 'all' ? '¡Todas las credenciales copiadas!' : 'Copiar todo al portapapeles' }}</span>
      </button>
    </div>
  </article>
</template>
