<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { 
  ArrowUpDown, 
  Check, 
  ChevronDown, 
  ChevronRight, 
  Flame, 
  PackageX, 
  Percent, 
  Plus, 
  RotateCcw, 
  SlidersHorizontal, 
  Sparkles, 
  Tv 
} from '@lucide/vue'
import { useCartStore } from '@/stores/cart'
import type { ComboPromo } from '@/types'
import AppLoader from '@/components/common/AppLoader.vue'
import AppAlert from '@/components/common/AppAlert.vue'
import ProductCard from '@/components/catalog/ProductCard.vue'
import { productService } from '@/services/productService'
import type { Plataforma, Producto, TipoProducto } from '@/types'
import { useClientFonts } from '@/composables/useClientFonts'
import '@/styles/client-ui.css'

useClientFonts()

const route = useRoute()
const router = useRouter()

const plataformas = ref<Plataforma[]>([])
const productos = ref<Producto[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Filtros reactivos sincronizados con URL
const plataformaSeleccionada = ref((route.query.plataforma as string) || '')
const tipoSeleccionado = ref((route.query.tipo as string) || '')
const precioMin = ref('')
const precioMax = ref('')
const ordenSeleccionado = ref('destacados')
const cart = useCartStore()
const promociones = ref<ComboPromo[]>([])
const isSortDropdownOpen = ref(false)
const toastComboAgregado = ref<string | null>(null)

const sortOptions = [
  { value: 'destacados', label: 'Destacados' },
  { value: 'precio_asc', label: 'Precio: menor a mayor' },
  { value: 'precio_desc', label: 'Precio: mayor a menor' },
  { value: 'nombre', label: 'Nombre: A a Z' },
]

function comboToProducto(c: ComboPromo): Producto {
  return {
    id: c.id + 100000,
    plataformaId: c.plataformas[0]?.id || 1,
    plataforma: {
      id: c.plataformas[0]?.id || 1,
      nombre: c.plataformas.map((p: any) => p.nombre).join(' + '),
      slug: 'combo',
      color: '#8b6cff',
      logoUrl: c.plataformas[0]?.logoUrl || null,
      coverUrl: c.imagenUrl || null,
    },
    nombre: c.nombre,
    tipo: 'CUENTA_COMPLETA',
    duracionDias: c.duracionDias,
    precio: c.precioPromo,
    stock: 10,
    activo: c.activo,
  }
}

function agregarComboAlCarrito(combo: ComboPromo) {
  const prod = comboToProducto(combo)
  const res = cart.addItem(prod)
  if (res.success) {
    toastComboAgregado.value = `¡${combo.nombre} agregado al carrito!`
    setTimeout(() => {
      toastComboAgregado.value = null
    }, 3000)
  }
}

function onDocumentClick(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('#orden-dropdown-container')) {
    isSortDropdownOpen.value = false
  }
}


// En móvil los filtros empiezan plegados para que los planes queden a la vista
const filtrosVisibles = ref(false)

const filtrosActivos = computed(
  () => [plataformaSeleccionada.value, tipoSeleccionado.value, precioMin.value, precioMax.value].filter(Boolean).length,
)

async function loadData() {
  loading.value = true
  error.value = null
  try {
    const [plats, prods, prom] = await Promise.all([
      productService.getPlataformas(),
      productService.getProductos(),
      productService.getPromociones(),
    ])
    plataformas.value = plats
    productos.value = prods
    promociones.value = prom.filter((p) => p.activo)
  } catch (err: any) {
    error.value = err?.message || 'Error al cargar los productos del catálogo.'
  } finally {
    loading.value = false
  }
}

watch(
  () => [plataformaSeleccionada.value, tipoSeleccionado.value],
  () => {
    const query: Record<string, string> = {}
    if (plataformaSeleccionada.value) query.plataforma = plataformaSeleccionada.value
    if (tipoSeleccionado.value) query.tipo = tipoSeleccionado.value
    router.replace({ query })
  }
)

function resetFiltros() {
  plataformaSeleccionada.value = ''
  tipoSeleccionado.value = ''
  precioMin.value = ''
  precioMax.value = ''
  ordenSeleccionado.value = 'destacados'
}

