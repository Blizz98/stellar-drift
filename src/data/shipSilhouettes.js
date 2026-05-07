/**
 * Ship silhouettes for the fleet roster display. Each silhouette is a
 * 100×40 viewBox SVG path. Designed to be small but distinctive — you
 * should be able to tell the ships apart at thumbnail size.
 *
 * Drawn with currentColor for line work; uses subtle internal details
 * to suggest ship character (small = nimble, long = endurance, etc).
 */

export const SHIP_SILHOUETTES = {
  // Explorer — small, single-engine, blunt nose. The starter.
  explorer: {
    path: 'M30 20 L60 20 L70 16 L72 16 L72 24 L70 24 L60 20 M50 16 L50 24 M40 17 L40 23',
    accent: 'M68 18 L72 20 L68 22'
  },

  // Frigate — slightly longer, twin engines aft, classic profile.
  frigate: {
    path: 'M22 20 L60 20 L70 14 L72 14 L72 18 L78 20 L72 22 L72 26 L70 26 L60 20 M30 14 L30 26 M45 16 L45 24',
    accent: 'M76 19 L80 20 L76 21'
  },

  // Science vessel — bulbous front (sensors), narrow tail.
  'science-vessel': {
    path: 'M20 20 m0 -6 a6 6 0 1 0 0 12 a6 6 0 1 0 0 -12 M26 20 L65 20 L75 17 L77 17 L77 23 L75 23 L65 20 M55 16 L55 24',
    accent: 'M20 20 m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0'
  },

  // Cutter — sleek, swept, predatory profile.
  cutter: {
    path: 'M18 20 L65 14 L78 18 L80 18 L80 22 L78 22 L65 26 L18 20 M32 17 L32 23 M48 16 L48 24',
    accent: 'M76 19 L82 20 L76 21'
  },

  // Long-hauler — long body, wide cargo middle, distant engines.
  'long-hauler': {
    path: 'M14 20 L25 14 L70 14 L70 26 L25 26 L14 20 M30 14 L30 26 M45 14 L45 26 L60 26 L60 14 M75 16 L80 16 L80 24 L75 24',
    accent: 'M82 18 L86 20 L82 22'
  },

  // Pathfinder — angular, multi-section, exploratory antennae.
  pathfinder: {
    path: 'M16 20 L20 14 L70 14 L75 17 L77 17 L77 23 L75 23 L70 26 L20 26 L16 20 M30 14 L30 26 M50 14 L50 26 M65 16 L65 24',
    accent: 'M14 14 L14 8 M14 14 L20 14 M14 26 L14 32 M14 26 L20 26'
  }
}

export function silhouetteFor(shipId) {
  return SHIP_SILHOUETTES[shipId] || SHIP_SILHOUETTES.explorer
}