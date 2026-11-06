<script setup lang="ts">
import { computed, ref } from 'vue'
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Eye, 
  EyeOff, 
  KeyRound, 
  Mail, 
  Search, 
  Users, 
  X, 
  XCircle 
} from '@lucide/vue'
import type { Servicio } from '@/types'
import { formatDate } from '@/composables/useFormat'

const props = defineProps<{
  servicios: Servicio[]
}>()

const searchQuery = ref('')
const estadoFiltro = ref<string>('TODOS')
const revealedPasswords = ref<Record<number, boolean>>({})
const copiedNotice = ref<string | null>(null)

function togglePassword(id: number) {
  revealedPasswords.value[id] = !revealedPasswords.value[id]
}

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text)
    copiedNotice.value = `¡${label} copiado!`
    setTimeout(() => {
      copiedNotice.value = null
    }, 2000)
  } catch (err) {}
}

function getEstadoBadge(estado: Servicio['estado']) {
  switch (estado) {
    case 'ACTIVO':
      return { label: 'Activo', cls: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30', icon: CheckCircle2 }
    case 'POR_VENCER':
      return { label: 'Por Vencer', cls: 'bg-amber-500/20 text-amber-400 border border-amber-500/30', icon: AlertTriangle }
    case 'VENCIDO':
      return { label: 'Vencido', cls: 'bg-red-500/15 text-red-400 border border-red-500/30', icon: XCircle }
    default:
      return { label: estado, cls: 'bg-surface-2 text-muted border border-line', icon: Clock }
  }
}

const serviciosFiltrados = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()

  return props.servicios.filter((s) => {
    const matchesEstado = estadoFiltro.value === 'TODOS' || s.estado === estadoFiltro.value

    const matchesSearch =
      !q ||
      s.plataforma?.nombre?.toLowerCase().includes(q) ||
      s.correoAcceso?.toLowerCase().includes(q) ||
      s.perfil?.toLowerCase().includes(q) ||
      s.compraId?.toString().includes(q)

    return matchesEstado && matchesSearch
  })
})

const conteos = computed(() => {
  const activos = props.servicios.filter((s) => s.estado === 'ACTIVO').length
  const porVencer = props.servicios.filter((s) => s.estado === 'POR_VENCER').length
  const vencidos = props.servicios.filter((s) => s.estado === 'VENCIDO').length
  return { activos, porVencer, vencidos, total: props.servicios.length }
})
</script>

