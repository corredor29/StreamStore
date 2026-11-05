<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangle, CheckCircle2, Info, XCircle } from '@lucide/vue'

const props = withDefaults(
  defineProps<{ variant?: 'info' | 'success' | 'warning' | 'error'; title?: string }>(),
  { variant: 'info' },
)
defineEmits<{ retry: [] }>()

const config = computed(() => {
  switch (props.variant) {
    case 'success':
      return { icon: CheckCircle2, cls: 'border-success/40 bg-success/10 text-success' }
    case 'warning':
      return { icon: AlertTriangle, cls: 'border-warning/40 bg-warning/10 text-warning' }
    case 'error':
      return { icon: XCircle, cls: 'border-danger/40 bg-danger/10 text-danger' }
    default:
      return { icon: Info, cls: 'border-brand-400/40 bg-brand-500/10 text-brand-300' }
  }
})
</script>

<template>
  <div
    :role="variant === 'error' ? 'alert' : 'status'"
    class="flex gap-3 rounded-xl border p-4 text-sm"
    :class="config.cls"
  >
    <component :is="config.icon" class="mt-0.5 size-5 shrink-0" aria-hidden="true" />
    <div class="flex-1 text-fg">
      <p v-if="title" class="font-semibold">{{ title }}</p>
      <slot />
    </div>
  </div>
</template>
