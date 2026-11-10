<script setup lang="ts">
import { computed, ref } from 'vue'
import CustomSelect from '@/components/common/CustomSelect.vue'
import { Check, Clock, Copy, Eye, EyeOff, PackageCheck, Search, Send, Users, X } from '@lucide/vue'
import type { ServicioAdmin } from '@/types'
import { formatDate } from '@/composables/useFormat'
import { portadaPlataforma } from '@/utils/platformArt'

const props = defineProps<{ servicios: ServicioAdmin[] }>()
const emit = defineEmits<{ entregar: [servicio: ServicioAdmin] }>()

type Filtro = 'TODOS' | 'PENDIENTE' | 'ENTREGADO' | 'POR_VENCER' | 'VENCIDO'

const searchQuery = ref('')
const filtro = ref<Filtro>('TODOS')
const revealed = ref<Record<number, boolean>>({})
const copiedNotice = ref<string | null>(null)

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text)
    copiedNotice.value = `${label} copiado`
    setTimeout(() => (copiedNotice.value = null), 2000)
  } catch {
    copiedNotice.value = 'No se pudo copiar'
  }
}

function fichaWhatsApp(s: ServicioAdmin) {
  const c = s.credenciales!
  const perfiles = c.pantallas.map((p) => `Perfil ${p.perfil} · PIN ${p.pin}`).join('\n')
  return `*STREAMSTORE - DATOS DE TU SUSCRIPCIÓN*\n\nServicio: ${s.plataforma}\nCorreo: ${c.email}\nClave: ${c.password}\n${perfiles}\nVence: ${formatDate(s.fechaVencimiento)}`
}

const ESTADO_BADGE = {
  ACTIVO: { label: 'Activo', dot: 'bg-ad-ok', cls: 'bg-ad-ok/10 text-ad-ok' },
  POR_VENCER: { label: 'Por vencer', dot: 'bg-ad-warn', cls: 'bg-ad-warn/10 text-ad-warn' },
  VENCIDO: { label: 'Vencido', dot: 'bg-ad-err', cls: 'bg-ad-err/10 text-ad-err' },
} as const

const conteos = computed(() => ({
  total: props.servicios.length,
  pendientes: props.servicios.filter((s) => s.estadoEntrega === 'PENDIENTE' && s.estado !== 'VENCIDO').length,
  entregados: props.servicios.filter((s) => s.estadoEntrega === 'ENTREGADO').length,
  porVencer: props.servicios.filter((s) => s.estado === 'POR_VENCER').length,
  vencidos: props.servicios.filter((s) => s.estado === 'VENCIDO').length,
}))

const serviciosFiltrados = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  return props.servicios
    .filter((s) => {
      const f = filtro.value
      const okFiltro =
        f === 'TODOS' ||
        (f === 'PENDIENTE' && s.estadoEntrega === 'PENDIENTE' && s.estado !== 'VENCIDO') ||
        (f === 'ENTREGADO' && s.estadoEntrega === 'ENTREGADO') ||
        s.estado === f
      const okBusqueda =
        !q ||
        s.plataforma.toLowerCase().includes(q) ||
        s.cliente?.nombre.toLowerCase().includes(q) ||
        s.cliente?.email.toLowerCase().includes(q) ||
        s.credenciales?.email.toLowerCase().includes(q) ||
        `#${s.id}`.includes(q) ||
        `#${s.compraId}`.includes(q)
      return okFiltro && okBusqueda
    })
    // Los pendientes de entrega primero: son los que requieren acción
    .sort((a, b) => Number(b.estadoEntrega === 'PENDIENTE' && b.estado !== 'VENCIDO') - Number(a.estadoEntrega === 'PENDIENTE' && a.estado !== 'VENCIDO'))
})

const opcionesFiltroServicios = computed(() => [
  { value: 'TODOS', label: `Todos (${conteos.value.total})` },
  { value: 'PENDIENTE', label: `Por entregar (${conteos.value.pendientes})` },
  { value: 'ENTREGADO', label: `Entregados (${conteos.value.entregados})` },
  { value: 'POR_VENCER', label: `Por vencer (${conteos.value.porVencer})` },
  { value: 'VENCIDO', label: `Vencidos (${conteos.value.vencidos})` },
])

