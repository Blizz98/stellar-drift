import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { loadJSON, saveJSON } from '@/composables/usePersistence'
import { useExpeditionStore } from './expedition'

/**
 * Habits are scoped to an Expedition. When you launch a new run, you bring
 * habits forward (or pick a different set). Logs are keyed by date + habit.
 *
 * Habit shape:
 *   id                  string
 *   expeditionId        string
 *   name                string
 *   description         string
 *   category            'engineering' | 'navigation' | 'research' | 'life-support'
 *   cadence             'daily' | 'weekday' | 'weekly_3'  (v1: daily only used; rest stubbed)
 *   completionsNeeded   number   (≥1; how many times per day this habit must fire to count as complete)
 *   icon                string   (emoji for v1; replace with custom SVG later)
 *
 * Logs structure: { [dateISO]: { [habitId]: { count: number, note?: string } } }
 *   A habit is "complete" for a given day when count >= completionsNeeded.
 */

export const CATEGORIES = {
  engineering: {
    label: 'Engineering',
    sublabel: 'Hull integrity & propulsion',
    description: 'Physical training, fitness, the body. The ship cannot voyage without maintenance.',
    color: 'var(--thrust)',
    icon: '⚙'
  },
  navigation: {
    label: 'Navigation',
    sublabel: 'Charting the course',
    description: 'Focus, planning, deep work. Knowing where you are and where you are going.',
    color: 'var(--cyan)',
    icon: '✦'
  },
  research: {
    label: 'Research',
    sublabel: 'Discovering new tech',
    description: 'Learning, reading, study. The tech tree of the self.',
    color: 'var(--plasma)',
    icon: '◇'
  },
  'life-support': {
    label: 'Life Support',
    sublabel: 'Crew wellbeing',
    description: 'Sleep, nutrition, recovery, stillness. The crew is you.',
    color: 'var(--verdant)',
    icon: '◉'
  }
}

const todayISO = () => new Date().toISOString().slice(0, 10)

/**
 * Migrates older log entries from the binary { completed: bool } shape to the
 * new { count: number } shape. Runs once on store initialization; harmless on
 * already-migrated data. Can be removed after all known users have migrated.
 */
function migrateLogs(logs) {
  let changed = false
  for (const date in logs) {
    for (const habitId in logs[date]) {
      const entry = logs[date][habitId]
      if (entry && 'completed' in entry && !('count' in entry)) {
        logs[date][habitId] = {
          count: entry.completed ? 1 : 0,
          note: entry.note || ''
        }
        changed = true
      }
    }
  }
  return changed
}

/**
 * Migrates older habits that don't yet have a `completionsNeeded` field.
 * Defaults to 1 (binary completion), matching pre-feature behavior.
 */
function migrateHabits(habits) {
  let changed = false
  for (const h of habits) {
    if (h.completionsNeeded === undefined) {
      h.completionsNeeded = 1
      changed = true
    }
  }
  return changed
}

