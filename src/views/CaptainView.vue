<script setup>
import { computed, ref } from 'vue'
import { useCaptainStore, RANKS } from '@/stores/captain'
import { SHIPS } from '@/data/ships'
import { DESTINATIONS } from '@/data/destinations'

const captain = useCaptainStore()

const editingName = ref(false)
const draftName = ref('')

function startEdit() {
  draftName.value = captain.state.name
  editingName.value = true
}
function commitEdit() {
  captain.setName(draftName.value)
  editingName.value = false
}

const xpPctLabel = computed(() =>
  captain.isMaxRank
    ? 'Terminal rank'
    : `${captain.xpIntoRank.toLocaleString()} / ${captain.xpForNextRank.toLocaleString()} XP`
)

const ranksList = computed(() =>
  RANKS.map(r => ({
    ...r,
    achieved: captain.currentRank.rank >= r.rank,
    isCurrent: captain.currentRank.rank === r.rank
  }))
)

const fleetList = computed(() =>
  SHIPS.map(s => ({
    ...s,
    unlocked: s.rankRequired <= captain.currentRank.rank
  }))
)

const charterCounts = computed(() => {
  const reachable = DESTINATIONS.filter(d => d.minRank <= captain.currentRank.rank).length
  return { reachable, total: DESTINATIONS.length }
})

const recentGrants = computed(() => captain.state.voyageGrants.slice(0, 12))
</script>

<template>
  <div class="captain">
    <!-- Header: identity + rank -->
    <header class="hero">
      <div class="hero__left">
        <p class="label">Captain's commission</p>
        <div class="hero__name">
          <template v-if="!editingName">
            <h1 class="display hero__name-display">{{ captain.state.name }}</h1>
            <button class="hero__edit mono" @click="startEdit">edit</button>
          </template>
          <template v-else>
            <input
              v-model="draftName"
              class="input hero__name-input"
              @keydown.enter="commitEdit"
              @blur="commitEdit"
              maxlength="40"
              autofocus
            />
          </template>
        </div>
        <p class="hero__rank mono">{{ captain.currentRank.name.toUpperCase() }} · RANK {{ captain.currentRank.rank }} OF {{ captain.MAX_RANK }}</p>
      </div>

      <div class="hero__right">
        <div class="xp">
          <div class="xp__bar">
            <div class="xp__fill" :style="{ width: (captain.progressToNext * 100) + '%' }" />
          </div>
          <div class="xp__legend mono">
            <span>{{ xpPctLabel }}</span>
            <span v-if="captain.nextRank" class="xp__next">
              NEXT · {{ captain.nextRank.name.toUpperCase() }}
            </span>
            <span v-else class="xp__next">— FLEET SUMMIT —</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Stats summary -->
    <section class="stats">
      <div class="stat">
        <span class="stat__num display">{{ captain.state.xp.toLocaleString() }}</span>
        <span class="stat__label label">Total XP</span>
      </div>
      <div class="stat">
        <span class="stat__num display">{{ fleetList.filter(s => s.unlocked).length }} / {{ fleetList.length }}</span>
        <span class="stat__label label">Hulls available</span>
      </div>
      <div class="stat">
        <span class="stat__num display">{{ charterCounts.reachable }} / {{ charterCounts.total }}</span>
        <span class="stat__label label">Destinations charted</span>
      </div>
    </section>

    <!-- Rank ladder -->
    <section class="block">
      <header class="block__head">
        <h2 class="block__title">Rank ladder</h2>
        <p class="block__lede">
          Each promotion comes from completing voyages. Abandoning thoughtfully grants smaller XP — that is also captain skill.
        </p>
      </header>

      <ol class="ladder">
        <li
          v-for="r in ranksList"
          :key="r.rank"
          class="rung"
          :class="{ 'rung--achieved': r.achieved, 'rung--current': r.isCurrent }"
        >
          <span class="rung__pip" />
          <span class="rung__num mono">R{{ r.rank }}</span>
          <span class="rung__name">{{ r.name }}</span>
          <span class="rung__xp mono">{{ r.minXP.toLocaleString() }} XP</span>
        </li>
      </ol>
    </section>

    <!-- Fleet roster -->
    <section class="block">
      <header class="block__head">
        <h2 class="block__title">Fleet roster</h2>
        <p class="block__lede">Hulls available to your rank, and those still ahead.</p>
      </header>

      <div class="fleet">
        <article
          v-for="s in fleetList"
          :key="s.id"
          class="hull"
          :class="{ 'hull--locked': !s.unlocked }"
        >
          <header class="hull__head">
            <h3 class="hull__name">{{ s.name }}</h3>
            <span v-if="!s.unlocked" class="hull__lock label">RANK {{ s.rankRequired }}</span>
            <span v-else class="hull__online label">ONLINE</span>
          </header>
          <p class="hull__tag">{{ s.tagline }}</p>
          <p class="hull__desc">{{ s.description }}</p>
          <dl class="hull__stats mono">
            <div><dt>RANGE</dt><dd>{{ s.maxRangeDays }}d</dd></div>
            <div><dt>VEL</dt><dd>{{ s.velocity.toFixed(1) }}c</dd></div>
            <div v-if="s.bonus"><dt>BIAS</dt><dd>{{ s.bonus.toUpperCase() }}</dd></div>
          </dl>
        </article>
      </div>
    </section>

    <!-- XP grant history -->
    <section class="block" v-if="recentGrants.length > 0">
      <header class="block__head">
        <h2 class="block__title">Recent commissions</h2>
        <p class="block__lede">XP grants from your last voyages.</p>
      </header>

      <ul class="grants">
        <li v-for="(g, i) in recentGrants" :key="i" class="grant">
          <span class="grant__date mono">{{ g.date }}</span>
          <span class="grant__name">{{ g.voyageName || '—' }}</span>
          <span class="grant__source mono">{{ g.source }}</span>
          <span class="grant__amount mono">+{{ g.amount }} XP</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.captain { display: flex; flex-direction: column; gap: var(--s-7); }

