<script setup>
import { computed, watch, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter, RouterLink, RouterView } from 'vue-router'
import { useExpeditionStore } from '@/stores/expedition'
import { useHabitsStore } from '@/stores/habits'
import { useCaptainStore, xpForCompletion } from '@/stores/captain'
import { todayISO } from '@/utils/date'
import Chronometer from '@/components/Chronometer.vue'
import LevelUpModal from '@/components/LevelUpModal.vue'
import GuidedFirstLaunch from '@/components/GuidedFirstLaunch.vue'
import DebriefModal from '@/components/DebriefModal.vue'
import WelcomeModal from '@/components/WelcomeModal.vue'

const route = useRoute()
const router = useRouter()
const expedition = useExpeditionStore()
const habits = useHabitsStore()
const captain = useCaptainStore()

const navLinks = computed(() => {
  if (expedition.isActive) {
    return [
      { to: '/',           label: 'Bridge',  code: 'BRG' },
      { to: '/expedition', label: 'Voyage',  code: 'VYG' },
      { to: '/habits',     label: 'Systems', code: 'SYS' },
      { to: '/captain',    label: 'Captain', code: 'CPT' },
      { to: '/log',        label: 'Log',     code: 'LOG' }
    ]
  }
  return [
    { to: '/launch',  label: 'Launch',  code: 'LCH' },
    { to: '/captain', label: 'Captain', code: 'CPT' },
    { to: '/log',     label: 'Log',     code: 'LOG' }
  ]
})

// ——— Sector boundary readout for status zone ———
const nextBoundary = computed(() => {
  if (!expedition.isActive) return null
  const cur = expedition.current
  const dayIdx = expedition.daysElapsed - 1
  const sectorSize = cur.durationDays / 4
  for (let s = 0; s < 4; s++) {
    const toIdx = Math.floor((s + 1) * sectorSize)
    if (dayIdx < toIdx) {
      const daysToBoundary = toIdx - dayIdx
      return { nextSector: s + 2, daysAway: daysToBoundary }
    }
  }
  return null
})

// ——— Auto-complete watcher (unchanged) ———
watch(
  () => expedition.daysRemaining,
  (remaining) => {
    if (!expedition.isActive) return
    if (remaining > 0) return

    const exp = expedition.current
    const avgRate = habits.averageCompletionForExpedition(exp.id, exp.startedAt, todayISO())
    const xp = xpForCompletion(exp.durationDays, avgRate)
    expedition.completeExpedition()
    captain.grantXP({
      amount: xp,
      source: 'completion',
      voyageName: exp.name,
      voyageId: exp.id
    })
  },
  { immediate: true }
)
</script>

<template>
  <div class="app-shell">
    <header class="masthead">
      <!-- Brand zone -->
      <div class="masthead__brand">
        <div class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="26" height="26">
            <!-- Stationary inner -->
            <circle cx="16" cy="16" r="3" fill="none" stroke="currentColor" stroke-width="1.4"/>
            <!-- Mid ring rotates slowly -->
            <g class="brand-mark__mid">
              <circle cx="16" cy="16" r="8" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55"/>
              <circle cx="24" cy="16" r="1.4" fill="currentColor"/>
            </g>
            <!-- Outer ring (stationary, faint) -->
            <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>
          </svg>
        </div>
        <div class="brand-name">
          <span class="display brand-display">Stellar Drift</span>
          <span class="mono brand-tag">long voyage habits</span>
        </div>
      </div>

      <!-- Navigation zone -->
      <nav class="masthead__nav" aria-label="Primary">
        <div class="nav-rail">
          <RouterLink
            v-for="(link, idx) in navLinks"
            :key="link.to"
            :to="link.to"
            class="navlink"
            :class="{ 'navlink--active': route.path === link.to }"
          >
            <span class="navlink__code mono">{{ link.code }}</span>
            <span class="navlink__label">{{ link.label }}</span>
            <span v-if="route.path === link.to" class="navlink__active-bar" aria-hidden="true" />
          </RouterLink>
        </div>
      </nav>

      <!-- Status zone -->
      <div class="masthead__status">
        <template v-if="expedition.isActive">
          <div class="status-block">
            <span class="status-block__label label">Mission time</span>
            <Chronometer />
          </div>
          <div v-if="nextBoundary" class="status-block status-block--secondary">
            <span class="status-block__label label">Next sector</span>
            <span class="status-block__value mono">
              SEC {{ nextBoundary.nextSector }} · T-{{ nextBoundary.daysAway }}d
            </span>
          </div>
          <span class="status-dot" aria-hidden="true" />
        </template>
        <template v-else>
          <div class="status-block">
            <span class="status-block__label label">Status</span>
            <span class="mono status-text--idle">PORT · NO ACTIVE VOYAGE</span>
          </div>
        </template>
      </div>
    </header>

    <main class="content">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
    
    <WelcomeModal />
    <LevelUpModal />
    <GuidedFirstLaunch />
    <DebriefModal />
  </div>
</template>

<style scoped>
.app-shell {
  position: relative;
  z-index: 1;
  min-height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
}

