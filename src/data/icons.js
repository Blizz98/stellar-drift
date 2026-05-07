/**
 * Curated icon library for habit cards.
 *
 * All icons are 24×24 viewBox SVG paths designed to match the line-art
 * aesthetic of the rest of the app. Stroke weight is 1.6 by default;
 * the consuming component renders with currentColor so category colors
 * apply automatically.
 *
 * Organized by theme. Each entry has:
 *   id        — unique identifier, used as habit.icon value
 *   label     — picker UI label
 *   theme     — grouping for the picker ('fitness' | 'work' | etc)
 *   path      — SVG path d-attribute (drawn at viewBox 24×24)
 *
 * To add icons, just append to this array. The picker reads themes
 * dynamically, so a new theme group appears automatically.
 */

export const ICON_THEMES = {
  fitness:    { label: 'Fitness & body',     order: 1 },
  mindful:    { label: 'Stillness & mind',   order: 2 },
  work:       { label: 'Focus & work',       order: 3 },
  learning:   { label: 'Learning & craft',   order: 4 },
  rest:       { label: 'Sleep & recovery',   order: 5 },
  nourish:    { label: 'Food & hydration',   order: 6 },
  creative:   { label: 'Creative & play',    order: 7 },
  social:     { label: 'Connection',         order: 8 },
  routine:    { label: 'Daily routine',      order: 9 },
  abstract:   { label: 'Abstract',           order: 10 }
}

