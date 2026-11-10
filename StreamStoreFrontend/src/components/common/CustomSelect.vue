<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { Check, ChevronDown } from '@lucide/vue'

export interface SelectOption {
  value: string | number
  label: string
  hint?: string
}

const props = withDefaults(
  defineProps<{
    modelValue: string | number
    options: (SelectOption | string | number)[]
    placeholder?: string
    ariaLabel?: string
    disabled?: boolean
    compact?: boolean
  }>(),
  {
    placeholder: 'Seleccionar...',
    ariaLabel: 'Seleccionar opción',
    disabled: false,
    compact: false,
  }
)

const emit = defineEmits<{
  'update:modelValue': [val: any]
  change: [val: any]
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const normalizedOptions = computed<SelectOption[]>(() => {
  return props.options.map((opt) => {
    if (typeof opt === 'object' && opt !== null && 'value' in opt) {
      return opt as SelectOption
    }
    return {
      value: opt,
      label: String(opt),
    }
  })
})

const currentSelected = computed(() => {
  return normalizedOptions.value.find((o) => o.value === props.modelValue)
})

const displayLabel = computed(() => {
  if (currentSelected.value) return currentSelected.value.label
  return props.placeholder
})

function toggleDropdown() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

function selectOption(val: string | number) {
  isOpen.value = false
  emit('update:modelValue', val)
  emit('change', val)
}

function handleClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    isOpen.value = false
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('click', handleClickOutside)
    window.addEventListener('keydown', onKeydown)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('click', handleClickOutside)
    window.removeEventListener('keydown', onKeydown)
  }
})
</script>

<template>
  <div ref="dropdownRef" class="relative inline-block text-left" :class="compact ? 'min-w-[4rem]' : 'min-w-[8rem]'">
    <!-- Botón Gatillo con Estilo Cyber Dark Glassmorphism -->
    <button
      type="button"
      :disabled="disabled"
      :aria-label="ariaLabel"
      :aria-expanded="isOpen"
      class="group flex w-full items-center justify-between gap-2 rounded-xl border border-white/15 bg-[#0C1024]/90 text-white shadow-lg backdrop-blur-xl transition-all hover:border-cyan-400/50 hover:bg-[#111735] hover:shadow-[0_0_15px_rgba(6,182,212,0.18)] focus:border-cyan-400 focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      :class="[
        compact ? 'px-2.5 py-1.5 text-xs font-semibold' : 'px-3.5 py-2 text-xs sm:text-[13px] font-bold',
        isOpen ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.25)] bg-[#111735]' : ''
      ]"
      @click.stop="toggleDropdown"
    >
      <span class="truncate text-left">{{ displayLabel }}</span>
      <ChevronDown
        class="size-3.5 shrink-0 text-slate-400 transition-transform duration-200 group-hover:text-cyan-300"
        :class="{ 'rotate-180 text-cyan-400': isOpen }"
        aria-hidden="true"
      />
    </button>

    <!-- Menú Desplegable con Animación y Efecto Neón -->
    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="transform scale-95 opacity-0 -translate-y-1"
      enter-to-class="transform scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform scale-100 opacity-100 translate-y-0"
      leave-to-class="transform scale-95 opacity-0 -translate-y-1"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 top-full mt-1.5 z-50 max-h-64 min-w-full w-max overflow-y-auto rounded-xl border border-white/20 bg-[#080d20] p-1.5 shadow-2xl backdrop-blur-2xl ring-1 ring-cyan-500/20"
        role="listbox"
      >
        <div class="space-y-0.5">
          <button
            v-for="opt in normalizedOptions"
            :key="opt.value"
            type="button"
            role="option"
            :aria-selected="opt.value === modelValue"
            class="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-xs font-semibold transition-all cursor-pointer"
            :class="[
              opt.value === modelValue
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 font-bold'
                : 'text-slate-300 hover:bg-white/10 hover:text-white'
            ]"
            @click.stop="selectOption(opt.value)"
          >
            <div class="flex flex-col min-w-0">
              <span class="truncate">{{ opt.label }}</span>
              <span v-if="opt.hint" class="text-[10px] text-slate-400 font-normal truncate">{{ opt.hint }}</span>
            </div>
            <Check v-if="opt.value === modelValue" class="size-3.5 shrink-0 text-cyan-400" aria-hidden="true" />
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>
