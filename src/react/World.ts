import { oddqOffsetNeighbor } from './hex'
import { CellTicker } from './CellTicker'

export type Cell = {
  x:number
  y:number
  [key: string]: any
}

export class World {
  width: number
  height: number
  cells: Cell[]

  constructor () {
    this.width = 10
    this.height = 10
    this.cells = []

    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.width; ++x) {
        const cell = { x, y, type: 'void' }
        this.cells.push(cell)
      }
    }
  }

  get (x:number, y:number):Cell {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return null
    }
    return this.cells[y * this.height + x]
  }

  setup () {
    for (const cell of this.cells) {
      if ((cell.y === 0 && cell.x === 0) || (cell.y === this.height - 1 && cell.x === this.width - 1)) {
        continue
      }
      cell.type = 'ocean'
      cell.bacteria = 0
      cell.humiditySource = true
    }
  }

  getNeighbours (cell) {
    const result = []
    for (let d = 0; d < 6; ++d) {
      const coord = oddqOffsetNeighbor(cell.x, cell.y, d)
      const neigh = this.get(coord.x, coord.y)
      if (neigh != null) {
        result.push(neigh)
      }
    }
    return result
  }

  tick () {
    const newCells = []
    for (let idx = 0; idx < this.cells.length; ++idx) {
      const cell = this.cells[idx]
      const neighours = this.getNeighbours(cell)
      const newCell = CellTicker.tick(cell, neighours, this)
      newCells.push(newCell)
    }
    this.cells = newCells
  }
}
