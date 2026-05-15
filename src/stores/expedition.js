import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { loadJSON, saveJSON } from '@/composables/usePersistence'
import { todayISO, parseLocalISO, daysBetween, daysElapsedSince } from '@/utils/date'

/**
 * An Expedition is a discrete run with a beginning and an end.
 * This is the roguelike skeleton: runs end, that's normal.
 *
 * Expedition shape:
 *   id            string
 *   name          string   (e.g. "Voyage to Kepler-186f")
 *   destination   string
 *   shipClass     'explorer' | 'frigate' | 'science-vessel' | ...
 *   durationDays  30 | 60 | 90
 *   startedAt     ISO date string (start of day, local)
 *   status        'active' | 'completed' | 'abandoned'
 *   endedAt       ISO date string | null
 */

export const useExpeditionStore = defineStore('expedition', () => {
  // ——— state ———
  const current = ref(loadJSON('expedition.current', null))
  const history = ref(loadJSON('expedition.history', []))
  const meta = ref(loadJSON('expedition.meta', {
    totalRuns: 0,
    completedRuns: 0,
    unlocks: ['explorer'] // ship classes unlocked across runs
  }))
  const pendingDebrief = ref(loadJSON('expedition.pendingDebrief', null))

  // ——— persistence ———
  watch(current, v => saveJSON('expedition.current', v), { deep: true })
  watch(history, v => saveJSON('expedition.history', v), { deep: true })
  watch(meta,    v => saveJSON('expedition.meta',    v), { deep: true })
  watch(pendingDebrief, v => saveJSON('expedition.pendingDebrief', v), { deep: true })

  // ——— getters ———
  const isActive = computed(() => current.value?.status === 'active')

  const daysElapsed = computed(() => {
    if (!current.value) return 0
    return daysElapsedSince(current.value.startedAt) + 1
  })

  const daysRemaining = computed(() => {
    if (!current.value) return 0
    return current.value.durationDays - daysElapsed.value + 1
  })

  const progressPercent = computed(() => {
    if (!current.value) return 0
    const span = Math.max(1, current.value.durationDays - 1)
    const ratio = (daysElapsed.value - 1) / span
    return Math.max(0, Math.min(100, Math.round(ratio * 100)))
  })

  /**
   * Roguelike "sectors": 4 chunks of the voyage with milestone moments.
   * Each sector spans floor(s * size) to floor((s+1) * size) - 1 in zero-indexed days.
   * This matches the day-cell mapping in VoyageMapMobile/StarMap so the "current sector"
   * label always agrees with which sector the today-day-cell visually falls in.
   */
  const currentSector = computed(() => {
    if (!current.value) return 1
    const sectorSize = current.value.durationDays / 4
    const dayIdx = daysElapsed.value - 1   // ← zero-based: day 1 → idx 0
    return Math.min(4, Math.max(1, Math.floor(dayIdx / sectorSize) + 1))
  })

  // ——— actions ———
  function launchExpedition({ name, destination, destinationId, durationDays, shipClass = 'explorer' }) {
    current.value = {
      id: `exp_${Date.now()}`,
      name: name || 'Untitled Voyage',
      destination: destination || 'Unknown Sector',
      destinationId: destinationId || null,
      shipClass,
      durationDays,
      startedAt: todayISO(),
      status: 'active',
      endedAt: null
    }
    meta.value.totalRuns += 1
  }

  function completeExpedition() {
    if (!current.value) return null
    const ended = { ...current.value, status: 'completed', endedAt: todayISO() }
    history.value = [ended, ...history.value]
    meta.value.completedRuns += 1
    current.value = null
    pendingDebrief.value = { voyageId: ended.id, status: 'completed', at: Date.now() }
    return ended
  }

  function abandonExpedition() {
    if (!current.value) return null
    const ended = { ...current.value, status: 'abandoned', endedAt: todayISO() }
    history.value = [ended, ...history.value]
    current.value = null
    pendingDebrief.value = { voyageId: ended.id, status: 'abandoned', at: Date.now() }
    return ended
  }

  /**
   * Saves the debrief reflection onto the archived expedition entry.
   * The pendingDebrief flag is cleared so the modal closes.
   */
  function fileDebrief({ voyageId, worked, surprised, nextVoyage, skipped = false }) {
    const idx = history.value.findIndex(e => e.id === voyageId)
    if (idx !== -1) {
      history.value[idx] = {
        ...history.value[idx],
        debrief: skipped
          ? null
          : {
              worked: (worked || '').trim(),
              surprised: (surprised || '').trim(),
              nextVoyage: (nextVoyage || '').trim(),
              filedAt: new Date().toISOString().slice(0, 10)
            }
      }
    }
    pendingDebrief.value = null
  }

  function dismissDebrief() {
    pendingDebrief.value = null
  }

  return {
    current, history, meta, pendingDebrief,
    isActive, daysElapsed, daysRemaining, progressPercent, currentSector,
    launchExpedition, completeExpedition, abandonExpedition, fileDebrief, dismissDebrief
  }
})