// Combina productos normales y combos promocionales como entidades de producto integradas
const todosLosProductos = computed<Producto[]>(() => {
  const prods = [...productos.value]

  const combosComoProductos: Producto[] = promociones.value
    .filter((c) => c.activo)
    .map((c) => {
      const platPrincipal = c.plataformas[0]
      return {
        id: 100000 + c.id,
        plataformaId: platPrincipal?.id || 1,
        plataforma: {
          id: platPrincipal?.id || 1,
          nombre: c.plataformas.map((p) => p.nombre).join(' + '),
          slug: platPrincipal?.slug || 'combo',
          color: platPrincipal?.color || '#8b6cff',
          logoUrl: platPrincipal?.logoUrl || null,
          coverUrl: c.imagenUrl || (platPrincipal as any)?.coverUrl || null,
        },
        nombre: c.nombre,
        tipo: 'COMBO' as TipoProducto,
        esCombo: true,
        etiquetaPromo: c.etiquetaPromo || 'COMBO OFERTA',
        precioRegular: Number(c.precioRegular),
        duracionDias: c.duracionDias,
        precio: Number(c.precioPromo),
        stock: 10,
        activo: c.activo,
        descripcion: c.descripcion || null,
        plataformasCombo: c.plataformas,
      }
    })

  return [...prods, ...combosComoProductos]
})

// Filtrado reactivo en memoria: si filtras por Netflix, ves productos de Netflix Y además
// combos que incluyan Netflix. Si filtras por Disney, ves Disney Y combos que incluyan Disney.
const productosFiltrados = computed(() => {
  let list = todosLosProductos.value

  // 1. Filtro por plataforma cruzado
  if (plataformaSeleccionada.value) {
    const slugFiltro = plataformaSeleccionada.value.toLowerCase().trim()
    list = list.filter((p) => {
      const pSlug = (p.plataforma?.slug || p.plataforma?.nombre || '').toLowerCase().trim()
      if (pSlug === slugFiltro || pSlug.includes(slugFiltro)) return true

      if (p.esCombo && p.plataformasCombo?.length) {
        return p.plataformasCombo.some((plat) => {
          const platSlug = (plat.slug || plat.nombre || '').toLowerCase().trim()
          return platSlug === slugFiltro || platSlug.includes(slugFiltro) || slugFiltro.includes(platSlug)
        })
      }

      return false
    })
  }

  // 2. Filtro por tipo de plan (con tag Promociones y Combos)
  if (tipoSeleccionado.value) {
    if (tipoSeleccionado.value === 'PROMO') {
      list = list.filter((p) => p.esCombo || p.tipo === 'COMBO')
    } else {
      list = list.filter((p) => p.tipo === tipoSeleccionado.value && !p.esCombo)
    }
  }

  // 3. Filtro por precio mínimo
  if (precioMin.value && !isNaN(Number(precioMin.value))) {
    const min = Number(precioMin.value)
    list = list.filter((p) => p.precio >= min)
  }

  // 4. Filtro por precio máximo
  if (precioMax.value && !isNaN(Number(precioMax.value))) {
    const max = Number(precioMax.value)
    list = list.filter((p) => p.precio <= max)
  }

  // 5. Ordenamiento
  if (ordenSeleccionado.value === 'precio_asc') {
    list.sort((a, b) => a.precio - b.precio)
  } else if (ordenSeleccionado.value === 'precio_desc') {
    list.sort((a, b) => b.precio - a.precio)
  } else if (ordenSeleccionado.value === 'nombre') {
    list.sort((a, b) => a.nombre.localeCompare(b.nombre))
  }

  return list
})

