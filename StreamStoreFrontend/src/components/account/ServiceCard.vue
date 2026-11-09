<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { 
  AlertTriangle, 
  Check, 
  CheckCircle2, 
  Clock, 
  Copy, 
  ExternalLink,
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
      dotCls: 'bg-rose-500',
      text: 'Servicio expirado',
      progressCls: 'bg-rose-500/40',
    }
  }
  if (isPorVencer.value) {
    return {
      label: 'POR VENCER',
      icon: AlertTriangle,
      badgeCls: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
      dotCls: 'bg-amber-400 animate-ping',
      text: `¡Vence en ${props.servicio.diasRestantes} día(s)!`,
      progressCls: 'bg-gradient-to-r from-amber-500 to-amber-300',
    }
  }
  return {
    label: 'ACTIVO',
    icon: CheckCircle2,
    badgeCls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    dotCls: 'bg-emerald-400',
    text: `${props.servicio.diasRestantes} días restantes`,
    progressCls: 'bg-gradient-to-r from-emerald-500 via-cyan-400 to-cyan-300',
  }
})

const platformColor = computed(() => props.servicio.plataforma?.color || '#8057FF')

const platformLogo = computed(() => {
  const plat = props.servicio.plataforma
  const slug = (plat?.slug || plat?.nombre || '').toLowerCase()

  if (slug.includes('net')) return '/home_logos/netflix.png'
  if (slug.includes('dis')) return '/disne.png'
  if (slug.includes('max') || slug.includes('hbo')) return '/home_logos/max.png'
  if (slug.includes('prime') || slug.includes('amz')) return '/home_logos/prime.png'
  if (slug.includes('param')) return '/home_logos/paramount.png'
  if (slug.includes('crunch')) return '/home_logos/crunchyroll.png'
  if (slug.includes('spot')) return '/home_logos/spotify.png'
  if (slug.includes('appl')) return '/home_logos/appletv.png'
  return plat?.logoUrl || '/streamstore_icon.png'
})

const platformUrl = computed(() => {
  const slug = (props.servicio.plataforma?.slug || props.servicio.plataforma?.nombre || '').toLowerCase()
  if (slug.includes('net')) return 'https://www.netflix.com'
  if (slug.includes('dis')) return 'https://www.disneyplus.com'
  if (slug.includes('max') || slug.includes('hbo')) return 'https://www.max.com'
  if (slug.includes('prime') || slug.includes('amz')) return 'https://www.primevideo.com'
  if (slug.includes('param')) return 'https://www.paramountplus.com'
  if (slug.includes('crunch')) return 'https://www.crunchyroll.com'
  if (slug.includes('spot')) return 'https://open.spotify.com'
  if (slug.includes('appl')) return 'https://tv.apple.com'
  return '#'
})

// Porcentaje de ciclo consumido para la barra de progreso
const progressPercentage = computed(() => {
  if (isVencido.value) return 100
  const dias = Math.max(0, props.servicio.diasRestantes)
  const pct = Math.min(100, Math.max(8, ((30 - dias) / 30) * 100))
  return pct
})

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

const perfiles = computed(() => {
  const lista = props.servicio.perfiles ?? []
  if (lista.length) return lista
  if (!props.servicio.perfil && !props.servicio.pin) return []
  return [{ numero: 1, perfil: props.servicio.perfil || 'Principal', pin: props.servicio.pin || '' }]
})

function copyAllCredentials() {
  const parts = [
    `🎬 ${props.servicio.plataforma?.nombre || 'Streaming'} - StreamStore VIP`,
    `Plan: ${props.servicio.tipo === 'CUENTA_COMPLETA' ? 'Cuenta Completa (Todas las pantallas)' : 'Pantalla Individual (PIN)'}`,
    `📧 Correo: ${props.servicio.correoAcceso}`,
    `🔑 Contraseña: ${props.servicio.passwordAcceso}`,
  ]
  for (const p of perfiles.value) {
    parts.push(p.pin ? `👤 Perfil: ${p.perfil} · PIN: ${p.pin}` : `👤 Perfil: ${p.perfil}`)
  }
  parts.push(`📅 Vencimiento: ${formatDate(props.servicio.fechaVencimiento)}`)

  copyToClipboard(parts.join('\n'), 'all')
}
</script>

