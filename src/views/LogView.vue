<script setup>
import { computed } from 'vue'
import { useExpeditionStore } from '@/stores/expedition'
import EmptyState from '@/components/EmptyState.vue'

const expedition = useExpeditionStore()

const sortedHistory = computed(() => [...expedition.history])

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

function durationLabel(exp) {
  if (!exp.endedAt) return `${exp.durationDays}d planned`
  const ms = new Date(exp.endedAt) - new Date(exp.startedAt)
  const days = Math.max(1, Math.round(ms / 86_400_000) + 1)
  return `${days}d actual / ${exp.durationDays}d planned`
}
</script>

<template>
  <div class="log">
    <header class="log__head">
      <p class="label">Archive</p>
      <h1 class="display log__title">Captain's Log</h1>
      <p class="log__lede">
        Every voyage you've launched, completed, or abandoned. Some make it to the destination.
        Most don't. That's the genre.
      </p>
    </header>

    <section class="meta">
      <div class="meta__cell">
        <span class="meta__num display">{{ expedition.meta.totalRuns }}</span>
        <span class="meta__label label">Voyages launched</span>
      </div>
      <div class="meta__cell">
        <span class="meta__num display">{{ expedition.meta.completedRuns }}</span>
        <span class="meta__label label">Voyages completed</span>
      </div>
      <div class="meta__cell">
        <span class="meta__num display">
          {{ expedition.meta.totalRuns
              ? Math.round((expedition.meta.completedRuns / expedition.meta.totalRuns) * 100)
              : 0 }}%
        </span>
        <span class="meta__label label">Completion rate</span>
      </div>
      <div class="meta__cell">
        <span class="meta__num display">{{ expedition.meta.unlocks.length }}</span>
        <span class="meta__label label">Ships unlocked</span>
      </div>
    </section>

    <section class="archive">
      <header class="archive__head">
        <h2 class="archive__title">Past voyages</h2>
      </header>

      <EmptyState
        v-if="sortedHistory.length === 0"
        title="No voyages logged yet"
        body="Past voyages, complete or abandoned, will be archived here."
      />

      <ol v-else class="entries">
        <li v-for="exp in sortedHistory" :key="exp.id" class="entry">
          <div class="entry__rail">
            <span
              class="entry__dot"
              :class="{
                'entry__dot--complete': exp.status === 'completed',
                'entry__dot--abandoned': exp.status === 'abandoned'
              }"
            />
          </div>

          <article class="entry__body">
            <header class="entry__head">
              <h3 class="entry__name display">{{ exp.name }}</h3>
              <span
                class="entry__badge mono"
                :class="exp.status === 'completed' ? 'entry__badge--ok' : 'entry__badge--warn'"
              >
                {{ exp.status }}
              </span>
            </header>

            <dl class="entry__data">
              <div><dt class="label">Destination</dt><dd>{{ exp.destination }}</dd></div>
              <div><dt class="label">Ship class</dt><dd>{{ exp.shipClass }}</dd></div>
              <div><dt class="label">Departed</dt><dd class="mono">{{ formatDate(exp.startedAt) }}</dd></div>
              <div><dt class="label">Concluded</dt><dd class="mono">{{ formatDate(exp.endedAt) }}</dd></div>
              <div><dt class="label">Duration</dt><dd class="mono">{{ durationLabel(exp) }}</dd></div>
            </dl>
          </article>
        </li>
      </ol>
    </section>
  </div>
</template>

<style scoped>
.log { display: flex; flex-direction: column; gap: var(--s-6); }

.log__head { padding-bottom: var(--s-4); border-bottom: 1px solid var(--line); }
.log__title { font-size: 48px; margin: 4px 0 var(--s-3); color: var(--signal); }
.log__lede { color: var(--signal-dim); max-width: 640px; line-height: 1.6; margin: 0; }

.meta {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--s-3);
}
.meta__cell {
  padding: var(--s-4);
  background: var(--bulkhead);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
}
.meta__num { font-size: 36px; line-height: 1; color: var(--amber); }
.meta__label { color: var(--signal-low); font-size: 9px; }

.archive__head { margin-bottom: var(--s-4); padding-bottom: var(--s-3); border-bottom: 1px solid var(--line); }
.archive__title {
  font-size: 16px;
  font-weight: 500;
  color: var(--signal);
  margin: 0;
  letter-spacing: 0.02em;
}

.entries {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
}

.entry {
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: var(--s-3);
}

.entry__rail {
  display: flex;
  justify-content: center;
  padding-top: var(--s-4);
  border-right: 1px dashed var(--line);
}
.entry__dot {
  width: 10px; height: 10px;
  border-radius: 50%;
  background: var(--line-hi);
  margin-right: -5px;
}
.entry__dot--complete { background: var(--verdant); box-shadow: 0 0 8px var(--verdant); }
.entry__dot--abandoned { background: var(--thrust); }

.entry__body {
  padding: var(--s-4);
  background: var(--hull);
  border: 1px solid var(--line);
  border-radius: var(--radius);
}

.entry__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--s-3);
  margin-bottom: var(--s-3);
}
.entry__name { font-size: 22px; margin: 0; color: var(--signal); }
.entry__badge {
  font-size: 9px;
  padding: 4px 10px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  border: 1px solid currentColor;
}
.entry__badge--ok   { color: var(--verdant); }
.entry__badge--warn { color: var(--thrust); }

.entry__data {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--s-3);
  margin: 0;
}
.entry__data > div { display: flex; flex-direction: column; gap: 2px; }
.entry__data dt { font-size: 9px; color: var(--signal-low); }
.entry__data dd { margin: 0; font-size: 13px; color: var(--signal); }

@media (max-width: 720px) {
  .meta { grid-template-columns: repeat(2, 1fr); }
  .log__title { font-size: 32px; }
}
</style>
