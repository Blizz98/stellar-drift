<script setup>
import { ref, computed, watch } from 'vue'
import { useCaptainStore, RANKS } from '@/stores/captain'
import { useExpeditionStore } from '@/stores/expedition'
import { SHIPS } from '@/data/ships'
import { DESTINATIONS } from '@/data/destinations'
import { silhouetteFor } from '@/data/shipSilhouettes'
import RankInsignia from '@/components/RankInsignia.vue'

const captain = useCaptainStore()
const expedition = useExpeditionStore()

// ——— Identity / name editing ———
const editingName = ref(false)
const nameDraft = ref(captain.state.name)
const nameInputRef = ref(null)

function startEditName() {
  nameDraft.value = captain.state.name
  editingName.value = true
}
function commitName() {
  captain.setName(nameDraft.value)
  editingName.value = false
}
function cancelEditName() {
  editingName.value = false
}

// ——— Personal log ———
const logDraft = ref(captain.state.personalLog || '')
const logSavedAt = ref(null)
let logSaveTimer = null

watch(logDraft, (v) => {
  if (logSaveTimer) clearTimeout(logSaveTimer)
  logSaveTimer = setTimeout(() => {
    captain.setPersonalLog(v)
    logSavedAt.value = new Date()
  }, 600)  // debounced autosave
})

const logSavedLabel = computed(() => {
  if (!logSavedAt.value) return null
  const hh = String(logSavedAt.value.getHours()).padStart(2, '0')
  const mm = String(logSavedAt.value.getMinutes()).padStart(2, '0')
  return `Saved ${hh}:${mm}`
})

// ——— Captain stats ———
const totalVoyages = computed(() => {
  const archived = expedition.history.length
  const active = expedition.isActive ? 1 : 0
  return archived + active
})
const completedVoyages = computed(() =>
  expedition.history.filter(e => e.status === 'completed').length
)
const unlockedHulls = computed(() =>
  SHIPS.filter(s => s.rankRequired <= captain.currentRank.rank).length
)
const reachableDests = computed(() =>
  DESTINATIONS.filter(d => d.minRank <= captain.currentRank.rank).length
)

// ——— Rank flavor lines ———
const RANK_FLAVOR = {
  1: 'Newly commissioned. Every voyage begins here.',
  2: 'A junior officer. Trusted with first crossings.',
  3: 'Captain of small vessels. Short distances, real responsibility.',
  4: 'Mid-deep voyages. The Cutter awaits.',
  5: 'A captain in full. Long crossings. Real cargo.',
  6: 'Veteran of the deep. The Long-Hauler is yours.',
  7: 'Fleet command. Your record speaks for you.',
  8: 'Terminal rank. The Pathfinder is yours. There is no further insignia.'
}

function rankFlavor(rank) {
  return RANK_FLAVOR[rank] || ''
}

// ——— Recent grants (commissions log) ———
const recentGrants = computed(() => captain.state.voyageGrants.slice(0, 8))

