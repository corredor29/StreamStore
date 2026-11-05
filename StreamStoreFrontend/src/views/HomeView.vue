<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { 
  ArrowRight, 
  ChevronDown, 
  CreditCard, 
  Headphones, 
  Play, 
  ShieldCheck, 
  Sparkles, 
  Zap 
} from '@lucide/vue'
import type { TipoProducto } from '@/types'

const modalidadSeleccionada = ref<TipoProducto>('CUENTA_COMPLETA')

const plataformas = [
  {
    id: 1,
    nombre: 'Netflix Premium 4K',
    slug: 'netflix',
    desc: 'Acceso completo en 4K Ultra HD. Compatible con Smart TVs, consolas y dispositivos móviles.',
    color: '#E50914',
    badge: 'Ultra HD 4K',
    precioCompleta: 38000,
    precioPantalla: 12000,
  },
  {
    id: 2,
    nombre: 'Disney+ Total Family',
    slug: 'disney',
    desc: 'Todo el universo Disney, Pixar, Marvel, Star Wars y Star+ sin interrupciones con audio envolvente.',
    color: '#113CCF',
    badge: 'Familiar',
    precioCompleta: 30000,
    precioPantalla: 9000,
  },
  {
    id: 3,
    nombre: 'Max (HBO) 4K Ultra',
    slug: 'max',
    desc: 'Series icónicas de HBO, Warner Bros, Max Originals y transmisiones de alta calidad.',
    color: '#7B2FF7',
    badge: 'HBO & Warner',
    precioCompleta: 28000,
    precioPantalla: 9500,
  },
  {
    id: 4,
    nombre: 'Amazon Prime Video',
    slug: 'prime',
    desc: 'Producciones originales galardonadas, canales en vivo y transmisiones deportivas en HD.',
    color: '#00A8E1',
    badge: 'Originals',
    precioCompleta: 25000,
    precioPantalla: 8000,
  },
  {
    id: 5,
    nombre: 'Spotify Individual Premium',
    slug: 'spotify',
    desc: 'Música ilimitada sin anuncios, audio de máxima calidad y descargas offline para tus viajes.',
    color: '#1DB954',
    badge: 'Audio HQ',
    precioCompleta: 14900,
    precioPantalla: 7500,
  },
  {
    id: 6,
    nombre: 'Crunchyroll Mega Fan',
    slug: 'crunchyroll',
    desc: 'El catálogo de anime más extenso del mundo en simulcast con subtítulos y doblaje en español.',
    color: '#F47521',
    badge: 'Anime HD',
    precioCompleta: 15000,
    precioPantalla: 8500,
  },
]

const faqs = ref([
  {
    q: '¿Cómo se realiza la entrega de la cuenta o pantalla?',
    a: 'La entrega es automatizada e inmediata. En cuanto tu pago simulado es verificado en el sistema, tus credenciales (correo, contraseña y PIN de perfil individual si corresponde) se activan y muestran de inmediato en tu panel "Mi Cuenta > Mis Servicios".',
    open: true,
  },
  {
    q: '¿Qué diferencia hay entre una cuenta completa y una pantalla individual?',
    a: 'En la Cuenta Completa recibes el acceso integral a la suscripción para usar en hasta 4 o 5 dispositivos según la plataforma. En Pantalla Individual adquieres 1 perfil exclusivo y personal protegido con PIN privado dentro de una cuenta compartida por nuestro sistema.',
    open: false,
  },
  {
    q: '¿Qué pasa si la cuenta presenta fallas o deja de funcionar?',
    a: 'Cuentas con garantía total de reposición. Si alguna pantalla presenta inconvenientes de conexión o credenciales durante los 30 días del ciclo contratado, nuestro sistema te reasigna una nueva cuenta de inmediato sin costo.',
    open: false,
  },
  {
    q: '¿Cuáles son los métodos de pago disponibles en Colombia?',
    a: 'Admitimos pagos con Tarjeta Débito (Bancolombia, Nu, Genérica multimarca y BBVA con auto-detección de Visa, Mastercard y Amex) y la pasarela móvil directa para Nequi con confirmación en tu celular.',
    open: false,
  },
])

function toggleFaq(index: number) {
  faqs.value[index].open = !faqs.value[index].open
}

const formatCOP = (val: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(val)
}
</script>

