<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import SkipLink from '@/components/layout/SkipLink.vue'
import WhatsAppButton from '@/components/common/WhatsAppButton.vue'

const route = useRoute()

const isAuthPage = computed(() => {
  return (
    route.name === 'login' ||
    route.name === 'register' ||
    route.path === '/login' ||
    route.path === '/registro'
  )
})
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-black text-fg">
    <SkipLink />
    <AppHeader v-if="route.path !== '/' && !isAuthPage" />
    <main id="main" tabindex="-1" class="flex-1 outline-none">
      <RouterView />
    </main>
    <AppFooter v-if="!isAuthPage" />
    <WhatsAppButton v-if="!isAuthPage" />
  </div>
</template>
