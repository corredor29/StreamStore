<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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

// Secciones de acordeón en sidebar (abiertas por defecto)
const openSections = ref<Record<string, boolean>>({
  plataformas: true,
  tipo: true,
  precio: true,
})

function toggleSection(key: string) {
  openSections.value[key] = !openSections.value[key]
}

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
  <div class="min-h-screen bg-black text-white pb-20 pt-4 sm:pt-6 relative overflow-hidden">
    <!-- Resplandores ambientales cinemáticos de fondo -->
    <div class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-[140px] pointer-events-none" />
    <div class="absolute top-1/3 right-10 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
    <div class="container-app">
      <!-- 1. BREADCRUMB (ESTILO LION TECH STORE) -->
      <nav aria-label="Breadcrumb" class="text-xs text-slate-400 mb-4 flex items-center gap-1.5 font-normal relative z-10">
        <RouterLink to="/" class="hover:text-white transition-colors">
          Inicio
        </RouterLink>
        <ChevronRight class="size-3 text-slate-400" />
        <span class="text-cyan-400 font-semibold truncate">
          Cuentas para streaming (Netflix, Disney+)
        </span>
      </nav>

      <!-- 2. CABECERA DE CATEGORÍA CON TITULAR Y SELECTOR DE ORDEN (ESTILO LION TECH STORE) -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="font-display text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
            Cuentas para streaming (Netflix, Disney+)
          </h1>
          <p class="text-xs text-slate-400 mt-1">
            Mostrando {{ productosFiltrados.length }} productos ({{ totalDisponibles }} disponibles con activación inmediata)
          </p>
        </div>

        <!-- Selector de Orden -->
        <div class="flex items-center gap-2 self-end sm:self-auto">
          <label for="orden-select" class="text-xs text-slate-400 font-medium flex items-center gap-1">
            <ArrowUpDown class="size-3.5 text-slate-400" />
            <span>Ordenar</span>
          </label>
          <select
            id="orden-select"
            v-model="ordenSeleccionado"
            class="rounded-xl border border-white/15 bg-neutral-900 px-3 py-2 text-xs font-bold text-white focus:border-cyan-400 focus:outline-none shadow-sm cursor-pointer hover:border-white/30 transition-colors"
          >
            <option class="bg-neutral-900 text-white" value="destacados">Relevancia / Destacados</option>
            <option class="bg-neutral-900 text-white" value="precio_asc">Precio: Menor a Mayor</option>
            <option class="bg-neutral-900 text-white" value="precio_desc">Precio: Mayor a Menor</option>
            <option class="bg-neutral-900 text-white" value="nombre">Nombre: A - Z</option>
          </select>
        </div>
      </div>

      <!-- 3. LAYOUT DE 2 COLUMNAS (SIDEBAR FILTROS + GRID DE PRODUCTOS) -->
      <div class="flex flex-col lg:flex-row gap-6 items-start">
        <!-- SIDEBAR DE FILTROS IZQUIERDO (ESTILO LION TECH STORE) -->
        <aside class="w-full lg:w-64 shrink-0 bg-neutral-900/90 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-2xl divide-y divide-white/10 overflow-hidden relative z-10">
          <!-- Título de Filtros con botón Limpiar -->
          <div class="p-4 flex items-center justify-between bg-white/5">
            <span class="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <SlidersHorizontal class="size-3.5 text-cyan-400" />
              Filtros
            </span>
            <button
              v-if="plataformaSeleccionada || tipoSeleccionado || precioMin || precioMax"
              type="button"
              class="text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
              @click="resetFiltros"
            >
              <RotateCcw class="size-3" />
              Limpiar
            </button>
          </div>

          <!-- FILTRO 1: PLATAFORMAS -->
          <div class="p-4">
            <button
              type="button"
              class="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-200 hover:text-white cursor-pointer transition-colors"
              @click="toggleSection('plataformas')"
            >
              <span>Plataforma</span>
              <ChevronDown
                class="size-4 text-slate-400 transition-transform duration-200"
                :class="{ 'rotate-180': openSections.plataformas }"
              />
            </button>
            <div v-show="openSections.plataformas" class="mt-3 space-y-1.5 max-h-48 overflow-y-auto pr-1">
              <label class="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer py-1 transition-colors">
                <input
                  type="radio"
                  name="plataforma"
                  value=""
                  :checked="plataformaSeleccionada === ''"
                  class="rounded-full text-cyan-400 bg-white/10 border-white/20 focus:ring-0 cursor-pointer"
                  @change="plataformaSeleccionada = ''"
                />
                <span :class="{ 'font-bold text-cyan-300': plataformaSeleccionada === '' }">Todas</span>
              </label>
              <label
                v-for="plat in plataformas"
                :key="plat.id"
                class="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer py-1 transition-colors"
              >
                <input
                  type="radio"
                  name="plataforma"
                  :value="plat.slug"
                  :checked="plataformaSeleccionada === plat.slug"
                  class="rounded-full text-cyan-400 bg-white/10 border-white/20 focus:ring-0 cursor-pointer"
                  @change="plataformaSeleccionada = plat.slug"
                />
                <span :class="{ 'font-bold text-cyan-300': plataformaSeleccionada === plat.slug }">
                  {{ plat.nombre }}
                </span>
              </label>
            </div>
          </div>

          <!-- FILTRO 2: TIPO / PANTALLAS -->
          <div class="p-4">
            <button
              type="button"
              class="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-200 hover:text-white cursor-pointer transition-colors"
              @click="toggleSection('tipo')"
            >
              <span>Pantallas / Tipo</span>
              <ChevronDown
                class="size-4 text-slate-400 transition-transform duration-200"
                :class="{ 'rotate-180': openSections.tipo }"
              />
            </button>
            <div v-show="openSections.tipo" class="mt-3 space-y-1.5">
              <label class="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer py-1 transition-colors">
                <input
                  type="radio"
                  name="tipo"
                  value=""
                  :checked="tipoSeleccionado === ''"
                  class="rounded-full text-cyan-400 bg-white/10 border-white/20 focus:ring-0 cursor-pointer"
                  @change="tipoSeleccionado = ''"
                />
                <span :class="{ 'font-bold text-cyan-300': tipoSeleccionado === '' }">Todos los tipos</span>
              </label>
              <label class="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer py-1 transition-colors">
                <input
                  type="radio"
                  name="tipo"
                  value="PANTALLA_INDIVIDUAL"
                  :checked="tipoSeleccionado === 'PANTALLA_INDIVIDUAL'"
                  class="rounded-full text-cyan-400 bg-white/10 border-white/20 focus:ring-0 cursor-pointer"
                  @change="tipoSeleccionado = 'PANTALLA_INDIVIDUAL'"
                />
                <span :class="{ 'font-bold text-cyan-300': tipoSeleccionado === 'PANTALLA_INDIVIDUAL' }">
                  Pantalla Individual (PIN)
                </span>
              </label>
              <label class="flex items-center gap-2 text-xs text-slate-300 hover:text-white cursor-pointer py-1 transition-colors">
                <input
                  type="radio"
                  name="tipo"
                  value="CUENTA_COMPLETA"
                  :checked="tipoSeleccionado === 'CUENTA_COMPLETA'"
                  class="rounded-full text-cyan-400 bg-white/10 border-white/20 focus:ring-0 cursor-pointer"
                  @change="tipoSeleccionado = 'CUENTA_COMPLETA'"
                />
                <span :class="{ 'font-bold text-cyan-300': tipoSeleccionado === 'CUENTA_COMPLETA' }">
                  Cuenta Completa
                </span>
              </label>
            </div>
          </div>

          <!-- FILTRO 3: RANGO DE PRECIO -->
          <div class="p-4">
            <button
              type="button"
              class="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-200 hover:text-white cursor-pointer transition-colors"
              @click="toggleSection('precio')"
            >
              <span>Precio</span>
              <ChevronDown
                class="size-4 text-slate-400 transition-transform duration-200"
                :class="{ 'rotate-180': openSections.precio }"
              />
            </button>
            <div v-show="openSections.precio" class="mt-3 space-y-2.5">
              <div class="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label for="precio-desde" class="text-[11px] text-slate-400 block mb-1 font-mono uppercase">Desde</label>
                  <input
                    id="precio-desde"
                    v-model="precioMin"
                    type="number"
                    placeholder="Min"
                    class="w-full rounded-xl border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label for="precio-hasta" class="text-[11px] text-slate-400 block mb-1 font-mono uppercase">Hasta</label>
                  <input
                    id="precio-hasta"
                    v-model="precioMax"
                    type="number"
                    placeholder="Max"
                    class="w-full rounded-xl border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- PRODUCT GRID DERECHO (4 COLUMNAS EN PANTALLAS GRANDES) -->
        <main class="flex-1 w-full">
          <!-- Loading State -->
          <AppLoader v-if="loading && productos.length === 0" label="Cargando catálogo..." />

          <!-- Error State -->
          <AppAlert v-else-if="error" variant="error" title="Error al cargar productos" class="mb-6">
            <p>{{ error }}</p>
            <button type="button" class="btn-secondary mt-3 text-xs" @click="loadData">
              Reintentar
            </button>
          </AppAlert>

          <!-- Grid de Productos Estilo Lion Tech Store -->
          <div v-else>
            <div
              v-if="productosFiltrados.length > 0"
              class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
            >
              <ProductCard
                v-for="producto in productosFiltrados"
                :key="producto.id"
                :producto="producto"
              />
            </div>

            <!-- Estado Vacío -->
            <div
              v-else
              class="bg-neutral-900/80 rounded-2xl border border-white/10 p-12 text-center shadow-xl backdrop-blur-xl flex flex-col items-center justify-center"
            >
              <PackageX class="size-12 text-slate-400" aria-hidden="true" />
              <h2 class="mt-4 font-display text-lg font-bold text-white">
                No se encontraron productos
              </h2>
              <p class="mt-1 max-w-sm text-xs text-slate-400">
                No hay productos que coincidan con los filtros seleccionados. Intenta restablecer los filtros para ver otros planes.
              </p>
              <button
                type="button"
                class="mt-5 rounded-xl bg-white hover:bg-slate-200 text-neutral-950 font-black text-xs px-6 py-2.5 transition-all cursor-pointer shadow-md active:scale-95"
                @click="resetFiltros"
              >
                Ver todo el catálogo
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>
