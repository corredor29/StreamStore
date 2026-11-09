<script setup lang="ts">
import { computed } from 'vue'
import { Film, Plus, Tv, Users } from '@lucide/vue'
import type { CuentaAdmin, Plataforma } from '@/types'
import { portadaPlataforma } from '@/utils/platformArt'

const props = defineProps<{
  plataformas: Plataforma[]
  cuentas: CuentaAdmin[]
}>()

const emit = defineEmits<{ cargarCuenta: [plataforma?: Plataforma] }>()

const SEGMENTOS = 12

const tarjetas = computed(() =>
  props.plataformas.map((plat) => {
    const cuentas = props.cuentas.filter(
      (c) => c.plataformaId === plat.id || c.plataforma?.slug === plat.slug || c.plataforma?.nombre === plat.nombre,
    )
    const total = cuentas.reduce((acc, c) => acc + c.totalPantallas, 0)
    const libres = cuentas.reduce((acc, c) => acc + c.pantallasDisponibles, 0)
    // Cuentas que todavía se pueden vender completas (ninguna pantalla vendida)
    const completasLibres = cuentas.filter((c) => c.totalPantallas > 0 && c.pantallasDisponibles === c.totalPantallas).length
    const estado =
      libres === 0
        ? { label: 'Agotado', cls: 'text-rose-400' }
        : libres <= 2
          ? { label: `¡Últimas ${libres}!`, cls: 'text-amber-400' }
          : { label: 'En stock', cls: 'text-emerald-400' }
    return {
      plat,
      portada: portadaPlataforma(plat.nombre, plat.slug, plat.coverUrl),
      cuentas: cuentas.length,
      total,
      libres,
      completasLibres,
      llenos: total ? Math.round((libres / total) * SEGMENTOS) : 0,
      estado,
    }
  }),
)
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <p class="text-[13px] text-ad-dim">Stock por servicio, tal como lo ve el cliente en el catálogo.</p>
      <button type="button" class="btn-ad-ghost h-9 shrink-0" @click="emit('cargarCuenta')">
        <Plus class="size-3.5" /> Agregar cuenta
      </button>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="t in tarjetas"
        :key="t.plat.id"
        class="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/90 transition-colors hover:border-cyan-500/50"
        :class="{ 'opacity-70': t.libres === 0 }"
      >
        <div class="relative h-36 overflow-hidden bg-black">
          <img :src="t.portada" :alt="t.plat.nombre" class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" loading="lazy" />
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
          <span class="absolute left-2.5 top-2.5 rounded-md border border-white/20 bg-black/60 px-2 py-0.5 font-mono text-[10px] font-bold text-white">
            {{ t.cuentas }} {{ t.cuentas === 1 ? 'cuenta' : 'cuentas' }}
          </span>
        </div>

        <div class="flex flex-1 flex-col gap-3 p-4">
          <div class="flex items-start justify-between gap-2">
            <h3 class="font-hud text-sm font-bold uppercase tracking-tight text-slate-100">{{ t.plat.nombre }}</h3>
            <span class="text-xs font-bold" :class="t.estado.cls">{{ t.estado.label }}</span>
          </div>

          <div>
            <div class="flex items-baseline justify-between">
              <span class="font-hud text-2xl font-black text-white tabular-nums">
                {{ t.libres }}<span class="font-mono text-sm font-normal text-ad-faint"> / {{ t.total }}</span>
              </span>
              <span class="font-mono text-[10px] uppercase tracking-wider text-ad-dim">pantallas libres</span>
            </div>
            <div class="mt-2 flex gap-[3px]" role="img" :aria-label="`${t.libres} de ${t.total} pantallas libres`">
              <span v-for="i in SEGMENTOS" :key="i" class="h-1.5 flex-1 rounded-[1px]" :class="i <= t.llenos ? 'bg-cyan-400' : 'bg-white/10'" />
            </div>
          </div>

          <div class="flex flex-wrap gap-1.5">
            <span class="chip-pantalla"><Tv class="size-3" /> {{ t.libres }} pantallas</span>
            <span class="chip-completa"><Users class="size-3" /> {{ t.completasLibres }} completas</span>
          </div>

          <button type="button" class="btn-ad mt-auto h-9 w-full" @click="emit('cargarCuenta', t.plat)">
            <Plus class="size-3.5" /> Abastecer {{ t.plat.nombre }}
          </button>
        </div>
      </article>
    </div>

    <div v-if="tarjetas.length === 0" class="hud-panel px-6 py-14 text-center">
      <Film class="mx-auto size-6 text-ad-faint" />
      <p class="mt-2 text-[13px] font-semibold text-white">No hay plataformas</p>
      <p class="mt-0.5 text-xs text-ad-dim">Crea una con «Nueva plataforma».</p>
    </div>
  </div>
</template>
