<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useHabitsStore, CATEGORIES } from '@/stores/habits'

const router = useRouter()
const habits = useHabitsStore()

const status = computed(() =>
  Object.entries(CATEGORIES).map(([key, cat]) => {
    const count = habits.activeHabits.filter(h => h.category === key).length
    return { key, ...cat, count, configured: count > 0 }
  })
)

const allConfigured = computed(() => status.value.every(s => s.configured))
const missingCount  = computed(() => status.value.filter(s => !s.configured).length)
const isFresh       = computed(() => habits.activeHabits.length === 0)
</script>

<template>
  <section v-if="!allConfigured" class="preflight">
    <header class="preflight__head">
      <span class="preflight__pulse" aria-hidden="true" />
      <div class="preflight__intro">
        <p class="label preflight__kicker">Pre-flight checklist</p>
        <h2 class="display preflight__title">
          {{ isFresh
              ? 'No systems online. Voyage cannot stabilize.'
              : `${missingCount} ${missingCount === 1 ? 'system' : 'systems'} pending configuration.` }}
        </h2>
        <p class="preflight__lede">
          A balanced voyage requires at least one habit in each of the four ship systems.
          Empty categories drift; configured ones hold the line.
        </p>
      </div>
    </header>

    <div class="preflight__grid">
      <article
        v-for="s in status"
        :key="s.key"
        class="cell"
        :class="{ 'cell--configured': s.configured, 'cell--pending': !s.configured }"
        :style="{ '--cat-color': s.color }"
      >
        <header class="cell__head">
          <span class="cell__icon">{{ s.icon }}</span>
          <span class="cell__check" :aria-label="s.configured ? 'configured' : 'pending'">
            <svg v-if="s.configured" viewBox="0 0 24 24" width="14" height="14" fill="none">
              <path d="M5 12.5l4.5 4.5L19 7.5"
                    stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span v-else class="cell__pending-mark">◇</span>
          </span>
        </header>

        <div class="cell__body">
          <h3 class="cell__name">{{ s.label }}</h3>
          <p class="cell__sub">{{ s.sublabel }}</p>
        </div>

        <footer class="cell__foot mono">
          <template v-if="s.configured">
            ✓ {{ s.count }} {{ s.count === 1 ? 'system' : 'systems' }} online
          </template>
          <template v-else>
            ◇ Not configured
          </template>
        </footer>
      </article>
    </div>

    <div class="preflight__cta">
      <button class="btn btn-primary" @click="router.push('/habits')">
        Configure systems →
      </button>
      <p class="preflight__hint mono">
        Aim for 1–2 systems per category. Eight is plenty for any voyage.
      </p>
    </div>
  </section>
</template>

<style scoped>
.preflight {
  padding: var(--s-5) var(--s-6) var(--s-6);
  background:
    radial-gradient(800px 200px at 80% 0%, rgba(232, 168, 70, 0.08), transparent 60%),
    var(--bulkhead);
  border: 1px solid var(--amber-deep);
  border-radius: var(--radius-lg);
  position: relative;
  overflow: hidden;
}
.preflight::before {
  /* warning corner mark */
  content: '';
  position: absolute;
  top: 12px; right: 12px;
  width: 28px; height: 28px;
  border-top: 1px solid var(--amber);
  border-right: 1px solid var(--amber);
  opacity: 0.7;
}

.preflight__head {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--s-4);
  align-items: start;
  margin-bottom: var(--s-5);
}

.preflight__pulse {
  margin-top: 12px;
  width: 10px; height: 10px;
  border-radius: 50%;
  background: var(--amber);
  box-shadow: 0 0 0 0 rgba(232, 168, 70, 0.6);
  animation: warn-pulse 2.2s ease-out infinite;
}
@keyframes warn-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(232, 168, 70, 0.55); }
  80%, 100% { box-shadow: 0 0 0 14px rgba(232, 168, 70, 0); }
}

.preflight__kicker { color: var(--amber-deep); }
.preflight__title {
  font-size: 28px;
  margin: 6px 0 var(--s-3);
  color: var(--signal);
  line-height: 1.15;
}
.preflight__lede {
  color: var(--signal-dim);
  margin: 0;
  line-height: 1.6;
  font-size: 14px;
  max-width: 600px;
}

.preflight__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--s-3);
  margin-bottom: var(--s-5);
}

.cell {
  position: relative;
  padding: var(--s-4);
  background: var(--hull);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
  min-height: 130px;
  transition: all var(--t-fast) var(--ease);
  overflow: hidden;
}
.cell::after {
  /* category color stripe along the top */
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: var(--cat-color);
  opacity: 0.6;
}
.cell--configured { border-color: var(--line-hi); }
.cell--configured::after { opacity: 1; }
.cell--pending {
  border-color: var(--line);
  background: linear-gradient(180deg, var(--hull) 0%, rgba(232, 168, 70, 0.04) 100%);
}
.cell--pending::after { opacity: 0.3; }

.cell__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.cell__icon {
  font-size: 18px;
  width: 28px; height: 28px;
  display: grid;
  place-items: center;
  color: var(--cat-color);
  background: var(--bulkhead);
  border-radius: var(--radius-sm);
}
.cell__check {
  width: 20px; height: 20px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  border: 1.5px solid var(--line-hi);
  color: var(--cat-color);
}
.cell--configured .cell__check {
  background: var(--cat-color);
  border-color: var(--cat-color);
  color: var(--void);
}
.cell__pending-mark { font-size: 10px; color: var(--signal-low); }

.cell__name {
  font-size: 14px;
  font-weight: 500;
  margin: 0;
  color: var(--signal);
}
.cell__sub {
  font-size: 11px;
  color: var(--signal-low);
  margin: 2px 0 0;
}

.cell__foot {
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--signal-low);
  margin-top: auto;
  padding-top: var(--s-2);
  border-top: 1px dashed var(--line);
}
.cell--configured .cell__foot { color: var(--cat-color); }

.preflight__cta {
  display: flex;
  align-items: center;
  gap: var(--s-4);
  padding-top: var(--s-4);
  border-top: 1px solid var(--line);
}
.preflight__hint { color: var(--signal-low); font-size: 11px; }

@media (max-width: 720px) {
  .preflight { padding: var(--s-4); }
  .preflight__title { font-size: 22px; }
  .preflight__grid { grid-template-columns: repeat(2, 1fr); }
  .preflight__cta { flex-direction: column; align-items: flex-start; }
  .cell { min-height: 110px; }
}
</style>
