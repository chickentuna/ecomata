import { oddqOffsetNeighbor } from './hex'
import { CellTicker } from './CellTicker'
import { Point } from './utils'

export type Cell = {
  x:number
  y:number
  [key: string]: any
}

export class World {
  width: number
  height: number
  cells: Cell[]
  neighbourMap: {[key:string]:number[]}

  constructor () {
    this.width = 10
    this.height = 10
    this.neighbourMap = {}
    this.initGrid()
  }

  initGrid () {
    this.cells = []
    let index = 0
    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.width; ++x) {
        const cell = { type: 'void', x, y, index: index++ }
        this.cells.push(cell)
      }
    }

    for (const cell of this.cells) {
      this.neighbourMap[cell.index] = this.getNeighbourIndices(cell)
    }
  }

  get (x:number, y:number):Cell {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return null
    }
    return this.cells[y * this.height + x]
  }

  setup () {
    this.initGrid()
    for (const cell of this.cells) {
      if ((cell.y === 0 && cell.x === 0) || (cell.y === this.height - 1 && cell.x === this.width - 1)) {
        continue
      }
      if (cell.x === this.width - 1 && cell.y === 1) {
        cell.animal = 'fish'
      }
      cell.type = 'ocean'
    }
  }

  getNeighbourIndices (hex:Point): number[] {
    const result = []
    for (let d = 0; d < 6; ++d) {
      const coord = oddqOffsetNeighbor(hex.x, hex.y, d)
      const neigh = this.get(coord.x, coord.y)
      if (neigh != null) {
        result.push(neigh.index)
      }
    }
    return result
  }

  getNeighbours (cell: Cell):Cell[] {
    const res = []
    for (const idx of this.neighbourMap[cell.index]) {
      const neigh = this.cells[idx]
      if (neigh.type !== 'void') {
        res.push(neigh)
      }
    }
    return res
  }

  tick () {
    const newCells = []
    for (const cell of this.cells) {
      if (cell.type === 'void') {
        newCells.push(cell)
        continue
      }
      const neighours = this.getNeighbours(cell)
      const newCell = CellTicker.tick(cell, neighours, this)
      newCells.push(newCell)
    }
    this.cells = newCells
  }
}
