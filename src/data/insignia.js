/**
 * Rank insignia — 10 base marks, properly centered at viewBox (32, 32).
 *
 * Grade is shown as 1, 2, or 3 vertical strokes beneath the main mark —
 * accumulated experience reading visibly as accumulated marks. The base
 * mark stays unchanged within a named rank; the strokes count up I → II → III.
 *
 * Stroke weights are quantized to three values:
 *   1.5  — primary structure
 *   1.0  — secondary detail
 *   0.6  — atmospheric / outer rings
 *
 * All circles use cx=32 cy=32 unless they're decorative offset elements.
 * The viewBox is 64×64 with the main mark filling roughly 48px of vertical
 * height, leaving 8px above and 8px (incl. grade strokes) below.
 */

// Base insignia for each NAMED rank (1..10), centered at (32, 32).
export const BASE_INSIGNIA = {
  // Rank 1 — Cadet: a single point. The beginning.
  1: [
    { type: 'circle', cx: 32, cy: 32, r: 3.5, fill: 'currentColor' }
  ],

  // Rank 2 — Ensign: + first orbit ring.
  2: [
    { type: 'circle', cx: 32, cy: 32, r: 3.5, fill: 'currentColor' },
    { type: 'circle', cx: 32, cy: 32, r: 11, stroke: 'currentColor', sw: 1.5, fill: 'none' }
  ],

  // Rank 3 — Lieutenant: + second orbit ring.
  3: [
    { type: 'circle', cx: 32, cy: 32, r: 3.5, fill: 'currentColor' },
    { type: 'circle', cx: 32, cy: 32, r: 11, stroke: 'currentColor', sw: 1.5, fill: 'none' },
    { type: 'circle', cx: 32, cy: 32, r: 18, stroke: 'currentColor', sw: 1.0, fill: 'none', opacity: 0.8 }
  ],

  // Rank 4 — Commander: + cardinal ticks (4-point compass).
  4: [
    { type: 'circle', cx: 32, cy: 32, r: 3.5, fill: 'currentColor' },
    { type: 'circle', cx: 32, cy: 32, r: 11, stroke: 'currentColor', sw: 1.5, fill: 'none' },
    { type: 'circle', cx: 32, cy: 32, r: 18, stroke: 'currentColor', sw: 1.0, fill: 'none', opacity: 0.8 },
    // 4 cardinal ticks just outside the second ring
    { type: 'path', d: 'M32 11v3 M32 50v3 M11 32h3 M50 32h3', stroke: 'currentColor', sw: 1.5 }
  ],

  // Rank 5 — Captain: + diagonal ticks (8-point) + small inner ring.
  5: [
    { type: 'circle', cx: 32, cy: 32, r: 3.5, fill: 'currentColor' },
    { type: 'circle', cx: 32, cy: 32, r: 7, stroke: 'currentColor', sw: 1.0, fill: 'none' },
    { type: 'circle', cx: 32, cy: 32, r: 11, stroke: 'currentColor', sw: 1.5, fill: 'none' },
    { type: 'circle', cx: 32, cy: 32, r: 18, stroke: 'currentColor', sw: 1.0, fill: 'none', opacity: 0.8 },
    { type: 'path', d: 'M32 11v3 M32 50v3 M11 32h3 M50 32h3', stroke: 'currentColor', sw: 1.5 },
    // Diagonal ticks (NE/NW/SE/SW), shorter and lighter
    { type: 'path', d: 'M17 17l2.1 2.1 M44.9 17l2.1-2.1 M17 47l2.1-2.1 M44.9 47l2.1 2.1',
      stroke: 'currentColor', sw: 1.0, opacity: 0.8 }
  ],

  // Rank 6 — Senior Captain: + outer dashed ring (extended reach).
  6: [
    { type: 'circle', cx: 32, cy: 32, r: 3.5, fill: 'currentColor' },
    { type: 'circle', cx: 32, cy: 32, r: 7, stroke: 'currentColor', sw: 1.0, fill: 'none' },
    { type: 'circle', cx: 32, cy: 32, r: 11, stroke: 'currentColor', sw: 1.5, fill: 'none' },
    { type: 'circle', cx: 32, cy: 32, r: 18, stroke: 'currentColor', sw: 1.0, fill: 'none', opacity: 0.8 },
    { type: 'circle', cx: 32, cy: 32, r: 24, stroke: 'currentColor', sw: 0.6, fill: 'none', opacity: 0.6,
      strokeDasharray: '2 3' },
    { type: 'path', d: 'M32 11v3 M32 50v3 M11 32h3 M50 32h3', stroke: 'currentColor', sw: 1.5 },
    { type: 'path', d: 'M17 17l2.1 2.1 M44.9 17l2.1-2.1 M17 47l2.1-2.1 M44.9 47l2.1 2.1',
      stroke: 'currentColor', sw: 1.0, opacity: 0.8 }
  ],

  // Rank 7 — Fleet Captain: + flanking points (commanded fleet).
  7: [
    { type: 'circle', cx: 32, cy: 32, r: 3.5, fill: 'currentColor' },
    { type: 'circle', cx: 32, cy: 32, r: 7, stroke: 'currentColor', sw: 1.0, fill: 'none' },
    { type: 'circle', cx: 32, cy: 32, r: 11, stroke: 'currentColor', sw: 1.5, fill: 'none' },
    { type: 'circle', cx: 32, cy: 32, r: 18, stroke: 'currentColor', sw: 1.0, fill: 'none', opacity: 0.8 },
    { type: 'circle', cx: 32, cy: 32, r: 24, stroke: 'currentColor', sw: 0.6, fill: 'none', opacity: 0.6,
      strokeDasharray: '2 3' },
    { type: 'path', d: 'M32 11v3 M32 50v3 M11 32h3 M50 32h3', stroke: 'currentColor', sw: 1.5 },
    { type: 'path', d: 'M17 17l2.1 2.1 M44.9 17l2.1-2.1 M17 47l2.1-2.1 M44.9 47l2.1 2.1',
      stroke: 'currentColor', sw: 1.0, opacity: 0.8 },
    // Flanking small bodies on the horizontal axis
    { type: 'circle', cx: 56, cy: 32, r: 1.8, fill: 'currentColor' },
    { type: 'circle', cx:  8, cy: 32, r: 1.8, fill: 'currentColor' }
  ],

  // Rank 8 — Commodore: + apex marker (upward triangle, direction of command).
  8: [
    { type: 'circle', cx: 32, cy: 32, r: 3.5, fill: 'currentColor' },
    { type: 'circle', cx: 32, cy: 32, r: 7, stroke: 'currentColor', sw: 1.0, fill: 'none' },
    { type: 'circle', cx: 32, cy: 32, r: 11, stroke: 'currentColor', sw: 1.5, fill: 'none' },
    { type: 'circle', cx: 32, cy: 32, r: 18, stroke: 'currentColor', sw: 1.0, fill: 'none', opacity: 0.8 },
    { type: 'circle', cx: 32, cy: 32, r: 24, stroke: 'currentColor', sw: 0.6, fill: 'none', opacity: 0.6,
      strokeDasharray: '2 3' },
    { type: 'path', d: 'M32 11v3 M32 50v3 M11 32h3 M50 32h3', stroke: 'currentColor', sw: 1.5 },
    { type: 'path', d: 'M17 17l2.1 2.1 M44.9 17l2.1-2.1 M17 47l2.1-2.1 M44.9 47l2.1 2.1',
      stroke: 'currentColor', sw: 1.0, opacity: 0.8 },
    { type: 'circle', cx: 56, cy: 32, r: 1.8, fill: 'currentColor' },
    { type: 'circle', cx:  8, cy: 32, r: 1.8, fill: 'currentColor' },
    // Apex triangle pointing up, just outside the dashed ring
    { type: 'path', d: 'M32 4 l3.5 5.5 h-7 z', fill: 'currentColor' }
  ],

  // Rank 9 — Rear Admiral: + flanking apex marks at lower diagonals.
  9: [
    { type: 'circle', cx: 32, cy: 32, r: 3.5, fill: 'currentColor' },
    { type: 'circle', cx: 32, cy: 32, r: 7, stroke: 'currentColor', sw: 1.0, fill: 'none' },
    { type: 'circle', cx: 32, cy: 32, r: 11, stroke: 'currentColor', sw: 1.5, fill: 'none' },
    { type: 'circle', cx: 32, cy: 32, r: 18, stroke: 'currentColor', sw: 1.0, fill: 'none', opacity: 0.8 },
    { type: 'circle', cx: 32, cy: 32, r: 24, stroke: 'currentColor', sw: 0.6, fill: 'none', opacity: 0.6,
      strokeDasharray: '2 3' },
    { type: 'path', d: 'M32 11v3 M32 50v3 M11 32h3 M50 32h3', stroke: 'currentColor', sw: 1.5 },
    { type: 'path', d: 'M17 17l2.1 2.1 M44.9 17l2.1-2.1 M17 47l2.1-2.1 M44.9 47l2.1 2.1',
      stroke: 'currentColor', sw: 1.0, opacity: 0.8 },
    { type: 'circle', cx: 56, cy: 32, r: 1.8, fill: 'currentColor' },
    { type: 'circle', cx:  8, cy: 32, r: 1.8, fill: 'currentColor' },
    { type: 'path', d: 'M32 4 l3.5 5.5 h-7 z', fill: 'currentColor' },
    // Two smaller apex triangles flanking, pointing outward at lower diagonals
    { type: 'path', d: 'M12 50 l3 4.5 h-6 z', fill: 'currentColor' },
    { type: 'path', d: 'M52 50 l3 4.5 h-6 z', fill: 'currentColor' }
  ],

  // Rank 10 — Admiral: + crowning halo arc above (full command).
  10: [
    { type: 'circle', cx: 32, cy: 32, r: 3.5, fill: 'currentColor' },
    { type: 'circle', cx: 32, cy: 32, r: 7, stroke: 'currentColor', sw: 1.0, fill: 'none' },
    { type: 'circle', cx: 32, cy: 32, r: 11, stroke: 'currentColor', sw: 1.5, fill: 'none' },
    { type: 'circle', cx: 32, cy: 32, r: 18, stroke: 'currentColor', sw: 1.0, fill: 'none', opacity: 0.8 },
    { type: 'circle', cx: 32, cy: 32, r: 24, stroke: 'currentColor', sw: 0.6, fill: 'none', opacity: 0.6,
      strokeDasharray: '2 3' },
    { type: 'circle', cx: 32, cy: 32, r: 28, stroke: 'currentColor', sw: 0.6, fill: 'none', opacity: 0.4 },
    { type: 'path', d: 'M32 11v3 M32 50v3 M11 32h3 M50 32h3', stroke: 'currentColor', sw: 1.5 },
    { type: 'path', d: 'M17 17l2.1 2.1 M44.9 17l2.1-2.1 M17 47l2.1-2.1 M44.9 47l2.1 2.1',
      stroke: 'currentColor', sw: 1.0, opacity: 0.8 },
    { type: 'circle', cx: 56, cy: 32, r: 1.8, fill: 'currentColor' },
    { type: 'circle', cx:  8, cy: 32, r: 1.8, fill: 'currentColor' },
    { type: 'path', d: 'M32 4 l3.5 5.5 h-7 z', fill: 'currentColor' },
    { type: 'path', d: 'M12 50 l3 4.5 h-6 z', fill: 'currentColor' },
    { type: 'path', d: 'M52 50 l3 4.5 h-6 z', fill: 'currentColor' },
    // Crowning arc above the insignia
    { type: 'path', d: 'M14 6 a18 8 0 0 1 36 0', stroke: 'currentColor', sw: 1.0, fill: 'none', opacity: 0.7 }
  ]
}

/**
 * Number of grade strokes to render: 1 for grade 'I', 2 for 'II', 3 for 'III'.
 */
export function gradeStrokeCount(grade) {
  return grade === 'III' ? 3 : grade === 'II' ? 2 : 1
}

export function baseInsigniaFor(rank) {
  return BASE_INSIGNIA[rank] || BASE_INSIGNIA[1]
}