export const ICONS = [
  // ——— Fitness ———
  { id: 'run',       theme: 'fitness',  label: 'Run',
    path: 'M13 4a2 2 0 1 0 0 0M9 9l3-3 4 2 2 4M5 14l4-2 3 3-2 5M14 13l3 1 2 4' },
  { id: 'lift',      theme: 'fitness',  label: 'Lift',
    path: 'M3 12h2M19 12h2M5 9v6M19 9v6M7 10v4M17 10v4M9 11h6' },
  { id: 'walk',      theme: 'fitness',  label: 'Walk',
    path: 'M14 4a2 2 0 1 0 0 0M11 8l3 1 1 4-3 5M9 14l-2 5M14 13l3 1 1 4' },
  { id: 'bike',      theme: 'fitness',  label: 'Cycle',
    path: 'M5 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 15l-2-6h-3M12 15l4-7h3M14 6h2' },
  { id: 'stretch',   theme: 'fitness',  label: 'Stretch',
    path: 'M12 4a2 2 0 1 0 0 0M12 7v4M9 11h6M9 11l-3 8M15 11l3 8' },
  { id: 'heartbeat', theme: 'fitness',  label: 'Cardio',
    path: 'M3 12h4l2-4 3 8 2-4h7' },

  // ——— Mindful ———
  { id: 'sit',       theme: 'mindful',  label: 'Meditate',
    path: 'M12 5a2 2 0 1 0 0 0M12 8v4M8 14c0 2 2 3 4 3s4-1 4-3M6 17h12' },
  { id: 'breath',    theme: 'mindful',  label: 'Breathe',
    path: 'M12 5v14M5 12h14M7 7l10 10M17 7L7 17' },
  { id: 'lotus',     theme: 'mindful',  label: 'Stillness',
    path: 'M12 5v6M8 8c0 3 2 5 4 5s4-2 4-5M5 14c1 3 4 4 7 4s6-1 7-4' },
  { id: 'sun',       theme: 'mindful',  label: 'Sunrise',
    path: 'M12 5v3M5 12h3M16 12h3M7 7l2 2M15 7l-2 2M8 17h8M7 14a5 5 0 0 1 10 0' },

  // ——— Work / focus ———
  { id: 'target',    theme: 'work',     label: 'Focus',
    path: 'M12 12m-7 0a7 7 0 1 0 14 0 7 7 0 1 0-14 0M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0' },
  { id: 'monitor',   theme: 'work',     label: 'Computer',
    path: 'M3 5h18v12H3zM3 5v12M9 21h6M12 17v4' },
  { id: 'code',      theme: 'work',     label: 'Code',
    path: 'M8 7l-5 5 5 5M16 7l5 5-5 5M14 5l-4 14' },
  { id: 'pen',       theme: 'work',     label: 'Write',
    path: 'M4 20l3-1 12-12-2-2L5 17l-1 3zM14 6l2 2' },
  { id: 'list',      theme: 'work',     label: 'Tasks',
    path: 'M4 6h16M4 12h16M4 18h10' },
  { id: 'clock',     theme: 'work',     label: 'Time',
    path: 'M12 12m-9 0a9 9 0 1 0 18 0 9 9 0 1 0-18 0M12 7v5l3 2' },
  { id: 'inbox',     theme: 'work',     label: 'Inbox',
    path: 'M3 13l3-7h12l3 7v6H3zM3 13h6l1 2h4l1-2h6' },

  // ——— Learning ———
  { id: 'book',      theme: 'learning', label: 'Read',
    path: 'M4 5v14h16V5M4 5l8 3 8-3M12 8v11' },
  { id: 'graduation', theme: 'learning', label: 'Study',
    path: 'M3 10l9-4 9 4-9 4-9-4zM7 12v4c0 1 2 2 5 2s5-1 5-2v-4M21 10v5' },
  { id: 'brain',     theme: 'learning', label: 'Think',
    path: 'M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-2 3v2a3 3 0 0 0 2 3v1a3 3 0 0 0 3 3M15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 2 3v2a3 3 0 0 1-2 3v1a3 3 0 0 1-3 3' },
  { id: 'language',  theme: 'learning', label: 'Language',
    path: 'M4 5h7M7 5v3M4 11s2 4 4 4M11 11s-3 6-7 7M14 19l4-10 4 10M16 16h6' },
  { id: 'music',     theme: 'learning', label: 'Music',
    path: 'M9 18a2 2 0 1 0 0 0M19 16a2 2 0 1 0 0 0M9 18V6l12-2v12' },

  // ——— Rest / recovery ———
  { id: 'moon',      theme: 'rest',     label: 'Sleep',
    path: 'M19 14a8 8 0 1 1-9-9 6 6 0 0 0 9 9z' },
  { id: 'bed',       theme: 'rest',     label: 'In bed',
    path: 'M3 18v-6h18v6M3 18v2M21 18v2M3 12V8h18v4M7 12V9h4v3' },
  { id: 'pillow',    theme: 'rest',     label: 'Rest',
    path: 'M5 9c0-2 2-3 7-3s7 1 7 3v6c0 2-2 3-7 3s-7-1-7-3z' },
  { id: 'star-rest', theme: 'rest',     label: 'Wind down',
    path: 'M12 5l1.5 4.5L18 11l-4.5 1.5L12 17l-1.5-4.5L6 11l4.5-1.5z' },

  // ——— Nourish ———
  { id: 'water',     theme: 'nourish',  label: 'Water',
    path: 'M12 4l5 7a5 5 0 1 1-10 0z' },
  { id: 'cup',       theme: 'nourish',  label: 'Drink',
    path: 'M5 7h14l-1 12H6zM19 7v0a3 3 0 0 1 0 6h-1' },
  { id: 'plate',     theme: 'nourish',  label: 'Meal',
    path: 'M12 12m-8 0a8 8 0 1 0 16 0 8 8 0 1 0-16 0M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0' },
  { id: 'apple',     theme: 'nourish',  label: 'Fruit',
    path: 'M12 7c-3 0-5 2-5 5s2 7 5 7 5-2 5-7-2-5-5-5zM12 7V5M12 5c0-1 1-2 2-2' },
  { id: 'leaf',      theme: 'nourish',  label: 'Greens',
    path: 'M5 19c0-7 5-12 14-14-1 9-6 14-14 14zM5 19l8-8' },

  // ——— Creative ———
  { id: 'brush',     theme: 'creative', label: 'Paint',
    path: 'M3 21l4-4M7 17l8-8 4 4-8 8zM15 9l3-3 2 2-3 3' },
  { id: 'camera',    theme: 'creative', label: 'Photo',
    path: 'M4 8h3l2-2h6l2 2h3v11H4zM12 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6z' },
  { id: 'film',      theme: 'creative', label: 'Watch',
    path: 'M3 5h18v14H3zM3 9h18M3 15h18M7 5v14M17 5v14' },
  { id: 'pen-craft', theme: 'creative', label: 'Sketch',
    path: 'M4 20l4-1 11-11-3-3L5 16l-1 4zM14 6l3 3' },

  // ——— Social ———
  { id: 'people',    theme: 'social',   label: 'Friends',
    path: 'M9 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2M16 4a3 3 0 1 1 0 6M21 20v-2a4 4 0 0 0-3-4' },
  { id: 'phone',     theme: 'social',   label: 'Call',
    path: 'M5 4h4l2 5-3 2c1 3 3 5 6 6l2-3 5 2v4c-9 0-16-7-16-16z' },
  { id: 'message',   theme: 'social',   label: 'Message',
    path: 'M3 5h18v12H7l-4 4z' },
  { id: 'heart',     theme: 'social',   label: 'Affection',
    path: 'M12 19s-7-4-9-9 0-7 4-7 5 3 5 3 1-3 5-3 6 2 4 7-9 9-9 9z' },

  // ——— Routine ———
  { id: 'tooth',     theme: 'routine',  label: 'Dental',
    path: 'M9 4c-2 0-4 1-4 4 0 4 1 6 2 11 1 1 2 1 2-2 1-3 1-3 3-3s2 0 3 3c0 3 1 3 2 2 1-5 2-7 2-11 0-3-2-4-4-4-1 0-2 1-3 1s-2-1-3-1z' },
  { id: 'shower',    theme: 'routine',  label: 'Shower',
    path: 'M7 4h6a4 4 0 0 1 4 4v3M3 11h18M5 14v3M9 14v3M13 14v3M17 14v3' },
  { id: 'home',      theme: 'routine',  label: 'Home',
    path: 'M3 11l9-7 9 7v9H3zM10 20v-6h4v6' },
  { id: 'pill',      theme: 'routine',  label: 'Medication',
    path: 'M5 12a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7zM8 8l8 8' },
  { id: 'plant',     theme: 'routine',  label: 'Plants',
    path: 'M12 20v-8M12 12c-3 0-5-2-5-5 0 0 5-1 5 5zM12 12c3 0 5-2 5-5 0 0-5-1-5 5z' },

  // ——— Abstract ———
  { id: 'orbit',     theme: 'abstract', label: 'Orbit',
    path: 'M12 12m-9 0a9 5 0 1 0 18 0 9 5 0 1 0-18 0M12 12m-2 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0' },
  { id: 'compass',   theme: 'abstract', label: 'Compass',
    path: 'M12 12m-9 0a9 9 0 1 0 18 0 9 9 0 1 0-18 0M9 15l2-6 4-2-2 6z' },
  { id: 'mountain',  theme: 'abstract', label: 'Peak',
    path: 'M3 19l5-9 4 5 3-3 6 7zM7 9a2 2 0 1 0 0-2 2 2 0 0 0 0 2z' },
  { id: 'flame',     theme: 'abstract', label: 'Energy',
    path: 'M12 4c0 4-5 5-5 10a5 5 0 0 0 10 0c0-2-2-3-3-5 0 1-1 2-2 2 0-3 1-5 0-7z' },
  { id: 'wave',      theme: 'abstract', label: 'Flow',
    path: 'M3 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0M3 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0' },
  { id: 'spiral',    theme: 'abstract', label: 'Cycle',
    path: 'M12 12a4 4 0 1 1 4-4 6 6 0 1 1-6 6 8 8 0 1 1 8-8' },
  { id: 'diamond',   theme: 'abstract', label: 'Mark',
    path: 'M12 3l9 9-9 9-9-9z' },
  { id: 'crosshair', theme: 'abstract', label: 'Aim',
    path: 'M12 12m-9 0a9 9 0 1 0 18 0 9 9 0 1 0-18 0M12 3v6M12 15v6M3 12h6M15 12h6' }
]

/**
 * Lookup a single icon by id. Returns null if not found — caller should fall
 * back to the category's default icon.
 */
export function iconById(id) {
  return ICONS.find(i => i.id === id) || null
}

/**
 * Group icons by theme, in the order defined by ICON_THEMES.
 * Used by the picker to render sections.
 */
export function iconsByTheme() {
  const grouped = {}
  for (const icon of ICONS) {
    if (!grouped[icon.theme]) grouped[icon.theme] = []
    grouped[icon.theme].push(icon)
  }
  // Sort by ICON_THEMES.order
  return Object.keys(ICON_THEMES)
    .sort((a, b) => ICON_THEMES[a].order - ICON_THEMES[b].order)
    .filter(theme => grouped[theme]?.length > 0)
    .map(theme => ({
      id: theme,
      label: ICON_THEMES[theme].label,
      icons: grouped[theme]
    }))
}