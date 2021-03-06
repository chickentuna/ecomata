import * as PIXI from 'pixi.js'
import { World } from './World'
import { screenToHex } from './hex'
import { HEIGHT, WIDTH } from './App'

function generateText (text:string, size:number, color:number|string, align:string): PIXI.Text {
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
}

function initTooltip (): PIXI.Container {
  var tooltip = new PIXI.Container()
  var background = new PIXI.Graphics()
  var label = generateText('', 36, 0xFFFFFF, 'left')

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

  tooltip.scale.set(0.5)

  tooltip.interactiveChildren = false
  return tooltip
}

export class TooltipHandler {
  container: PIXI.Container
  worldContainer: PIXI.Container
  tooltip: PIXI.Container
  background: PIXI.Graphics
  label: PIXI.Text
  world: World
  mouseData: PIXI.interaction.InteractionData

  constructor (container:PIXI.Container, worldContainer:PIXI.Container, world:World) {
    this.container = container
    this.worldContainer = worldContainer
    this.world = world
  }

  init () {
    initTooltip.bind(this)()
    this.worldContainer.interactive = true
    this.worldContainer.on('mousemove', (ev:PIXI.interaction.InteractionEvent) => {
      this.mouseData = ev.data
      this.refresh()
    })
    this.container.addChild(this.tooltip)
    this.tooltip.zIndex = 100
  }

  refresh () {
    const tooltip = this.tooltip

    if (this.mouseData) {
      var pos = this.mouseData.getLocalPosition(this.worldContainer)

      tooltip.x = pos.x * this.worldContainer.scale.x
      tooltip.y = pos.y * this.worldContainer.scale.y

      const hexCoords = screenToHex(pos)

      const cell = this.world.get(hexCoords.x, hexCoords.y)

      const tooltipBlocks = []

      if (cell != null) {
        const params = []
        for (const key in cell) {
          if (cell[key] != null) {
            params.push(`${key}: ${cell[key]}`)
          }
        }
        tooltipBlocks.push(params.join('\n'))
      } else if (hexCoords.y >= 0 && hexCoords.x >= 0 && hexCoords.x < this.world.width && hexCoords.y < this.world.height) {
        const x = hexCoords.x
        const y = hexCoords.y

        const tooltipBlock = 'x: ' + x + '\ny: ' + y
        tooltipBlocks.push(tooltipBlock)
      }

      tooltip.visible = tooltipBlocks.length > 0
      if (tooltip.visible) {
        this.label.text = tooltipBlocks.join('\n──────────\n')
      }

      this.background.width = this.label.width + 20
      this.background.height = this.label.height + 20

      tooltip.pivot.x = -30
      tooltip.pivot.y = -50

      const offY = Math.max(0, tooltip.y + 50 + tooltip.height - HEIGHT)
      tooltip.pivot.y += offY * this.worldContainer.scale.y

      const offX = Math.max(0, tooltip.x + 50 + tooltip.width - WIDTH)
      tooltip.pivot.x += offX * this.worldContainer.scale.x
    }
  }
}
