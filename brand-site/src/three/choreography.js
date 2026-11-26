// Scroll choreography for every actor in the scene.
//
// Keyframes are keyed on `s`, the continuous section coordinate from store.js
// (s = 3 → section 3's top is at the viewport top). Positions are in screen
// fractions at the object's own depth (x = ±1 → left/right edge, y = ±1 →
// bottom/top edge), so the composition holds on any aspect ratio.
//
// Frame: [s, x, y, z, rotX, rotY, rotZ, scale, capLift]

const OFF_TOP = 1.9
const OFF_BOTTOM = -1.9

export const tracks = {
  // N°01 — the hero bottle; travels through every section.
  ambre: [
    [0.0, 0.17, -0.04, 0, 0.06, -0.45, 0.05, 1.25, 0],
    [0.5, -0.12, 0.0, 0.2, 0.1, 0.5, -0.1, 1.05, 0],
    [1.0, -0.5, -0.05, -0.5, 0.12, 1.6, -0.18, 0.95, 0],
    [1.55, -0.45, 0.02, -0.5, 0.0, 3.4, 0.1, 0.95, 0],
    [2.0, -0.24, -0.04, 0.5, 0.04, 6.0, 0.0, 1.2, 0],
    [2.15, -0.24, -0.04, 0.5, 0.04, 6.5, 0.0, 1.2, 0],
    [2.3, -1.7, 0.0, -1.0, 0.1, 8.6, 0.2, 1.0, 0],
    [2.75, -1.7, -1.7, -1.0, 0, 8.6, 0, 1.0, 0],
    [2.9, 0.0, -2.1, 0, 0, 8.6, 0, 1.2, 0],
    [3.0, 0.0, -0.06, 0.6, 0.05, 9.4, 0, 1.25, 0],
    [3.08, 0.0, -0.06, 0.6, 0.05, 9.8, 0, 1.25, 1],
    [3.63, 0.0, -0.06, 0.6, 0.05, 12.0, 0, 1.25, 1],
    [3.72, 0.0, -0.06, 0.6, 0.05, 12.3, 0, 1.25, 0],
    [4.0, 0.3, -0.42, 1.5, 0.25, 12.4, 0.12, 2.4, 0],
    [4.55, 0.26, -0.14, 1.5, 0.12, 13.1, -0.05, 2.6, 0],
    [4.85, 0.4, -0.6, 0.5, 0.1, 13.5, 0, 1.6, 0],
    [5.3, -0.7, OFF_TOP, -2, 0, 14, 0, 1.0, 0],
    [6.08, -0.7, OFF_TOP, -2, 0, 14, 0, 1.0, 0],
    [6.3, -0.2, 0.15, -1.5, 0.2, 15.5, 0.3, 1.0, 0],
    [6.6, 0.3, -0.1, -1.2, 0.1, 16.8, 0.1, 1.05, 0],
    [7.0, 0.28, -0.06, 0.2, 0.05, 18.6, 0.03, 1.15, 0],
    [8.0, 0.3, 0.42, -0.5, 0.15, 19.4, 0.08, 0.95, 0],
  ],

  // N°02 — enters from the left edge in the hero, second in the showcase.
  iris: [
    [0.0, -0.84, 0.5, -2.0, 0.2, 0.4, 0.35, 1.0],
    [1.0, -1.5, OFF_TOP, -3, 0.3, 1.4, 0.6, 1.0],
    [1.3, 1.7, OFF_TOP, -1, 0, -1.6, 0, 1.1],
    [2.15, 1.7, 0.05, 0.5, 0, -1.6, 0, 1.15],
    [2.3, -0.24, -0.04, 0.5, 0.05, 0.2, 0, 1.15],
    [2.45, -0.24, -0.04, 0.5, 0.05, 0.6, 0, 1.15],
    [2.6, -1.7, 0.0, -1, 0.1, 2.4, 0.2, 1.0],
    [3.0, -1.7, OFF_BOTTOM, -1, 0, 2.4, 0, 1.0],
    [4.9, -1.7, OFF_BOTTOM, -1, 0, 2.4, 0, 1.0],
    [5.3, 0.8, OFF_TOP, -4, 0, 2.4, 0, 0.8],
    [6.6, 0.8, OFF_TOP, -4, 0, 2.4, 0, 0.8],
    [7.0, 0.74, 0.55, -4, 0.2, 0.5, 0.3, 0.8],
    [8.0, 0.8, 1.05, -4, 0.3, 1.2, 0.4, 0.8],
  ],

  // N°03 — partially out of frame bottom-right in the hero, third in the showcase.
  figue: [
    [0.0, 0.95, -0.84, 1.0, -0.2, -0.6, -0.3, 1.1],
    [1.0, 1.7, OFF_BOTTOM, 1.0, -0.2, -1.2, -0.3, 1.1],
    [1.5, 1.7, -0.5, 0.5, 0, -1.6, 0, 1.15],
    [2.45, 1.7, 0.05, 0.5, 0, -1.6, 0, 1.15],
    [2.6, -0.24, -0.04, 0.5, 0.05, 0.2, 0, 1.15],
    [2.72, -0.24, -0.04, 0.5, 0.05, 0.5, 0, 1.15],
    [3.0, -0.24, OFF_TOP, 0.5, 0.2, 1.2, 0, 1.15],
    [4.9, -0.24, OFF_TOP, 0.5, 0.2, 1.2, 0, 1.15],
    [5.3, 0.9, OFF_TOP, -3, 0, 1.2, 0, 1.0],
    [6.08, 0.9, OFF_TOP, -3, 0, 1.2, 0, 1.0],
    [7.0, 0.62, -0.78, 1.6, -0.15, -0.5, -0.25, 0.75],
    [8.0, 1.02, 0.3, 1.2, -0.1, -1.1, -0.2, 0.7],
  ],

  // N°04 / N°05 — only appear inside the collection.
  sel: [
    [0, 0.5, -2.2, 0, 0, 0, 0, 1],
    [4.9, 0.5, -2.2, 0, 0, 0, 0, 1],
    [5.3, 0.5, 2.2, 0, 0, 0, 0, 1],
  ],
  cuir: [
    [0, 0.5, -2.2, 0, 0, 0, 0, 1],
    [4.9, 0.5, -2.2, 0, 0, 0, 0, 1],
    [5.3, 0.5, 2.2, 0, 0, 0, 0, 1],
  ],
}

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export function sample(track, s, out) {
  const n = track.length
  let a = track[0]
  let b = track[0]
  let t = 0
  if (s <= track[0][0]) a = b = track[0]
  else if (s >= track[n - 1][0]) a = b = track[n - 1]
  else {
    for (let i = 0; i < n - 1; i++) {
      if (s < track[i + 1][0]) {
        a = track[i]
        b = track[i + 1]
        t = ease((s - a[0]) / (b[0] - a[0]))
        break
      }
    }
  }
  for (let k = 1; k < 9; k++) out[k - 1] = (a[k] ?? 0) + ((b[k] ?? 0) - (a[k] ?? 0)) * t
  return out
}

export const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

// How strongly an actor is pinned to its DOM anchor in the collection.
export const anchorWeight = (s) => smoothstep(4.7, 4.95, s) * (1 - smoothstep(6.0, 6.08, s))

// Portrait screens: pull centred objects toward the middle, leave edges alone.
export function compressX(x) {
  const a = Math.abs(x)
  const g = a <= 0.5 ? a * 0.55 : 0.275 + (a - 0.5) * 1.45
  return Math.sign(x) * g
}
