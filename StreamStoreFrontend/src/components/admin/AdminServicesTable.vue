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
  Mail, 
  Search, 
  Tv, 
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
      return { 
        label: 'Activo', 
        dot: 'bg-emerald-400', 
        cls: 'bg-emerald-500/10 text-emerald-400' 
      }
    case 'POR_VENCER':
      return { 
        label: 'Por Vencer', 
        dot: 'bg-amber-400', 
        cls: 'bg-amber-500/10 text-amber-400' 
      }
    case 'VENCIDO':
      return { 
        label: 'Vencido', 
        dot: 'bg-red-400', 
        cls: 'bg-red-500/10 text-red-400' 
      }
    default:
      return { 
        label: estado, 
        dot: 'bg-slate-400', 
        cls: 'bg-slate-500/10 text-slate-400' 
      }
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
  <div class="space-y-3">
    <!-- Toast Copiado -->
    <div
      v-if="copiedNotice"
      class="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border border-white/15 bg-[#141B2D] px-3.5 py-2 text-xs font-semibold text-white shadow-xl shadow-black/80"
    >
      <Check class="size-4 text-emerald-400" />
      <span>{{ copiedNotice }}</span>
    </div>

    <!-- Barra de Herramientas y Filtros -->
    <div class="rounded-xl border border-white/10 bg-[#0D121F] p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      <!-- Buscador -->
      <div class="relative flex-1 max-w-md">
        <Search class="absolute left-3 top-2.5 size-4 text-slate-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por cliente, correo o servicio..."
          class="w-full rounded-lg border border-white/10 bg-[#141B2D] pl-9 pr-8 py-2 text-xs text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none transition-colors"
        />
        <button
          v-if="searchQuery"
          type="button"
          class="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
          @click="searchQuery = ''"
        >
          <X class="size-3.5" />
        </button>
      </div>

      <!-- Pastillas de Estado -->
      <div class="flex items-center gap-2 text-xs">
        <select
          v-model="estadoFiltro"
          class="rounded-lg border border-white/10 bg-[#141B2D] px-3 py-2 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none cursor-pointer"
        >
          <option value="TODOS">Todos los servicios ({{ conteos.total }})</option>
          <option value="ACTIVO">Activos ({{ conteos.activos }})</option>
          <option value="POR_VENCER">Por vencer ({{ conteos.porVencer }})</option>
          <option value="VENCIDO">Vencidos ({{ conteos.vencidos }})</option>
        </select>

        <span class="text-slate-400 font-mono text-[11px] hidden sm:inline">
          {{ serviciosFiltrados.length }} suscripciones
        </span>
      </div>
    </div>

    <!-- TABLA DE SUSCRIPCIONES Y ENTREGAS A CLIENTES -->
    <div class="rounded-xl border border-white/10 bg-[#0D121F] overflow-hidden shadow-sm">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="bg-[#121829] border-b border-white/10 text-slate-400 uppercase text-[11px] font-semibold tracking-wider">
            <tr>
              <th class="py-3 px-4 w-12 text-center">ID</th>
              <th class="py-3 px-4">Plataforma</th>
              <th class="py-3 px-4">Credenciales Asignadas</th>
              <th class="py-3 px-4">Perfil & PIN</th>
              <th class="py-3 px-4">Vencimiento</th>
              <th class="py-3 px-4 text-center">Estado</th>
              <th class="py-3 px-4 text-right">Ficha</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/[0.06]">
            <tr
              v-for="s in serviciosFiltrados"
              :key="s.id"
              class="hover:bg-[#141B2E] transition-colors"
            >
              <!-- ID -->
              <td class="py-3.5 px-4 text-center font-mono text-slate-400 text-xs font-semibold whitespace-nowrap">
                #{{ s.id }}
              </td>

              <!-- Plataforma -->
              <td class="py-3.5 px-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <div
                    class="size-6 rounded flex items-center justify-center text-[10px] font-bold text-white uppercase shrink-0"
                    :style="{ backgroundColor: s.plataforma?.color || '#8057FF' }"
                  >
                    {{ (s.plataforma?.nombre || 'SS').slice(0, 2) }}
                  </div>
                  <div>
                    <span class="font-semibold text-white">{{ s.plataforma?.nombre }}</span>
                    <span class="text-[10px] text-slate-400 block font-mono">
                      {{ s.tipo === 'CUENTA_COMPLETA' ? 'Completa' : '1 Pantalla' }}
                    </span>
                  </div>
                </div>
              </td>

              <!-- Credenciales (Correo + Password) -->
              <td class="py-3.5 px-4 whitespace-nowrap">
                <div class="space-y-1">
                  <div class="flex items-center gap-1.5 font-mono text-xs">
                    <span class="text-white">{{ s.correoAcceso }}</span>
                    <button
                      type="button"
                      class="text-slate-400 hover:text-white p-0.5"
                      title="Copiar correo"
                      @click="copyText(s.correoAcceso, 'Correo')"
                    >
                      <Copy class="size-3" />
                    </button>
                  </div>
                  <div class="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                    <span>{{ revealedPasswords[s.id] ? s.passwordAcceso : '••••••••' }}</span>
                    <button
                      type="button"
                      class="text-slate-400 hover:text-white p-0.5"
                      @click="togglePassword(s.id)"
                    >
                      <EyeOff v-if="revealedPasswords[s.id]" class="size-3" />
                      <Eye v-else class="size-3" />
                    </button>
                    <button
                      type="button"
                      class="text-slate-400 hover:text-white p-0.5"
                      title="Copiar contraseña"
                      @click="copyText(s.passwordAcceso, 'Contraseña')"
                    >
                      <Copy class="size-3" />
                    </button>
                  </div>
                </div>
              </td>

              <!-- Perfil & PIN -->
              <td class="py-3.5 px-4 whitespace-nowrap">
                <span class="font-medium text-white block">{{ s.perfil || 'Principal' }}</span>
                <span v-if="s.pin" class="font-mono text-[11px] text-slate-400">
                  PIN: <strong class="text-white">{{ s.pin }}</strong>
                </span>
                <span v-else class="text-[10px] text-slate-500">Sin PIN</span>
              </td>

              <!-- Vencimiento -->
              <td class="py-3.5 px-4 whitespace-nowrap">
                <span class="text-slate-300 block text-xs">{{ formatDate(s.fechaVencimiento) }}</span>
                <span
                  class="font-mono text-[11px] font-semibold"
                  :class="s.diasRestantes <= 0 ? 'text-red-400' : s.diasRestantes <= 3 ? 'text-amber-400' : 'text-emerald-400'"
                >
                  {{ s.diasRestantes > 0 ? `${s.diasRestantes} días restantes` : 'Expiró' }}
                </span>
              </td>

              <!-- Estado -->
              <td class="py-3.5 px-4 text-center whitespace-nowrap">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                  :class="getEstadoBadge(s.estado).cls"
                >
                  <span class="size-1.5 rounded-full" :class="getEstadoBadge(s.estado).dot" />
                  {{ getEstadoBadge(s.estado).label }}
                </span>
              </td>

              <!-- Copiar Ficha WhatsApp -->
              <td class="py-3.5 px-4 text-right whitespace-nowrap">
                <button
                  type="button"
                  class="inline-flex items-center gap-1 rounded-md border border-white/10 hover:border-cyan-400/50 bg-[#141B2D] text-slate-200 hover:text-white px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer"
                  title="Copiar ficha de entrega para WhatsApp"
                  @click="copyText(`*STREAMSTORE - DATOS DE TU SUSCRIPCIÓN*\n\n📺 *Servicio:* ${s.plataforma?.nombre}\n👤 *Perfil:* ${s.perfil || 'Principal'}\n🔑 *PIN:* ${s.pin || 'Sin PIN'}\n📧 *Correo:* ${s.correoAcceso}\n🔒 *Clave:* ${s.passwordAcceso}\n📅 *Vence:* ${formatDate(s.fechaVencimiento)}`, 'Ficha WhatsApp')"
                >
                  <Copy class="size-3 text-cyan-400" />
                  <span>WhatsApp</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Estado Vacío -->
      <div v-if="serviciosFiltrados.length === 0" class="p-12 text-center text-slate-400 space-y-2">
        <Users class="size-8 mx-auto text-slate-600" />
        <p class="text-sm font-semibold text-white">No hay suscripciones entregadas con estos filtros</p>
        <p class="text-xs">Los registros aparecerán cuando los clientes adquieran planes.</p>
      </div>
    </div>
  </div>
</template>
