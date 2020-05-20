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

const oddqDirections = [
  [[+1, 0], [+1, -1], [0, -1],
    [-1, -1], [-1, 0], [0, +1]],
  [[+1, +1], [+1, 0], [0, -1],
    [-1, 0], [-1, +1], [0, +1]]
]

export function oddqOffsetNeighbor (x:number, y:number, direction:number) {
  var parity = x & 1
  var dir = oddqDirections[parity][direction]
  return { x: x + dir[0], y: y + dir[1] }
}

interface CubePoint {
  x:number
  y: number
  z: number
}

function oddqToCube (hex:Point):CubePoint {
  var x = hex.x
  var z = hex.y - (hex.x - (hex.x & 1)) / 2
  var y = -x - z
  return { x, y, z }
}

function cubeDistance (a:CubePoint, b:CubePoint) : number {
  return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z)) / 2
}

export function offsetDistance (a:Point, b:Point):number {
  var ac = oddqToCube(a)
  var bc = oddqToCube(b)
  return cubeDistance(ac, bc)
}