/* — Hero — */
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--s-6);
  align-items: end;
  padding-bottom: var(--s-5);
  border-bottom: 1px solid var(--line);
}

.hero__name {
  display: flex;
  align-items: baseline;
  gap: var(--s-3);
  margin: 4px 0;
}
.hero__name-display { font-size: 56px; margin: 0; color: var(--signal); line-height: 1; }
.hero__edit {
  font-size: 9px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--signal-low);
  padding: 4px 8px;
  border-radius: 4px;
  transition: all var(--t-fast) var(--ease);
}
.hero__edit:hover { color: var(--amber); background: var(--hull); }

.hero__name-input {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 36px;
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--amber);
  padding: 4px 0;
  border-radius: 0;
  color: var(--signal);
  width: 100%;
}

.hero__rank {
  color: var(--amber);
  font-size: 12px;
  letter-spacing: 0.18em;
  margin-top: var(--s-2);
}

/* — XP bar (right side of hero) — */
.xp { display: flex; flex-direction: column; gap: var(--s-2); }
.xp__bar {
  position: relative;
  height: 6px;
  background: var(--hull);
  border: 1px solid var(--line);
  border-radius: 999px;
  overflow: hidden;
}
.xp__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--amber-deep), var(--amber));
  box-shadow: 0 0 14px var(--amber);
  transition: width var(--t-slow) var(--ease);
}
.xp__legend {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--signal-dim);
}
.xp__next { color: var(--cyan); }

/* — Stats — */
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--s-3);
}
.stat {
  padding: var(--s-4);
  background: var(--bulkhead);
  border: 1px solid var(--line);
  border-radius: var(--radius);
}
.stat__num { font-size: 32px; line-height: 1; color: var(--amber); display: block; margin-bottom: var(--s-2); }
.stat__label { color: var(--signal-low); font-size: 9px; }

