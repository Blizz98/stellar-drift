<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useExpeditionStore } from '@/stores/expedition'
import { useHabitsStore, CATEGORIES } from '@/stores/habits'
import StatusReadout from '@/components/StatusReadout.vue'
import HabitCard from '@/components/HabitCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import PreflightChecklist from '@/components/PreflightChecklist.vue'
import DailyBrief from '@/components/DailyBrief.vue'
import AllSystemsNominal from '@/components/AllSystemsNominal.vue'
import TelemetryFeed from '@/components/TelemetryFeed.vue'
import YesterdayWidget from '@/components/YesterdayWidget.vue'

const router = useRouter()
const expedition = useExpeditionStore()
const habits = useHabitsStore()

const today = new Date()
const todayLabel = computed(() => today.toLocaleDateString(undefined, {
  weekday: 'long', month: 'long', day: 'numeric'
}))

const grouped = computed(() => {
  const out = {}
  for (const h of habits.todayHabits) {
    if (!out[h.category]) out[h.category] = []
    out[h.category].push(h)
  }
  return out
})

const orderedCategories = ['engineering', 'navigation', 'research', 'life-support']
</script>

<template>
  <div v-if="!expedition.isActive" class="empty-wrap">
    <EmptyState
      title="No voyage in progress"
      body="Every voyage has a beginning and an end. Plot a course to start your first run — there's no streak to break, only a journey to make."
    >
      <button class="btn btn-primary" @click="router.push('/launch')" style="margin-top: var(--s-4)">
        Plot a course →
      </button>
    </EmptyState>
  </div>

  <div v-else class="bridge">
    <StatusReadout />

    <PreflightChecklist />

    <YesterdayWidget />

    <AllSystemsNominal />

    <DailyBrief />

    <section class="day">
      <header class="day__head">
        <div>
          <p class="label">Today's flight log</p>
          <h2 class="display day__title">{{ todayLabel }}</h2>
        </div>
        <p class="day__hint">
          Tap a system to mark it nominal.
        </p>
      </header>

      <div v-if="habits.todayHabits.length === 0" class="day__empty">
        <p>No systems configured for this voyage yet.</p>
        <button class="btn btn-primary" @click="router.push('/habits')">
          Configure systems →
        </button>
      </div>

      <div v-else class="systems">
        <div
          v-for="cat in orderedCategories"
          :key="cat"
          v-show="grouped[cat]?.length"
          class="system-group"
        >
          <header class="system-group__head">
            <span class="system-group__icon" :style="{ color: CATEGORIES[cat].color }">
              {{ CATEGORIES[cat].icon }}
            </span>
            <div>
              <h3 class="system-group__name">{{ CATEGORIES[cat].label }}</h3>
              <p class="system-group__sub label">{{ CATEGORIES[cat].sublabel }}</p>
            </div>
          </header>

          <div class="system-group__list">
            <HabitCard v-for="h in grouped[cat]" :key="h.id" :habit="h" />
          </div>
        </div>
      </div>
    </section>

    <TelemetryFeed />
  </div>
</template>

<style scoped>
.empty-wrap { padding-top: var(--s-7); }

.bridge {
  display: flex;
  flex-direction: column;
  gap: var(--s-7);
}

.day__head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: var(--s-4);
  margin-bottom: var(--s-5);
  padding-bottom: var(--s-4);
  border-bottom: 1px solid var(--line);
}
.day__title { font-size: 28px; margin: 4px 0 0; color: var(--signal); }
.day__hint { color: var(--signal-low); font-size: 12px; margin: 0; font-family: var(--font-mono); }

.day__empty {
  text-align: center;
  padding: var(--s-7);
  color: var(--signal-dim);
  background: var(--hull);
  border: 1px dashed var(--line);
  border-radius: var(--radius-lg);
}
.day__empty p { margin: 0 0 var(--s-4); }

.systems {
  display: flex;
  flex-direction: column;
  gap: var(--s-6);
}

.system-group__head {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  margin-bottom: var(--s-3);
  padding-bottom: var(--s-3);
}
.system-group__icon {
  font-size: 18px;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
}
.system-group__name {
  font-size: 14px;
  font-weight: 500;
  color: var(--signal);
  margin: 0;
  letter-spacing: 0.02em;
}
.system-group__sub { color: var(--signal-low); font-size: 9px; }

.system-group__list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--s-3);
  border-bottom: 1px solid var(--line);
  padding-bottom: var(--s-6);
}

@media (max-width: 720px) {
  .day__head { flex-direction: column; align-items: flex-start; gap: var(--s-2); }
  .day__title { font-size: 24px; }
}
</style>
