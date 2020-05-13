import { Cell } from './World'
import { hexToScreen, HEXAGON_RADIUS, HEXAGON_HEIGHT } from './hex'
import * as PIXI from 'pixi.js'

const COLOURS = {
  void: 0x0,
  ocean: 0x00295e
}

const DRAWN = {
  void: noop,
  ocean: drawHex
}

function noop () {}

function drawHex (cell, container) {
  const colour = COLOURS[cell.type]

  const hexaP = hexToScreen(cell)

  const g = new PIXI.Graphics()
  g.beginFill(colour, 1)
  g.lineStyle(1, 0x0, 1, 0)
  g.drawPolygon([
    -HEXAGON_RADIUS, 0,
    -HEXAGON_RADIUS / 2, HEXAGON_HEIGHT / 2,
    HEXAGON_RADIUS / 2, HEXAGON_HEIGHT / 2,
    HEXAGON_RADIUS, 0,
    HEXAGON_RADIUS / 2, -HEXAGON_HEIGHT / 2,
    -HEXAGON_RADIUS / 2, -HEXAGON_HEIGHT / 2
  ])
  g.endFill()

  g.position.set(hexaP.x, hexaP.y)
  container.addChild(g)
}

export class CellDrawer {
  static draw (cell: Cell, container: PIXI.Container) {
    const x = cell.x
    const y = cell.y

    const drawFunc = DRAWN[cell.type]
    drawFunc(cell, container)
  }
}
