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
  Object.entries(ANIMALS).forEach(([id, animal]) => {
    if (animal.spawn(cell)) {
      transform({ animal: id })
    }
  })

  if (cell.animal != null) {
    const animal = ANIMALS[cell.animal]
    if (animal.die(cell)) {
      transform({ animal: null })
    }
    // if (animal.predators) {
    //   const predatorCount = count(c => animal.predators.includes(c.animal))
    //   if (predatorCount > 0) {
    //     transform({ animal: null })
    //   }
    // }
    // if (animal.prey) {
    //   const preyCount = count(c => animal.prey.includes(c.animal))
    //   const competitionCount = countAnimals(cell.animal)
    //   if (preyCount === 0) {
    //     // Starve
    //     transform({ animal: null })
    //   }
    // }
  }
  if (cell.plant == null) {
    Object.entries(PLANTS).forEach(([id, plant]) => {
      if (plant.spawn(cell)) {
        transform({
          plant: id,
          [plant.spawnCost.id]: -plant.spawnCost.amount
        })
      }
    })
  }

  applyHumidity(cell, transform)

  if (cell.type === 'ocean') {
    if (cell.bones === 1) {
      transform({ type: 'rock' }, { replace: true })
    }

    if (countParam('type', 'rock') >= 1) {
      transform({ type: 'sand' }, { replace: true })
    }
  } else if (cell.type === 'sand') {
    if (cell.humidity <= HUMIDITY_DISTANCE - 2) {
      transform({ type: 'earth' }, { replace: true })
    }
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
      return cell.animal == null && cell.type === 'ocean' && countAnimals('fish') === 2
    },
    predators: ['shark'],
    die: (cell:Cell) => {
      // const predatorCount = count(c => this.predators.includes(c.animal))
      // if (predatorCount > 0) {
      //   return true
      // }
      // return false
      const fishCount = countAnimals('fish')
      return fishCount <= 1 || fishCount >= 3
    }

  },
  shark: {
    spawn: (cell:Cell) => {
      return (
        (cell.animal === 'fish' && cell.type === 'ocean' && countAnimals('shark') === 2)
      )
    },
    die: (cell:Cell) => {
      // const preyCount = count(c => this.prey.includes(c.animal))
      // const competitionCount = countAnimals(cell.animal)
      // if (preyCount === 0) {
      //   return true
      // }
      // return false
      const fishCount = countAnimals('shark')
      return fishCount <= 1 || fishCount >= 3
    },
    prey: ['fish']
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
