<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Headphones, Lock, ShieldCheck } from '@lucide/vue'
import AppLogo from './AppLogo.vue'
</script>

<template>
  <footer class="border-t border-line bg-surface/70 text-muted">
    <div class="container-app py-12 sm:py-16">
      <div class="grid grid-cols-1 gap-10 md:grid-cols-12">
        <!-- Columna 1: Marca y Propuesta de Valor (5 cols) -->
        <div class="md:col-span-5 space-y-4">
          <AppLogo />
          <p class="max-w-sm text-xs leading-relaxed text-muted">
            Plataforma digital especializada en la distribución y gestión de suscripciones de entretenimiento en streaming en Colombia. Entrega automatizada 24/7, perfiles privados con PIN y soporte en tiempo real.
          </p>
          <div class="flex items-center gap-4 text-xs text-muted pt-2">
            <span class="flex items-center gap-1.5 text-success">
              <ShieldCheck class="size-4" />
              <span>Garantía de reposición</span>
            </span>
            <span class="flex items-center gap-1.5 text-cyan-300">
              <Lock class="size-4" />
              <span>Simulación Segura</span>
            </span>
          </div>
        </div>

        <!-- Columna 2: Navegación Rápida (2 cols) -->
        <div class="md:col-span-2 space-y-3">
          <h4 class="font-display text-xs font-bold uppercase tracking-[0.2em] text-fg">
            Plataforma
          </h4>
          <ul class="space-y-2 text-xs">
            <li><RouterLink to="/" class="hover:text-cyan-300 transition-colors">Inicio</RouterLink></li>
            <li><RouterLink to="/catalogo" class="hover:text-cyan-300 transition-colors">Catálogo de Streaming</RouterLink></li>
            <li><RouterLink to="/bienvenida" class="hover:text-cyan-300 transition-colors">Historia Audiovisual</RouterLink></li>
            <li><RouterLink to="/carrito" class="hover:text-cyan-300 transition-colors">Carrito de Compras</RouterLink></li>
            <li><RouterLink to="/mi-cuenta" class="hover:text-cyan-300 transition-colors">Panel de Cliente</RouterLink></li>
          </ul>
        </div>

        <!-- Columna 3: Información Legal (2 cols) -->
        <div class="md:col-span-2 space-y-3">
          <h4 class="font-display text-xs font-bold uppercase tracking-[0.2em] text-fg">
            Políticas
          </h4>
          <ul class="space-y-2 text-xs text-muted">
            <li><span class="hover:text-fg cursor-pointer">Términos de Servicio</span></li>
            <li><span class="hover:text-fg cursor-pointer">Garantía y Reembolsos</span></li>
            <li><span class="hover:text-fg cursor-pointer">Tratamiento de Datos</span></li>
            <li><span class="hover:text-fg cursor-pointer">Aviso de Simulación</span></li>
          </ul>
        </div>

        <!-- Columna 4: Atención & Contacto (3 cols) -->
        <div class="md:col-span-3 space-y-3">
          <h4 class="font-display text-xs font-bold uppercase tracking-[0.2em] text-fg">
            Atención Inmediata
          </h4>
          <p class="text-xs text-muted leading-relaxed">
            ¿Tienes dudas sobre la asignación de pantallas o PINs? Chatea directamente con nuestro canal de atención.
          </p>
          <a
            href="https://wa.me/573001234567"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-3.5 py-2 text-xs font-semibold text-fg hover:border-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <Headphones class="size-4 text-brand-400" />
            <span>WhatsApp Soporte 24/7</span>
          </a>
        </div>
      </div>

      <div class="mt-12 border-t border-line/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
        <p>© {{ new Date().getFullYear() }} StreamStore S.A.S. · Bogotá, Colombia. Todos los derechos reservados.</p>
        <p class="font-mono text-[11px] text-muted/70">Ambiente de Desarrollo y Demostración Frontend</p>
      </div>
    </div>
  </footer>
</template>
