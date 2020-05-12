interface Params {
  [key: string]: any
}

class Cell {
  params: Params
  x:number
  y:number

  constructor (x:number, y:number) {
    this.x = x
    this.y = y
    this.params = {}
  }
}

class World {
  width: number
  height: number
  cells: Cell[]

  constructor () {
    this.width = 10
    this.height = 10
    this.cells = []

    for (let y = 0; y < this.height; ++y) {
      for (let x = 0; x < this.width; ++x) {
        const cell = new Cell(x, y)
      }
    }
  }
}

export { Cell, World }