<template>
  <article
    class="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#131728]/95 via-[#0D101E]/95 to-[#080A14]/98 p-6 shadow-2xl backdrop-blur-2xl transition-all duration-300 hover:border-white/25 hover:shadow-[0_20px_45px_rgba(0,0,0,0.85)] group"
    :class="[
      isVencido ? 'border-rose-500/30 opacity-75' :
      isPorVencer ? 'border-amber-500/40 shadow-amber-500/5' :
      'hover:border-cyan-400/35'
    ]"
    :aria-labelledby="`service-title-${servicio.id}`"
  >
    <!-- Línea Neón Superior Resplandeciente -->
    <div
      class="absolute left-0 top-0 h-1.5 w-full"
      :style="{ backgroundColor: platformColor, boxShadow: `0 0 20px ${platformColor}` }"
      aria-hidden="true"
    />

    <!-- Sutil resplandor ambiental en la esquina superior -->
    <div
      class="absolute -top-16 -right-16 size-48 rounded-full blur-[70px] opacity-25 pointer-events-none"
      :style="{ backgroundColor: platformColor }"
    />

    <div class="space-y-5 pt-1 relative z-10">
      <!-- ================= CABECERA: LOGO FLOTANTE SIN CUADRO BLANCO + METADATOS ================= -->
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="flex min-w-0 flex-1 basis-56 items-center gap-3.5">
          <!-- Cápsula Oscura Glassmorphism para el Logo Oficial (Sin caja blanca opaca) -->
          <div class="h-13 w-24 sm:w-28 shrink-0 bg-white/[0.04] rounded-2xl p-2.5 border border-white/10 flex items-center justify-center backdrop-blur-md shadow-inner">
            <img
              v-if="platformLogo"
              :src="platformLogo"
              :alt="servicio.plataforma?.nombre"
              class="max-h-8 max-w-full object-contain drop-shadow-md"
            />
            <span v-else class="font-display text-xs font-black text-white uppercase">
              {{ servicio.plataforma?.nombre || 'STREAMING' }}
            </span>
          </div>

          <div class="min-w-0">
            <span class="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-black block truncate">
              {{ servicio.tipo === 'CUENTA_COMPLETA' ? 'Cuenta completa' : 'Pantalla con PIN' }}
            </span>
            <h3
              :id="`service-title-${servicio.id}`"
              class="font-display text-lg sm:text-xl font-black text-white mt-0.5 tracking-tight truncate drop-shadow"
            >
              {{ servicio.plataforma?.nombre || 'Servicio Streaming' }}
            </h3>
          </div>
        </div>

        <!-- Badge de Estado Dinámico -->
        <div class="shrink-0 sm:text-right">
          <span
            class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-wider backdrop-blur-sm"
            :class="statusConfig.badgeCls"
          >
            <span class="size-2 rounded-full" :class="statusConfig.dotCls" />
            {{ statusConfig.label }}
          </span>
          <span
            class="block mt-1 text-[11px] font-medium"
            :class="isPorVencer ? 'text-amber-300 font-bold' : isVencido ? 'text-rose-400' : 'text-slate-400'"
          >
            {{ statusConfig.text }}
          </span>
        </div>
      </div>

      <!-- ================= BARRA DE CICLO DE VIDA / PROGRESO ================= -->
      <div class="rounded-2xl border border-white/10 bg-white/[0.02] p-3 text-xs">
        <div class="flex items-center justify-between text-slate-400 text-[11px] font-medium mb-2">
          <span class="flex items-center gap-1">
            <Clock class="size-3 text-slate-500" aria-hidden="true" />
            Inicio: {{ formatDate(servicio.fechaCompra) }}
          </span>
          <span>
            Vence: <strong class="text-white font-bold">{{ formatDate(servicio.fechaVencimiento) }}</strong>
          </span>
        </div>
        <!-- Pista de Progreso -->
        <div class="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            class="h-full transition-all duration-500 rounded-full"
            :class="statusConfig.progressCls"
            :style="{ width: `${progressPercentage}%` }"
          />
        </div>
      </div>

      <!-- ================= BÓVEDA DE CREDENCIALES SEGURA ================= -->
      <div class="space-y-2.5 rounded-2xl border border-white/10 bg-black/60 p-4 text-xs shadow-inner">
        <div class="flex items-center justify-between font-bold text-white text-[11px] uppercase tracking-wider pb-1 border-b border-white/5">
          <span class="flex items-center gap-1.5 text-cyan-400 font-mono font-black">
            <KeyRound class="size-3.5 text-cyan-400" aria-hidden="true" />
            Credenciales de Acceso
          </span>
          <span v-if="isVencido" class="text-rose-400 font-medium normal-case flex items-center gap-1">
            <XCircle class="size-3" />
            Expirado
          </span>
          <span v-else class="text-emerald-400 font-mono text-[10px] normal-case flex items-center gap-1">
            <CheckCircle2 class="size-3 text-emerald-400" />
            Verificado y Seguro
          </span>
        </div>

        <!-- Correo de Acceso -->
        <div class="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 flex items-center justify-between gap-2 hover:border-white/20 transition-colors">
          <div class="flex items-center gap-2.5 min-w-0">
            <Mail class="size-3.5 text-slate-400 shrink-0" aria-hidden="true" />
            <div class="min-w-0">
              <span class="text-[9px] font-mono uppercase text-slate-400 block -mb-0.5">Correo Electrónico</span>
              <span class="font-mono text-white text-xs truncate select-all block">{{ servicio.correoAcceso }}</span>
            </div>
          </div>
          <button
            type="button"
            class="text-slate-400 hover:text-cyan-300 shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            :aria-label="copiedField === 'email' ? 'Correo copiado' : 'Copiar correo de acceso'"
            @click="copyToClipboard(servicio.correoAcceso, 'email')"
          >
            <Check v-if="copiedField === 'email'" class="size-3.5 text-emerald-400" />
            <Copy v-else class="size-3.5" />
          </button>
        </div>

        <!-- Contraseña con Mostrar/Ocultar -->
        <div class="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 flex items-center justify-between gap-2 hover:border-white/20 transition-colors">
          <div class="flex items-center gap-2.5 min-w-0">
            <Lock class="size-3.5 text-slate-400 shrink-0" aria-hidden="true" />
            <div class="min-w-0">
              <span class="text-[9px] font-mono uppercase text-slate-400 block -mb-0.5">Contraseña</span>
              <span class="font-mono text-white text-xs truncate select-all block">
                {{ showPassword ? servicio.passwordAcceso : '••••••••••••' }}
              </span>
            </div>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <button
              type="button"
              class="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              :aria-label="showPassword ? 'Ocultar contraseña' : 'Ver contraseña'"
              @click="showPassword = !showPassword"
            >
              <component :is="showPassword ? EyeOff : Eye" class="size-3.5" />
            </button>
            <button
              type="button"
              class="text-slate-400 hover:text-cyan-300 p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              :aria-label="copiedField === 'password' ? 'Contraseña copiada' : 'Copiar contraseña'"
              @click="copyToClipboard(servicio.passwordAcceso, 'password')"
            >
              <Check v-if="copiedField === 'password'" class="size-3.5 text-emerald-400" />
              <Copy v-else class="size-3.5" />
            </button>
          </div>
        </div>

        <!-- Perfiles y PIN -->
        <div v-if="perfiles.length" class="space-y-1.5 pt-0.5">
          <div
            v-for="p in perfiles"
            :key="p.numero"
            class="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2.5"
          >
            <div class="flex items-center gap-2 min-w-0">
              <User class="size-3.5 text-cyan-400 shrink-0" aria-hidden="true" />
              <span class="truncate text-[11px] text-slate-200 font-semibold">{{ p.perfil }}</span>
            </div>
            <div v-if="p.pin" class="flex items-center gap-1.5 shrink-0">
              <span class="text-[10px] font-mono uppercase text-slate-400 font-bold">PIN</span>
              <span class="font-mono font-black text-cyan-300 tracking-widest text-xs px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-500/40 shadow-sm">
                {{ p.pin }}
              </span>
              <button
                type="button"
                class="text-slate-400 hover:text-cyan-300 p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                :aria-label="copiedField === `pin-${p.numero}` ? `PIN copiado` : `Copiar PIN`"
                @click="copyToClipboard(p.pin, `pin-${p.numero}`)"
              >
                <Check v-if="copiedField === `pin-${p.numero}`" class="size-3 text-emerald-400" />
                <Copy v-else class="size-3" />
              </button>
            </div>
            <span v-else class="text-[10px] text-slate-500 font-mono shrink-0">Sin PIN</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ================= BOTONES DE ACCIÓN: COPIAR / ABRIR / RENOVAR ================= -->
    <div class="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2.5 relative z-10">
      <!-- Copiar Credenciales -->
      <button
        type="button"
        class="flex-1 inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-2.5 px-3 transition-all cursor-pointer gap-2"
        :class="{ 'border-emerald-500 text-emerald-400 bg-emerald-500/10': copiedField === 'all' }"
        @click="copyAllCredentials"
      >
        <Check v-if="copiedField === 'all'" class="size-3.5 text-emerald-400" aria-hidden="true" />
        <Copy v-else class="size-3.5 text-cyan-400" aria-hidden="true" />
        <span>{{ copiedField === 'all' ? '¡Credenciales copiadas!' : 'Copiar credenciales' }}</span>
      </button>

      <!-- Abrir Plataforma (Si está activo) -->
      <a
        v-if="!isVencido"
        :href="platformUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white p-2.5 transition-all cursor-pointer shrink-0"
        :title="`Abrir ${servicio.plataforma?.nombre || 'plataforma'}`"
        :aria-label="`Abrir ${servicio.plataforma?.nombre || 'plataforma'} en una pestaña nueva`"
      >
        <ExternalLink class="size-4" aria-hidden="true" />
      </a>

      <!-- Renovar Plan (Si está por vencer o vencido) -->
      <RouterLink
        v-if="isVencido || isPorVencer"
        to="/catalogo"
        class="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-brand-500 to-cyan-500 hover:opacity-95 text-neutral-950 font-black text-xs py-2.5 px-4 transition-all gap-1.5 grow shadow-lg sm:grow-0"
      >
        <RefreshCw class="size-3.5" />
        <span>Renovar plan</span>
      </RouterLink>
    </div>
  </article>
</template>