/* ——————————————————————————————————————————————————————————
   Masthead
   —————————————————————————————————————————————————————————— */
.masthead {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: var(--s-5);
  padding: var(--s-4) var(--s-6);
  border-bottom: 1px solid var(--line);
  background:
    linear-gradient(180deg, rgba(6, 8, 15, 0.95) 0%, rgba(10, 15, 28, 0.85) 100%);
  position: relative;
}

/* Subtle scanline texture, very low opacity, only on masthead */
.masthead::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    0deg,
    transparent 0,
    transparent 2px,
    rgba(232, 168, 70, 0.012) 2px,
    rgba(232, 168, 70, 0.012) 3px
  );
  pointer-events: none;
}

/* ——— Brand ——— */
.masthead__brand {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  color: var(--amber);
}
.brand-mark {
  display: flex;
  width: 26px;
  height: 26px;
}
.brand-mark__mid {
  transform-origin: 16px 16px;
  animation: brand-rotate 60s linear infinite;
}
@keyframes brand-rotate {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.brand-name {
  display: flex;
  flex-direction: column;
  line-height: 1;
}
.brand-display {
  font-size: 22px;
  color: var(--signal);
  letter-spacing: 0.005em;
}
.brand-tag {
  margin-top: 5px;
  color: var(--amber-deep);
  font-size: 8px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

/* ——— Navigation ——— */
.masthead__nav {
  display: flex;
  justify-content: center;
  min-width: 0;
}
.nav-rail {
  display: flex;
  gap: 2px;
  padding: 4px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--hull);
  position: relative;
}

.navlink {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 6px 14px;
  border-radius: calc(var(--radius) - 4px);
  color: var(--signal-dim);
  transition: all var(--t-fast) var(--ease);
  text-decoration: none;
  min-width: 60px;
}
.navlink:hover {
  color: var(--signal);
  background: var(--console);
}
.navlink--active {
  color: var(--amber);
  background: var(--console);
}

.navlink__code {
  font-size: 8px;
  letter-spacing: 0.16em;
  color: var(--signal-low);
  transition: color var(--t-fast) var(--ease);
}
.navlink__label {
  font-size: 11px;
  letter-spacing: 0.04em;
}
.navlink--active .navlink__code {
  color: var(--amber-deep);
}

/* The active marker — small bar at the bottom of the active link */
.navlink__active-bar {
  position: absolute;
  bottom: 2px;
  left: 50%;
  transform: translateX(-50%);
  width: 14px;
  height: 2px;
  background: var(--amber);
  border-radius: 2px;
  box-shadow: 0 0 6px var(--amber);
}

/* ——— Status zone ——— */
.masthead__status {
  display: flex;
  align-items: center;
  gap: var(--s-4);
  justify-content: flex-end;
}

.status-block {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  line-height: 1;
}
.status-block__label {
  color: var(--amber-deep);
  font-size: 8px;
}
.status-block--secondary .status-block__label {
  color: var(--cyan-deep);
}
.status-block__value {
  font-size: 11px;
  letter-spacing: 0.06em;
  color: var(--cyan);
}

.status-text--idle {
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--signal-low);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--verdant);
  box-shadow: 0 0 8px var(--verdant);
  animation: pulse 2.4s var(--ease) infinite;
  flex-shrink: 0;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}

/* ——————————————————————————————————————————————————————————
   Content
   —————————————————————————————————————————————————————————— */
.content {
  padding: var(--s-7) var(--s-6) var(--s-8);
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Page transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity var(--t-med) var(--ease), transform var(--t-med) var(--ease);
}
.fade-enter-from { opacity: 0; transform: translateY(8px); }
.fade-leave-to   { opacity: 0; transform: translateY(-4px); }

/* ——————————————————————————————————————————————————————————
   Mobile (≤720px): adaptive layout
   Top row: brand + status (compact)
   Bottom row: nav (horizontal scroll)
   —————————————————————————————————————————————————————————— */
@media (max-width: 720px) {
  .masthead {
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    gap: var(--s-3);
    padding: var(--s-3) var(--s-4);
  }

  .masthead__brand {
    grid-column: 1;
    grid-row: 1;
  }
  .brand-display { font-size: 18px; }
  .brand-tag { font-size: 7px; margin-top: 3px; }

  .masthead__status {
    grid-column: 2;
    grid-row: 1;
    gap: var(--s-3);
  }
  /* Hide secondary status on mobile to keep top row compact */
  .status-block--secondary { display: none; }

  .masthead__nav {
    grid-column: 1 / -1;
    grid-row: 2;
    justify-content: center;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .masthead__nav::-webkit-scrollbar { display: none; }

  .nav-rail {
    flex-shrink: 0;
  }

  .navlink {
    min-width: 60px;
    padding: 8px 12px;
  }
  .navlink__label { font-size: 10px; }

  .content { padding: var(--s-5) var(--s-4) var(--s-7); }
}

/* Ultra-narrow (≤380px): hide brand tag */
@media (max-width: 380px) {
  .brand-tag { display: none; }
}
</style>