function formatGrantDate(iso) {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// ——— Ship status helpers ———
function shipUnlocked(ship) {
  return ship.rankRequired <= captain.currentRank.rank
}
</script>

<template>
  <div class="captain">

    <!-- ============================================================
         Identity hero — officer's plate
         ============================================================ -->
    <section class="hero">
      <!-- Centered insignia of current rank -->
      <div class="hero__insignia-frame">
        <div class="hero__insignia-glow" />
        <RankInsignia :rank="captain.currentRank.rank" :size="120" />
      </div>

      <!-- Name + rank -->
      <div class="hero__identity">
        <p class="label hero__rank-kicker">Officer commanding</p>
        <div class="hero__name-row">
          <template v-if="!editingName">
            <h1 class="display hero__name" @click="startEditName">
              {{ captain.state.name }}
              <span class="hero__edit-hint mono">EDIT</span>
            </h1>
          </template>
          <template v-else>
            <input
              ref="nameInputRef"
              v-model="nameDraft"
              class="input hero__name-input"
              @keydown.enter="commitName"
              @keydown.escape="cancelEditName"
              @blur="commitName"
              maxlength="40"
            />
          </template>
        </div>
        <p class="hero__rank-line">
          <span class="display hero__rank-name">{{ captain.currentRank.name }}</span>
          <span class="mono hero__rank-num">RANK {{ String(captain.currentRank.rank).padStart(2, '0') }}</span>
        </p>
        <p class="hero__flavor display">{{ rankFlavor(captain.currentRank.rank) }}</p>
      </div>

      <!-- Service stats -->
      <div class="hero__stats">
        <div class="stat">
          <span class="stat__label label">Voyages</span>
          <span class="stat__value display">{{ totalVoyages }}</span>
          <span class="stat__sub mono">{{ completedVoyages }} COMPLETED</span>
        </div>
        <div class="stat">
          <span class="stat__label label">Total XP</span>
          <span class="stat__value display">{{ captain.state.xp.toLocaleString() }}</span>
          <span class="stat__sub mono">CUMULATIVE</span>
        </div>
        <div class="stat">
          <span class="stat__label label">Hulls</span>
          <span class="stat__value display">{{ unlockedHulls }}<span class="stat__total mono">/{{ SHIPS.length }}</span></span>
          <span class="stat__sub mono">AVAILABLE</span>
        </div>
        <div class="stat">
          <span class="stat__label label">Destinations</span>
          <span class="stat__value display">{{ reachableDests }}<span class="stat__total mono">/{{ DESTINATIONS.length }}</span></span>
          <span class="stat__sub mono">REACHABLE</span>
        </div>
      </div>
    </section>

    <!-- ============================================================
         Rank progression — substantial instrument
         ============================================================ -->
    <section class="progression">
      <header class="section-head">
        <span class="label section-head__kicker">Rank progression</span>
        <h2 class="display section-title">Path to {{ captain.nextRank?.name || 'terminal rank' }}</h2>
      </header>

      <div v-if="!captain.isMaxRank" class="prog-instrument">
        <!-- Current rank insignia (left) -->
        <div class="prog-instrument__current">
          <RankInsignia :rank="captain.currentRank.rank" :size="56" />
          <span class="mono prog-instrument__current-label">{{ captain.currentRank.name }}</span>
        </div>

        <!-- Bar between -->
        <div class="prog-instrument__bar-wrap">
          <div class="prog-instrument__readout mono">
            <span class="prog-instrument__current-xp">{{ captain.xpIntoRank.toLocaleString() }}</span>
            <span class="prog-instrument__sep">/</span>
            <span class="prog-instrument__needed-xp">{{ captain.xpForNextRank.toLocaleString() }}</span>
            <span class="prog-instrument__unit">XP</span>
          </div>
          <div class="prog-instrument__bar">
            <div
              class="prog-instrument__fill"
              :style="{ width: (captain.progressToNext * 100) + '%' }"
            />
            <div class="prog-instrument__ticks">
              <span v-for="i in 9" :key="i" class="prog-instrument__tick" />
            </div>
          </div>
          <p class="prog-instrument__remaining mono">
            {{ (captain.xpForNextRank - captain.xpIntoRank).toLocaleString() }} XP TO ADVANCE
          </p>
        </div>

        <!-- Next rank insignia (right) -->
        <div class="prog-instrument__next">
          <RankInsignia :rank="captain.nextRank.rank" :size="56" />
          <span class="mono prog-instrument__next-label">{{ captain.nextRank.name }}</span>
        </div>
      </div>

      <!-- Max rank state -->
      <div v-else class="prog-terminal">
        <RankInsignia :rank="8" :size="80" />
        <p class="display prog-terminal__title">Terminal rank achieved.</p>
        <p class="prog-terminal__desc">There is no further insignia. The voyages continue.</p>
      </div>
    </section>

    <!-- ============================================================
         Rank ladder — vertical timeline
         ============================================================ -->
    <section class="ladder">
      <header class="section-head">
        <span class="label section-head__kicker">Service record</span>
        <h2 class="display section-title">The ladder</h2>
      </header>

      <ol class="rank-list">
        <li
          v-for="r in RANKS"
          :key="r.rank"
          class="rank-node"
          :class="{
            'rank-node--past':    r.rank < captain.currentRank.rank,
            'rank-node--current': r.rank === captain.currentRank.rank,
            'rank-node--future':  r.rank > captain.currentRank.rank
          }"
        >
          <div class="rank-node__insignia-wrap">
            <RankInsignia :rank="r.rank" :size="44" />
          </div>
          <div class="rank-node__body">
            <div class="rank-node__head">
              <span class="display rank-node__name">{{ r.name }}</span>
              <span class="mono rank-node__num">RANK {{ String(r.rank).padStart(2, '0') }}</span>
            </div>
            <p class="rank-node__flavor">{{ rankFlavor(r.rank) }}</p>
            <p class="mono rank-node__threshold">
              <template v-if="r.rank === 1">STARTING POSITION</template>
              <template v-else>{{ r.minXP.toLocaleString() }} XP THRESHOLD</template>
            </p>
          </div>
          <span v-if="r.rank === captain.currentRank.rank" class="rank-node__tag mono">CURRENT</span>
          <span v-else-if="r.rank < captain.currentRank.rank" class="rank-node__tag rank-node__tag--past mono">ACHIEVED</span>
          <span v-else class="rank-node__tag rank-node__tag--future mono">LOCKED</span>
        </li>
      </ol>
    </section>

    <!-- ============================================================
         Fleet hangar
         ============================================================ -->
    <section class="hangar">
      <header class="section-head">
        <span class="label section-head__kicker">Fleet</span>
        <h2 class="display section-title">Hangar bay</h2>
      </header>

      <div class="hangar__grid">
        <article
          v-for="ship in SHIPS"
          :key="ship.id"
          class="ship"
          :class="{ 'ship--locked': !shipUnlocked(ship) }"
        >
          <header class="ship__head">
            <span class="mono ship__id">{{ ship.id.toUpperCase() }}</span>
            <span class="mono ship__status">{{ shipUnlocked(ship) ? 'AVAILABLE' : 'LOCKED' }}</span>
            <span class="ship__dot" :class="{ 'ship__dot--available': shipUnlocked(ship) }" />
          </header>

          <div class="ship__silhouette">
            <svg viewBox="0 0 100 40" width="100%" height="40" fill="none">
              <path
                :d="silhouetteFor(ship.id).path"
                stroke="currentColor"
                stroke-width="1.4"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                v-if="silhouetteFor(ship.id).accent"
                :d="silhouetteFor(ship.id).accent"
                stroke="currentColor"
                stroke-width="1"
                stroke-linecap="round"
                opacity="0.6"
              />
            </svg>
          </div>

          <div class="ship__body">
            <h4 class="display ship__name">{{ ship.name }}</h4>
            <p class="mono ship__tag">{{ ship.tagline }}</p>
            <p class="ship__desc">{{ ship.description }}</p>
          </div>

          <footer class="ship__foot">
            <div class="ship__spec">
              <span class="label">Velocity</span>
              <span class="mono">{{ ship.velocity }} c</span>
            </div>
            <div class="ship__spec">
              <span class="label">Range</span>
              <span class="mono">{{ ship.maxRangeDays }}d</span>
            </div>
            <div v-if="!shipUnlocked(ship)" class="ship__spec ship__spec--lock">
              <span class="label">Unlock</span>
              <span class="mono">RANK {{ ship.rankRequired }}</span>
            </div>
          </footer>
        </article>
      </div>
    </section>

    <!-- ============================================================
         Personal log
         ============================================================ -->
    <section class="plog">
      <header class="section-head">
        <span class="label section-head__kicker">Captain's reflection</span>
        <h2 class="display section-title">Personal log</h2>
        <p class="section-head__lede">
          A space for your own thoughts. What kind of captain you want to be,
          what you're learning across voyages — anything that belongs to you,
          not to any specific run.
        </p>
      </header>

      <div class="plog__pad">
        <textarea
          v-model="logDraft"
          class="plog__input"
          placeholder="The voyages have been teaching me..."
          rows="8"
        />
        <div class="plog__foot">
          <span v-if="logSavedLabel" class="mono plog__saved">◇ {{ logSavedLabel }}</span>
          <span v-else class="mono plog__hint">Auto-saves as you write</span>
        </div>
      </div>
    </section>

    <!-- ============================================================
         Recent commissions (XP grants log)
         ============================================================ -->
    <section v-if="recentGrants.length > 0" class="commissions">
      <header class="section-head">
        <span class="label section-head__kicker">Commissions</span>
        <h2 class="display section-title">Recent grants</h2>
      </header>

      <ol class="commission-list">
        <li v-for="(g, i) in recentGrants" :key="i" class="commission">
          <span class="commission__date mono">{{ formatGrantDate(g.date) }}</span>
          <span class="commission__rail" />
          <div class="commission__body">
            <p class="commission__voyage">{{ g.voyageName || 'Voyage' }}</p>
            <p class="commission__source mono">
              {{ g.source === 'completion' ? 'COMPLETION' : 'ABANDONMENT' }}
            </p>
          </div>
          <span class="commission__amount mono">+{{ g.amount }} XP</span>
        </li>
      </ol>
    </section>
  </div>
