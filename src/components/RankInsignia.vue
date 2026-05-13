<script setup>
import { computed } from 'vue'
import { baseInsigniaFor, gradeStrokeCount } from '@/data/insignia'

const props = defineProps({
  rank:  { type: Number, required: true },
  grade: { type: String, default: 'I' },
  size:  { type: Number, default: 48 }
})

const elements = computed(() => baseInsigniaFor(props.rank))
const strokes = computed(() => gradeStrokeCount(props.grade))

// Compute X positions for grade strokes, centered at x=32 with 4px spacing.
const strokePositions = computed(() => {
  const count = strokes.value
  const spacing = 4
  const totalWidth = (count - 1) * spacing
  const startX = 32 - totalWidth / 2
  return Array.from({ length: count }, (_, i) => startX + i * spacing)
})
</script>

<template>
  <svg viewBox="0 0 64 64" :width="size" :height="size" class="insignia" aria-hidden="true">
    <!-- Base rank insignia (centered at 32, 32) -->
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
        stroke-linecap="round"
        :opacity="el.opacity ?? 1"
      />
    </template>

    <!-- Grade strokes — vertical lines below the main mark -->
    <g class="insignia__grades">
      <line
        v-for="(x, i) in strokePositions"
        :key="i"
        :x1="x" :y1="58"
        :x2="x" :y2="62"
        stroke="currentColor"
        stroke-width="1.4"
        stroke-linecap="round"
      />
    </g>
  </svg>
</template>

<style scoped>
.insignia { display: block; }
</style>