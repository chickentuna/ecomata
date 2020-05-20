import { Cell, World } from './World'
import { choice } from './utils'
import { HUMIDITY_SOURCE } from './properties'

const HUMIDITY_DISTANCE = 4

var currentNeighbours:Cell[] = []

function count (predicate: (c:Cell) => boolean): number {
  return currentNeighbours.filter(predicate).length
}

function countAnimals (name:string) {
  return count(c => c.animal === name)
}

export function countParam (key:string, name:string) {
  return count(c => c[key] === name)
}

export function surroundedBy (key:string, name:string) {
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

export function applyHumidity (cell:Cell, transform: TransformCollector) {
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
  let spawned = false
  Object.entries(ANIMALS).forEach(([id, animal]) => {
    const mates = countAnimals(id)
    const onPrey = animal.prey?.includes(cell.animal)
    const onEmpty = cell.animal == null
    const preyCount = animal.prey && count(c => animal.prey.includes(c.animal))
    const onHabitat = typeof animal.habitat === 'string' ? cell.type === animal.habitat : animal.habitat.includes(cell.type)

    if (mates === 2 && (onPrey || (onEmpty && onHabitat)) && ((preyCount == null) || (preyCount > 0))) {
      transform({ animal: id })
      spawned = true
    }
  })

  if (!spawned && cell.animal != null) {
    const animal = ANIMALS[cell.animal]
    const mates = countAnimals(cell.animal)
    const preyCount = animal.prey && count(c => animal.prey.includes(c.animal))

    if (preyCount != null && preyCount === 0) {
      transform({ animal: null })
    } else if (preyCount == null && mates < 2) {
      const predators = Object.entries(ANIMALS)
        .filter(([id, predator]) => predator.prey?.includes(cell.animal))
        .map(([id, predator]) => id)
      const predatorCount = count(c => predators.includes(c.animal))
      if (predatorCount > 0) {
        transform({ animal: null })
      } else {
        const onHabitat = typeof animal.habitat === 'string' ? cell.type === animal.habitat : animal.habitat.includes(cell.type)
        if (!onHabitat) {
          transform({ animal: null })
        }
      }
    } else {
      const onHabitat = typeof animal.habitat === 'string' ? cell.type === animal.habitat : animal.habitat.includes(cell.type)
      if (!onHabitat) {
        transform({ animal: null })
      }
    }
  }
}

interface Animal {
  prey?:string[],
  habitat: string|string[]
}

interface Contents {
  id: string,
  amount: number
}

interface Plant {
  spawn: (cell:Cell) => boolean,
  spawnCost: Contents
}

// TODO: how to despawn plants?
export const PLANTS:{[id:string]:Plant} = {
  tree: {
    spawn: (cell:Cell) => {
      return cell.type === 'earth' && cell.fertilizer === 1 && cell.humidity > 0
    },
    spawnCost: {
      id: 'fertilizer',
      amount: 1
    }
  },
  'palm tree': {
    spawn: (cell:Cell) => {
      return cell.type === 'sand' && cell.fertilizer === 1 && cell.humidity > 0
    },
    spawnCost: {
      id: 'fertilizer',
      amount: 1
    }
  }
}

export const ANIMALS:{[id:string]:Animal} = {
  fish: {
    habitat: 'ocean'
  },
  shark: {
    habitat: 'ocean',
    prey: ['fish']
  },
  crab: {
    habitat: 'sand'
  },
  octopus: {
    habitat: 'ocean',
    prey: ['crab']
  },
  bird: {
    habitat: ['rock', 'earth'],
    prey: ['crab', 'bug']
  },
  bug: {
    habitat: 'earth'
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
