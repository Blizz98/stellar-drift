import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { loadJSON, saveJSON } from '@/composables/usePersistence'

/**
 * The Captain's level system — 10 named ranks × 3 grades each = 30 progression steps.
 *
 * Philosophy: XP is awarded at voyage END only, never per-day. This keeps
 * the run as the unit of progression and avoids streak-shame.
 *
 * Curve: each step ~25% harder than the previous; gaps grow throughout.
 *   - Committed user (90% completion):  ~14 months to Admiral I, ~18 months to Admiral III
 *   - Average user   (70%):              ~22 months to Admiral I
 *   - Casual user    (55%):              ~3 years to Admiral I
 *
 * Display: rank+grade always shown together (e.g. "Lieutenant II"). The named
 * promotion (Cadet III → Ensign I) is the bigger moment; grade-ups within a
 * rank are smaller markers of accumulating experience.
 */

export const RANKS = [
  { step: 1,  rank: 1,  name: 'Cadet',          grade: 'I',   minXP:     0 },
  { step: 2,  rank: 1,  name: 'Cadet',          grade: 'II',  minXP:    80 },
  { step: 3,  rank: 1,  name: 'Cadet',          grade: 'III', minXP:   180 },

  { step: 4,  rank: 2,  name: 'Ensign',         grade: 'I',   minXP:   320 },
  { step: 5,  rank: 2,  name: 'Ensign',         grade: 'II',  minXP:   500 },
  { step: 6,  rank: 2,  name: 'Ensign',         grade: 'III', minXP:   720 },

  { step: 7,  rank: 3,  name: 'Lieutenant',     grade: 'I',   minXP:  1000 },
  { step: 8,  rank: 3,  name: 'Lieutenant',     grade: 'II',  minXP:  1340 },
  { step: 9,  rank: 3,  name: 'Lieutenant',     grade: 'III', minXP:  1740 },

  { step: 10, rank: 4,  name: 'Commander',      grade: 'I',   minXP:  2200 },
  { step: 11, rank: 4,  name: 'Commander',      grade: 'II',  minXP:  2740 },
  { step: 12, rank: 4,  name: 'Commander',      grade: 'III', minXP:  3360 },

  { step: 13, rank: 5,  name: 'Captain',        grade: 'I',   minXP:  4070 },
  { step: 14, rank: 5,  name: 'Captain',        grade: 'II',  minXP:  4880 },
  { step: 15, rank: 5,  name: 'Captain',        grade: 'III', minXP:  5800 },

  { step: 16, rank: 6,  name: 'Senior Captain', grade: 'I',   minXP:  6840 },
  { step: 17, rank: 6,  name: 'Senior Captain', grade: 'II',  minXP:  8010 },
  { step: 18, rank: 6,  name: 'Senior Captain', grade: 'III', minXP:  9320 },

  { step: 19, rank: 7,  name: 'Fleet Captain',  grade: 'I',   minXP: 10780 },
  { step: 20, rank: 7,  name: 'Fleet Captain',  grade: 'II',  minXP: 12400 },
  { step: 21, rank: 7,  name: 'Fleet Captain',  grade: 'III', minXP: 14190 },

  { step: 22, rank: 8,  name: 'Commodore',      grade: 'I',   minXP: 16170 },
  { step: 23, rank: 8,  name: 'Commodore',      grade: 'II',  minXP: 18350 },
  { step: 24, rank: 8,  name: 'Commodore',      grade: 'III', minXP: 20740 },

  { step: 25, rank: 9,  name: 'Rear Admiral',   grade: 'I',   minXP: 23360 },
  { step: 26, rank: 9,  name: 'Rear Admiral',   grade: 'II',  minXP: 26230 },
  { step: 27, rank: 9,  name: 'Rear Admiral',   grade: 'III', minXP: 29360 },

  { step: 28, rank: 10, name: 'Admiral',        grade: 'I',   minXP: 32760 },
  { step: 29, rank: 10, name: 'Admiral',        grade: 'II',  minXP: 36450 },
  { step: 30, rank: 10, name: 'Admiral',        grade: 'III', minXP: 40450 }
]

export const MAX_STEP = RANKS.length
export const MAX_RANK = 10

/**
 * Returns the rank entry for a given total XP — the highest rank whose minXP
 * is at or below the given xp.
 */
export function rankForXP(xp) {
  let r = RANKS[0]
  for (const candidate of RANKS) {
    if (xp >= candidate.minXP) r = candidate
    else break
  }
  return r
}

/**
 * Display string for a rank entry — "Lieutenant II", "Admiral III", etc.
 */
export function rankDisplay(rankEntry) {
  if (!rankEntry) return ''
  return `${rankEntry.name} ${rankEntry.grade}`
}