<template>
  <div class="space-y-4">
    <!-- Notificación Copiado -->
    <div
      v-if="copiedNotice"
      class="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-[#0B1528] px-4 py-2.5 text-xs font-bold text-emerald-300 shadow-xl"
    >
      <CheckCircle2 class="size-4 text-emerald-400" />
      <span>{{ copiedNotice }}</span>
    </div>

    <!-- Mini Banner de Resumen de Servicios -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="rounded-xl border border-line/70 bg-surface/60 p-3.5 flex items-center justify-between">
        <div>
          <span class="text-[10px] uppercase font-bold text-muted">Suscripciones Activas</span>
          <p class="font-display text-lg font-black text-emerald-400 mt-0.5">
            {{ conteos.activos }}
          </p>
        </div>
        <div class="size-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
          <CheckCircle2 class="size-4" />
        </div>
      </div>

      <div class="rounded-xl border border-line/70 bg-surface/60 p-3.5 flex items-center justify-between">
        <div>
          <span class="text-[10px] uppercase font-bold text-muted">Próximas a Vencer (&le; 3 días)</span>
          <p class="font-display text-lg font-black text-amber-400 mt-0.5">
            {{ conteos.porVencer }}
          </p>
        </div>
        <div class="size-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400">
          <AlertTriangle class="size-4" />
        </div>
      </div>

      <div class="rounded-xl border border-line/70 bg-surface/60 p-3.5 flex items-center justify-between">
        <div>
          <span class="text-[10px] uppercase font-bold text-muted">Cuentas Vencidas</span>
          <p class="font-display text-lg font-black text-red-400 mt-0.5">
            {{ conteos.vencidos }}
          </p>
        </div>
        <div class="size-8 rounded-lg bg-red-500/15 flex items-center justify-center text-red-400">
          <XCircle class="size-4" />
        </div>
      </div>
    </div>

    <!-- Barra de Filtros -->
    <div class="rounded-2xl border border-line/80 bg-surface/80 backdrop-blur p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-md">
      <!-- Pastillas de Estado -->
      <div class="flex items-center gap-1.5 overflow-x-auto">
        <button
          type="button"
          class="px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          :class="estadoFiltro === 'TODOS' ? 'bg-surface-2 text-fg font-bold' : 'text-muted hover:text-fg'"
          @click="estadoFiltro = 'TODOS'"
        >
          Todas ({{ conteos.total }})
        </button>
        <button
          type="button"
          class="px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer text-emerald-400 transition-colors"
          :class="estadoFiltro === 'ACTIVO' ? 'bg-emerald-500/20 font-bold border border-emerald-500/30' : 'hover:bg-surface-2/60'"
          @click="estadoFiltro = 'ACTIVO'"
        >
          Activas ({{ conteos.activos }})
        </button>
        <button
          type="button"
          class="px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer text-amber-400 transition-colors"
          :class="estadoFiltro === 'POR_VENCER' ? 'bg-amber-500/20 font-bold border border-amber-500/30' : 'hover:bg-surface-2/60'"
          @click="estadoFiltro = 'POR_VENCER'"
        >
          Por vencer ({{ conteos.porVencer }})
        </button>
        <button
          type="button"
          class="px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer text-red-400 transition-colors"
          :class="estadoFiltro === 'VENCIDO' ? 'bg-red-500/20 font-bold border border-red-500/30' : 'hover:bg-surface-2/60'"
          @click="estadoFiltro = 'VENCIDO'"
        >
          Vencidas ({{ conteos.vencidos }})
        </button>
      </div>

      <!-- Buscador -->
      <div class="relative sm:w-64">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar cliente, correo o servicio..."
          class="w-full rounded-xl border border-line bg-surface-2 pl-8 pr-7 py-1.5 text-xs text-fg placeholder:text-muted/60 focus:border-brand-400 focus:outline-none"
        />
        <Search class="absolute left-2.5 top-2 size-3.5 text-muted" />
        <button
          v-if="searchQuery"
          type="button"
          class="absolute right-2 top-2 text-muted hover:text-fg"
          @click="searchQuery = ''"
        >
          <X class="size-3.5" />
        </button>
      </div>
    </div>

    <!-- Lista de Servicios Asignados a Clientes -->
    <div v-if="serviciosFiltrados.length > 0" class="space-y-3">
      <div
        v-for="s in serviciosFiltrados"
        :key="s.id"
        class="rounded-2xl border border-line/70 bg-[#12172D] p-4 sm:p-5 transition-all hover:border-brand-500/40 space-y-3"
      >
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div
              class="size-10 rounded-xl flex items-center justify-center font-display font-black text-xs text-white shrink-0 shadow-sm"
              :style="{ backgroundColor: s.plataforma?.color || '#8057FF' }"
            >
              {{ (s.plataforma?.nombre || 'SS').slice(0, 3) }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-display font-bold text-fg text-sm">
                  {{ s.plataforma?.nombre }}
                </span>
                <span class="rounded bg-surface-2 px-1.5 py-0.2 font-mono text-[10px] text-muted border border-line/60">
                  {{ s.tipo === 'CUENTA_COMPLETA' ? 'Cuenta Completa' : '1 Pantalla' }}
                </span>
                <span
                  class="rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider"
                  :class="getEstadoBadge(s.estado).cls"
                >
                  {{ getEstadoBadge(s.estado).label }}
                </span>
              </div>
              <p class="text-xs text-muted mt-0.5">
                Perfil: <strong class="text-fg">{{ s.perfil || 'Principal' }}</strong>
                <span v-if="s.pin" class="ml-2">· PIN: <strong class="font-mono text-fg">{{ s.pin }}</strong></span>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3 self-end sm:self-auto">
            <!-- Días Restantes -->
            <div class="text-right">
              <span class="text-[10px] uppercase font-bold text-muted block">Vigencia:</span>
              <span
                class="font-mono font-bold text-xs"
                :class="s.diasRestantes <= 0 ? 'text-red-400' : s.diasRestantes <= 3 ? 'text-amber-400' : 'text-emerald-400'"
              >
                {{ s.diasRestantes > 0 ? `${s.diasRestantes} días restantes` : 'Expiró' }}
              </span>
            </div>

            <!-- Botón Copiar Entrega WhatsApp / Soporte -->
            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-xl border border-brand-500/40 bg-brand-500/15 hover:bg-brand-500/25 text-brand-300 px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer"
              title="Copiar datos de entrega para enviar al cliente"
              @click="copyText(`*STREAMSTORE - DATOS DE TU SUSCRIPCIÓN*\n\n📺 *Servicio:* ${s.plataforma?.nombre}\n👤 *Perfil:* ${s.perfil || 'Principal'}\n🔑 *PIN:* ${s.pin || 'Sin PIN'}\n📧 *Correo:* ${s.correoAcceso}\n🔒 *Clave:* ${s.passwordAcceso}\n📅 *Vence:* ${formatDate(s.fechaVencimiento)}\n\n¡Gracias por tu compra!`, 'Ficha de entrega')"
            >
              <Copy class="size-3" />
              <span>Copiar Entrega</span>
            </button>
          </div>
        </div>

        <!-- Credenciales de Entrega -->
        <div class="rounded-xl border border-line/60 bg-[#0C1022] p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div class="flex items-center justify-between">
            <span class="text-muted flex items-center gap-1.5 text-[11px]">
              <Mail class="size-3.5 text-brand-300" /> Correo entrega:
            </span>
            <div class="flex items-center gap-1 font-mono font-semibold text-fg">
              <span>{{ s.correoAcceso }}</span>
              <button
                type="button"
                class="text-muted hover:text-brand-300 p-0.5"
                @click="copyText(s.correoAcceso, 'Correo')"
              >
                <Copy class="size-3" />
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-muted flex items-center gap-1.5 text-[11px]">
              <KeyRound class="size-3.5 text-brand-300" /> Contraseña:
            </span>
            <div class="flex items-center gap-1.5 font-mono font-semibold text-fg">
              <span>{{ revealedPasswords[s.id] ? s.passwordAcceso : '••••••••••••' }}</span>
              <button
                type="button"
                class="text-muted hover:text-brand-300 p-0.5"
                @click="togglePassword(s.id)"
              >
                <EyeOff v-if="revealedPasswords[s.id]" class="size-3.5" />
                <Eye v-else class="size-3.5" />
              </button>
              <button
                type="button"
                class="text-muted hover:text-brand-300 p-0.5"
                @click="copyText(s.passwordAcceso, 'Contraseña')"
              >
                <Copy class="size-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado Vacío -->
    <div
      v-else
      class="rounded-2xl border border-line/80 bg-surface/40 p-10 text-center space-y-2 text-muted"
    >
      <Users class="size-8 mx-auto text-muted/60" />
      <p class="text-sm font-semibold text-fg">No hay suscripciones entregadas con estos filtros</p>
      <p class="text-xs">Los servicios aparecerán automáticamente cuando los clientes realicen compras.</p>
    </div>
  </div>
</template>
