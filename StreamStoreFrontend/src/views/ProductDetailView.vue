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
  Tv, 
  Users 
} from '@lucide/vue'
import AppLoader from '@/components/common/AppLoader.vue'
import AppAlert from '@/components/common/AppAlert.vue'
import { productService } from '@/services/productService'
import { formatPrice } from '@/composables/useFormat'
import { useCartStore } from '@/stores/cart'
import type { Producto } from '@/types'
import { useClientFonts } from '@/composables/useClientFonts'
import '@/styles/client-ui.css'

useClientFonts()

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
    ? { label: 'Cuenta completa', icon: Users, desc: 'Adquieres la cuenta total con todas las pantallas disponibles.' }
    : { label: 'Pantalla individual', icon: Tv, desc: 'Adquieres un perfil exclusivo dentro de una cuenta compartida.' }
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

// Portadas ilustradas (subidas o de /targetyas/) llenan el marco; los logos se muestran enteros
const isCoverArt = computed(() => !!producto.value?.plataforma?.coverUrl || productImage.value.includes('/targetyas/'))

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
    feedbackMsg.value = `${producto.value.nombre} se agregó al carrito.`
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
  <div class="ss-page bg-[#05060d]">
    <div class="container-app py-8 sm:py-12">
      <RouterLink to="/catalogo" class="mb-6 inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-[#a9b1cc] hover:text-white">
        <ArrowLeft class="size-4" aria-hidden="true" />
        Volver al catálogo
      </RouterLink>

      <AppLoader v-if="loading" label="Cargando el plan..." />

      <div v-else-if="error" class="ss-empty">
        <h1 class="ss-title ss-h2 text-white">No pudimos cargar este plan</h1>
        <p class="max-w-md text-sm text-[#a9b1cc]">{{ error }}</p>
        <div class="mt-1 flex flex-wrap justify-center gap-3">
          <button type="button" class="ss-btn ss-btn-primary" @click="fetchProducto">Reintentar</button>
          <RouterLink to="/catalogo" class="ss-btn ss-btn-secondary">Ver el catálogo</RouterLink>
        </div>
      </div>

      <article v-else-if="producto" class="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-10">
        <div class="space-y-8 lg:col-span-7">
          <!-- Portada -->
          <div class="relative overflow-hidden rounded-2xl border border-white/12 bg-[#0a0d1c]">
            <div class="relative aspect-[16/9] w-full">
              <img
                :src="productImage"
                :alt="`Portada de ${producto.plataforma?.nombre || producto.nombre}`"
                class="h-full w-full"
                :class="isCoverArt ? 'object-cover' : 'object-contain p-10 sm:p-16'"
              />
            </div>
            <span
              class="absolute left-4 top-4 inline-flex items-center rounded-lg px-3 py-1 text-sm font-bold text-white shadow-lg"
              :style="{ backgroundColor: producto.plataforma?.color || '#0891b2' }"
            >
              {{ producto.plataforma?.nombre }}
            </span>
          </div>

          <div>
            <h1 class="ss-title ss-h1 text-white">{{ producto.nombre }}</h1>
            <p class="ss-lead mt-3">
              {{ producto.descripcion || 'Disfruta de tus series, películas y eventos favoritos con acceso garantizado y soporte directo.' }}
            </p>
          </div>

          <dl class="grid grid-cols-1 gap-x-8 gap-y-5 border-t border-white/10 pt-6 sm:grid-cols-2">
            <div class="flex gap-3">
              <component :is="tipoBadge.icon" class="mt-0.5 size-5 shrink-0 text-[#2dd4ef]" aria-hidden="true" />
              <div>
                <dt class="text-sm font-bold text-white">{{ tipoBadge.label }}</dt>
                <dd class="mt-0.5 text-sm text-[#a9b1cc]">{{ tipoBadge.desc }}</dd>
              </div>
            </div>
            <div class="flex gap-3">
              <Clock class="mt-0.5 size-5 shrink-0 text-[#2dd4ef]" aria-hidden="true" />
              <div>
                <dt class="text-sm font-bold text-white">Duración</dt>
                <dd class="mt-0.5 text-sm text-[#a9b1cc]">{{ producto.duracionDias }} días continuos de servicio.</dd>
              </div>
            </div>
            <div class="flex gap-3">
              <ShieldCheck class="mt-0.5 size-5 shrink-0 text-emerald-300" aria-hidden="true" />
              <div>
                <dt class="text-sm font-bold text-white">Garantía</dt>
                <dd class="mt-0.5 text-sm text-[#a9b1cc]">Soporte y reemplazo durante todo el periodo contratado.</dd>
              </div>
            </div>
            <div class="flex gap-3">
              <CheckCircle2 class="mt-0.5 size-5 shrink-0 text-emerald-300" aria-hidden="true" />
              <div>
                <dt class="text-sm font-bold text-white">Entrega</dt>
                <dd class="mt-0.5 text-sm text-[#a9b1cc]">Las credenciales aparecen en Mi cuenta cuando se aprueba el pago.</dd>
              </div>
            </div>
          </dl>
        </div>

        <!-- Caja de compra -->
        <aside class="lg:col-span-5 lg:sticky lg:top-24" aria-label="Comprar este plan">
          <div class="ss-panel space-y-5 p-6 sm:p-7">
            <div>
              <p class="text-sm font-semibold text-[#a9b1cc]">Precio por {{ producto.duracionDias }} días</p>
              <p class="font-display mt-1 text-4xl font-extrabold tracking-tight text-white">{{ formatPrice(producto.precio) }}</p>
              <p class="mt-2 text-sm font-semibold">
                <span v-if="isAgotado" class="text-[#ff9fb2]">Agotado por ahora</span>
                <span v-else-if="producto.stock <= 3" class="text-amber-300">Quedan {{ producto.stock }} disponibles</span>
                <span v-else class="text-emerald-300">{{ producto.stock }} disponibles</span>
              </p>
            </div>

            <div class="ss-field">
              <label :for="`product-detail-qty-${producto.id}`" class="ss-label">Cantidad</label>
              <div class="flex flex-col gap-3 min-[420px]:flex-row">
                <select
                  :id="`product-detail-qty-${producto.id}`"
                  v-model.number="cantidad"
                  :disabled="isAgotado"
                  class="ss-input min-[420px]:!w-24"
                >
                  <option v-for="n in maxSeleccionable" :key="n" :value="n">{{ n }}</option>
                </select>
                <button
                  type="button"
                  class="ss-btn flex-1"
                  :class="isAgotado ? 'border border-white/10 bg-white/5 text-[#8a93b2]' : agregado ? 'bg-emerald-400 text-[#05230f]' : 'ss-btn-primary'"
                  :disabled="isAgotado"
                  @click="onAgregar"
                >
                  <template v-if="agregado">
                    <Check class="size-4" aria-hidden="true" />
                    Agregado al carrito
                  </template>
                  <template v-else-if="isAgotado">Agotado</template>
                  <template v-else>
                    <ShoppingCart class="size-4" aria-hidden="true" />
                    Agregar al carrito
                  </template>
                </button>
              </div>
            </div>

            <div
              v-if="feedbackMsg"
              role="status"
              aria-live="polite"
              class="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3 text-sm font-semibold"
              :class="agregado ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : 'border-[#ff7a93]/30 bg-[#ff7a93]/10 text-[#ffc2ce]'"
            >
              <span>{{ feedbackMsg }}</span>
              <RouterLink v-if="agregado" to="/carrito" class="ss-link">Ver carrito</RouterLink>
            </div>

            <ul class="space-y-2 border-t border-white/10 pt-4 text-sm text-[#a9b1cc]">
              <li>Las credenciales y PIN se muestran en tu cuenta tras aprobarse el pago.</li>
              <li>El stock se confirma al pagar; si se agota antes, te avisamos en el checkout.</li>
            </ul>
          </div>
        </aside>
      </article>
    </div>
  </div>
</template>