/**
 * Was the promotion from `before` to `after` a NAMED promotion (different
 * named rank), or just a grade-up within the same name? Used to drive
 * different celebration intensities in the LevelUpModal.
 */
export function isNamedPromotion(beforeStep, afterStep) {
  const before = RANKS.find(r => r.step === beforeStep)
  const after  = RANKS.find(r => r.step === afterStep)
  if (!before || !after) return false
  return before.rank !== after.rank
}

// XP formulas
export function xpForCompletion(durationDays, avgCompletionRate) {
  return 100 + Math.round(avgCompletionRate * durationDays * 2)
}

export function xpForAbandonment(daysElapsed, durationDays) {
  const daysCompleted = Math.max(0, daysElapsed - 1)
  return Math.round(100 * (daysCompleted / durationDays))
}

export const useCaptainStore = defineStore('captain', () => {
  const state = ref(loadJSON('captain.state', {
    name: 'Captain',
    xp: 0,
    voyageGrants: [],
    personalLog: ''
  }))

  // Backfill personalLog for users on the old shape
  if (state.value.personalLog === undefined) {
    state.value.personalLog = ''
    saveJSON('captain.state', state.value)
  }

  const pendingLevelUp = ref(loadJSON('captain.pendingLevelUp', null))

  watch(state,          v => saveJSON('captain.state',          v), { deep: true })
  watch(pendingLevelUp, v => saveJSON('captain.pendingLevelUp', v), { deep: true })

  // ——— Current step / rank state ———
  const currentRank = computed(() => rankForXP(state.value.xp))
  const currentStep = computed(() => currentRank.value.step)

  const nextRank = computed(() => {
    const idx = RANKS.findIndex(r => r.step === currentStep.value)
    return idx < RANKS.length - 1 ? RANKS[idx + 1] : null
  })

  const xpIntoStep = computed(() => state.value.xp - currentRank.value.minXP)

  const xpForNextStep = computed(() => {
    if (!nextRank.value) return 0
    return nextRank.value.minXP - currentRank.value.minXP
  })

  const progressToNext = computed(() => {
    if (!nextRank.value) return 1
    return Math.min(1, xpIntoStep.value / xpForNextStep.value)
  })

  const isMaxStep = computed(() => !nextRank.value)

  /**
   * Window of visible rank steps for the Ladder view.
   * Shows: up to 2 below current + current + up to 5 above.
   * If the user is near the top or bottom, the window is trimmed honestly
   * (no padding with imaginary steps).
   */
  const visibleLadderSteps = computed(() => {
    const cur = currentStep.value
    const start = Math.max(1, cur - 2)
    const end   = Math.min(MAX_STEP, cur + 4)
    return RANKS.filter(r => r.step >= start && r.step <= end)
  })

  /**
   * How many steps exist beyond the visible ladder window.
   * Used by the Captain view to render the "X further ranks await" indicator.
   */
  const hiddenStepCount = computed(() => {
    const cur = currentStep.value
    const visibleEnd = Math.min(MAX_STEP, cur + 4)
    return MAX_STEP - visibleEnd
  })

  // ——— Actions ———

  /**
   * Grant XP. If this crosses a step boundary, queue a level-up celebration
   * (with isNamedPromotion flag for distinguishing celebration intensity).
   * Returns { gained, leveledUp, newStep, namedPromotion }.
   */
  function grantXP({ amount, source, voyageName, voyageId }) {
    const beforeStep = currentStep.value
    state.value.xp += amount
    state.value.voyageGrants.unshift({
      date: new Date().toISOString().slice(0, 10),
      source,
      amount,
      voyageName: voyageName || '',
      voyageId:   voyageId   || ''
    })
    state.value.voyageGrants = state.value.voyageGrants.slice(0, 50)

    const afterStep = currentStep.value
    if (afterStep > beforeStep) {
      const named = isNamedPromotion(beforeStep, afterStep)
      pendingLevelUp.value = {
        from: RANKS.find(r => r.step === beforeStep),
        to:   RANKS.find(r => r.step === afterStep),
        namedPromotion: named,
        at: Date.now()
      }
      return { gained: amount, leveledUp: true, newStep: afterStep, namedPromotion: named }
    }
    return { gained: amount, leveledUp: false, newStep: afterStep, namedPromotion: false }
  }

  function clearPendingLevelUp() {
    pendingLevelUp.value = null
  }

  function setName(newName) {
    state.value.name = newName.trim() || 'Captain'
  }

  function setPersonalLog(text) {
    state.value.personalLog = text || ''
  }

  return {
    state, pendingLevelUp,
    currentRank, currentStep, nextRank,
    xpIntoStep, xpForNextStep, progressToNext, isMaxStep,
    visibleLadderSteps, hiddenStepCount,
    grantXP, clearPendingLevelUp, setName, setPersonalLog,
    MAX_STEP, MAX_RANK
  }
})