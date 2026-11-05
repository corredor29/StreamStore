<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ShieldCheck, Tv } from '@lucide/vue'
</script>

<template>
  <footer class="border-t border-line bg-surface/50 text-muted">
    <div class="container-app py-12">
      <div class="grid grid-cols-1 gap-8 md:grid-cols-4">
        <!-- Columna 1: Marca y descripción -->
        <div class="md:col-span-2">
          <RouterLink to="/" class="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-fg">
            <span class="grid size-9 place-items-center rounded-lg bg-brand-500 text-white">
              <Tv class="size-5" aria-hidden="true" />
            </span>
            <span>Stream<span class="text-brand-300">Store</span></span>
          </RouterLink>
          <p class="mt-3 max-w-sm text-sm text-muted">
            Tienda virtual de cuentas completas y pantallas individuales de streaming. Acceso rápido, precios justos y soporte confiable.
          </p>
          <div class="mt-4 flex items-center gap-2 text-xs text-muted">
            <ShieldCheck class="size-4 text-brand-300" aria-hidden="true" />
            <span>Transacciones y credenciales protegidas.</span>
          </div>
        </div>

        <!-- Columna 2: Navegación -->
        <div>
          <h4 class="font-display text-sm font-semibold uppercase tracking-wider text-fg">Plataforma</h4>
          <ul class="mt-3 space-y-2 text-sm">
            <li><RouterLink to="/" class="hover:text-fg">Inicio</RouterLink></li>
            <li><RouterLink to="/catalogo" class="hover:text-fg">Catálogo completo</RouterLink></li>
            <li><RouterLink to="/carrito" class="hover:text-fg">Carrito de compras</RouterLink></li>
            <li><RouterLink to="/mi-cuenta" class="hover:text-fg">Mis servicios</RouterLink></li>
          </ul>
        </div>

        <!-- Columna 3: Información importante -->
        <div>
          <h4 class="font-display text-sm font-semibold uppercase tracking-wider text-fg">Demostración</h4>
          <p class="mt-3 text-xs leading-relaxed text-muted">
            StreamStore es un proyecto de demostración frontend. Todos los accesos, marcas y transacciones son simulados con fines de desarrollo y prueba técnica.
          </p>
        </div>
      </div>

      <div class="mt-10 border-t border-line/60 pt-6 text-center text-xs text-muted">
        <p>© {{ new Date().getFullYear() }} StreamStore · Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
</template>
