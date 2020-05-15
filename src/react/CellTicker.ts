import { Cell, World } from './World'
import { hexToScreen, HEXAGON_RADIUS, HEXAGON_HEIGHT } from './hex'
import * as PIXI from 'pixi.js'
import { choice } from './utils'

const NO_RANDOM = true

function count (neighbours: Cell[], predicate): number {
  return neighbours.filter(predicate).length
}

var currentNeighbours = []

function countAnimals (name) {
  return count(currentNeighbours, c => c.animal === name)
}

// TODO: a property mapper object to add qualities to other cells with a given property.
// E.G. I add the 'wet' property to ocean and lake. Or 'herbivore' to rabbit and chicken.
// these properties do not change, they are tied to the mapped property.
// Example below.
const BONE_MASS = {
  fish: 0.05,
  shark: 0.1
}
// Now i can react to presence of bones in an animal (weird example)

interface Changes {
  [key:string]:number|string|null
}
interface TransformOpts {
  replace?: boolean
}

function apply (cell, transform:(changes: Changes, opts?: TransformOpts) => void) {
  if (cell.type === 'ocean') {
    transform({ plantlife: 0.1 })

    if (cell.animal == null && cell.plantlife > 0.5) {
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
  }
}

export class CellTicker {
  static tick (cell: Cell, neighbours: Cell[], world: World):Cell {
    currentNeighbours = neighbours
    var transforms = []
    const accumulator = (changes, opts) => {
      transforms.push({ changes, ...opts })
    }
    apply(cell, accumulator)

    if (transforms.length > 0) {
      // pick a transform
      const transform = choice(transforms)
      // debugger
      if (transform.replace) {
        return {
          ...transform.changes,
          x: cell.x,
          y: cell.y
        }
      }
      const copy = { ...cell }
      for (const key in transform.changes) {
        const value = transform.changes[key]
        if (typeof value === 'number') {
          copy[key] = +Math.max(0, Math.min(1, (cell[key] || 0) + value)).toFixed(3)
        } else {
          copy[key] = value
        }
      }
      return copy
    }

    return cell
  }
}
