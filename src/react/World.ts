import { oddqOffsetNeighbor } from './hex'
import { CellTicker } from './CellTicker'
import { Point } from './utils'

export type Cell = {
  x:number
  y:number
  [key: string]: any
}

function key (point:Point) {
  return `${point.x} ${point.y}`
}

export class World {
  width: number
  height: number
  cells: Cell[]
  neighbourMap: {[key:string]:Point[]}

  constructor () {
    this.width = 10
    this.height = 10
    this.cells = []
    this.neighbourMap = {}

    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.width; ++x) {
        const cell = { x, y, type: 'void' }
        this.cells.push(cell)
      }
    }

    for (const cell of this.cells) {
      this.neighbourMap[key(cell)] = this.getNeighbourCoords(cell)
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
      if (cell.x === this.width - 1 && cell.y === 1) {
        cell.animal = 'fish'
      }
      cell.type = 'ocean'
      cell.plantlife = 0
      cell.humiditySource = true
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
    return this.neighbourMap[key(cell)].map(point => this.get(point.x, point.y))
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
