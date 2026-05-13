export const SHIP_SILHOUETTES = {
  // Existing
  explorer: {
    path: 'M30 20 L60 20 L70 16 L72 16 L72 24 L70 24 L60 20 M50 16 L50 24 M40 17 L40 23',
    accent: 'M68 18 L72 20 L68 22'
  },
  frigate: {
    path: 'M22 20 L60 20 L70 14 L72 14 L72 18 L78 20 L72 22 L72 26 L70 26 L60 20 M30 14 L30 26 M45 16 L45 24',
    accent: 'M76 19 L80 20 L76 21'
  },
  'science-vessel': {
    path: 'M20 20 m0 -6 a6 6 0 1 0 0 12 a6 6 0 1 0 0 -12 M26 20 L65 20 L75 17 L77 17 L77 23 L75 23 L65 20 M55 16 L55 24',
    accent: 'M20 20 m-3 0 a3 3 0 1 0 6 0 a3 3 0 1 0 -6 0'
  },
  cutter: {
    path: 'M18 20 L65 14 L78 18 L80 18 L80 22 L78 22 L65 26 L18 20 M32 17 L32 23 M48 16 L48 24',
    accent: 'M76 19 L82 20 L76 21'
  },
  // New — Corvette: balanced mid-tier, dual ridge
  corvette: {
    path: 'M18 20 L25 14 L65 14 L72 18 L78 18 L80 20 L78 22 L72 22 L65 26 L25 26 L18 20 M35 14 L35 26 M50 14 L50 26',
    accent: 'M76 19 L82 20 L76 21'
  },
  'long-hauler': {
    path: 'M14 20 L25 14 L70 14 L70 26 L25 26 L14 20 M30 14 L30 26 M45 14 L45 26 L60 26 L60 14 M75 16 L80 16 L80 24 L75 24',
    accent: 'M82 18 L86 20 L82 22'
  },
  // New — Star Liner: long, smooth, multi-window comfort vessel
  liner: {
    path: 'M12 20 L18 16 L72 16 L78 20 L72 24 L18 24 L12 20 M22 16 L22 24 M32 16 L32 24 M42 16 L42 24 M52 16 L52 24 M62 16 L62 24',
    accent: 'M80 18 L86 20 L80 22'
  },
  pathfinder: {
    path: 'M16 20 L20 14 L70 14 L75 17 L77 17 L77 23 L75 23 L70 26 L20 26 L16 20 M30 14 L30 26 M50 14 L50 26 M65 16 L65 24',
    accent: 'M14 14 L14 8 M14 14 L20 14 M14 26 L14 32 M14 26 L20 26'
  },
  // New — Voyager: extended profile with deep-space sensor mast
  voyager: {
    path: 'M14 20 L18 14 L70 14 L78 17 L82 17 L82 23 L78 23 L70 26 L18 26 L14 20 M28 14 L28 26 M44 14 L44 26 M58 14 L58 26',
    accent: 'M14 14 L14 6 M11 8 L17 8 M82 16 L88 17 L82 18 M82 22 L88 23 L82 24'
  },
  // New — Flagship: largest, most decorated, command-vessel profile
  flagship: {
    path: 'M10 20 L16 12 L24 12 L26 14 L70 14 L78 16 L82 18 L86 20 L82 22 L78 24 L70 26 L26 26 L24 28 L16 28 L10 20 M22 14 L22 26 M36 14 L36 26 M50 14 L50 26 M64 14 L64 26',
    accent: 'M16 12 L16 6 M13 8 L19 8 M16 28 L16 34 M13 32 L19 32 M86 19 L92 20 L86 21'
  }
}

export function silhouetteFor(shipId) {
  return SHIP_SILHOUETTES[shipId] || SHIP_SILHOUETTES.explorer
}