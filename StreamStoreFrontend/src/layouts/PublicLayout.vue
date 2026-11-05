<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import SkipLink from '@/components/layout/SkipLink.vue'
import WhatsAppButton from '@/components/common/WhatsAppButton.vue'
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-bg text-fg">
    <SkipLink />
    <AppHeader />
    <main id="main" tabindex="-1" class="flex-1 outline-none">
      <RouterView />
    </main>
    <AppFooter />
    <WhatsAppButton />
  </div>
</template>
