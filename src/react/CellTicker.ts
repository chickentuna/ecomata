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
  // Object.entries(ANIMALS).forEach(([id, animal]) => {
  //   if (animal.spawn(cell)) {
  //     transform({ animal: id })
  //   }
  // })

  // if (cell.animal != null) {
  //   const animal = ANIMALS[cell.animal]
  //   if (animal.die(cell)) {
  //     transform({ animal: null })
  //   }
  // }
  if (cell.x == 26 && cell.y == 4 && cell.animal == 'shark') {
    // debugger
  }
  if (countAnimals('shark') === 2 && (cell.animal === 'fish' || cell.animal == null) && countAnimals('fish') > 0) {
    transform({ animal: 'shark' })
  } else if (countAnimals('fish') === 2 && (cell.animal == null)) {
    transform({ animal: 'fish' })
  } else if (cell.animal === 'fish' && countAnimals('fish') < 2) {
    transform({ animal: null })
  } else if ((cell.animal === 'shark' && countAnimals('shark') !== 2 && countAnimals('fish') === 0) || countAnimals('fish') === 0) {
    transform({ animal: null })
  }
}

interface Animal {
  spawn: (cell:Cell) => boolean
  die: (cell:Cell) => boolean
  predators?: string[]
  prey?:string[] // Not necassarily equal to the concerned animals' predators
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
    spawn: (cell:Cell) => {
      return cell.animal == null && cell.type === 'ocean' && countAnimals('fish') === 2 // && countAnimals('shark') === 0
    },
    die: (cell:Cell) => {
      const fishCount = countAnimals('fish')
      return fishCount <= 1 || countAnimals('shark') > 0
    }

  },
  shark: {
    spawn: (cell:Cell) => {
      const preyCount = countAnimals('fish')

      return (
        preyCount > 0 && (cell.animal == null || cell.animal === 'fish') && cell.type === 'ocean' && countAnimals('shark') === 2
      )
    },
    die: (cell:Cell) => {
      const shark = countAnimals('shark')
      return (shark <= 1 || shark >= 3) && countAnimals('fish') === 0
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
