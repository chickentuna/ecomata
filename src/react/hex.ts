import { Point } from './utils'

export const HEXAGON_WIDTH = 20
export const HEXAGON_RADIUS = HEXAGON_WIDTH / 2
export const HEXAGON_HEIGHT = HEXAGON_RADIUS * Math.sqrt(3)
export const HEXAGON_X_SEP = HEXAGON_RADIUS * 3 / 2

export function screenToHex (p:Point): Point {
  const xIdx = Math.round(p.x / (HEXAGON_RADIUS * (3 / 2)))
  const x = xIdx
  let y
  if (xIdx % 2) {
    y = Math.floor(p.y / (HEXAGON_HEIGHT))
  } else {
    y = Math.round(p.y / (HEXAGON_HEIGHT))
  }

  return { x, y }
}

export function hexToScreen (p:Point): Point {
  const x = HEXAGON_RADIUS * 3 / 2 * p.x
  const y = HEXAGON_HEIGHT * (p.y + 0.5 * (p.x & 1))
  return { x, y }
}
