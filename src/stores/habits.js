import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { loadJSON, saveJSON } from '@/composables/usePersistence'
import { useExpeditionStore } from './expedition'

/**
 * Habits are scoped to an Expedition. When you launch a new run, you bring
 * habits forward (or pick a different set). Logs are keyed by date + habit.
 *
 * Habit shape:
 *   id            string
 *   expeditionId  string
 *   name          string
 *   description   string
 *   category      'engineering' | 'navigation' | 'research' | 'life-support'
 *   cadence       'daily' | 'weekday' | 'weekly_3'  (v1: daily only used; rest stubbed)
 *   icon          string (emoji for v1; replace with custom SVG later)
 *
 * Logs structure: { [dateISO]: { [habitId]: { completed: bool, note?: string } } }
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

export const useHabitsStore = defineStore('habits', () => {
  // ——— state ———
  const habits = ref(loadJSON('habits.list', []))
  const logs   = ref(loadJSON('habits.logs', {}))

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
   * Returns the completion entry for (date, habitId), or a default.
   */
  function getLog(date, habitId) {
    return logs.value[date]?.[habitId] ?? { completed: false, note: '' }
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
      const dayDone = expHabits.filter(h => logs.value[iso]?.[h.id]?.completed).length
      sum += dayDone / expHabits.length
    }
    return sum / dayCount
  }

  // ——— actions ———
  function addHabit({ name, description = '', category = 'engineering', icon = null }) {
    if (!expedition.current) return
    const habit = {
      id: `hab_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      expeditionId: expedition.current.id,
      name: name.trim(),
      description: description.trim(),
      category,
      cadence: 'daily',
      icon: icon || CATEGORIES[category].icon,
      createdAt: todayISO()
    }
    habits.value.push(habit)
    return habit
  }

  function removeHabit(id) {
    habits.value = habits.value.filter(h => h.id !== id)
  }

  function toggleCompletion(habitId, date = todayISO()) {
    if (!logs.value[date]) logs.value[date] = {}
    const current = logs.value[date][habitId]?.completed ?? false
    logs.value[date] = {
      ...logs.value[date],
      [habitId]: { ...(logs.value[date][habitId] || {}), completed: !current }
    }
  }

  function setNote(habitId, note, date = todayISO()) {
    if (!logs.value[date]) logs.value[date] = {}
    logs.value[date] = {
      ...logs.value[date],
      [habitId]: { ...(logs.value[date][habitId] || { completed: false }), note }
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

  return {
    habits, logs,
    activeHabits, todayHabits, todayCompletionRate,
    getLog, completionRate, averageCompletionForExpedition,
    addHabit, removeHabit, toggleCompletion, setNote, carryHabitsForward
  }
})