export const useHabitsStore = defineStore('habits', () => {
  // ——— state ———
  const habits = ref(loadJSON('habits.list', []))
  const logs   = ref(loadJSON('habits.logs', {}))

  // One-time migrations for users upgrading from the pre-multi-completion schema.
  if (migrateHabits(habits.value)) saveJSON('habits.list', habits.value)
  if (migrateLogs(logs.value))     saveJSON('habits.logs',  logs.value)

  watch(habits, v => saveJSON('habits.list', v), { deep: true })
  watch(logs,   v => saveJSON('habits.logs',  v), { deep: true })

  const expedition = useExpeditionStore()

  // ——— getters ———
  const activeHabits = computed(() => {
    if (!expedition.current) return []
    return habits.value.filter(h => h.expeditionId === expedition.current.id)
  })

  const todayHabits = computed(() => activeHabits.value)

  /**
   * Returns the completion entry for (date, habitId), with a derived `completed`
   * property based on the habit's completionsNeeded threshold.
   */
  function getLog(date, habitId) {
    const raw = logs.value[date]?.[habitId] ?? { count: 0, note: '' }
    const habit = habits.value.find(h => h.id === habitId)
    const needed = habit?.completionsNeeded ?? 1
    return {
      ...raw,
      completed: raw.count >= needed
    }
  }

  /**
   * Returns 0..1 representing the share of today's habits completed for a given date.
   */
  function completionRate(date) {
    const list = activeHabits.value
    if (list.length === 0) return 0
    const completed = list.filter(h => getLog(date, h.id).completed).length
    return completed / list.length
  }

  const todayCompletionRate = computed(() => completionRate(todayISO()))

  /**
   * Computes the average daily completion rate for a given expedition,
   * looking only at days from startedAt up through (and including) `throughDate`.
   * Used at voyage end to compute XP rewards.
   *
   * Important: only counts habits that were active during this expedition,
   * and only days the voyage was actually running.
   */
  function averageCompletionForExpedition(expeditionId, startedAt, throughDate) {
    const expHabits = habits.value.filter(h => h.expeditionId === expeditionId)
    if (expHabits.length === 0) return 0

    const start = new Date(startedAt + 'T00:00:00')
    const end   = new Date(throughDate + 'T00:00:00')
    const dayCount = Math.max(1, Math.floor((end - start) / 86_400_000) + 1)

    let sum = 0
    for (let i = 0; i < dayCount; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      const iso = d.toISOString().slice(0, 10)
      const dayDone = expHabits.filter(h => {
        const count = logs.value[iso]?.[h.id]?.count ?? 0
        return count >= (h.completionsNeeded ?? 1)
      }).length
      sum += dayDone / expHabits.length
    }
    return sum / dayCount
  }

  // ——— actions ———
  function addHabit({ name, description = '', category = 'engineering', icon = null, completionsNeeded = 1 }) {
    if (!expedition.current) return
    const habit = {
      id: `hab_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      expeditionId: expedition.current.id,
      name: name.trim(),
      description: description.trim(),
      category,
      cadence: 'daily',
      completionsNeeded: Math.max(1, completionsNeeded || 1),
      icon: icon || CATEGORIES[category].icon,
      createdAt: todayISO()
    }
    habits.value.push(habit)
    return habit
  }

    /**
   * Updates an existing habit's mutable fields. Immutable fields (id, expeditionId,
   * createdAt) are protected from accidental overwrite. The current daily log entry
   * is untouched — if completionsNeeded changes, the derived `completed` flag will
   * recompute naturally on next read.
   */
  function updateHabit(id, updates) {
    const idx = habits.value.findIndex(h => h.id === id)
    if (idx === -1) return null

    const existing = habits.value[idx]
    const merged = {
      ...existing,
      ...updates,
      id: existing.id,
      expeditionId: existing.expeditionId,
      createdAt: existing.createdAt,
      // Re-validate the mutable fields that have rules
      name: (updates.name ?? existing.name).trim(),
      description: (updates.description ?? existing.description ?? '').trim(),
      completionsNeeded: Math.max(1, parseInt(updates.completionsNeeded ?? existing.completionsNeeded, 10) || 1),
      icon: updates.icon || existing.icon || CATEGORIES[updates.category ?? existing.category].icon
    }

    habits.value[idx] = merged
    return merged
  }

  function removeHabit(id) {
    habits.value = habits.value.filter(h => h.id !== id)
  }

  /**
 * Returns yesterday's completion summary, but only counts habits that existed
 * at the time. Returns null if no habits were configured yesterday — in that
 * case the widget should hide entirely (e.g. day after voyage launch).
 *
 * Shape: { rate, completed, total, hasData, date }
 */
function yesterdaySummary() {
  const yest = new Date()
  yest.setDate(yest.getDate() - 1)
  const yestISO = yest.toISOString().slice(0, 10)

  const eligible = activeHabits.value.filter(h => h.createdAt <= yestISO)
  if (eligible.length === 0) return null

  const completed = eligible.filter(h => {
    const count = logs.value[yestISO]?.[h.id]?.count ?? 0
    return count >= (h.completionsNeeded ?? 1)
  }).length

  return {
    rate: completed / eligible.length,
    completed,
    total: eligible.length,
    hasData: true,
    date: yestISO
  }
}

  /**
   * Used by binary habits (completionsNeeded === 1): flips between done and not-done.
   * For multi-completion habits, treats the tap as a full reset (any count → 0).
   * Multi-completion habits should normally use incrementCompletion instead.
   */
  function toggleCompletion(habitId, date = todayISO()) {
    if (!logs.value[date]) logs.value[date] = {}
    const habit = habits.value.find(h => h.id === habitId)
    const needed = habit?.completionsNeeded ?? 1
    const current = logs.value[date][habitId]?.count ?? 0

    const next = (needed === 1)
      ? (current >= needed ? 0 : needed)
      : 0

    logs.value[date] = {
      ...logs.value[date],
      [habitId]: { ...(logs.value[date][habitId] || { count: 0 }), count: next }
    }
  }

  /**
   * Increments today's count by 1, capped at completionsNeeded so it stops at "complete".
   * Used by the "+1" action on multi-completion habit cards.
   */
  function incrementCompletion(habitId, date = todayISO()) {
    if (!logs.value[date]) logs.value[date] = {}
    const habit = habits.value.find(h => h.id === habitId)
    const needed = habit?.completionsNeeded ?? 1
    const current = logs.value[date][habitId]?.count ?? 0
    const next = Math.min(needed, current + 1)

    logs.value[date] = {
      ...logs.value[date],
      [habitId]: { ...(logs.value[date][habitId] || { count: 0 }), count: next }
    }
  }

  function setNote(habitId, note, date = todayISO()) {
    if (!logs.value[date]) logs.value[date] = {}
    logs.value[date] = {
      ...logs.value[date],
      [habitId]: { ...(logs.value[date][habitId] || { count: 0 }), note }
    }
  }

  /**
   * When a new expedition launches, the user can carry habits forward.
   * v1 just clones the active set with new IDs and the new expeditionId.
   */
  function carryHabitsForward(fromExpeditionId, toExpeditionId) {
    const carryover = habits.value
      .filter(h => h.expeditionId === fromExpeditionId)
      .map(h => ({
        ...h,
        id: `hab_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        expeditionId: toExpeditionId,
        createdAt: todayISO()
      }))
    habits.value = [...habits.value, ...carryover]
  }

  /**
   * Per-habit completion history across a voyage. Returns an array of day entries
   * from voyage start through today (or through endedAt for archived voyages).
   *
   * Each entry: { day, dateISO, isToday, isPast, isFuture, completion }
   *   - completion is 0..1 for past days, null for today/future
   *   - For multi-completion habits, completion = count / completionsNeeded (capped at 1)
   *   - For binary habits, completion is 0 or 1
   *
   * Used by the Systems view to render per-habit voyage strips.
   */
  function habitVoyageStrip(habit, voyageStartedAt, voyageEndedAt = null) {
    const start = new Date(voyageStartedAt + 'T00:00:00')
    const today = new Date(todayISO() + 'T00:00:00')
    const end = voyageEndedAt
      ? new Date(voyageEndedAt + 'T00:00:00')
      : today
    const habitCreated = new Date(habit.createdAt + 'T00:00:00')

    // Voyage spans from start to end (or today, whichever is earlier for active voyages)
    const stripEnd = today < end ? today : end
    const totalDays = Math.max(1, Math.floor((end - start) / 86_400_000) + 1)
    const todayDayNum = Math.floor((today - start) / 86_400_000) + 1

    return Array.from({ length: totalDays }, (_, i) => {
      const date = new Date(start)
      date.setDate(date.getDate() + i)
      const dayNum = i + 1
      const dateISO = date.toISOString().slice(0, 10)
      const isToday = dayNum === todayDayNum
      const isPast = dayNum < todayDayNum
      const isFuture = dayNum > todayDayNum
      const habitExisted = date >= habitCreated

      let completion = null
      if (habitExisted && (isPast || isToday)) {
        const count = logs.value[dateISO]?.[habit.id]?.count ?? 0
        const needed = habit.completionsNeeded ?? 1
        completion = Math.min(1, count / needed)
      }

      return {
        day: dayNum,
        dateISO,
        isToday,
        isPast,
        isFuture,
        habitExisted,
        completion
      }
    })
  }

  /**
   * Per-habit completion percentage across past days only (excluding today).
   * Returns 0..1 or null if no eligible past days exist.
   */
  function habitPastAverage(habit, voyageStartedAt) {
    const strip = habitVoyageStrip(habit, voyageStartedAt)
    const past = strip.filter(d => d.isPast && d.habitExisted)
    if (past.length === 0) return null
    const sum = past.reduce((s, d) => s + (d.completion ?? 0), 0)
    return sum / past.length
  }

  return {
    habits, logs,
    activeHabits, todayHabits, todayCompletionRate,
    getLog, completionRate, averageCompletionForExpedition, yesterdaySummary,
    habitVoyageStrip, habitPastAverage,
    addHabit, updateHabit, removeHabit, toggleCompletion, incrementCompletion, setNote, carryHabitsForward
  }
})