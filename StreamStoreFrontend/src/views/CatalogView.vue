<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { 
  ArrowUpDown, 
  ChevronDown, 
  ChevronRight, 
  PackageX, 
  RotateCcw, 
  SlidersHorizontal 
} from '@lucide/vue'
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

// En móvil los filtros empiezan plegados para que los planes queden a la vista
const filtrosVisibles = ref(false)

const filtrosActivos = computed(
  () => [plataformaSeleccionada.value, tipoSeleccionado.value, precioMin.value, precioMax.value].filter(Boolean).length,
)

async function loadData() {
  loading.value = true
  error.value = null
  try {
    const [plats, prods] = await Promise.all([
      productService.getPlataformas(),
      productService.getProductos({
        plataforma: plataformaSeleccionada.value || undefined,
        tipo: (tipoSeleccionado.value as TipoProducto) || undefined,
      }),
    ])
    plataformas.value = plats
    productos.value = prods
  } catch (err: any) {
    error.value = err?.message || 'Error al cargar los productos del catálogo.'
  } finally {
    loading.value = false
  }
}

watch(
  () => [plataformaSeleccionada.value, tipoSeleccionado.value],
  async () => {
    const query: Record<string, string> = {}
    if (plataformaSeleccionada.value) query.plataforma = plataformaSeleccionada.value
    if (tipoSeleccionado.value) query.tipo = tipoSeleccionado.value

    router.replace({ query })

    try {
      loading.value = true
      error.value = null
      productos.value = await productService.getProductos({
        plataforma: plataformaSeleccionada.value || undefined,
        tipo: (tipoSeleccionado.value as TipoProducto) || undefined,
      })
    } catch (err: any) {
      error.value = err?.message || 'Error al filtrar productos.'
    } finally {
      loading.value = false
    }
  }
)

function resetFiltros() {
  plataformaSeleccionada.value = ''
  tipoSeleccionado.value = ''
  precioMin.value = ''
  precioMax.value = ''
  ordenSeleccionado.value = 'destacados'
}

// Filtrado y ordenamiento en cliente para precio y orden
const productosFiltrados = computed(() => {
  let list = [...productos.value]

  // Filtro por precio mínimo
  if (precioMin.value && !isNaN(Number(precioMin.value))) {
    const min = Number(precioMin.value)
    list = list.filter((p) => p.precio >= min)
  }

  // Filtro por precio máximo
  if (precioMax.value && !isNaN(Number(precioMax.value))) {
    const max = Number(precioMax.value)
    list = list.filter((p) => p.precio <= max)
  }

  // Ordenamiento
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

        <div class="flex items-center gap-2">
          <label for="orden-select" class="flex items-center gap-1.5 text-sm font-semibold text-[#d7dcf0]">
            <ArrowUpDown class="size-4" aria-hidden="true" />
            Ordenar por
          </label>
          <select id="orden-select" v-model="ordenSeleccionado" class="ss-input !min-h-10 !w-auto !py-2 text-sm">
            <option value="destacados">Destacados</option>
            <option value="precio_asc">Precio: menor a mayor</option>
            <option value="precio_desc">Precio: mayor a menor</option>
            <option value="nombre">Nombre: A a Z</option>
          </select>
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
                  Todos
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

            <fieldset class="p-4">
              <legend class="mb-2 block w-full text-sm font-semibold text-white">Precio (COP)</legend>
              <div class="grid grid-cols-2 gap-2.5">
                <div class="ss-field !gap-1 min-w-0">
                  <label for="precio-desde" class="text-xs font-semibold text-[#a9b1cc]">Desde</label>
                  <input id="precio-desde" v-model="precioMin" type="number" min="0" inputmode="numeric" placeholder="0" class="ss-input !min-h-10 !px-3 !py-2 text-sm w-full" />
                </div>
                <div class="ss-field !gap-1 min-w-0">
                  <label for="precio-hasta" class="text-xs font-semibold text-[#a9b1cc]">Hasta</label>
                  <input id="precio-hasta" v-model="precioMax" type="number" min="0" inputmode="numeric" placeholder="Sin límite" class="ss-input !min-h-10 !px-3 !py-2 text-sm w-full" />
                </div>
              </div>
            </fieldset>
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
