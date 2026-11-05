<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PackageX, Sparkles } from '@lucide/vue'
import AppLoader from '@/components/common/AppLoader.vue'
import AppAlert from '@/components/common/AppAlert.vue'
import ProductCard from '@/components/catalog/ProductCard.vue'
import CatalogFilters from '@/components/catalog/CatalogFilters.vue'
import { productService } from '@/services/productService'
import type { Plataforma, Producto, TipoProducto } from '@/types'

const route = useRoute()
const router = useRouter()

const plataformas = ref<Plataforma[]>([])
const productos = ref<Producto[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Filtros reactivos sincronizados con URL query params
const plataformaSeleccionada = ref((route.query.plataforma as string) || '')
const tipoSeleccionado = ref((route.query.tipo as string) || '')

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
    // Sincronizar query params
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
}

const totalDisponibles = computed(() => {
  return productos.value.filter((p) => p.stock > 0).length
})

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="container-app py-8 sm:py-12">
    <!-- Encabezado del catálogo (Stitch Board 3) -->
    <header class="mb-10 text-center max-w-3xl mx-auto space-y-3">
      <div class="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-mono font-semibold uppercase tracking-widest text-cyan-300">
        <Sparkles class="size-3.5 text-cyan-400" aria-hidden="true" />
        <span>Catálogo Oficial de Streaming</span>
      </div>
      <h1 class="font-display text-3xl sm:text-5xl font-black tracking-tight text-fg">
        Explora el Entretenimiento sin Límites
      </h1>
      <p class="text-xs sm:text-sm text-muted max-w-2xl mx-auto leading-relaxed">
        Nuestras cuentas completas, pantallas individuales y perfiles protegidos al instante con entrega automatizada 24/7 en COP.
      </p>
    </header>

    <!-- Barra de filtros -->
    <CatalogFilters
      :plataformas="plataformas"
      :plataforma-seleccionada="plataformaSeleccionada"
      :tipo-seleccionado="tipoSeleccionado"
      @update:plataforma="(val) => (plataformaSeleccionada = val)"
      @update:tipo="(val) => (tipoSeleccionado = val)"
      @reset="resetFiltros"
    />

    <!-- Estado de Carga -->
    <AppLoader v-if="loading && productos.length === 0" label="Cargando catálogo..." />

    <!-- Estado de Error -->
    <AppAlert v-else-if="error" variant="error" title="Problema al cargar el catálogo" class="mb-6">
      <p>{{ error }}</p>
      <button type="button" class="btn-secondary mt-3 text-xs" @click="loadData">
        Reintentar
      </button>
    </AppAlert>

    <!-- Lista de productos -->
    <div v-else>
      <div class="mb-4 flex items-center justify-between text-xs text-muted">
        <span>Mostrando {{ productos.length }} productos ({{ totalDisponibles }} con stock inmediato)</span>
      </div>

      <div
        v-if="productos.length > 0"
        class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <ProductCard
          v-for="producto in productos"
          :key="producto.id"
          :producto="producto"
        />
      </div>

      <!-- Estado vacío cuando los filtros no arrojan resultados -->
      <div
        v-else
        class="card flex flex-col items-center justify-center py-16 text-center"
      >
        <PackageX class="size-12 text-muted" aria-hidden="true" />
        <h2 class="mt-4 font-display text-lg font-bold text-fg">No se encontraron productos</h2>
        <p class="mt-1 max-w-md text-sm text-muted">
          No hay planes disponibles con los filtros seleccionados. Intenta restablecer los filtros para ver otras plataformas.
        </p>
        <button
          type="button"
          class="btn-secondary mt-6"
          @click="resetFiltros"
        >
          Ver todo el catálogo
        </button>
      </div>
    </div>
  </div>
</template>