</template>

<style scoped>
.captain {
  display: flex;
  flex-direction: column;
  gap: var(--s-7);
}

/* ——— Section heads ——— */
.section-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: var(--s-4);
}
.section-head__kicker { color: var(--cyan-deep); }
.section-title {
  font-size: 28px;
  margin: 0;
  color: var(--signal);
}
.section-head__lede {
  margin: var(--s-2) 0 0;
  color: var(--signal-dim);
  font-size: 13px;
  line-height: 1.6;
  max-width: 600px;
}

/* ============================================================
   Hero — officer's plate
   ============================================================ */
.hero {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  gap: var(--s-5) var(--s-6);
  padding: var(--s-6);
  background: var(--bulkhead);
  border: 1px solid var(--amber-deep);
  border-radius: var(--radius-lg);
  position: relative;
  overflow: hidden;
}

/* Subtle ambient glow behind the hero */
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(400px 240px at 18% 30%, rgba(232, 168, 70, 0.10), transparent 70%),
    repeating-linear-gradient(0deg, transparent 0, transparent 3px, rgba(232,168,70,0.012) 3px, rgba(232,168,70,0.012) 4px);
  pointer-events: none;
}

.hero__insignia-frame {
  grid-column: 1;
  grid-row: 1 / span 2;
  position: relative;
  width: 160px;
  height: 160px;
  display: grid;
  place-items: center;
  background: var(--hull);
  border: 1px solid var(--amber);
  border-radius: 50%;
  color: var(--amber);
  z-index: 1;
}
.hero__insignia-glow {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(232,168,70,0.2), transparent 70%);
  animation: hero-glow 4s ease-in-out infinite;
}
@keyframes hero-glow {
  0%, 100% { opacity: 0.6; }
  50%      { opacity: 1; }
}