/* — Block sections — */
.block { display: flex; flex-direction: column; gap: var(--s-4); }
.block__head { padding-bottom: var(--s-3); border-bottom: 1px solid var(--line); }
.block__title {
  font-size: 16px;
  margin: 0 0 var(--s-2);
  color: var(--signal);
  font-weight: 500;
}
.block__lede { color: var(--signal-dim); font-size: 13px; margin: 0; max-width: 580px; line-height: 1.6; }

/* — Rank ladder — */
.ladder {
  list-style: none;
  margin: 0; padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--s-1);
}
.rung {
  display: grid;
  grid-template-columns: 16px 40px 1fr auto;
  gap: var(--s-3);
  align-items: center;
  padding: var(--s-3) var(--s-4);
  background: var(--hull);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  transition: all var(--t-fast) var(--ease);
}
.rung__pip {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--line-hi);
}
.rung__num { font-size: 10px; color: var(--signal-low); }
.rung__name { font-size: 14px; color: var(--signal-dim); }
.rung__xp { font-size: 10px; color: var(--signal-low); letter-spacing: 0.08em; }

.rung--achieved { border-color: var(--line-hi); background: var(--bulkhead); }
.rung--achieved .rung__pip { background: var(--amber-deep); }
.rung--achieved .rung__name { color: var(--signal); }

.rung--current {
  border-color: var(--amber);
  background: var(--console);
}
.rung--current .rung__pip { background: var(--amber); box-shadow: 0 0 8px var(--amber); }
.rung--current .rung__num,
.rung--current .rung__name { color: var(--amber); }

/* — Fleet roster — */
.fleet {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--s-3);
}
.hull {
  padding: var(--s-4);
  background: var(--bulkhead);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  display: flex;
  flex-direction: column;
  gap: var(--s-3);
}
.hull--locked { opacity: 0.55; background: var(--hull); }

.hull__head { display: flex; justify-content: space-between; align-items: center; }
.hull__name { font-size: 16px; margin: 0; color: var(--signal); font-weight: 500; }
.hull__lock { color: var(--amber-deep); font-size: 9px; }
.hull__online { color: var(--verdant); font-size: 9px; }

.hull__tag { font-size: 12px; color: var(--cyan-deep); margin: 0; font-style: italic; }
.hull__desc { font-size: 12px; color: var(--signal-dim); margin: 0; line-height: 1.6; }

.hull__stats {
  display: flex;
  gap: var(--s-3);
  margin: 0;
  padding-top: var(--s-2);
  border-top: 1px dashed var(--line);
  font-size: 10px;
}
.hull__stats > div { display: flex; flex-direction: column; gap: 2px; }
.hull__stats dt { color: var(--signal-low); }
.hull__stats dd { color: var(--signal); margin: 0; }

/* — Grants — */
.grants {
  list-style: none;
  margin: 0; padding: 0;
  display: flex;
  flex-direction: column;
}
.grant {
  display: grid;
  grid-template-columns: 110px 1fr auto auto;
  gap: var(--s-3);
  padding: var(--s-3) var(--s-4);
  border-bottom: 1px dashed var(--line);
  align-items: center;
  font-size: 13px;
}
.grant:last-child { border-bottom: 0; }
.grant__date { color: var(--signal-low); font-size: 10px; }
.grant__name { color: var(--signal); }
.grant__source {
  color: var(--cyan-deep);
  font-size: 9px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.grant__amount { color: var(--amber); font-size: 13px; }

@media (max-width: 720px) {
  .hero { grid-template-columns: 1fr; align-items: start; }
  .hero__name-display { font-size: 38px; }
  .stats { grid-template-columns: 1fr; }
  .grant { grid-template-columns: 1fr auto; gap: 4px; }
  .grant__date { grid-column: 1; }
  .grant__source { grid-column: 1; }
  .grant__amount { grid-column: 2; grid-row: 1; }
  .grant__name { grid-column: 1 / -1; grid-row: 2; }
}
</style>
