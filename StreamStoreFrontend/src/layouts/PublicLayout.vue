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

const isNotFoundPage = computed(() => {
  return (
    route.name === 'not-found' ||
    route.matched.some((r) => r.name === 'not-found')
  )
})

const isStandalonePage = computed(() => {
  return isAuthPage.value || isNotFoundPage.value
})
</script>

<template>
  <div class="flex min-h-dvh flex-col bg-black text-fg">
    <SkipLink />
    <AppHeader v-if="route.path !== '/' && !isStandalonePage" />
    <main id="main" tabindex="-1" class="flex-1 outline-none">
      <RouterView />
    </main>
    <AppFooter v-if="!isStandalonePage" />
    <WhatsAppButton v-if="!isStandalonePage" />
  </div>
</template>
