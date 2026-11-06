<script setup lang="ts">
import { computed, ref } from 'vue'
import { 
  Check, 
  CheckCircle2, 
  Copy, 
  Flame, 
  Layers, 
  PackagePlus, 
  Plus, 
  Search, 
  Sparkles, 
  Tag, 
  Trash2, 
  Tv, 
  X 
} from '@lucide/vue'
import type { ComboPromo, Plataforma } from '@/types'
import { formatPrice } from '@/composables/useFormat'

const props = defineProps<{
  combos: ComboPromo[]
  plataformas: Plataforma[]
}>()

const emit = defineEmits<{
  abrirModalCombo: []
  toggleActivo: [id: number]
  eliminarCombo: [id: number]
}>()

const searchQuery = ref('')
const estadoFiltro = ref<'TODOS' | 'ACTIVOS' | 'INACTIVOS'>('TODOS')
const copiedNotice = ref<string | null>(null)

async function copyComboShare(c: ComboPromo) {
  try {
    const platsStr = c.plataformas.map((p) => p.nombre).join(' + ')
    const msg = `*STREAMSTORE - ${c.nombre.toUpperCase()}*\n🔥 *Oferta Especial:* ${c.etiquetaPromo}\n📺 *Incluye:* ${platsStr} (${c.pantallasPorPlataforma} pantalla por servicio)\n💰 *Precio Promo:* ${formatPrice(c.precioPromo)} (Antes: ${formatPrice(c.precioRegular)})\n⏱️ *Vigencia:* ${c.duracionDias} días\n\n¡Pide tu combo ahora!`
    await navigator.clipboard.writeText(msg)
    copiedNotice.value = '¡Ficha de promoción copiada!'
    setTimeout(() => {
      copiedNotice.value = null
    }, 2200)
  } catch (err) {}
}

const combosFiltrados = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()

  return props.combos.filter((c) => {
    const matchesEstado =
      estadoFiltro.value === 'TODOS' ||
      (estadoFiltro.value === 'ACTIVOS' && c.activo) ||
      (estadoFiltro.value === 'INACTIVOS' && !c.activo)

    const matchesSearch =
      !q ||
      c.nombre.toLowerCase().includes(q) ||
      c.etiquetaPromo.toLowerCase().includes(q) ||
      c.plataformas.some((p) => p.nombre.toLowerCase().includes(q))

    return matchesEstado && matchesSearch
  })
})

const conteos = computed(() => {
  const total = props.combos.length
  const activos = props.combos.filter((c) => c.activo).length
  const inactivos = total - activos
  return { total, activos, inactivos }
})
</script>

