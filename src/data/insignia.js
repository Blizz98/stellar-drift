/**
 * Rank insignia — additive geometric marks, one per rank.
 *
 * Each insignia is a 64×64 viewBox SVG path collection. Designed so each
 * rank visually contains the prior rank's elements plus new ones — by
 * Admiral, the insignia is the accumulation of the captain's whole journey.
 *
 * Drawn with currentColor so the color can be set by the consuming context.
 * Strokes use width 1.4 by default; tweak per element as needed.
 */

export const INSIGNIA = {
  // Rank 1 — Cadet: a single point. The beginning.
  1: [
    { type: 'circle', cx: 32, cy: 32, r: 3, fill: 'currentColor' }
  ],

  // Rank 2 — Ensign: point + first orbit ring.
  2: [
    { type: 'circle', cx: 32, cy: 32, r: 3, fill: 'currentColor' },
    { type: 'circle', cx: 32, cy: 32, r: 12, stroke: 'currentColor', sw: 1.2, fill: 'none' }
  ],

  // Rank 3 — Lieutenant: + second orbit ring (outer).
  3: [
    { type: 'circle', cx: 32, cy: 32, r: 3, fill: 'currentColor' },
    { type: 'circle', cx: 32, cy: 32, r: 12, stroke: 'currentColor', sw: 1.2, fill: 'none' },
    { type: 'circle', cx: 32, cy: 32, r: 22, stroke: 'currentColor', sw: 0.9, fill: 'none', opacity: 0.7 }
  ],

  // Rank 4 — Commander: + cardinal points marker (4 short ticks at compass positions).
  4: [
    { type: 'circle', cx: 32, cy: 32, r: 3, fill: 'currentColor' },
    { type: 'circle', cx: 32, cy: 32, r: 12, stroke: 'currentColor', sw: 1.2, fill: 'none' },
    { type: 'circle', cx: 32, cy: 32, r: 22, stroke: 'currentColor', sw: 0.9, fill: 'none', opacity: 0.7 },
    { type: 'path', d: 'M32 6v4 M32 54v4 M6 32h4 M54 32h4', stroke: 'currentColor', sw: 1.4 }
  ],

  // Rank 5 — Captain: + diagonal points (8-point compass) + filled inner ring.
  5: [
    { type: 'circle', cx: 32, cy: 32, r: 3, fill: 'currentColor' },
    { type: 'circle', cx: 32, cy: 32, r: 8, stroke: 'currentColor', sw: 0.8, fill: 'none' },
    { type: 'circle', cx: 32, cy: 32, r: 12, stroke: 'currentColor', sw: 1.2, fill: 'none' },
    { type: 'circle', cx: 32, cy: 32, r: 22, stroke: 'currentColor', sw: 0.9, fill: 'none', opacity: 0.7 },
    { type: 'path', d: 'M32 6v4 M32 54v4 M6 32h4 M54 32h4', stroke: 'currentColor', sw: 1.4 },
    { type: 'path', d: 'M14 14l2.8 2.8 M47.2 14l2.8 2.8 M14 47.2l2.8 2.8 M47.2 47.2l2.8 2.8',
      stroke: 'currentColor', sw: 1.2, opacity: 0.7 }
  ],

  // Rank 6 — Senior Captain: + outer dashed ring (extended reach).
  6: [
    { type: 'circle', cx: 32, cy: 32, r: 3, fill: 'currentColor' },
    { type: 'circle', cx: 32, cy: 32, r: 8, stroke: 'currentColor', sw: 0.8, fill: 'none' },
    { type: 'circle', cx: 32, cy: 32, r: 12, stroke: 'currentColor', sw: 1.2, fill: 'none' },
    { type: 'circle', cx: 32, cy: 32, r: 22, stroke: 'currentColor', sw: 0.9, fill: 'none', opacity: 0.7 },
    { type: 'circle', cx: 32, cy: 32, r: 28, stroke: 'currentColor', sw: 0.6, fill: 'none', opacity: 0.5,
      strokeDasharray: '2 3' },
    { type: 'path', d: 'M32 6v4 M32 54v4 M6 32h4 M54 32h4', stroke: 'currentColor', sw: 1.4 },
    { type: 'path', d: 'M14 14l2.8 2.8 M47.2 14l2.8 2.8 M14 47.2l2.8 2.8 M47.2 47.2l2.8 2.8',
      stroke: 'currentColor', sw: 1.2, opacity: 0.7 }
  ],

  // Rank 7 — Fleet Captain: + small orbiting bodies (commanded fleet).
  7: [
    { type: 'circle', cx: 32, cy: 32, r: 3, fill: 'currentColor' },
    { type: 'circle', cx: 32, cy: 32, r: 8, stroke: 'currentColor', sw: 0.8, fill: 'none' },
    { type: 'circle', cx: 32, cy: 32, r: 12, stroke: 'currentColor', sw: 1.2, fill: 'none' },
    { type: 'circle', cx: 32, cy: 32, r: 22, stroke: 'currentColor', sw: 0.9, fill: 'none', opacity: 0.7 },
    { type: 'circle', cx: 32, cy: 32, r: 28, stroke: 'currentColor', sw: 0.6, fill: 'none', opacity: 0.5,
      strokeDasharray: '2 3' },
    { type: 'path', d: 'M32 6v4 M32 54v4 M6 32h4 M54 32h4', stroke: 'currentColor', sw: 1.4 },
    { type: 'path', d: 'M14 14l2.8 2.8 M47.2 14l2.8 2.8 M14 47.2l2.8 2.8 M47.2 47.2l2.8 2.8',
      stroke: 'currentColor', sw: 1.2, opacity: 0.7 },
    { type: 'circle', cx: 54, cy: 32, r: 1.6, fill: 'currentColor' },
    { type: 'circle', cx: 10, cy: 32, r: 1.6, fill: 'currentColor' }
  ],

  // Rank 8 — Admiral: + apex marker (centered triangle / direction-of-command).
  8: [
    { type: 'circle', cx: 32, cy: 32, r: 3, fill: 'currentColor' },
    { type: 'circle', cx: 32, cy: 32, r: 8, stroke: 'currentColor', sw: 0.8, fill: 'none' },
    { type: 'circle', cx: 32, cy: 32, r: 12, stroke: 'currentColor', sw: 1.2, fill: 'none' },
    { type: 'circle', cx: 32, cy: 32, r: 22, stroke: 'currentColor', sw: 0.9, fill: 'none', opacity: 0.7 },
    { type: 'circle', cx: 32, cy: 32, r: 28, stroke: 'currentColor', sw: 0.6, fill: 'none', opacity: 0.5,
      strokeDasharray: '2 3' },
    { type: 'path', d: 'M32 6v4 M32 54v4 M6 32h4 M54 32h4', stroke: 'currentColor', sw: 1.4 },
    { type: 'path', d: 'M14 14l2.8 2.8 M47.2 14l2.8 2.8 M14 47.2l2.8 2.8 M47.2 47.2l2.8 2.8',
      stroke: 'currentColor', sw: 1.2, opacity: 0.7 },
    { type: 'circle', cx: 54, cy: 32, r: 1.6, fill: 'currentColor' },
    { type: 'circle', cx: 10, cy: 32, r: 1.6, fill: 'currentColor' },
    { type: 'path', d: 'M32 17l4 7h-8z', fill: 'currentColor' }
  ]
}

export function insigniaFor(rank) {
  return INSIGNIA[rank] || INSIGNIA[1]
}