.hero__identity {
  grid-column: 2;
  grid-row: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
  z-index: 1;
  min-width: 0;
}
.hero__rank-kicker { color: var(--amber-deep); }

.hero__name-row { display: flex; align-items: baseline; gap: var(--s-3); }
.hero__name {
  font-size: 48px;
  margin: 0;
  color: var(--signal);
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: baseline;
  gap: var(--s-3);
  transition: color var(--t-fast) var(--ease);
}
.hero__name:hover { color: var(--amber); }

.hero__edit-hint {
  font-size: 9px;
  color: var(--signal-low);
  letter-spacing: 0.18em;
  opacity: 0;
  transition: opacity var(--t-fast) var(--ease);
}
.hero__name:hover .hero__edit-hint { opacity: 0.8; }

.hero__name-input {
  font-family: var(--font-display);
  font-size: 48px;
  background: transparent;
  border: 0;
  border-bottom: 2px solid var(--amber);
  color: var(--signal);
  padding: 0 0 4px;
  width: 100%;
  max-width: 400px;
}
.hero__name-input:focus { outline: 0; }

.hero__rank-line {
  display: flex;
  align-items: baseline;
  gap: var(--s-3);
  margin: var(--s-2) 0 0;
}
.hero__rank-name {
  font-size: 22px;
  color: var(--amber);
}
.hero__rank-num {
  font-size: 10px;
  color: var(--amber-deep);
  letter-spacing: 0.16em;
}

