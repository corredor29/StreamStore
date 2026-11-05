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
    <!-- Encabezado del catálogo -->
    <header class="mb-8">
      <div class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-300">
        <Sparkles class="size-4" aria-hidden="true" />
        <span>Catálogo oficial</span>
      </div>
      <h1 class="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl text-fg">
        Cuentas completas y pantallas
      </h1>
      <p class="mt-2 text-sm text-muted sm:text-base max-w-2xl">
        Entrega inmediata y garantizada tras la confirmación del pago. Escoge la modalidad que mejor se adapte a tu consumo.
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
