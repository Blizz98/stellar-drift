<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink, RouterView } from 'vue-router'
import { useExpeditionStore } from '@/stores/expedition'
import Chronometer from '@/components/Chronometer.vue'
import LevelUpModal from '@/components/LevelUpModal.vue'
import GuidedFirstLaunch from '@/components/GuidedFirstLaunch.vue'

const route = useRoute()
const expedition = useExpeditionStore()

const navLinks = computed(() => {
  if (expedition.isActive) {
    return [
      { to: '/',           label: 'Bridge' },
      { to: '/expedition', label: 'Voyage' },
      { to: '/habits',     label: 'Systems' },
      { to: '/captain',    label: 'Captain' },
      { to: '/log',        label: 'Log' }
    ]
  }
  return [
    { to: '/launch',  label: 'Launch' },
    { to: '/captain', label: 'Captain' },
    { to: '/log',     label: 'Log' }
  ]
})
</script>

<template>
  <div class="app-shell">
    <header class="masthead">
      <div class="masthead__brand">
        <div class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" width="22" height="22">
            <circle cx="16" cy="16" r="3" fill="none" stroke="currentColor" stroke-width="1.4"/>
            <circle cx="16" cy="16" r="8" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.55"/>
            <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.3"/>
            <circle cx="24" cy="11" r="1.4" fill="currentColor"/>
          </svg>
        </div>
        <div class="brand-name">
          <span class="display brand-display">Stellar Drift</span>
          <span class="label brand-tag">long voyage habits</span>
        </div>
      </div>

      <nav class="masthead__nav">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="navlink"
          :class="{ 'navlink--active': route.path === link.to }"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <div class="masthead__status">
        <template v-if="expedition.isActive">
          <span class="status-dot" />
          <Chronometer />
        </template>
        <template v-else>
          <span class="mono status-text status-text--idle">NO ACTIVE VOYAGE</span>
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

    <LevelUpModal />
    <GuidedFirstLaunch />
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

.masthead {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: var(--s-5);
  padding: var(--s-4) var(--s-6);
  border-bottom: 1px solid var(--line);
  background: linear-gradient(180deg, rgba(6, 8, 15, 0.95) 0%, rgba(6, 8, 15, 0.7) 100%);
  backdrop-filter: blur(12px);
}

.masthead__brand {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  color: var(--amber);
}
.brand-mark { display: flex; }
.brand-name { display: flex; flex-direction: column; line-height: 1; }
.brand-display {
  font-size: 22px;
  color: var(--signal);
}
.brand-tag {
  margin-top: 4px;
  color: var(--amber-deep);
  font-size: 9px;
}

.masthead__nav {
  display: flex;
  gap: var(--s-2);
  padding: 4px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--hull);
}
.navlink {
  font-family: var(--font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  padding: 8px 16px;
  border-radius: 999px;
  color: var(--signal-dim);
  transition: all var(--t-fast) var(--ease);
}
.navlink:hover { color: var(--signal); background: var(--console); }
.navlink--active {
  color: var(--void);
  background: var(--amber);
}

.masthead__status {
  display: flex;
  align-items: center;
  gap: var(--s-2);
  justify-content: flex-end;
}
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--verdant);
  box-shadow: 0 0 8px var(--verdant);
  animation: pulse 2.4s var(--ease) infinite;
}
.status-text {
  font-size: 11px;
  letter-spacing: 0.12em;
  color: var(--signal-dim);
}
.status-text--idle { color: var(--signal-low); }

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

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}

/* — Responsive — */
@media (max-width: 720px) {
  .masthead {
    grid-template-columns: 1fr;
    gap: var(--s-3);
    padding: var(--s-3) var(--s-4);
  }
  .masthead__nav { justify-self: start; overflow-x: auto; max-width: 100%; }
  .masthead__status { justify-content: flex-start; }
  .content { padding: var(--s-5) var(--s-4) var(--s-7); }
}
</style>