const totalDisponibles = computed(() => {
  return productosFiltrados.value.filter((p) => p.stock > 0).length
})

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="ss-page relative min-h-screen bg-[#05060d] pb-20 pt-6 sm:pt-8">
    <div class="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(50%_80%_at_20%_0%,rgba(139,108,255,0.16),transparent_70%)]" aria-hidden="true" />

    <div class="container-app relative">
      <nav aria-label="Ruta de navegación" class="mb-5 flex items-center gap-1.5 text-sm text-[#a9b1cc]">
        <RouterLink to="/" class="rounded hover:text-white">Inicio</RouterLink>
        <ChevronRight class="size-3.5" aria-hidden="true" />
        <span class="font-semibold text-white" aria-current="page">Catálogo</span>
      </nav>

      <header class="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="ss-title ss-h1 text-white">Catálogo de streaming</h1>
          <p class="ss-lead mt-2" aria-live="polite">
            <template v-if="loading">Cargando planes…</template>
            <template v-else>
              {{ productosFiltrados.length }} {{ productosFiltrados.length === 1 ? 'plan' : 'planes' }},
              {{ totalDisponibles }} con stock para entrega inmediata.
            </template>
          </p>
        </div>

        <!-- Selector de Ordenamiento Personalizado (Diseño Cyber Dark Glassmorphism) -->
        <div id="orden-dropdown-container" class="relative flex items-center gap-2">
          <span class="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#d7dcf0]">
            <ArrowUpDown class="size-3.5 sm:size-4 text-cyan-400" aria-hidden="true" />
            <span>Ordenar por</span>
          </span>

          <div class="relative">
            <button
              type="button"
              class="flex items-center justify-between gap-2.5 rounded-xl border border-white/15 bg-[#0C1024]/90 px-3.5 py-2 text-xs font-bold text-white shadow-lg backdrop-blur-xl transition-all hover:border-cyan-400/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] focus:border-cyan-400 focus:outline-none cursor-pointer"
              :aria-expanded="isSortDropdownOpen"
              aria-haspopup="listbox"
              @click.stop="isSortDropdownOpen = !isSortDropdownOpen"
            >
              <span>{{ sortOptions.find(o => o.value === ordenSeleccionado)?.label || 'Destacados' }}</span>
              <ChevronDown
                class="size-3.5 text-cyan-400 transition-transform duration-200"
                :class="{ 'rotate-180': isSortDropdownOpen }"
                aria-hidden="true"
              />
            </button>

            <!-- Menú Desplegable Flotante -->
            <div
              v-if="isSortDropdownOpen"
              class="absolute right-0 top-full mt-2 w-56 z-50 rounded-2xl border border-white/20 bg-[#0A0D1F]/98 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.95)] backdrop-blur-2xl space-y-0.5"
              role="listbox"
            >
              <button
                v-for="opt in sortOptions"
                :key="opt.value"
                type="button"
                role="option"
                :aria-selected="ordenSeleccionado === opt.value"
                class="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all cursor-pointer text-left"
                :class="[
                  ordenSeleccionado === opt.value
                    ? 'bg-gradient-to-r from-purple-600/30 to-cyan-500/30 text-cyan-300 font-bold border border-cyan-400/30'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white border border-transparent'
                ]"
                @click="ordenSeleccionado = opt.value; isSortDropdownOpen = false"
              >
                <span>{{ opt.label }}</span>
                <Check v-if="ordenSeleccionado === opt.value" class="size-3.5 text-cyan-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

            

      

      <div class="flex flex-col items-start gap-6 lg:flex-row lg:gap-8">
        <!-- Filtros: desplegables en móvil, siempre visibles en escritorio -->
        <aside class="ss-panel w-full shrink-0 lg:sticky lg:top-24 lg:w-64" aria-label="Filtros del catálogo">
          <div class="flex items-center justify-between gap-3 p-4">
            <button
              type="button"
              class="flex items-center gap-2 text-sm font-bold text-white lg:pointer-events-none"
              :aria-expanded="filtrosVisibles"
              aria-controls="panel-filtros"
              @click="filtrosVisibles = !filtrosVisibles"
            >
              <SlidersHorizontal class="size-4 text-[#2dd4ef]" aria-hidden="true" />
              Filtros
              <span v-if="filtrosActivos" class="rounded-full bg-[#8b6cff] px-2 py-0.5 text-xs text-white">{{ filtrosActivos }}</span>
              <ChevronDown class="size-4 transition-transform lg:hidden" :class="{ 'rotate-180': filtrosVisibles }" aria-hidden="true" />
            </button>
            <button
              v-if="filtrosActivos"
              type="button"
              class="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-[#ff9fb2] hover:bg-white/5"
              @click="resetFiltros"
            >
              <RotateCcw class="size-3.5" aria-hidden="true" />
              Limpiar
            </button>
          </div>

          <div id="panel-filtros" class="divide-y divide-white/10 border-t border-white/10" :class="filtrosVisibles ? 'block' : 'hidden lg:block'">
            <fieldset class="p-4">
              <legend class="mb-2 block w-full text-sm font-semibold text-white">Plataforma</legend>
              <div class="max-h-56 space-y-0.5 overflow-y-auto pr-1">
                <label class="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg px-2 text-sm text-[#d7dcf0] hover:bg-white/5">
                  <input v-model="plataformaSeleccionada" type="radio" name="plataforma" value="" class="size-4 accent-[#8b6cff]" />
                  Todas
                </label>
                <label
                  v-for="plat in plataformas"
                  :key="plat.id"
                  class="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg px-2 text-sm text-[#d7dcf0] hover:bg-white/5"
                >
                  <input v-model="plataformaSeleccionada" type="radio" name="plataforma" :value="plat.slug" class="size-4 accent-[#8b6cff]" />
                  {{ plat.nombre }}
                </label>
              </div>
            </fieldset>

            <fieldset class="p-4">
              <legend class="mb-2 block w-full text-sm font-semibold text-white">Tipo de plan</legend>
              <div class="space-y-0.5">
                <label class="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg px-2 text-sm text-[#d7dcf0] hover:bg-white/5">
                  <input v-model="tipoSeleccionado" type="radio" name="tipo" value="" class="size-4 accent-[#8b6cff]" />
                  Todos los planes
                </label>
                <label class="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg px-2 text-sm text-[#d7dcf0] hover:bg-white/5">
                  <input v-model="tipoSeleccionado" type="radio" name="tipo" value="PROMO" class="size-4 accent-red-500" />
                  <span class="inline-flex items-center gap-1.5 font-bold text-red-300">
                    <Flame class="size-3.5 text-red-400" />
                    Promociones y Combos
                  </span>
                </label>
                <label class="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg px-2 text-sm text-[#d7dcf0] hover:bg-white/5">
                  <input v-model="tipoSeleccionado" type="radio" name="tipo" value="PANTALLA_INDIVIDUAL" class="size-4 accent-[#8b6cff]" />
                  Pantalla individual con PIN
                </label>
                <label class="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-lg px-2 text-sm text-[#d7dcf0] hover:bg-white/5">
                  <input v-model="tipoSeleccionado" type="radio" name="tipo" value="CUENTA_COMPLETA" class="size-4 accent-[#8b6cff]" />
                  Cuenta completa
                </label>
              </div>
            </fieldset>

            <div role="group" aria-labelledby="filtro-precio-heading" class="p-4">
              <span id="filtro-precio-heading" class="mb-2.5 block w-full text-sm font-bold text-white">Precio (COP)</span>
              <div class="grid grid-cols-2 gap-2.5">
                <div class="flex flex-col gap-1 min-w-0">
                  <label for="precio-desde" class="text-[11px] font-semibold uppercase tracking-wider text-[#a9b1cc]">Desde</label>
                  <div class="relative">
                    <span class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">$</span>
                    <input
                      id="precio-desde"
                      v-model="precioMin"
                      type="number"
                      min="0"
                      inputmode="numeric"
                      placeholder="0"
                      class="w-full rounded-xl border border-white/15 bg-[#0a0d1c] py-2 pl-6 pr-2 text-xs font-mono text-white placeholder-slate-600 transition-colors focus:border-cyan-400 focus:outline-none [appearance:textfield]"
                    />
                  </div>
                </div>
                <div class="flex flex-col gap-1 min-w-0">
                  <label for="precio-hasta" class="text-[11px] font-semibold uppercase tracking-wider text-[#a9b1cc]">Hasta</label>
                  <div class="relative">
                    <span class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">$</span>
                    <input
                      id="precio-hasta"
                      v-model="precioMax"
                      type="number"
                      min="0"
                      inputmode="numeric"
                      placeholder="Max"
                      class="w-full rounded-xl border border-white/15 bg-[#0a0d1c] py-2 pl-6 pr-2 text-xs font-mono text-white placeholder-slate-600 transition-colors focus:border-cyan-400 focus:outline-none [appearance:textfield]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section class="w-full min-w-0 flex-1" aria-label="Resultados">
          <AppLoader v-if="loading && productos.length === 0" label="Cargando catálogo..." />

          <div v-else-if="error" class="ss-empty">
            <PackageX class="size-10 text-[#ff9fb2]" aria-hidden="true" />
            <h2 class="ss-title ss-h2 text-white">No pudimos cargar el catálogo</h2>
            <p class="max-w-md text-sm text-[#a9b1cc]">{{ error }}</p>
            <button type="button" class="ss-btn ss-btn-primary mt-1" @click="loadData">Reintentar</button>
          </div>

          <template v-else>
            <div
              v-if="productosFiltrados.length > 0"
              class="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 sm:gap-5"
              :aria-busy="loading"
            >
              <ProductCard v-for="producto in productosFiltrados" :key="producto.id" :producto="producto" />
            </div>

            <div v-else class="ss-empty">
              <PackageX class="size-10 text-[#a9b1cc]" aria-hidden="true" />
              <h2 class="ss-title ss-h2 text-white">Ningún plan coincide con los filtros</h2>
              <p class="max-w-md text-sm text-[#a9b1cc]">Prueba otra plataforma, cambia el rango de precio o quita los filtros.</p>
              <button type="button" class="ss-btn ss-btn-primary mt-1" @click="resetFiltros">Quitar filtros</button>
            </div>
          </template>
        </section>
      </div>
    </div>
  </div>
</template>
