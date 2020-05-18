import { Cell, World } from './World'
import { choice } from './utils'
import { BONE_MASS, HUMIDITY_SOURCE } from './properties'
import { interaction } from 'pixi.js'

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

function surroundedBy (key:string, name:string) {
  return currentNeighbours.every(c => c[key] === name)
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
type TransformCollector = (changes: Changes, opts?: TransformOpts) => void

function applyHumidity (cell:Cell, transform: TransformCollector) {
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
}

function apply (cell:Cell, transform:TransformCollector) {
  for (const animal of ANIMALS) {

  }

  applyHumidity(cell, transform)
}

interface Animal {
  spawn: (cell:Cell) => boolean,
  id: string,
  predators?: string[],
  consume?: Contents,
  dropOnDeath?: Contents,
  prey?:string[] // Not necassarily equal to the concerned animals' predators
}

interface Contents {
  id: string,
  amount: number
}

interface Plant {
  id: string,
  spawnFor: Contents
}

// TODO: how to despawn plants?
export const PLANTS:Plant[] = [
  {
    id: 'tree',
    spawnFor: {
      id: 'fertilizer',
      amount: 1
    }

  }
]

export const ANIMALS:Animal[] = [
  {
    id: 'fish',
    spawn: (cell:Cell) => {
      return cell.type === 'ocean' && cell.plantlife > 0.5 && count(c => c.type !== 'ocean') <= 1
    },
    predators: ['shark'],
    consume: {
      id: 'plantlife',
      amount: 0.2
    },
    dropOnDeath: {
      id: 'bonemass',
      amount: 0.05
    }
  },
  {
    id: 'shark',
    spawn: (cell:Cell) => {
      return (cell.type === 'ocean' && countAnimals('fish') > 3 && surroundedBy('type', 'ocean'))
    },
    prey: ['fish'],
    dropOnDeath: {
      id: 'bones',
      amount: 0.1
    }
  }
]

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
