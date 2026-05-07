import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { loadJSON, saveJSON } from '@/composables/usePersistence'

/**
 * The Captain's level system.
 *
 * Philosophy: XP is awarded at voyage END only, never per-day. This keeps
 * the run as the unit of progression and avoids streak-shame. A thoughtful
 * abandonment also grants (smaller) XP — captain skill includes knowing
 * when to pull the plug.
 *
 * Curve: rank N requires N² × 200 total XP.
 *   1: 0          (Cadet — start)
 *   2: 800
 *   3: 1800
 *   4: 3200
 *   5: 5000
 *   6: 7200
 *   7: 9800
 *   8: 12800     (Admiral — terminal rank)
 */

export const RANKS = [
  { rank: 1, name: 'Cadet',          minXP:     0 },
  { rank: 2, name: 'Ensign',         minXP:   400 },
  { rank: 3, name: 'Lieutenant',     minXP:  800 },
  { rank: 4, name: 'Commander',      minXP:  1400 },
  { rank: 5, name: 'Captain',        minXP:  2200 },
  { rank: 6, name: 'Senior Captain', minXP:  3300 },
  { rank: 7, name: 'Fleet Captain',  minXP:  4600 },
  { rank: 8, name: 'Commodore',        minXP: 6100 },
  { rank: 9, name: 'Rear Admiral',        minXP: 7500 },
  { rank: 10, name: 'Vice Admiral',        minXP: 9500 },
  { rank: 11, name: 'Admiral',        minXP: 11500 },
  { rank: 12, name: 'Grand Admiral',        minXP: 13500 }
]

const MAX_RANK = RANKS.length

function rankForXP(xp) {
  let r = RANKS[0]
  for (const candidate of RANKS) {
    if (xp >= candidate.minXP) r = candidate
    else break
  }
  return r
}

/**
 * XP awarded on auto-completion (voyage reached its planned end).
 * Base 100 + completion-quality bonus.
 */
export function xpForCompletion(durationDays, avgCompletionRate) {
  return 100 + Math.round(avgCompletionRate * durationDays * 2)
}

/**
 * XP awarded on abandonment.
 * Only fully-completed days count — the day you abandon on does not.
 *
 * Day 1 abandon (0 completed days):  0 XP
 * Day 2 abandon (1 completed day):   round(100 × 1/N)
 * Day N abandon (N-1 completed):     round(100 × (N-1)/N)
 *
 * No completion-quality bonus — abandon is about how far you got,
 * not how well you did along the way.
 */
export function xpForAbandonment(daysElapsed, durationDays) {
  const daysCompleted = Math.max(0, daysElapsed - 1)
  return Math.round(100 * (daysCompleted / durationDays))
}

export const useCaptainStore = defineStore('captain', () => {
  // ——— state ———
  const state = ref(loadJSON('captain.state', {
    name: 'Captain',
    xp: 0,
    voyageGrants: []   // history of XP grants for the captain log: { date, source, amount, voyageName }
  }))

  // Pending level-up celebration: when present, BridgeView shows the modal
  // and the user can dismiss it. Avoids showing it on a stale page reload.
  const pendingLevelUp = ref(loadJSON('captain.pendingLevelUp', null))

  watch(state,           v => saveJSON('captain.state',           v), { deep: true })
  watch(pendingLevelUp,  v => saveJSON('captain.pendingLevelUp',  v), { deep: true })

  // ——— getters ———
  const currentRank = computed(() => rankForXP(state.value.xp))

  const nextRank = computed(() => {
    const idx = RANKS.findIndex(r => r.rank === currentRank.value.rank)
    return idx < RANKS.length - 1 ? RANKS[idx + 1] : null
  })

  const xpIntoRank = computed(() => state.value.xp - currentRank.value.minXP)

  const xpForNextRank = computed(() => {
    if (!nextRank.value) return 0
    return nextRank.value.minXP - currentRank.value.minXP
  })

  const progressToNext = computed(() => {
    if (!nextRank.value) return 1
    return Math.min(1, xpIntoRank.value / xpForNextRank.value)
  })

  const isMaxRank = computed(() => !nextRank.value)

  // ——— actions ———

  /**
   * Grant XP. If this crosses a rank boundary, queue a level-up celebration.
   * Returns { gained, leveledUp, newRank }.
   */
  function grantXP({ amount, source, voyageName, voyageId }) {
    const before = currentRank.value.rank
    state.value.xp += amount
    state.value.voyageGrants.unshift({
      date: new Date().toISOString().slice(0, 10),
      source,
      amount,
      voyageName: voyageName || '',
      voyageId:   voyageId   || ''
    })
    state.value.voyageGrants = state.value.voyageGrants.slice(0, 50) // cap history

    const after = currentRank.value.rank
    if (after > before) {
      pendingLevelUp.value = {
        from: RANKS.find(r => r.rank === before),
        to:   RANKS.find(r => r.rank === after),
        at: Date.now()
      }
      return { gained: amount, leveledUp: true, newRank: after }
    }
    return { gained: amount, leveledUp: false, newRank: after }
  }

  function clearPendingLevelUp() {
    pendingLevelUp.value = null
  }

  function setName(newName) {
    state.value.name = newName.trim() || 'Captain'
  }

  return {
    state, pendingLevelUp,
    currentRank, nextRank, xpIntoRank, xpForNextRank, progressToNext, isMaxRank,
    grantXP, clearPendingLevelUp, setName,
    MAX_RANK
  }
})
