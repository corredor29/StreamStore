<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
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
  RefreshCw,
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

const isVencido = computed(() => {
  const est = (props.servicio.estado || '').toUpperCase()
  return est.includes('VENCID') || props.servicio.diasRestantes <= 0
})

const isPorVencer = computed(() => {
  const est = (props.servicio.estado || '').toUpperCase()
  return est.includes('VENCER') || (props.servicio.diasRestantes > 0 && props.servicio.diasRestantes <= 3)
})

const statusConfig = computed(() => {
  if (isVencido.value) {
    return {
      label: 'VENCIDO',
      icon: XCircle,
      badgeCls: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      text: 'Servicio expirado',
    }
  }
  if (isPorVencer.value) {
    return {
      label: 'POR VENCER',
      icon: AlertTriangle,
      badgeCls: 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse',
      text: `¡Vence en ${props.servicio.diasRestantes} día(s)!`,
    }
  }
  return {
    label: 'ACTIVO',
    icon: CheckCircle2,
    badgeCls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    text: `${props.servicio.diasRestantes} días restantes`,
  }
})

const platformColor = computed(() => props.servicio.plataforma?.color || '#8057FF')
const platformLogo = computed(() => props.servicio.plataforma?.logoUrl || null)

async function copyToClipboard(text: string, fieldName: string) {
  try {
    await navigator.clipboard.writeText(text)
    copiedField.value = fieldName
    setTimeout(() => {
      copiedField.value = null
    }, 2000)
  } catch {
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
    `Plataforma: ${props.servicio.plataforma?.nombre || 'Streaming'}`,
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
    class="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/80 backdrop-blur-xl p-5 shadow-xl transition-all duration-300 hover:border-white/25 hover:shadow-2xl"
    :class="[
      isVencido ? 'border-rose-500/30 opacity-80' :
      isPorVencer ? 'border-amber-500/50 shadow-amber-500/5' :
      'hover:border-cyan-500/40'
    ]"
    :aria-labelledby="`service-title-${servicio.id}`"
  >
    <!-- Línea superior con color neón de la plataforma -->
    <div
      class="absolute left-0 top-0 h-1.5 w-full"
      :style="{ backgroundColor: platformColor, boxShadow: `0 0 15px ${platformColor}` }"
      aria-hidden="true"
    />

    <div class="space-y-4 pt-1">
      <!-- Encabezado con Logo Oficial de la Plataforma -->
      <div class="flex items-start justify-between gap-3">
        <div>
          <span class="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
            {{ servicio.tipo === 'CUENTA_COMPLETA' ? 'Cuenta Completa' : 'Pantalla Individual (PIN)' }}
          </span>
          <div class="mt-1 flex items-center gap-2.5">
            <img
              v-if="platformLogo"
              :src="platformLogo"
              :alt="servicio.plataforma?.nombre"
              class="h-7 max-w-[120px] object-contain drop-shadow"
            />
            <h3
              v-else
              :id="`service-title-${servicio.id}`"
              class="font-display text-lg font-black text-white"
            >
              {{ servicio.plataforma?.nombre || 'Servicio Streaming' }}
            </h3>
          </div>
        </div>

        <!-- Badge de Estado (Verde / Amarillo / Rojo) -->
        <div class="text-right shrink-0">
          <span
            class="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider"
            :class="statusConfig.badgeCls"
          >
            <component :is="statusConfig.icon" class="size-3.5" aria-hidden="true" />
            {{ statusConfig.label }}
          </span>
          <span
            class="block mt-1 text-[11px] font-medium"
            :class="isPorVencer ? 'text-amber-300' : isVencido ? 'text-rose-400' : 'text-slate-400'"
          >
            {{ statusConfig.text }}
          </span>
        </div>
      </div>

      <!-- Fechas de servicio -->
      <div class="flex flex-wrap items-center justify-between gap-2 border-y border-white/10 py-2.5 text-xs text-slate-400">
        <span class="flex items-center gap-1">
          <Clock class="size-3.5 text-slate-500" aria-hidden="true" />
          Inicio: {{ formatDate(servicio.fechaCompra) }}
        </span>
        <span>
          Vence: <strong class="text-white font-semibold">{{ formatDate(servicio.fechaVencimiento) }}</strong>
        </span>
      </div>

      <!-- Bloque de Credenciales Protegidas -->
      <div class="space-y-3 rounded-xl border border-white/10 bg-black/50 p-3.5 text-xs">
        <div class="flex items-center justify-between font-bold text-white text-[11px] uppercase tracking-wider">
          <span class="flex items-center gap-1.5 text-cyan-300">
            <KeyRound class="size-3.5 text-cyan-400" aria-hidden="true" />
            Credenciales de Acceso
          </span>
          <span v-if="isVencido" class="text-rose-400 font-medium normal-case">
            Expirado
          </span>
          <span v-else class="text-emerald-400 font-mono text-[10px] normal-case">
            ● Verificado
          </span>
        </div>

        <!-- Correo de acceso -->
        <div class="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 p-2.5">
          <div class="flex items-center gap-2 min-w-0">
            <Mail class="size-3.5 text-slate-400 shrink-0" aria-hidden="true" />
            <span class="font-mono text-white text-xs truncate select-all">{{ servicio.correoAcceso }}</span>
          </div>
          <button
            type="button"
            class="text-slate-400 hover:text-cyan-300 shrink-0 p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
            :aria-label="copiedField === 'email' ? 'Correo copiado' : 'Copiar correo de acceso'"
            @click="copyToClipboard(servicio.correoAcceso, 'email')"
          >
            <Check v-if="copiedField === 'email'" class="size-3.5 text-emerald-400" />
            <Copy v-else class="size-3.5" />
          </button>
        </div>

        <!-- Contraseña con Mostrar/Ocultar -->
        <div class="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 p-2.5">
          <div class="flex items-center gap-2 min-w-0">
            <Lock class="size-3.5 text-slate-400 shrink-0" aria-hidden="true" />
            <span class="font-mono text-white text-xs truncate select-all">
              {{ showPassword ? servicio.passwordAcceso : '••••••••••••' }}
            </span>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <!-- Alternar visibilidad -->
            <button
              type="button"
              class="text-slate-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
              :aria-label="showPassword ? 'Ocultar contraseña' : 'Ver contraseña'"
              @click="showPassword = !showPassword"
            >
              <component :is="showPassword ? EyeOff : Eye" class="size-3.5" />
            </button>
            <!-- Copiar contraseña -->
            <button
              type="button"
              class="text-slate-400 hover:text-cyan-300 p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
              :aria-label="copiedField === 'password' ? 'Contraseña copiada' : 'Copiar contraseña'"
              @click="copyToClipboard(servicio.passwordAcceso, 'password')"
            >
              <Check v-if="copiedField === 'password'" class="size-3.5 text-emerald-400" />
              <Copy v-else class="size-3.5" />
            </button>
          </div>
        </div>

        <!-- Perfil y PIN si aplica -->
        <div v-if="servicio.perfil || servicio.pin" class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <!-- Perfil -->
          <div v-if="servicio.perfil" class="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2.5">
            <div class="flex items-center gap-1.5 min-w-0">
              <User class="size-3 text-cyan-400 shrink-0" aria-hidden="true" />
              <span class="truncate text-[11px] text-slate-200 font-medium">{{ servicio.perfil }}</span>
            </div>
          </div>

          <!-- PIN -->
          <div v-if="servicio.pin" class="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2.5">
            <span class="text-[11px] text-slate-400">PIN:</span>
            <span class="font-mono font-black text-cyan-300 tracking-widest text-xs px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/30">
              {{ servicio.pin }}
            </span>
            <button
              type="button"
              class="text-slate-400 hover:text-cyan-300 p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
              :aria-label="copiedField === 'pin' ? 'PIN copiado' : 'Copiar PIN'"
              @click="copyToClipboard(servicio.pin!, 'pin')"
            >
              <Check v-if="copiedField === 'pin'" class="size-3.5 text-emerald-400" />
              <Copy v-else class="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Botones de Acción: Copiar todo / Renovar -->
    <div class="mt-5 pt-3.5 border-t border-white/10 flex flex-col sm:flex-row gap-2.5">
      <button
        type="button"
        class="flex-1 inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-2.5 px-3 transition-all cursor-pointer gap-2"
        :class="{ 'border-emerald-500 text-emerald-400 bg-emerald-500/10': copiedField === 'all' }"
        @click="copyAllCredentials"
      >
        <Check v-if="copiedField === 'all'" class="size-3.5 text-emerald-400" aria-hidden="true" />
        <Copy v-else class="size-3.5 text-cyan-400" aria-hidden="true" />
        <span>{{ copiedField === 'all' ? '¡Credenciales copiadas!' : 'Copiar credenciales' }}</span>
      </button>

      <RouterLink
        v-if="isVencido || isPorVencer"
        to="/catalogo"
        class="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-500 to-cyan-500 hover:opacity-90 text-neutral-950 font-black text-xs py-2.5 px-4 transition-all gap-1.5 shrink-0 shadow-lg"
      >
        <RefreshCw class="size-3" />
        <span>Renovar Plan</span>
      </RouterLink>
    </div>
  </article>
</template>
