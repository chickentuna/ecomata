import { Cell, World } from './World'
import { hexToScreen, HEXAGON_RADIUS, HEXAGON_HEIGHT } from './hex'
import * as PIXI from 'pixi.js'

function random (a, b) {
  return +(a + Math.random() * (b - a)).toFixed(3)
}

function count (neighbours: Cell[], predicate): number {
  return neighbours.filter(predicate).length
}

function increment (cell:Cell, key, amount:number) {
  cell[key] = +Math.min(1, (cell[key] || 0) + amount).toFixed(3)
}

function decrement (cell:Cell, key:string, amount:number) {
  cell[key] = +Math.max(0, (cell[key] || 0) - amount).toFixed(3)
}

var currentNeighbours = []

function countAnimals (name) {
  return count(currentNeighbours, c => c.animal === name)
}

export class CellTicker {
  static tick (cell: Cell, neighbours: Cell[], world: World):Cell {
    currentNeighbours = neighbours

    if (cell.type === 'ocean') {
      const copy = { ...cell }
      increment(copy, 'plantlife', random(0, 0.1))

      if (cell.animal == null && cell.plantlife > 0.5) {
        copy.animal = 'fish'
      }

      if (cell.animal === 'fish' && cell.plantlife < 0.1) {
        copy.animal = null
      }

      if (cell.animal === 'fish' && cell.plantlife >= 0.1) {
        decrement(copy, 'plantlife', random(0.01, 0.2))
      }

      if (cell.animal == null && countAnimals('fish') > 3) {
        copy.animal = 'shark'
      }

      if (
        cell.animal === 'fish' &&
        countAnimals('shark') > 0 &&
        countAnimals('fish') === 0
      ) {
        copy.animal = null
        increment(copy, 'bones', 0.05)
      }

      if (cell.animal === 'shark' && countAnimals('fish') === 0) {
        copy.animal = null
        increment(copy, 'bones', 0.1)
      }

      if (cell.bones === 1) {
        copy.type = 'rock'
        copy.animal = null
      }

      return copy
    }

    return cell
  }
}