.hero__flavor {
  font-style: italic;
  color: var(--cyan);
  font-size: 14px;
  margin: 6px 0 0;
}

.hero__stats {
  grid-column: 2;
  grid-row: 2;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--s-3);
  position: relative;
  z-index: 1;
  margin-top: var(--s-3);
  padding-top: var(--s-4);
  border-top: 1px dashed var(--line);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.stat__label { color: var(--amber-deep); }
.stat__value {
  font-size: 28px;
  color: var(--signal);
  line-height: 1.1;
}
.stat__total {
  font-size: 13px;
  color: var(--signal-low);
}
.stat__sub {
  font-size: 8px;
  color: var(--signal-low);
  letter-spacing: 0.14em;
  margin-top: 2px;
}

/* ============================================================
   Progression instrument
   ============================================================ */
.progression {
  padding: var(--s-5);
  background: var(--hull);
  border: 1px solid var(--line);
  border-left: 2px solid var(--amber);
  border-radius: var(--radius);
}

.prog-instrument {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--s-5);
}
.prog-instrument__current,
.prog-instrument__next {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s-2);
  color: var(--amber);
}
.prog-instrument__next { color: var(--amber-deep); opacity: 0.6; }

.prog-instrument__current-label,
.prog-instrument__next-label {
  font-size: 9px;
  letter-spacing: 0.14em;
  white-space: nowrap;
}

.prog-instrument__bar-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--s-2);
}
.prog-instrument__readout {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--signal-dim);
}
.prog-instrument__current-xp { color: var(--amber); font-size: 16px; }
.prog-instrument__sep { color: var(--signal-low); }
.prog-instrument__needed-xp { color: var(--signal-dim); }
.prog-instrument__unit {
  color: var(--signal-low);
  font-size: 9px;
  margin-left: 2px;
  letter-spacing: 0.14em;
}

.prog-instrument__bar {
  position: relative;
  height: 16px;
  background: var(--bulkhead);
  border: 1px solid var(--line);
  border-radius: 2px;
  overflow: hidden;
}
.prog-instrument__fill {
  position: absolute;
  inset: 0 auto 0 0;
  background: linear-gradient(90deg, var(--amber-deep), var(--amber));
  transition: width var(--t-slow) var(--ease);
  box-shadow: 0 0 8px var(--amber);
}
.prog-instrument__ticks {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  padding: 0 4px;
}
.prog-instrument__tick {
  width: 1px;
  background: rgba(255, 255, 255, 0.08);
}

.prog-instrument__remaining {
  font-size: 9px;
  letter-spacing: 0.14em;
  color: var(--signal-low);
  text-align: center;
}

.prog-terminal {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--s-3);
  padding: var(--s-5);
  color: var(--amber);
}
.prog-terminal__title {
  font-size: 24px;
  color: var(--amber);
  margin: 0;
}
.prog-terminal__desc {
  margin: 0;
  color: var(--signal-dim);
  font-size: 13px;
  text-align: center;
}

/* ============================================================
   Rank ladder
   ============================================================ */
