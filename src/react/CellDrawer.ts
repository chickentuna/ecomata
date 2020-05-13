import { Cell } from './World'
import { hexToScreen, HEXAGON_RADIUS, HEXAGON_HEIGHT } from './hex'
import * as PIXI from 'pixi.js'

const COLOURS = {
  void: 0x0,
  ocean: 0x00295e,
  rock: 0xDCDCDC
}

const DRAWN = {
  void: noop,
  ocean: drawHex,
  rock: drawHex
}

const ANIMALS = {
  fish: '🐠',
  shark: '🦈'
}

function noop () {}

function drawHex (cell, container) {
  const group = new PIXI.Container()
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

  group.addChild(g)

  if (cell.animal) {
    const emoji = new PIXI.Text(ANIMALS[cell.animal], {
      fontSize: 24
    })
    emoji.scale.set(0.5)
    emoji.anchor.set(0.5)
    group.addChild(emoji)
  }

  group.position.set(hexaP.x, hexaP.y)
  container.addChild(group)
}

export class CellDrawer {
  static draw (cell: Cell, container: PIXI.Container) {
    const x = cell.x
    const y = cell.y

    const drawFunc = DRAWN[cell.type]
    drawFunc(cell, container)
  }
}
