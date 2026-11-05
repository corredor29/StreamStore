<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { 
  ArrowRight, 
  ChevronDown, 
  CreditCard, 
  HelpCircle, 
  KeyRound, 
  ShieldCheck, 
  Sparkles, 
  Tv 
} from '@lucide/vue'
import heroImg from '@/assets/hero.png'

const plataformasDestacadas = [
  { nombre: 'Netflix', slug: 'netflix', desc: 'PelÃ­culas, series y producciones originales sin lÃ­mite.', color: '#E50914', cuentas: 'Completa o Pantalla' },
  { nombre: 'Disney+', slug: 'disney', desc: 'Marvel, Star Wars, Pixar y clÃ¡sicos familiares.', color: '#113CCF', cuentas: 'Completa o Pantalla' },
  { nombre: 'Prime Video', slug: 'prime', desc: 'Series exclusivas de Amazon y estrenos mundiales.', color: '#00A8E1', cuentas: 'Completa o Pantalla' },
  { nombre: 'Max', slug: 'max', desc: 'HBO, Warner Bros, DC y producciones de alta gama.', color: '#7B2FF7', cuentas: 'Completa o Pantalla' },
]

const faqs = ref([
  {
    q: 'Â¿CuÃ¡l es la diferencia entre Cuenta Completa y Pantalla Individual?',
    a: 'En la Cuenta Completa adquieres la cuenta en su totalidad con todas sus pantallas disponibles para ti y tu familia. En Pantalla Individual adquieres un perfil exclusivo con PIN de acceso dentro de una cuenta compartida.',
    open: true,
  },
  {
    q: 'Â¿CuÃ¡ndo y cÃ³mo recibo mis credenciales de acceso?',
    a: 'Las credenciales (correo, contraseÃ±a y PIN de perfil si aplica) se revelan inmediatamente en la secciÃ³n "Mi Cuenta > Mis Servicios" una vez que el pago es procesado y confirmado.',
    open: false,
  },
  {
    q: 'Â¿El carrito de compras reserva el inventario?',
    a: 'No. El carrito te permite agrupar productos, pero el stock definitivo se valida en tiempo real al momento de ejecutar el pago para garantizar inventario activo.',
    open: false,
  },
  {
    q: 'Â¿QuÃ© garantÃ­a tienen los servicios contratados?',
    a: 'Cuentas con garantÃ­a y reemplazo inmediato durante los 30 dÃ­as de vigencia de tu plan con atenciÃ³n a travÃ©s de nuestro soporte tÃ©cnico.',
    open: false,
  },
])

function toggleFaq(index: number) {
  faqs.value[index].open = !faqs.value[index].open
}
</script>

