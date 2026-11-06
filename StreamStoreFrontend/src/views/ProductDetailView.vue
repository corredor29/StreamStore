<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { 
  ArrowLeft, 
  Check, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ShoppingCart, 
  Sparkles, 
  Tv, 
  Users 
} from '@lucide/vue'
import AppLoader from '@/components/common/AppLoader.vue'
import AppAlert from '@/components/common/AppAlert.vue'
import { productService } from '@/services/productService'
import { formatPrice } from '@/composables/useFormat'
import { useCartStore } from '@/stores/cart'
import type { Producto } from '@/types'

const props = defineProps<{
  id: number
}>()

const cart = useCartStore()
const producto = ref<Producto | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const cantidad = ref(1)
const agregado = ref(false)
const feedbackMsg = ref('')

const isAgotado = computed(() => !producto.value || producto.value.stock <= 0)
const maxSeleccionable = computed(() => {
  if (!producto.value) return 1
  return Math.min(producto.value.stock, 5)
})

const tipoBadge = computed(() => {
  if (!producto.value) return { label: '', icon: Tv }
  return producto.value.tipo === 'CUENTA_COMPLETA'
    ? { label: 'Cuenta Completa', icon: Users, desc: 'Adquieres la cuenta total con todas las pantallas disponibles.' }
    : { label: 'Pantalla Individual', icon: Tv, desc: 'Adquieres un perfil exclusivo dentro de una cuenta compartida.' }
})

// Imagen de presentación oficial del producto
const productImage = computed(() => {
  if (!producto.value) return '/brand_logos/streamstore_icon.png'

  // 1. Portada personalizada subida desde el admin o URL
  if (producto.value.plataforma?.coverUrl) {
    return producto.value.plataforma.coverUrl
  }

  const slug = (producto.value.plataforma?.slug || producto.value.plataforma?.nombre || '').toLowerCase()
  const name = (producto.value.nombre || '').toLowerCase()

  if (slug.includes('disney') || slug.includes('dp') || name.includes('disney')) {
    return '/targetyas/disneycard.png'
  }
  if (slug.includes('netflix') || slug.includes('nf') || name.includes('netflix')) {
    return '/targetyas/netflixcard.svg'
  }
  if (slug.includes('max') || slug.includes('hbo') || name.includes('max')) {
    return '/targetyas/HBO_Max.webp'
  }
  if (slug.includes('prime') || slug.includes('amazon') || name.includes('prime') || slug.includes('pv')) {
    return '/targetyas/prime_video_card.svg'
  }
  if (slug.includes('crunchyroll') || slug.includes('anime') || name.includes('crunchyroll')) {
    return '/targetyas/Crunchyroll.webp'
  }
  if (slug.includes('spotify') || slug.includes('musica') || name.includes('spotify')) {
    return '/targetyas/spotify_premiun.webp'
  }
  if (slug.includes('paramount') || slug.includes('paramont') || name.includes('paramount')) {
    return '/brand_logos/paramont.png'
  }
  if (slug.includes('apple') || slug.includes('appletv') || name.includes('apple')) {
    return '/brand_logos/appletv.webp'
  }

  return producto.value.plataforma?.logoUrl || '/brand_logos/streamstore_icon.png'
})

async function fetchProducto() {
  loading.value = true
  error.value = null
  try {
    producto.value = await productService.getProducto(props.id)
  } catch (err: any) {
    error.value = err?.message || 'No se pudo cargar la información del producto.'
  } finally {
    loading.value = false
  }
}

function onAgregar() {
  if (!producto.value || isAgotado.value) return
  const res = cart.addItem(producto.value, cantidad.value)
  if (res.success) {
    agregado.value = true
    feedbackMsg.value = `¡${producto.value.nombre} agregado al carrito!`
    setTimeout(() => {
      agregado.value = false
      feedbackMsg.value = ''
    }, 2500)
  } else {
    feedbackMsg.value = res.message || 'No se pudo agregar'
    setTimeout(() => {
      feedbackMsg.value = ''
    }, 3500)
  }
}

onMounted(() => {
  fetchProducto()
})

watch(
  () => props.id,
  () => {
    fetchProducto()
  }
)
</script>

