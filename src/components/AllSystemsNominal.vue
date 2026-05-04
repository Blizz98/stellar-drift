<script setup>
import { computed } from 'vue'
import { useHabitsStore } from '@/stores/habits'

const habits = useHabitsStore()

const show = computed(() =>
  habits.activeHabits.length > 0 && habits.todayCompletionRate >= 1
)
</script>

<template>
  <Transition name="rise">
    <section v-if="show" class="nominal" role="status" aria-live="polite">
      <div class="nominal__rays" aria-hidden="true">
        <span v-for="i in 12" :key="i" class="nominal__ray" :style="{ transform: `rotate(${i * 30}deg)` }" />
      </div>

      <div class="nominal__core">
        <span class="nominal__icon" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="28" height="28" fill="none">
            <circle cx="16" cy="16" r="9" stroke="currentColor" stroke-width="1.4"/>
            <circle cx="16" cy="16" r="3" fill="currentColor"/>
          </svg>
        </span>
        <div class="nominal__copy">
          <span class="nominal__kicker mono">All systems nominal</span>
          <h3 class="nominal__title display">The ship sails clean today.</h3>
        </div>
      </div>
    </section>
  </Transition>
</template>

<style scoped>
.nominal {
  position: relative;
  padding: var(--s-5) var(--s-6);
  background:
    radial-gradient(400px 200px at 50% 50%, rgba(91, 203, 140, 0.18), transparent 70%),
    var(--bulkhead);
  border: 1px solid var(--verdant);
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: 0 0 32px -8px rgba(91, 203, 140, 0.45);
}

.nominal__rays {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
  opacity: 0.3;
}
.nominal__ray {
  position: absolute;
  width: 1px;
  height: 80px;
  background: linear-gradient(180deg, transparent, var(--verdant));
  transform-origin: bottom center;
  animation: ray-spin 18s linear infinite;
}
@keyframes ray-spin {
  to { transform: rotate(360deg); }
}

.nominal__core {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--s-4);
}
.nominal__icon {
  width: 44px; height: 44px;
  display: grid;
  place-items: center;
  color: var(--verdant);
  background: var(--hull);
  border: 1px solid var(--verdant);
  border-radius: 50%;
  flex-shrink: 0;
}
.nominal__kicker {
  font-size: 10px;
  letter-spacing: 0.14em;
  color: var(--verdant);
}
.nominal__title {
  font-size: 24px;
  margin: 4px 0 0;
  color: var(--signal);
}

.rise-enter-active {
  transition: transform 480ms var(--ease-out), opacity 480ms var(--ease-out);
}
.rise-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.97);
}
.rise-leave-active {
  transition: opacity var(--t-fast) var(--ease);
}
.rise-leave-to { opacity: 0; }

@media (max-width: 720px) {
  .nominal { padding: var(--s-4); }
  .nominal__title { font-size: 18px; }
}
</style>