.rank-list {
  list-style: none;
  margin: 0;
  padding: 0;
  position: relative;
}

/* Vertical spine running through all rank nodes */
.rank-list::before {
  content: '';
  position: absolute;
  left: 32px;
  top: 24px;
  bottom: 24px;
  width: 1px;
  background: linear-gradient(180deg, var(--amber-deep), var(--line) 50%, var(--line));
}

.rank-node {
  display: grid;
  grid-template-columns: 64px 1fr auto;
  gap: var(--s-4);
  align-items: center;
  padding: var(--s-3) var(--s-4);
  margin-bottom: var(--s-2);
  background: var(--hull);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  position: relative;
  z-index: 1;
}

.rank-node--current {
  border-color: var(--amber);
  background: var(--bulkhead);
  box-shadow: var(--glow-amber);
}
.rank-node--past {
  border-color: var(--amber-deep);
  opacity: 0.85;
}
.rank-node--future {
  opacity: 0.55;
}

.rank-node__insignia-wrap {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  background: var(--bulkhead);
  border: 1px solid var(--line);
  border-radius: 50%;
  color: var(--signal-low);
}
.rank-node--past    .rank-node__insignia-wrap { color: var(--amber-deep); border-color: var(--amber-deep); }
.rank-node--current .rank-node__insignia-wrap {
  color: var(--amber);
  border-color: var(--amber);
  box-shadow: 0 0 12px -2px var(--amber);
}

.rank-node__body { min-width: 0; }
.rank-node__head {
  display: flex;
  align-items: baseline;
  gap: var(--s-3);
}
.rank-node__name { font-size: 18px; color: var(--signal); }
.rank-node--current .rank-node__name { color: var(--amber); }
.rank-node--future  .rank-node__name { color: var(--signal-dim); }

.rank-node__num {
  font-size: 9px;
  color: var(--signal-low);
  letter-spacing: 0.14em;
}
.rank-node__flavor {
  font-size: 12px;
  color: var(--signal-dim);
  margin: 4px 0 0;
  line-height: 1.5;
  font-style: italic;
}
.rank-node__threshold {
  font-size: 9px;
  color: var(--signal-low);
  letter-spacing: 0.14em;
  margin: 4px 0 0;
}

.rank-node__tag {
  font-size: 9px;
  letter-spacing: 0.14em;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid var(--line);
  color: var(--signal-low);
  white-space: nowrap;
}
.rank-node--current .rank-node__tag {
  border-color: var(--amber);
  color: var(--amber);
  background: var(--bulkhead);
}
.rank-node__tag--past {
  border-color: var(--amber-deep);
  color: var(--amber-deep);
}
.rank-node__tag--future {
  color: var(--signal-low);
}

/* ============================================================
   Hangar bay
   ============================================================ */
.hangar__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--s-4);
}

.ship {
  display: flex;
  flex-direction: column;
  background: var(--hull);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  overflow: hidden;
  transition: all var(--t-fast) var(--ease);
}
.ship--locked {
  opacity: 0.55;
}
.ship:not(.ship--locked):hover {
  border-color: var(--amber-deep);
}

.ship__head {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px var(--s-3);
  background: var(--bulkhead);
  border-bottom: 1px dashed var(--line);
  font-size: 9px;
  letter-spacing: 0.14em;
}
.ship__id { color: var(--cyan-deep); }
.ship__status { color: var(--signal-low); flex: 1; }
.ship--locked .ship__status { color: var(--signal-low); }
.ship:not(.ship--locked) .ship__status { color: var(--verdant); }

.ship__dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--line-hi);
}
.ship__dot--available {
  background: var(--verdant);
  box-shadow: 0 0 6px var(--verdant);
}

.ship__silhouette {
  padding: var(--s-4) var(--s-4) var(--s-2);
  color: var(--amber);
  display: grid;
  place-items: center;
}
.ship--locked .ship__silhouette {
  color: var(--signal-low);
}