<template>
  <div>
    <!-- HERO SECTION -->
    <section class="relative overflow-hidden border-b border-line py-16 sm:py-24 lg:py-28">
      <!-- Resplandor decorativo de fondo -->
      <div
        class="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-brand-500/20 blur-3xl"
        aria-hidden="true"
      />

      <div class="container-app relative">
        <div class="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <!-- Columna Izquierda: Mensaje y CTA -->
          <div class="lg:col-span-7">
            <div class="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-brand-300">
              <Sparkles class="size-3.5" aria-hidden="true" />
              <span>Streaming Premium al Mejor Precio</span>
            </div>

            <h1 class="mt-4 font-display text-4xl font-extrabold tracking-tight text-fg sm:text-5xl lg:text-6xl leading-[1.1]">
              Tus plataformas de <span class="text-brand-300">streaming</span> en un solo lugar.
            </h1>

            <p class="mt-5 text-base leading-relaxed text-muted sm:text-lg max-w-xl">
              Cuentas completas y pantallas individuales garantizadas para Netflix, Disney+, Prime Video y Max. Entrega inmediata tras la confirmaciÃ³n de tu compra.
            </p>

            <div class="mt-8 flex flex-wrap items-center gap-4">
              <RouterLink to="/catalogo" class="btn-primary text-base py-3 px-6 shadow-lg shadow-brand-500/25">
                <span>Explorar CatÃ¡logo</span>
                <ArrowRight class="size-4" aria-hidden="true" />
              </RouterLink>

                            <a href="#como-funciona" class="btn-secondary text-base py-3 px-6">
                Â¿CÃ³mo funciona?
              </a>
            </div>

            <!-- Mini indicadores de confianza -->
            <div class="mt-10 grid grid-cols-3 gap-4 border-t border-line/60 pt-6">
              <div>
                <p class="font-display text-2xl font-bold text-fg">100%</p>
                <p class="text-xs text-muted">GarantÃ­a activa</p>
              </div>
              <div>
                <p class="font-display text-2xl font-bold text-fg">&lt; 1 min</p>
                <p class="text-xs text-muted">Entrega automÃ¡tica</p>
              </div>
              <div>
                <p class="font-display text-2xl font-bold text-fg">24/7</p>
                <p class="text-xs text-muted">Soporte directo</p>
              </div>
            </div>
          </div>

          <!-- Columna Derecha: Imagen visual o preview de plataformas -->
          <div class="lg:col-span-5 flex justify-center">
            <div class="relative w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface p-4 shadow-2xl shadow-brand-500/10">
              <img
                :src="heroImg"
                alt="Plataformas de streaming disponibles en StreamStore"
                class="w-full h-auto rounded-xl object-cover"
                loading="eager"
              />
              <div class="mt-4 flex items-center justify-between px-2 text-xs text-muted">
                <span class="flex items-center gap-1">
                  <ShieldCheck class="size-4 text-success" aria-hidden="true" />
                  Disponibilidad verificada
                </span>
                <span class="font-mono text-brand-300">4 Plataformas top</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- PLATAFORMAS DESTACADAS -->
    <section class="py-16 sm:py-20 border-b border-line bg-surface/30">
      <div class="container-app">
        <div class="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <h2 class="font-display text-2xl font-bold text-fg sm:text-3xl">Plataformas disponibles</h2>
            <p class="text-sm text-muted">Selecciona tu plataforma para ver disponibilidad y precios.</p>
          </div>
          <RouterLink to="/catalogo" class="text-sm font-semibold text-brand-300 hover:text-brand-200 inline-flex items-center gap-1">
            <span>Ver todo el catÃ¡logo</span>
            <ArrowRight class="size-4" aria-hidden="true" />
          </RouterLink>
        </div>

        <div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <RouterLink
            v-for="plat in plataformasDestacadas"
            :key="plat.slug"
            :to="`/catalogo?plataforma=${plat.slug}`"
            class="card group relative flex flex-col justify-between overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-brand-400/60 hover:shadow-lg"
          >
            <div
              class="absolute left-0 top-0 h-1.5 w-full"
              :style="{ backgroundColor: plat.color }"
              aria-hidden="true"
            />
            <div>
              <div class="flex items-center justify-between">
                <span class="font-display text-lg font-bold text-fg group-hover:text-brand-300">
                  {{ plat.nombre }}
                </span>
                <span
                  class="size-3 rounded-full"
                  :style="{ backgroundColor: plat.color }"
                  aria-hidden="true"
                />
              </div>
              <p class="mt-2 text-xs text-muted leading-relaxed">
                {{ plat.desc }}
              </p>
            </div>
            <div class="mt-6 flex items-center justify-between border-t border-line/50 pt-3 text-xs">
              <span class="text-muted">{{ plat.cuentas }}</span>
              <span class="font-semibold text-brand-300 group-hover:translate-x-0.5 transition-transform">Ver planes â†’</span>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- CÃ“MO FUNCIONA -->
    <section id="como-funciona" class="py-16 sm:py-24 border-b border-line">
      <div class="container-app">
        <div class="text-center max-w-2xl mx-auto">
          <span class="text-xs font-semibold uppercase tracking-wider text-brand-300">Paso a paso</span>
          <h2 class="mt-1 font-display text-3xl font-bold text-fg sm:text-4xl">Â¿CÃ³mo funciona StreamStore?</h2>
          <p class="mt-2 text-sm text-muted sm:text-base">
            Proceso de compra simple, transparente y automatizado en tres sencillos pasos.
          </p>
        </div>

        <div class="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          <!-- Paso 1 -->
          <div class="card relative p-6">
            <div class="flex items-center justify-between">
              <div class="grid size-12 place-items-center rounded-xl bg-brand-500/20 text-brand-300">
                <Tv class="size-6" aria-hidden="true" />
              </div>
              <span class="font-display text-3xl font-extrabold text-line">01</span>
            </div>
            <h3 class="mt-4 font-display text-lg font-bold text-fg">1. Elige tu modalidad</h3>
            <p class="mt-2 text-sm text-muted">
              Escoge entre una <strong>Cuenta Completa</strong> con todas las pantallas o una <strong>Pantalla Individual</strong> para uso personal a menor costo.
            </p>
          </div>

          <!-- Paso 2 -->
          <div class="card relative p-6">
            <div class="flex items-center justify-between">
              <div class="grid size-12 place-items-center rounded-xl bg-brand-500/20 text-brand-300">
                <CreditCard class="size-6" aria-hidden="true" />
              </div>
              <span class="font-display text-3xl font-extrabold text-line">02</span>
            </div>
            <h3 class="mt-4 font-display text-lg font-bold text-fg">2. Paga de forma segura</h3>
            <p class="mt-2 text-sm text-muted">
              Paga mediante tarjeta de prueba o Daviplata. El inventario se valida de forma estricta para garantizar stock activo.
            </p>
          </div>

          <!-- Paso 3 -->
          <div class="card relative p-6">
            <div class="flex items-center justify-between">
              <div class="grid size-12 place-items-center rounded-xl bg-brand-500/20 text-brand-300">
                <KeyRound class="size-6" aria-hidden="true" />
              </div>
              <span class="font-display text-3xl font-extrabold text-line">03</span>
            </div>
            <h3 class="mt-4 font-display text-lg font-bold text-fg">3. Recibe tus credenciales</h3>
            <p class="mt-2 text-sm text-muted">
              Accede a tu panel en <strong>Mi Cuenta</strong> y consulta correo, contraseÃ±a y PIN asignado listos para copiar con un solo clic.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- PREGUNTAS FRECUENTES (FAQ) -->
    <section class="py-16 sm:py-24">
      <div class="container-app max-w-4xl">
        <div class="text-center">
          <div class="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-300">
            <HelpCircle class="size-4" aria-hidden="true" />
            <span>Respuestas claras</span>
          </div>
          <h2 class="mt-1 font-display text-3xl font-bold text-fg sm:text-4xl">Preguntas frecuentes</h2>
          <p class="mt-2 text-sm text-muted">
            Todo lo que necesitas saber antes de adquirir tu cuenta o pantalla.
          </p>
        </div>

        <div class="mt-10 space-y-4">
          <div
            v-for="(faq, idx) in faqs"
            :key="idx"
            class="card overflow-hidden p-0"
          >
            <button
              type="button"
              class="flex w-full items-center justify-between gap-4 p-5 text-left font-display text-base font-semibold text-fg transition-colors hover:text-brand-300 focus:outline-none"
              :aria-expanded="faq.open"
              :aria-controls="`faq-ans-${idx}`"
              @click="toggleFaq(idx)"
            >
              <span>{{ faq.q }}</span>
              <ChevronDown
                class="size-5 shrink-0 transition-transform duration-200 text-muted"
                :class="{ 'rotate-180 text-brand-300': faq.open }"
                aria-hidden="true"
              />
            </button>
            <div
              v-show="faq.open"
              :id="`faq-ans-${idx}`"
              class="border-t border-line/60 bg-surface-2/30 p-5 text-sm leading-relaxed text-muted"
            >
              {{ faq.a }}
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