<template>
  <div class="container-app py-8 sm:py-12">
    <!-- Enlace de regreso al catálogo -->
    <RouterLink
      to="/catalogo"
      class="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 transition-colors hover:text-cyan-400"
    >
      <ArrowLeft class="size-4" aria-hidden="true" />
      <span>Volver al catálogo</span>
    </RouterLink>

    <AppLoader v-if="loading" label="Cargando detalles del producto..." />

    <AppAlert v-else-if="error" variant="error" title="Producto no encontrado">
      <p>{{ error }}</p>
      <RouterLink to="/catalogo" class="btn-secondary mt-3 inline-flex text-xs">
        Explorar otros productos
      </RouterLink>
    </AppAlert>

    <article v-else-if="producto" class="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
      <!-- Columna Izquierda: Foto y Detalles (7 columnas) -->
      <div class="lg:col-span-7 space-y-6">
        <!-- 1. FOTO / PORTADA CINEMÁTICA DEL PRODUCTO -->
        <div class="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0E1322] shadow-2xl group">
          <!-- Fondo difuminado ambiental para profundidad cinemática -->
          <div
            class="absolute inset-0 bg-cover bg-center blur-3xl opacity-25 scale-125 pointer-events-none"
            :style="{ backgroundImage: `url(${productImage})` }"
          />

          <!-- Contenedor de la Imagen Principal -->
          <div class="relative h-64 sm:h-80 w-full flex items-center justify-center p-6 bg-black/50">
            <img
              :src="productImage"
              :alt="producto.nombre"
              class="max-h-full max-w-full object-contain rounded-xl shadow-2xl transition-transform duration-500 group-hover:scale-105 select-none"
            />

            <!-- Gradiente inferior para transición al contenido -->
            <div class="absolute inset-0 bg-gradient-to-t from-[#0E1322] via-transparent to-transparent pointer-events-none" />

            <!-- Badges flotantes superiores sobre la foto -->
            <div class="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-10">
              <span
                class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-mono font-bold uppercase tracking-wider text-white shadow-lg backdrop-blur-md border border-white/20"
                :style="{ backgroundColor: producto.plataforma?.color || '#06b6d4' }"
              >
                {{ producto.plataforma?.nombre }}
              </span>

              <span
                v-if="isAgotado"
                class="rounded-lg bg-rose-500/80 border border-rose-400 text-white px-2.5 py-1 text-xs font-bold uppercase backdrop-blur-md"
              >
                Agotado
              </span>
              <span
                v-else
                class="rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-2.5 py-1 text-xs font-semibold backdrop-blur-md"
              >
                {{ producto.stock }} en stock
              </span>
            </div>

            <!-- Badge de Duración -->
            <div class="absolute top-4 right-4 z-10">
              <span class="inline-flex items-center gap-1.5 rounded-lg bg-black/70 border border-white/20 text-white px-2.5 py-1 text-xs font-mono font-bold backdrop-blur-md">
                <Clock class="size-3.5 text-cyan-400" />
                <span>{{ producto.duracionDias }} días</span>
              </span>
            </div>
          </div>
        </div>

        <!-- 2. INFORMACIÓN Y CARACTERÍSTICAS -->
        <div class="rounded-2xl border border-white/10 bg-[#0E1322] p-6 sm:p-8 shadow-xl space-y-6">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="rounded bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-widest">
                Suscripción Oficial
              </span>
              <span class="text-xs text-slate-400 font-mono">Entrega Inmediata</span>
            </div>
            <h1 class="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {{ producto.nombre }}
            </h1>
            <p class="mt-2 text-sm leading-relaxed text-slate-300">
              {{ producto.descripcion || 'Disfruta de tus series, películas y eventos favoritos con acceso garantizado y soporte directo.' }}
            </p>
          </div>

          <!-- Cuadrícula de Beneficios -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4 border-t border-white/10">
            <div class="flex items-start gap-3 rounded-xl border border-white/10 bg-[#0B0F19] p-3.5">
              <component :is="tipoBadge.icon" class="mt-0.5 size-5 shrink-0 text-cyan-400" aria-hidden="true" />
              <div>
                <h4 class="text-xs font-bold uppercase text-white">{{ tipoBadge.label }}</h4>
                <p class="text-xs text-slate-400 mt-0.5">{{ tipoBadge.desc }}</p>
              </div>
            </div>

            <div class="flex items-start gap-3 rounded-xl border border-white/10 bg-[#0B0F19] p-3.5">
              <Clock class="mt-0.5 size-5 shrink-0 text-cyan-400" aria-hidden="true" />
              <div>
                <h4 class="text-xs font-bold uppercase text-white">Duración del plan</h4>
                <p class="text-xs text-slate-400 mt-0.5">{{ producto.duracionDias }} días continuos de servicio garantizado.</p>
              </div>
            </div>

            <div class="flex items-start gap-3 rounded-xl border border-white/10 bg-[#0B0F19] p-3.5">
              <ShieldCheck class="mt-0.5 size-5 shrink-0 text-emerald-400" aria-hidden="true" />
              <div>
                <h4 class="text-xs font-bold uppercase text-white">Garantía completa</h4>
                <p class="text-xs text-slate-400 mt-0.5">Soporte y reemplazo inmediato durante todo el período contratado.</p>
              </div>
            </div>

            <div class="flex items-start gap-3 rounded-xl border border-white/10 bg-[#0B0F19] p-3.5">
              <CheckCircle2 class="mt-0.5 size-5 shrink-0 text-emerald-400" aria-hidden="true" />
              <div>
                <h4 class="text-xs font-bold uppercase text-white">Entrega automática</h4>
                <p class="text-xs text-slate-400 mt-0.5">Credenciales y PINes visibles en tu panel una vez acreditado el pago.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Columna Derecha: Caja de Compra Flotante (5 columnas) -->
      <div class="lg:col-span-5">
        <div class="rounded-2xl border border-white/10 bg-[#0E1322] sticky top-24 p-6 sm:p-7 shadow-2xl space-y-5">
          <!-- Mini preview visual con la foto del producto -->
          <div class="flex items-center gap-3.5 pb-4 border-b border-white/10">
            <div class="size-14 rounded-xl overflow-hidden bg-black/60 border border-white/10 shrink-0 p-1.5 flex items-center justify-center">
              <img :src="productImage" :alt="producto.nombre" class="max-h-full max-w-full object-contain" />
            </div>
            <div class="truncate flex-1">
              <span class="text-[10px] font-mono text-cyan-400 uppercase font-bold block">
                {{ producto.plataforma?.nombre }}
              </span>
              <h3 class="text-xs sm:text-sm font-bold text-white truncate">
                {{ producto.nombre }}
              </h3>
            </div>
          </div>

          <!-- Resumen de Precio -->
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Resumen de precio
            </span>
            <div class="mt-1.5 flex items-baseline gap-2">
              <span class="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {{ formatPrice(producto.precio) }}
              </span>
              <span class="text-xs text-slate-400 font-mono">/ {{ producto.duracionDias }} días</span>
            </div>
          </div>

          <!-- Cantidad y Botón de Agregar al Carrito -->
          <div class="space-y-4 pt-2">
            <div>
              <label :for="`product-detail-qty-${producto.id}`" class="text-xs font-semibold text-slate-300 block mb-1.5">
                Cantidad a comprar
              </label>
              <div class="flex items-center gap-3">
                <select
                  :id="`product-detail-qty-${producto.id}`"
                  v-model.number="cantidad"
                  :disabled="isAgotado"
                  class="rounded-xl border border-white/10 bg-[#0B0F19] px-4 py-2.5 text-xs font-bold text-white focus:border-cyan-400 focus:outline-none cursor-pointer w-24 text-center"
                >
                  <option v-for="n in maxSeleccionable" :key="n" :value="n">
                    {{ n }}
                  </option>
                </select>

                <button
                  type="button"
                  class="flex-1 py-3 px-5 rounded-xl text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
                  :class="[
                    isAgotado
                      ? 'cursor-not-allowed bg-slate-800 text-slate-500 border border-white/5'
                      : agregado
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-black shadow-emerald-500/25'
                        : 'btn-primary shadow-cyan-500/25'
                  ]"
                  :disabled="isAgotado"
                  @click="onAgregar"
                >
                  <template v-if="agregado">
                    <Check class="size-4" aria-hidden="true" />
                    <span>¡Agregado al carrito!</span>
                  </template>
                  <template v-else-if="isAgotado">
                    <span>Producto Agotado</span>
                  </template>
                  <template v-else>
                    <ShoppingCart class="size-4" aria-hidden="true" />
                    <span>Agregar al carrito</span>
                  </template>
                </button>
              </div>
            </div>

            <!-- Feedback temporal -->
            <div
              v-if="feedbackMsg"
              role="status"
              aria-live="polite"
              class="rounded-lg p-2.5 text-center text-xs font-semibold animate-fade-in"
              :class="agregado ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'"
            >
              {{ feedbackMsg }}
            </div>

            <!-- Políticas / Notas de compra -->
            <div class="rounded-xl border border-white/10 bg-[#0B0F19] p-3.5 text-xs text-slate-400 space-y-2">
              <p class="flex items-start gap-1.5">
                <span class="text-cyan-400 shrink-0">📌</span>
                <span><strong>Regla de compra:</strong> Las credenciales y PINes se revelan inmediatamente en tu panel tras aprobarse el pago.</span>
              </p>
              <p class="flex items-start gap-1.5">
                <span class="text-amber-400 shrink-0">⚡</span>
                <span><strong>Inventario en vivo:</strong> El stock definitivo se valida y bloquea en tiempo real durante el checkout.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>
