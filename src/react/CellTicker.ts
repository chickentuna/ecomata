import { Cell, World } from './World'
import { hexToScreen, HEXAGON_RADIUS, HEXAGON_HEIGHT } from './hex'
import * as PIXI from 'pixi.js'

export class CellTicker {
  static tick (cell: Cell, neighours: Cell[], world: World):Cell {
    if (cell.type === 'ocean') {
      const copy = { ...cell }
      copy.bacteria = Math.min(1, copy.bacteria + Math.random() / 10)
      return copy
    }
    return cell
  }
}