</script>

<template>
  <div class="space-y-3">
    <div
      v-if="copiedNotice"
      role="status"
      class="hud-panel fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-ad-text"
    >
      <Check class="size-4 text-ad-ok" />
      <span>{{ copiedNotice }}</span>
    </div>

    <!-- Aviso de entregas pendientes -->
    <button
      v-if="conteos.pendientes > 0 && filtro !== 'PENDIENTE'"
      type="button"
      class="w-full flex items-center gap-3 rounded-lg border border-ad-warn/40 bg-ad-warn/10 p-3.5 text-left text-xs text-ad-warn hover:bg-ad-warn/15 transition-colors cursor-pointer"
      @click="filtro = 'PENDIENTE'"
    >
      <Clock class="size-5 text-ad-warn shrink-0" />
      <span class="flex-1">
        <strong class="text-ad-warn">{{ conteos.pendientes }} {{ conteos.pendientes === 1 ? 'cliente espera' : 'clientes esperan' }} sus datos de acceso.</strong>
        Pagaron, pero su cuenta no tenía credenciales cargadas.
      </span>
      <span class="font-semibold text-ad-warn shrink-0">Ver pendientes</span>
    </button>

    <div class="hud-panel p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      <div class="relative flex-1 max-w-md">
        <Search class="absolute left-3 top-2.5 size-4 text-ad-dim" />
        <input
          v-model="searchQuery"
          type="search"
          aria-label="Buscar servicios"
          placeholder="Buscar por cliente, correo, plataforma o #ID..."
          class="w-full rounded-lg border border-ad-line bg-ad-raised pl-9 pr-8 py-2 text-xs text-ad-text placeholder:text-ad-dim focus:border-ad-accent focus:outline-none"
        />
        <button v-if="searchQuery" type="button" aria-label="Limpiar búsqueda" class="absolute right-2.5 top-2.5 text-ad-dim hover:text-ad-text" @click="searchQuery = ''">
          <X class="size-3.5" />
        </button>
      </div>
      <div class="flex items-center gap-2">
        <CustomSelect
          v-model="filtro"
          :options="opcionesFiltroServicios"
          aria-label="Filtrar servicios"
        />
        <span class="text-ad-dim tabular-nums text-[11px] hidden sm:inline">{{ serviciosFiltrados.length }} servicios</span>
      </div>
    </div>

    <div class="hud-panel">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="border-b border-ad-line bg-ad-raised/40 font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-ad-dim">
            <tr>
              <th class="py-3 px-4">Servicio</th>
              <th class="py-3 px-4">Cliente</th>
              <th class="py-3 px-4">Acceso entregado</th>
              <th class="py-3 px-4">Vencimiento</th>
              <th class="py-3 px-4 text-right">Entrega</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-ad-line">
            <tr
              v-for="s in serviciosFiltrados"
              :key="s.id"
              class="hover:bg-ad-hover transition-colors"
              :class="{ 'bg-ad-warn/[0.04]': s.estadoEntrega === 'PENDIENTE' && s.estado !== 'VENCIDO' }"
            >
              <td class="py-3.5 px-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <img :src="portadaPlataforma(s.plataforma)" alt="" class="h-9 w-14 shrink-0 rounded-md border border-white/10 bg-black object-cover" />
                  <div class="space-y-1">
                    <span class="block font-hud font-bold uppercase tracking-tight text-ad-text">{{ s.plataforma }}</span>
                    <span :class="s.tipo === 'CUENTA_COMPLETA' ? 'chip-completa' : 'chip-pantalla'">
                      {{ s.tipo === 'CUENTA_COMPLETA' ? 'Cuenta completa' : '1 pantalla (PIN)' }}
                    </span>
                    <span class="block font-mono text-[10px] text-ad-faint">#{{ s.id }} · Compra #{{ s.compraId }}</span>
                  </div>
                </div>
              </td>

              <td class="py-3.5 px-4 whitespace-nowrap">
                <template v-if="s.cliente">
                  <span class="font-medium text-ad-text block">{{ s.cliente.nombre }}</span>
                  <span class="tabular-nums text-[11px] text-ad-dim">{{ s.cliente.email }}</span>
                </template>
                <span v-else class="text-ad-faint">—</span>
              </td>

              <td class="py-3.5 px-4 whitespace-nowrap">
                <div v-if="s.credenciales" class="space-y-1 tabular-nums">
                  <div class="flex items-center gap-1.5 text-ad-text">
                    <span>{{ s.credenciales.email }}</span>
                    <button type="button" class="text-ad-dim hover:text-ad-text p-0.5" aria-label="Copiar correo" @click="copyText(s.credenciales.email, 'Correo')">
                      <Copy class="size-3" />
                    </button>
                  </div>
                  <div class="flex items-center gap-1.5 text-[11px] text-ad-dim">
                    <span>{{ revealed[s.id] ? s.credenciales.password : '••••••••' }}</span>
                    <button
                      type="button"
                      class="text-ad-dim hover:text-ad-text p-0.5"
                      :aria-label="revealed[s.id] ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                      @click="revealed[s.id] = !revealed[s.id]"
                    >
                      <EyeOff v-if="revealed[s.id]" class="size-3" />
                      <Eye v-else class="size-3" />
                    </button>
                    <span v-if="s.credenciales.pantallas.length === 1" class="text-ad-faint">
                      · {{ s.credenciales.pantallas[0].perfil }} / PIN {{ revealed[s.id] ? s.credenciales.pantallas[0].pin : '••••' }}
                    </span>
                    <span v-else class="text-ad-faint">· {{ s.credenciales.pantallas.length }} perfiles</span>
                  </div>
                </div>
                <span
                  v-else-if="s.estadoEntrega === 'PENDIENTE' && s.estado !== 'VENCIDO'"
                  class="inline-flex items-center gap-1.5 rounded-full bg-ad-warn/10 px-2.5 py-0.5 text-[11px] font-semibold text-ad-warn"
                >
                  <Clock class="size-3" /> Pendiente de entrega
                </span>
                <span v-else class="text-ad-faint text-[11px]">No disponible (vencido)</span>
              </td>

              <td class="py-3.5 px-4 whitespace-nowrap">
                <span class="text-ad-text block">{{ formatDate(s.fechaVencimiento) }}</span>
                <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-full px-2 py-0.5 mt-0.5" :class="ESTADO_BADGE[s.estado].cls">
                  <span class="size-1.5 rounded-full" :class="ESTADO_BADGE[s.estado].dot" />
                  {{ s.estado === 'VENCIDO' ? 'Vencido' : `${s.diasRestantes} días` }}
                </span>
              </td>

              <td class="py-3.5 px-4 text-right whitespace-nowrap">
                <div class="inline-flex items-center gap-1.5">
                  <button
                    v-if="s.credenciales"
                    type="button"
                    class="inline-flex items-center gap-1 rounded-md border border-ad-line hover:border-ad-accent/50 bg-ad-raised text-ad-text hover:text-ad-text px-2.5 py-1 text-xs font-semibold cursor-pointer"
                    title="Copiar ficha para WhatsApp"
                    @click="copyText(fichaWhatsApp(s), 'Ficha')"
                  >
                    <Copy class="size-3 text-ad-accent-text" /> Ficha
                  </button>
                  <button
                    v-if="s.estado !== 'VENCIDO'"
                    type="button"
                    class="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold cursor-pointer transition-colors"
                    :class="s.estadoEntrega === 'PENDIENTE'
                      ? 'bg-ad-warn text-black hover:bg-ad-warn'
                      : 'border border-ad-line hover:border-ad-accent/50 bg-ad-raised text-ad-text hover:text-ad-text'"
                    @click="emit('entregar', s)"
                  >
                    <PackageCheck v-if="s.estadoEntrega === 'PENDIENTE'" class="size-3.5" />
                    <Send v-else class="size-3 text-ad-accent-text" />
                    {{ s.estadoEntrega === 'PENDIENTE' ? 'Entregar' : 'Reenviar' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="serviciosFiltrados.length === 0" class="p-12 text-center text-ad-dim space-y-2">
        <Users class="size-8 mx-auto text-ad-faint" />
        <p class="text-sm font-semibold text-ad-text">No hay servicios con estos filtros</p>
        <p class="text-xs">Aparecerán aquí cuando los clientes compren.</p>
      </div>
    </div>
  </div>
</template>