<template>
  <div class="space-y-20 pb-20">
    <!-- ================= 1. CINEMATIC HERO (Stitch Board 2) ================= -->
    <section class="relative overflow-hidden pt-12 sm:pt-20 lg:pt-24 pb-16 border-b border-line">
      <!-- Iluminación ambiental controlada (Glow esférico) -->
      <div class="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 size-[650px] rounded-full bg-brand-500/15 blur-[120px] -z-10" />
      <div class="pointer-events-none absolute right-1/4 top-1/3 size-[400px] rounded-full bg-cyan-500/10 blur-[100px] -z-10" />

      <div class="container-app text-center max-w-4xl mx-auto space-y-6">
        <!-- Pill de Categoría -->
        <div class="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-950/40 px-4 py-1.5 text-xs font-mono font-semibold uppercase tracking-widest text-cyan-300 shadow-sm">
          <Sparkles class="size-3.5 text-cyan-400" />
          <span>StreamStore / Entertainment 100% Digital</span>
        </div>

        <!-- Titular Principal -->
        <h1 class="font-display text-4xl sm:text-6xl lg:text-7xl font-black text-fg tracking-tight leading-[1.08]">
          Tus Plataformas de Streaming Favoritas al <span class="bg-gradient-to-r from-brand-400 via-cyan-300 to-brand-300 bg-clip-text text-transparent">Mejor Precio</span>
        </h1>

        <!-- Subtítulo -->
        <p class="text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
          Disfruta del mejor entretenimiento en 4K UHD sin sobrecostos. Cuentas completas y perfiles individuales con entrega automática en segundos.
        </p>

        <!-- Botones de Acción CTA -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <RouterLink
            to="/catalogo"
            class="btn-primary text-base py-3.5 px-8 font-bold shadow-lg shadow-brand-500/30 w-full sm:w-auto"
          >
            <span>Explorar Catálogo</span>
            <ArrowRight class="size-4" />
          </RouterLink>

          <RouterLink
            to="/bienvenida"
            class="btn-secondary text-base py-3.5 px-7 font-bold border-cyan-500/30 text-cyan-200 hover:border-cyan-400 hover:text-white w-full sm:w-auto flex items-center gap-2"
          >
            <Play class="size-4 fill-cyan-400 text-cyan-400" />
            <span>Conoce Cómo Funciona</span>
          </RouterLink>
        </div>

        <!-- Métricas de Confianza (4 Columnas) -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-12 border-t border-line/60 mt-12">
          <div class="rounded-xl border border-line/60 bg-surface/50 p-4">
            <p class="font-display text-3xl font-black text-fg tracking-tight">+15K</p>
            <p class="text-xs text-muted mt-0.5">Clientes Satisfechos</p>
          </div>
          <div class="rounded-xl border border-line/60 bg-surface/50 p-4">
            <p class="font-display text-3xl font-black text-success tracking-tight">100%</p>
            <p class="text-xs text-muted mt-0.5">Garantía Activa</p>
          </div>
          <div class="rounded-xl border border-line/60 bg-surface/50 p-4">
            <p class="font-display text-3xl font-black text-cyan-300 tracking-tight">24/7</p>
            <p class="text-xs text-muted mt-0.5">Soporte Inmediato</p>
          </div>
          <div class="rounded-xl border border-line/60 bg-surface/50 p-4">
            <p class="font-display text-3xl font-black text-brand-300 tracking-tight">&lt; 10s</p>
            <p class="text-xs text-muted mt-0.5">Entrega Automática</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= 2. ELIGE TU MODALIDAD Y CATÁLOGO RÁPIDO ================= -->
    <section class="container-app space-y-8">
      <div class="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <span class="text-xs font-mono uppercase tracking-[0.25em] text-cyan-400 font-bold block mb-1">
            Catálogo Destacado
          </span>
          <h2 class="font-display text-2xl sm:text-4xl font-black text-fg tracking-tight">
            Elige Tu Modalidad
          </h2>
        </div>

        <!-- Segmented Toggle Cuentas Completas vs Pantallas Individuales -->
        <div class="flex p-1 rounded-xl border border-line bg-surface-2 self-stretch sm:self-auto">
          <button
            type="button"
            class="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200"
            :class="
              modalidadSeleccionada === 'CUENTA_COMPLETA'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'text-muted hover:text-fg'
            "
            @click="modalidadSeleccionada = 'CUENTA_COMPLETA'"
          >
            Cuentas Completas
          </button>
          <button
            type="button"
            class="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200"
            :class="
              modalidadSeleccionada === 'PANTALLA'
                ? 'bg-cyan-500 text-neutral-900 shadow-sm'
                : 'text-muted hover:text-fg'
            "
            @click="modalidadSeleccionada = 'PANTALLA'"
          >
            Pantallas Individuales (PIN)
          </button>
        </div>
      </div>

      <!-- Cuadrícula de 6 Plataformas Principales -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="p in plataformas"
          :key="p.id"
          class="card group relative flex flex-col justify-between overflow-hidden border-line hover:border-brand-400/60 transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/10"
        >
          <!-- Acento de Color de la Plataforma -->
          <div
            class="h-1.5 w-full absolute top-0 left-0 transition-opacity duration-300"
            :style="{ backgroundColor: p.color }"
          />

          <div class="p-2 space-y-4">
            <div class="flex items-center justify-between pt-2">
              <span class="text-xs font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-line bg-surface-2 text-muted">
                {{ p.badge }}
              </span>
              <span class="size-2.5 rounded-full" :style="{ backgroundColor: p.color }" />
            </div>

            <div>
              <h3 class="font-display text-xl font-bold text-fg group-hover:text-cyan-300 transition-colors">
                {{ p.nombre }}
              </h3>
              <p class="text-xs text-muted leading-relaxed mt-1 line-clamp-2">
                {{ p.desc }}
              </p>
            </div>

            <!-- Precio en COP según modalidad seleccionada -->
            <div class="pt-3 border-t border-line/60">
              <span class="text-[10px] font-mono text-muted uppercase tracking-wider block">
                Precio mensual desde
              </span>
              <p class="font-display text-2xl font-black text-fg mt-0.5">
                {{ formatCOP(modalidadSeleccionada === 'CUENTA_COMPLETA' ? p.precioCompleta : p.precioPantalla) }}
                <span class="text-xs text-muted font-normal font-sans">/ mes</span>
              </p>
            </div>
          </div>

          <div class="p-2 pt-4">
            <RouterLink
              to="/catalogo"
              class="btn w-full py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200"
              :class="
                modalidadSeleccionada === 'CUENTA_COMPLETA'
                  ? 'btn-primary'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-neutral-900 shadow-md shadow-cyan-500/20'
              "
            >
              <span>{{ modalidadSeleccionada === 'CUENTA_COMPLETA' ? 'Comprar Cuenta' : 'Comprar Pantalla' }}</span>
              <ArrowRight class="size-3.5" />
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ================= 3. EXPERIENCIA SIN COMPLICACIONES (Stitch Board 2) ================= -->
    <section class="container-app space-y-10">
      <div class="text-center max-w-xl mx-auto space-y-2">
        <span class="text-xs font-mono uppercase tracking-[0.25em] text-cyan-400 font-bold block">
          Por Qué Elegirnos
        </span>
        <h2 class="font-display text-3xl sm:text-4xl font-black text-fg tracking-tight">
          Experiencia Sin Complicaciones
        </h2>
        <p class="text-xs sm:text-sm text-muted">
          Diseñado para ofrecerte máxima velocidad, seguridad y tranquilidad en cada compra digital.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Beneficio 1: Entrega Inmediata -->
        <div class="card p-6 space-y-3 border-line/80 hover:border-cyan-400/50 transition-colors">
          <div class="grid size-12 place-items-center rounded-2xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            <Zap class="size-6" />
          </div>
          <h3 class="font-display text-base font-bold text-fg">Entrega Inmediata</h3>
          <p class="text-xs text-muted leading-relaxed">
            Recibe tus datos de acceso en segundos de forma automatizada tras confirmar tu pago.
          </p>
        </div>

        <!-- Beneficio 2: Garantía Total -->
        <div class="card p-6 space-y-3 border-line/80 hover:border-emerald-400/50 transition-colors">
          <div class="grid size-12 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <ShieldCheck class="size-6" />
          </div>
          <h3 class="font-display text-base font-bold text-fg">Garantía Total</h3>
          <p class="text-xs text-muted leading-relaxed">
            Reemplazo inmediato garantizado durante todo el periodo si tu suscripción presenta fallas.
          </p>
        </div>

        <!-- Beneficio 3: Soporte 24/7 -->
        <div class="card p-6 space-y-3 border-line/80 hover:border-brand-400/50 transition-colors">
          <div class="grid size-12 place-items-center rounded-2xl bg-brand-500/15 text-brand-300 border border-brand-500/30">
            <Headphones class="size-6" />
          </div>
          <h3 class="font-display text-base font-bold text-fg">Soporte 24/7</h3>
          <p class="text-xs text-muted leading-relaxed">
            Equipo técnico disponible vía WhatsApp y chat interno para resolver cualquier duda al instante.
          </p>
        </div>

        <!-- Beneficio 4: Pagos en COP -->
        <div class="card p-6 space-y-3 border-line/80 hover:border-yellow-400/50 transition-colors">
          <div class="grid size-12 place-items-center rounded-2xl bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">
            <CreditCard class="size-6" />
          </div>
          <h3 class="font-display text-base font-bold text-fg">Pagos en COP</h3>
          <p class="text-xs text-muted leading-relaxed">
            Paga fácilmente en pesos colombianos con múltiples métodos de pago locales seguros.
          </p>
        </div>
      </div>
    </section>

    <!-- ================= 4. PREGUNTAS FRECUENTES (Stitch Board 2) ================= -->
    <section class="container-app max-w-3xl space-y-8">
      <div class="text-center space-y-2">
        <span class="text-xs font-mono uppercase tracking-[0.25em] text-cyan-400 font-bold block">
          Resolvemos tus Dudas
        </span>
        <h2 class="font-display text-3xl font-black text-fg tracking-tight">
          Preguntas Frecuentes
        </h2>
      </div>

      <div class="space-y-3">
        <div
          v-for="(faq, idx) in faqs"
          :key="idx"
          class="rounded-xl border border-line bg-surface overflow-hidden transition-colors"
        >
          <button
            type="button"
            class="flex w-full items-center justify-between p-5 text-left font-display text-sm font-bold text-fg hover:text-cyan-300 transition-colors"
            @click="toggleFaq(idx)"
          >
            <span>{{ faq.q }}</span>
            <ChevronDown
              class="size-4 shrink-0 transition-transform duration-300 text-muted"
              :class="{ 'rotate-180 text-cyan-300': faq.open }"
            />
          </button>
          <div v-show="faq.open" class="px-5 pb-5 text-xs text-muted leading-relaxed border-t border-line/40 pt-3">
            {{ faq.a }}
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
