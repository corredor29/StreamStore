<script setup lang="ts">
import { computed, ref } from 'vue'
import CustomSelect from '@/components/common/CustomSelect.vue'
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

const opcionesEstadoCombos = computed(() => [
  { value: 'TODOS', label: `Todos los combos (${conteos.value.total})` },
  { value: 'ACTIVOS', label: `Activos (${conteos.value.activos})` },
  { value: 'INACTIVOS', label: `Pausados (${conteos.value.inactivos})` },
])

</script>

<template>
  <div class="space-y-4">
    <!-- Toast Copiado -->
    <div
      v-if="copiedNotice"
      class="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg border border-ad-ok/40 bg-ad-raised px-4 py-2.5 text-xs font-semibold text-ad-ok"
    >
      <Check class="size-4 text-ad-ok" />
      <span>{{ copiedNotice }}</span>
    </div>

    <!-- Barra de Control de Promociones -->
    <div class="hud-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="rounded bg-ad-err/15 border border-ad-err/30 px-2 py-0.5 text-[10px] font-semibold text-ad-err flex items-center gap-1">
            <Flame class="size-3" />
            PROMOCIONES
          </span>
          <span class="text-xs text-ad-dim tabular-nums">Multi-Streaming</span>
        </div>
        <h3 class="font-display text-sm sm:text-base font-semibold text-ad-text mt-1">
          Combos y Paquetes Multi-Servicio
        </h3>
        <p class="text-xs text-ad-dim mt-0.5">
          Combina plataformas (ej. Netflix + Max HBO) con precios especiales de venta cruzada.
        </p>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg hover:from-rose-600 hover:to-amber-600 text-ad-text text-xs font-semibold px-3.5 py-2 transition-all cursor-pointer self-start sm:self-auto"
        @click="emit('abrirModalCombo')"
      >
        <PackagePlus class="size-4" />
        <span>Crear Nueva Promoción</span>
      </button>
    </div>

    <!-- Filtros de Combos -->
    <div class="hud-panel p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      <div class="flex items-center gap-1.5 overflow-x-auto text-xs">
        <CustomSelect
          v-model="estadoFiltro"
          :options="opcionesEstadoCombos"
          aria-label="Filtrar combos"
        />

        <span class="text-ad-dim tabular-nums text-[11px] ml-1">
          {{ combosFiltrados.length }} combos
        </span>
      </div>

      <!-- Buscador -->
      <div class="relative sm:w-64">
        <Search class="absolute left-3 top-2.5 size-4 text-ad-dim" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar combo o plataforma..."
          class="w-full rounded-lg border border-ad-line bg-ad-raised pl-9 pr-8 py-2 text-xs text-ad-text placeholder:text-ad-dim focus:border-ad-accent focus:outline-none"
        />
        <button
          v-if="searchQuery"
          type="button"
          class="absolute right-2.5 top-2.5 text-ad-dim hover:text-ad-text"
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
        class="hud-panel flex flex-col justify-between hover:border-white/25 transition-all group overflow-hidden"
      >
        <!-- Portada de la Promoción si existe -->
        <div v-if="c.imagenUrl" class="relative h-28 w-full overflow-hidden bg-black">
          <img :src="c.imagenUrl" :alt="c.nombre" class="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div class="absolute inset-0 bg-gradient-to-t from-ad-panel via-ad-panel/40 to-transparent pointer-events-none" />
        </div>
        <!-- Encabezado de la Tarjeta Combo -->
        <div class="p-4 space-y-3">
          <!-- Insignia de Oferta y Switch Activo -->
          <div class="flex items-center justify-between gap-2">
            <span class="inline-flex items-center gap-1.5 rounded-full bg-ad-err/15 border border-ad-err/30 px-2.5 py-0.5 text-[10px] font-semibold text-ad-err">
              <Sparkles class="size-3" />
              {{ c.etiquetaPromo }}
            </span>

            <button
              type="button"
              class="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] tabular-nums font-semibold transition-all cursor-pointer border"
              :class="[
                c.activo
                  ? 'border-ad-ok/30 bg-ad-ok/10 text-ad-ok hover:bg-ad-ok/20'
                  : 'border-ad-line bg-ad-raised text-ad-dim hover:text-ad-text'
              ]"
              @click="emit('toggleActivo', c.id)"
            >
              <span class="size-1.5 rounded-full" :class="c.activo ? 'bg-ad-ok' : 'bg-ad-hover'" />
              <span>{{ c.activo ? 'Activo' : 'Pausado' }}</span>
            </button>
          </div>

          <!-- Representación de Plataformas Combinadas (Logos juntos) -->
          <div class="flex items-center gap-2.5">
            <div class="flex items-center -space-x-2">
              <div
                v-for="(plat, idx) in c.plataformas"
                :key="plat.id"
                class="size-9 rounded-lg overflow-hidden border-2 border-ad-panel bg-ad-raised flex items-center justify-center font-semibold text-xs text-ad-text"
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
              <h4 class="font-display font-semibold text-ad-text text-sm truncate group-hover:text-ad-accent-text transition-colors">
                {{ c.nombre }}
              </h4>
              <p class="text-[11px] text-ad-dim truncate">
                {{ c.plataformas.map(p => p.nombre).join(' + ') }}
              </p>
            </div>
          </div>

          <!-- Descripción o Beneficios -->
          <p class="text-xs text-ad-dim line-clamp-2 leading-relaxed">
            {{ c.descripcion }}
          </p>

          <!-- Especificaciones Técnicas (Pantallas por servicio) -->
          <div class="rounded-lg border border-ad-line bg-ad-raised p-2.5 flex items-center justify-between text-xs">
            <div class="flex items-center gap-1.5 text-ad-dim">
              <Tv class="size-3.5 text-ad-text" />
              <span>Pantallas:</span>
            </div>
            <span class="tabular-nums font-semibold text-ad-text">
              {{ c.pantallasPorPlataforma }} {{ c.pantallasPorPlataforma === 1 ? 'pantalla' : 'pantallas' }} c/u
            </span>
          </div>

          <!-- Bloque de Precios y Ahorro -->
          <div class="pt-2 border-t border-ad-line flex items-baseline justify-between">
            <div>
              <span class="text-[10px] font-semibold text-ad-dim block">Precio Combo:</span>
              <div class="flex items-baseline gap-2">
                <span class="font-display text-lg font-semibold text-ad-ok">
                  {{ formatPrice(c.precioPromo) }}
                </span>
                <span class="text-xs text-ad-faint line-through tabular-nums">
                  {{ formatPrice(c.precioRegular) }}
                </span>
              </div>
            </div>

            <span class="rounded bg-ad-ok/10 border border-ad-ok/20 px-2 py-0.5 text-[10px] tabular-nums font-semibold text-ad-ok">
              Ahorra {{ formatPrice(c.precioRegular - c.precioPromo) }}
            </span>
          </div>
        </div>

        <!-- Acciones Inferiores -->
        <div class="p-2.5 border-t border-ad-line bg-ad-raised flex items-center justify-between gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-md border border-ad-line bg-ad-raised hover:border-ad-accent/50 text-xs font-semibold text-ad-text hover:text-ad-text px-2.5 py-1 transition-colors cursor-pointer"
            @click="copyComboShare(c)"
          >
            <Copy class="size-3 text-ad-accent-text" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            class="text-ad-dim hover:text-ad-err p-1.5 rounded-md hover:bg-ad-err/10 transition-colors cursor-pointer"
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
      class="hud-panel p-12 text-center space-y-3"
    >
      <div class="size-12 rounded-lg bg-ad-raised flex items-center justify-center mx-auto text-ad-dim">
        <PackagePlus class="size-6" />
      </div>
      <h3 class="font-display text-base font-semibold text-ad-text">
        No se encontraron promociones
      </h3>
      <p class="text-xs text-ad-dim max-w-sm mx-auto">
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
