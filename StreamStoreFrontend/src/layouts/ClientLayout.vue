<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import SkipLink from '@/components/layout/SkipLink.vue'
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-black text-fg selection:bg-brand-500/30 selection:text-white">
    <SkipLink />
    <AppHeader />
    
    <div class="container-app flex-1 py-6 sm:py-8">
      <main id="main" tabindex="-1" class="min-w-0 flex-1 outline-none">
        <RouterView />
      </main>
    </div>
  </div>
</template>
