<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { dailyTelemetry } from '@/composables/useFlavorText'

const today = new Date().toISOString().slice(0, 10)
const lines = computed(() => dailyTelemetry(today, 50))
const visible = ref([])
let interval = null

onMounted(() => {
  // Reveal lines one at a time for an instrument-feed feel
  let i = 0
  const reveal = () => {
    if (i >= lines.value.length) {
      clearInterval(interval)
      return
    }
    const stamp = new Date()
    const hh = String(stamp.getHours()).padStart(2, '0')
    const mm = String(stamp.getMinutes()).padStart(2, '0')
    const ss = String(stamp.getSeconds()).padStart(2, '0')
    visible.value.unshift({ id: i, text: lines.value[i], time: `${hh}:${mm}:${ss}` })
    visible.value = visible.value.slice(0, 4)
    i++
  }
  reveal()
  interval = setInterval(reveal, 11300)
})

onUnmounted(() => { if (interval) clearInterval(interval) })
</script>

<template>
  <aside class="telemetry">
    <header class="telemetry__head">
      <span class="telemetry__dot" />
      <span class="label">Telemetry · live</span>
    </header>
    <ul class="telemetry__list mono">
      <li v-for="entry in visible" :key="entry.id" class="telemetry__entry">
        <span class="telemetry__time">{{ entry.time }}</span>
        <span class="telemetry__text">{{ entry.text }}</span>
      </li>
    </ul>
  </aside>
</template>

<style scoped>
.telemetry {
  padding: var(--s-4) var(--s-5);
  background: var(--hull);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  font-size: 11px;
}

.telemetry__head {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  margin-bottom: var(--s-3);
  padding-bottom: var(--s-2);
  border-bottom: 1px dashed var(--line);
}
.telemetry__dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--verdant);
  box-shadow: 0 0 6px var(--verdant);
  animation: blink 1.6s ease-in-out infinite;
}
@keyframes blink { 50% { opacity: 0.3; } }

.telemetry__list {
  list-style: none;
  margin: 0; padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.telemetry__entry {
  display: grid;
  grid-template-columns: 64px 1fr;
  gap: var(--s-3);
  font-size: 10px;
  color: var(--signal-dim);
  animation: telemetry-in 320ms var(--ease-out);
  opacity: 0.92;
}
.telemetry__entry:first-child { color: var(--signal); opacity: 1; }
.telemetry__entry:nth-child(3) { opacity: 0.7; }
.telemetry__entry:nth-child(4) { opacity: 0.45; }

.telemetry__time { color: var(--signal-low); letter-spacing: 0.04em; }
.telemetry__text { letter-spacing: 0.02em; }

@keyframes telemetry-in {
  from { transform: translateY(-4px); opacity: 0; }
  to   { transform: translateY(0);    opacity: var(--end-opacity, 1); }
}
</style>
