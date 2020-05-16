import { Cell, World } from './World'
import { choice } from './utils'
import { BONE_MASS, HUMIDITY_SOURCE } from './properties'

const HUMIDITY_DISTANCE = 4

var currentNeighbours:Cell[] = []

function count (predicate: (c:Cell) => boolean): number {
  return currentNeighbours.filter(predicate).length
}

function countAnimals (name:string) {
  return count(c => c.animal === name)
}

function countParam (key:string, name:string) {
  return count(c => c[key] === name)
}

interface Changes {
  [key:string]:number|string|null
}
interface TransformOpts {
  replace?: boolean,
  set?: boolean
}
interface Transform {
  changes: Changes,
  opts?: TransformOpts
}

function apply (cell:Cell, transform:(changes: Changes, opts?: TransformOpts) => void) {
  if (cell.type === 'ocean') {
    transform({ plantlife: 0.1 })

    if (cell.animal == null && cell.plantlife > 0.5 && count(c => c.type !== 'ocean') <= 1) {
      transform({ animal: 'fish' })
    }

    if (cell.animal === 'fish' && cell.plantlife < 0.1) {
      transform({ animal: null, bones: +BONE_MASS[cell.animal] })
    }

    if (cell.animal === 'fish' && cell.plantlife >= 0.1) {
      transform({ plantlife: -0.2 })
    }

    if (cell.animal == null && countAnimals('fish') > 3) {
      transform({ animal: 'shark' })
    }

    if (cell.animal === 'fish' &&
      countAnimals('shark') > 0 &&
      countAnimals('fish') === 0
    ) {
      transform({ animal: null, bones: +BONE_MASS[cell.animal] })
    }

    if (cell.animal === 'shark' && countAnimals('fish') === 0) {
      transform({ animal: null, bones: +BONE_MASS[cell.animal] })
    }

    if (cell.bones === 1) {
      transform({ type: 'rock' }, { replace: true })
    }

    if (countParam('type', 'rock') >= 1) {
      transform({ type: 'sand' }, { replace: true })
    }
  }

  if (!HUMIDITY_SOURCE.includes(cell.type)) {
    const humdityScore = Math.max(...currentNeighbours.map(
      c => {
        if (HUMIDITY_SOURCE.includes(c.type)) {
          return HUMIDITY_DISTANCE
        }
        return c.humidity || 0
      }
    ))
    transform({ humidity: Math.max(0, humdityScore - 1) }, { set: true })
  }

  if (cell.type === 'sand') {
    if (cell.humidity <= HUMIDITY_DISTANCE - 2) {
      transform({ type: 'earth' }, { replace: true })
    }
  }
}

export class CellTicker {
  static tick (cell: Cell, neighbours: Cell[], world: World):Cell {
    currentNeighbours = neighbours
    var transforms:Transform[] = []
    const accumulator = (changes:Changes, opts:TransformOpts) => {
      transforms.push({ changes, opts })
    }
    apply(cell, accumulator)

    if (transforms.length > 0) {
      // pick a transform
      const transform = choice(transforms)

      if (transform.opts?.replace) {
        return {
          ...transform.changes,
          x: cell.x,
          y: cell.y,
          index: cell.index
        }
      }
      const copy = { ...cell }
      for (const key in transform.changes) {
        const value = transform.changes[key]
        if (typeof value === 'number' && !transform.opts?.set) {
          copy[key] = Math.max(0, Math.min(1, (cell[key] || 0) + value))
        } else {
          copy[key] = value
        }
      }
      return copy
    }

    return cell
  }
}
