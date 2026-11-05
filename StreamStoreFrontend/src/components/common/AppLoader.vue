<script setup lang="ts">
withDefaults(defineProps<{ label?: string; size?: 'sm' | 'md' | 'lg' }>(), {
  label: 'Cargando…',
  size: 'md',
})
</script>

<template>
  <div role="status" aria-live="polite" class="flex items-center justify-center gap-3 py-6 text-muted">
    <span
      aria-hidden="true"
      class="animate-spin rounded-full border-2 border-brand-400/30 border-t-brand-400"
      :class="{ 'size-4': size === 'sm', 'size-6': size === 'md', 'size-10': size === 'lg' }"
    />
    <span :class="size === 'sm' ? 'sr-only' : 'text-sm'">{{ label }}</span>
  </div>
</template>
