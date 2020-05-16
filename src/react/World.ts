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
  neighbourMap: {[key:string]:Point[]}

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
        const cell = { x, y, index: index++, type: 'void' }
        this.cells.push(cell)
      }
    }

    for (const cell of this.cells) {
      this.neighbourMap[cell.index] = this.getNeighbourCoords(cell)
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

  getNeighbourCoords (hex:Point): Point[] {
    const result = []
    for (let d = 0; d < 6; ++d) {
      const coord = oddqOffsetNeighbor(hex.x, hex.y, d)
      const neigh = this.get(coord.x, coord.y)
      if (neigh != null) {
        result.push(coord)
      }
    }
    return result
  }

  getNeighbours (cell: Cell):Cell[] {
    const res = []
    for (const point of this.neighbourMap[cell.index]) {
      const cell = this.get(point.x, point.y)
      if (cell != null && cell.type !== 'void') {
        res.push(cell)
      }
    }
    return res
  }

  tick () {
    const newCells = []
    for (const cell of this.cells) {
      if (cell.type === 'void') {
        continue
      }
      const neighours = this.getNeighbours(cell)
      const newCell = CellTicker.tick(cell, neighours, this)
      newCells.push(newCell)
    }
    this.cells = newCells
  }
}
