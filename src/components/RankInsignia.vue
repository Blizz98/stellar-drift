<script setup>
import { computed } from 'vue'
import { insigniaFor } from '@/data/insignia'

const props = defineProps({
  rank: { type: Number, required: true },
  size: { type: Number, default: 48 }
})

const elements = computed(() => insigniaFor(props.rank))
</script>

<template>
  <svg :viewBox="`0 0 64 64`" :width="size" :height="size" class="insignia" aria-hidden="true">
    <template v-for="(el, i) in elements" :key="i">
      <circle
        v-if="el.type === 'circle'"
        :cx="el.cx" :cy="el.cy" :r="el.r"
        :fill="el.fill || 'none'"
        :stroke="el.stroke || 'none'"
        :stroke-width="el.sw || 0"
        :stroke-dasharray="el.strokeDasharray || null"
        :opacity="el.opacity ?? 1"
      />
      <path
        v-else-if="el.type === 'path'"
        :d="el.d"
        :fill="el.fill || 'none'"
        :stroke="el.stroke || 'none'"
        :stroke-width="el.sw || 0"
        :stroke-linecap="'round'"
        :opacity="el.opacity ?? 1"
      />
    </template>
  </svg>
</template>

<style scoped>
.insignia {
  display: block;
}
</style>