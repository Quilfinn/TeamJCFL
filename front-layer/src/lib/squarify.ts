export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

/**
 * Squarified treemap (Bruls, Huizing & van Wijk).
 * Tiles `rect` with one box per value, sized proportionally, aiming for
 * aspect ratios close to 1 so the boxes read as rounded squares.
 */
export function squarify(values: number[], rect: Rect): Rect[] {
  const total = values.reduce((a, b) => a + b, 0)
  if (total <= 0) return values.map(() => ({ ...rect }))

  const area = rect.w * rect.h
  const scaled = values.map((v) => (v / total) * area)

  const tiles: Rect[] = new Array(values.length)
  const order: number[] = scaled.map((_, i) => i)

  let x = rect.x
  let y = rect.y
  let w = rect.w
  let h = rect.h

  let row: number[] = [] // indices
  const shortest = () => Math.min(w, h)

  const worst = (rowIdx: number[], side: number): number => {
    let s = 0
    let max = -Infinity
    let min = Infinity
    for (const i of rowIdx) {
      const v = scaled[i]
      s += v
      if (v > max) max = v
      if (v < min) min = v
    }
    const side2 = side * side
    const s2 = s * s
    return Math.max((side2 * max) / s2, s2 / (side2 * min))
  }

  const layoutRow = (rowIdx: number[]) => {
    const s = rowIdx.reduce((acc, i) => acc + scaled[i], 0)
    if (w >= h) {
      const rw = s / h
      let cy = y
      for (const i of rowIdx) {
        const rh = scaled[i] / rw
        tiles[i] = { x, y: cy, w: rw, h: rh }
        cy += rh
      }
      x += rw
      w -= rw
    } else {
      const rh = s / w
      let cx = x
      for (const i of rowIdx) {
        const rw = scaled[i] / rh
        tiles[i] = { x: cx, y, w: rw, h: rh }
        cx += rw
      }
      y += rh
      h -= rh
    }
  }

  let k = 0
  while (k < order.length) {
    const idx = order[k]
    if (row.length === 0) {
      row.push(idx)
      k++
    } else {
      const side = shortest()
      const next = [...row, idx]
      if (worst(next, side) <= worst(row, side)) {
        row = next
        k++
      } else {
        layoutRow(row)
        row = []
      }
    }
  }
  if (row.length) layoutRow(row)

  return tiles
}