<template>
  <div class="space-y-4">
    <!-- Toast Copiado -->
    <div
      v-if="copiedNotice"
      class="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-[#0B1528] px-4 py-2.5 text-xs font-bold text-emerald-300 shadow-xl"
    >
      <Check class="size-4 text-emerald-400" />
      <span>{{ copiedNotice }}</span>
    </div>

    <!-- Barra de Control de Promociones -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-white/10 bg-[#0D121F]">
      <div>
        <div class="flex items-center gap-2">
          <span class="rounded bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-[10px] font-black text-rose-300 uppercase tracking-widest flex items-center gap-1">
            <Flame class="size-3" />
            PROMOCIONES
          </span>
          <span class="text-xs text-slate-400 font-mono">Multi-Streaming</span>
        </div>
        <h3 class="font-display text-sm sm:text-base font-bold text-white mt-1">
          Combos y Paquetes Multi-Servicio
        </h3>
        <p class="text-xs text-slate-400 mt-0.5">
          Combina plataformas (ej. Netflix + Max HBO) con precios especiales de venta cruzada.
        </p>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-bold px-3.5 py-2 shadow-md transition-all cursor-pointer self-start sm:self-auto"
        @click="emit('abrirModalCombo')"
      >
        <PackagePlus class="size-4" />
        <span>Crear Nueva Promoción</span>
      </button>
    </div>

    <!-- Filtros de Combos -->
    <div class="rounded-xl border border-white/10 bg-[#0D121F] p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      <div class="flex items-center gap-1.5 overflow-x-auto text-xs">
        <select
          v-model="estadoFiltro"
          class="rounded-lg border border-white/10 bg-[#141B2D] px-3 py-2 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none cursor-pointer"
        >
          <option value="TODOS">Todos los combos ({{ conteos.total }})</option>
          <option value="ACTIVOS">Activos ({{ conteos.activos }})</option>
          <option value="INACTIVOS">Pausados ({{ conteos.inactivos }})</option>
        </select>

        <span class="text-slate-400 font-mono text-[11px] ml-1">
          {{ combosFiltrados.length }} combos
        </span>
      </div>

      <!-- Buscador -->
      <div class="relative sm:w-64">
        <Search class="absolute left-3 top-2.5 size-4 text-slate-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar combo o plataforma..."
          class="w-full rounded-lg border border-white/10 bg-[#141B2D] pl-9 pr-8 py-2 text-xs text-white placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none"
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
    </div>

    <!-- Lista de Tarjetas de Promociones y Combos -->
    <div v-if="combosFiltrados.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <div
        v-for="c in combosFiltrados"
        :key="c.id"
        class="rounded-xl border border-white/10 bg-[#0D121F] overflow-hidden flex flex-col justify-between hover:border-white/25 transition-all group"
      >
        <!-- Encabezado de la Tarjeta Combo -->
        <div class="p-4 space-y-3">
          <!-- Insignia de Oferta y Switch Activo -->
          <div class="flex items-center justify-between gap-2">
            <span class="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 text-[10px] font-black text-rose-300 uppercase tracking-wider">
              <Sparkles class="size-3" />
              {{ c.etiquetaPromo }}
            </span>

            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-mono font-bold transition-all cursor-pointer border"
              :class="[
                c.activo
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  : 'border-white/10 bg-[#141B2D] text-slate-400 hover:text-white'
              ]"
              @click="emit('toggleActivo', c.id)"
            >
              <span class="size-1.5 rounded-full" :class="c.activo ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'" />
              <span>{{ c.activo ? 'Activo' : 'Pausado' }}</span>
            </button>
          </div>

          <!-- Representación de Plataformas Combinadas (Logos juntos) -->
          <div class="flex items-center gap-2.5">
            <div class="flex items-center -space-x-2">
              <div
                v-for="(plat, idx) in c.plataformas"
                :key="plat.id"
                class="size-9 rounded-lg overflow-hidden border-2 border-[#0D121F] bg-[#141B2D] shadow-sm flex items-center justify-center font-bold text-xs text-white"
                :style="{ backgroundColor: plat.color || '#8057FF', zIndex: 10 - idx }"
              >
                <img
                  v-if="plat.logoUrl"
                  :src="plat.logoUrl"
                  :alt="plat.nombre"
                  class="w-full h-full object-cover"
                />
                <span v-else>{{ plat.nombre.slice(0, 2) }}</span>
              </div>
            </div>

            <div class="min-w-0 flex-1">
              <h4 class="font-display font-bold text-white text-sm truncate group-hover:text-cyan-300 transition-colors">
                {{ c.nombre }}
              </h4>
              <p class="text-[11px] text-slate-400 truncate">
                {{ c.plataformas.map(p => p.nombre).join(' + ') }}
              </p>
            </div>
          </div>

          <!-- Descripción o Beneficios -->
          <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {{ c.descripcion }}
          </p>

          <!-- Especificaciones Técnicas (Pantallas por servicio) -->
          <div class="rounded-lg border border-white/5 bg-[#141B2D] p-2.5 flex items-center justify-between text-xs">
            <div class="flex items-center gap-1.5 text-slate-400">
              <Tv class="size-3.5 text-slate-300" />
              <span>Pantallas:</span>
            </div>
            <span class="font-mono font-bold text-white">
              {{ c.pantallasPorPlataforma }} {{ c.pantallasPorPlataforma === 1 ? 'pantalla' : 'pantallas' }} c/u
            </span>
          </div>

          <!-- Bloque de Precios y Ahorro -->
          <div class="pt-2 border-t border-white/5 flex items-baseline justify-between">
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Precio Combo:</span>
              <div class="flex items-baseline gap-2">
                <span class="font-display text-lg font-black text-emerald-400">
                  {{ formatPrice(c.precioPromo) }}
                </span>
                <span class="text-xs text-slate-500 line-through font-mono">
                  {{ formatPrice(c.precioRegular) }}
                </span>
              </div>
            </div>

            <span class="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400">
              Ahorra {{ formatPrice(c.precioRegular - c.precioPromo) }}
            </span>
          </div>
        </div>

        <!-- Acciones Inferiores -->
        <div class="p-2.5 border-t border-white/5 bg-[#121829] flex items-center justify-between gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-[#141B2D] hover:border-cyan-400/50 text-xs font-semibold text-slate-200 hover:text-white px-2.5 py-1 transition-colors cursor-pointer"
            @click="copyComboShare(c)"
          >
            <Copy class="size-3 text-cyan-400" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            class="text-slate-400 hover:text-rose-400 p-1.5 rounded-md hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Eliminar combo"
            @click="emit('eliminarCombo', c.id)"
          >
            <Trash2 class="size-3.5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Estado Vacío -->
    <div
      v-else
      class="rounded-2xl border border-line/80 bg-surface/40 p-12 text-center space-y-3"
    >
      <div class="size-12 rounded-2xl bg-surface-2 flex items-center justify-center mx-auto text-muted">
        <PackagePlus class="size-6" />
      </div>
      <h3 class="font-display text-base font-bold text-fg">
        No se encontraron promociones
      </h3>
      <p class="text-xs text-muted max-w-sm mx-auto">
        Crea tu primer combo multi-plataforma (ej. Netflix + Max HBO) para aumentar el ticket promedio de compra.
      </p>
      <div class="pt-2">
        <button
          type="button"
          class="btn-primary text-xs py-2 px-4"
          @click="emit('abrirModalCombo')"
        >
          <Plus class="size-3.5" />
          <span>Crear Primer Combo</span>
        </button>
      </div>
    </div>
  </div>
</template>
