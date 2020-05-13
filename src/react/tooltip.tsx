import * as PIXI from 'pixi.js'
import { World } from './World'
import { hexToScreen, screenToHex } from './hex'

function getSpriteMouseMoveFunc (entity, tooltip) {
  return function (event) {
    if (entity.graphics.containsPoint(event.data.global)) {
      tooltip.inside[entity.id] = true
    } else {
      delete tooltip.inside[entity.id]
    }
  }
}

function getEntityCurrentSubStates (entity, frame) {
  if (entity.states[frame]) {
    return entity.states[frame]
  }
  const frameNumbers = Object.keys(entity.states)
  let index = frameNumbers.length - 1

  while (index >= 0 && frameNumbers[index] > frame) {
    index--
  }
  return entity.states[frameNumbers[index]] || []
}

function convertPosition (pos, globalData) {
  return {
    x: (pos.x - globalData.x) / (globalData.coefficient * globalData.cellSize),
    y: (pos.y - globalData.y) / (globalData.coefficient * globalData.cellSize)
  }
}

function getMouseMoveFunc (tooltip: PIXI.Container, container: PIXI.Container, handler: TooltipHandler) {
  return function (ev) {
    if (tooltip) {
      var pos = ev.data.getLocalPosition(container)
      tooltip.x = pos.x
      tooltip.y = pos.y

      const hexCoords = screenToHex(pos)

      const tooltipBlocks = []

      if (hexCoords.y >= 0 && hexCoords.x >= 0 && hexCoords.x < handler.world.width && hexCoords.y < handler.world.height) {
        const x = hexCoords.x
        const y = hexCoords.y

        const tooltipBlock = 'x: ' + x + '\ny: ' + y
        tooltipBlocks.push(tooltipBlock)
      }

      tooltip.visible = tooltipBlocks.length > 0
      if (tooltip.visible) {
        handler.label.text = tooltipBlocks.join('\n──────────\n')
      }

      handler.background.width = handler.label.width + 20
      handler.background.height = handler.label.height + 20

      tooltip.pivot.x = -30
      tooltip.pivot.y = -50

      if (tooltip.y - tooltip.pivot.y + tooltip.height > container.width) {
        tooltip.pivot.y = 10 + tooltip.height
        tooltip.y -= tooltip.y - tooltip.pivot.y + tooltip.height - container.height
      }

      if (tooltip.x - tooltip.pivot.x + tooltip.width > container.width) {
        tooltip.pivot.x = tooltip.width
      }
    }
  }
};

export class TooltipHandler {
  container: PIXI.Container
  tooltip: PIXI.Container
  background: PIXI.Graphics
  label: PIXI.Text
  world: World

  constructor (container, world) {
    this.container = container
    this.world = world
  }

  init () {
    this.initTooltip()
    this.container.interactive = true
    this.container.on('mousemove', getMouseMoveFunc(this.tooltip, this.container, this))
    this.container.addChild(this.tooltip)
    this.tooltip.zIndex = 100
  }

  generateText (text, size, color, align): PIXI.Text {
    var textEl = new PIXI.Text(text, {
      fontSize: Math.round(size / 1.2) + 'px',
      fontFamily: 'Lato',
      fontWeight: 'bold',
      fill: color
    })

    if (align === 'right') {
      textEl.anchor.x = 1
    } else if (align === 'center') {
      textEl.anchor.x = 0.5
    }

    return textEl
  };

  initTooltip () {
    var tooltip = new PIXI.Container()
    var background = new PIXI.Graphics()
    var label = this.generateText('', 36, 0xFFFFFF, 'left')

    this.tooltip = tooltip
    this.background = background
    this.label = label

    background.beginFill(0x0, 0.7)
    background.drawRect(0, 0, 100, 90)
    background.endFill()
    background.x = -10
    background.y = -10

    tooltip.visible = false

    tooltip.addChild(background)
    tooltip.addChild(label)

    tooltip.scale.set(0.25)

    tooltip.interactiveChildren = false
    return tooltip
  };
}