.ship__body {
  padding: 0 var(--s-4) var(--s-3);
  flex: 1;
}
.ship__name {
  font-size: 20px;
  margin: 0 0 4px;
  color: var(--signal);
}
.ship__tag {
  font-size: 9px;
  color: var(--signal-low);
  letter-spacing: 0.14em;
  margin: 0 0 var(--s-3);
}
.ship__desc {
  font-size: 12px;
  color: var(--signal-dim);
  line-height: 1.55;
  margin: 0;
}

.ship__foot {
  display: flex;
  gap: var(--s-3);
  padding: var(--s-3) var(--s-4);
  background: var(--bulkhead);
  border-top: 1px dashed var(--line);
}
.ship__spec {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ship__spec .label { font-size: 8px; }
.ship__spec .mono  { font-size: 11px; color: var(--amber); }
.ship__spec--lock .mono { color: var(--cyan); }

/* ============================================================
   Personal log
   ============================================================ */
.plog__pad {
  padding: var(--s-5);
  background: var(--hull);
  border: 1px solid var(--line);
  border-left: 2px solid var(--cyan-deep);
  border-radius: var(--radius);
}

.plog__input {
  width: 100%;
  background: var(--bulkhead);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: var(--s-4);
  color: var(--signal);
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.7;
  resize: vertical;
  min-height: 180px;
  transition: border-color var(--t-fast) var(--ease);
}
.plog__input:focus {
  outline: 0;
  border-color: var(--cyan-deep);
}
.plog__input::placeholder {
  color: var(--signal-low);
  font-style: italic;
}

.plog__foot {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--s-2);
  font-size: 9px;
  letter-spacing: 0.14em;
}
.plog__saved { color: var(--verdant); }
.plog__hint  { color: var(--signal-low); }

/* ============================================================
   Commissions log
   ============================================================ */
.commission-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  position: relative;
}

.commission {
  display: grid;
  grid-template-columns: 60px 12px 1fr auto;
  gap: var(--s-3);
  align-items: center;
  padding: var(--s-3) var(--s-4);
  background: var(--hull);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  margin-bottom: var(--s-2);
}

.commission__date {
  font-size: 10px;
  color: var(--signal-low);
  letter-spacing: 0.1em;
}
.commission__rail {
  width: 1px;
  height: 100%;
  background: var(--amber-deep);
  justify-self: center;
}
.commission__voyage {
  margin: 0;
  font-size: 13px;
  color: var(--signal);
}
.commission__source {
  margin: 2px 0 0;
  font-size: 9px;
  color: var(--signal-low);
  letter-spacing: 0.14em;
}
.commission__amount {
  font-size: 13px;
  color: var(--amber);
  letter-spacing: 0.06em;
}

@media (max-width: 720px) {
  .hero {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .hero__insignia-frame {
    grid-column: 1; grid-row: 1;
    margin: 0 auto;
    width: 120px; height: 120px;
  }
  .hero__identity { grid-column: 1; grid-row: 2; align-items: center; }
  .hero__name-row { justify-content: center; }
  .hero__name { font-size: 36px; }
  .hero__name-input { font-size: 36px; text-align: center; }
  .hero__rank-line { justify-content: center; }
  .hero__stats {
    grid-column: 1; grid-row: 3;
    grid-template-columns: repeat(2, 1fr);
  }
  .stat__value { font-size: 22px; }

  .prog-instrument {
    grid-template-columns: 1fr;
    gap: var(--s-4);
    text-align: center;
  }

  .rank-list::before { left: 24px; }
  .rank-node {
    grid-template-columns: 48px 1fr;
    gap: var(--s-3);
  }
  .rank-node__insignia-wrap { width: 44px; height: 44px; }
  .rank-node__tag {
    grid-column: 1 / -1;
    justify-self: start;
    margin-top: var(--s-2);
  }

  .commission { grid-template-columns: 50px 8px 1fr auto; }
}
</style>