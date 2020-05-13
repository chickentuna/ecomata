import React, { Component } from 'react'
import './App.scss'
import * as PIXI from 'pixi.js'
import { World } from './World'
import { HEXAGON_RADIUS, hexToScreen, HEXAGON_HEIGHT, HEXAGON_X_SEP } from './hex'
import { TooltipHandler } from './tooltip'
import { CellDrawer } from './CellDrawer'

const MS_PER_TICK = 1

class App extends Component {
  app: PIXI.Application
  world: World
  container: PIXI.Container
  time: number
  lastWorldTick: number
  worldContainer: PIXI.Container
  tooltip: TooltipHandler

  componentDidMount () {
    this.app = new PIXI.Application({
      width: 640,
      height: 480,
      antialias: true
    })
    document.querySelector('#canvas-zone').appendChild(this.app.view)

    this.app.ticker.add(this.animate.bind(this))

    this.initWorld()
    this.initUI()
    this.drawWorld()
    this.time = 0
    this.lastWorldTick = 0
  }

  initUI () {
    const tooltipHandler = new TooltipHandler(this.container, this.world)
    tooltipHandler.init()
    this.tooltip = tooltipHandler
  }

  initWorld () {
    this.container = new PIXI.Container()
    this.container.sortableChildren = true
    this.app.stage.addChild(this.container)
    this.container.position.set(30, 30)
    this.container.scale.set(2)

    this.world = new World()
    this.world.setup()
    this.worldContainer = new PIXI.Container()
    this.container.addChild(this.worldContainer)
  }

  drawWorld () {
    const world = this.world

    this.worldContainer.removeChildren()

    for (const cell of world.cells) {
      CellDrawer.draw(cell, this.worldContainer)
    }

    const g = new PIXI.Graphics()
    g.lineStyle(2, 0xFF0000, 1, 1)
    g.drawRect(0, 0, world.width * HEXAGON_X_SEP + HEXAGON_RADIUS / 2, (world.height + 0.5) * HEXAGON_HEIGHT)
    g.position.set(-HEXAGON_RADIUS, -HEXAGON_HEIGHT / 2)
    this.worldContainer.addChild(g)
  }

  animate () {
    const delta = this.app.ticker.deltaMS
    this.time += delta
    if (delta >= 100) {
      console.log('too slow!')

      return
    }
    if (this.time >= this.lastWorldTick + MS_PER_TICK) {
      this.world.tick()
      this.drawWorld()
      this.lastWorldTick = this.time
      this.tooltip.refresh()
    }
  }

  render () {
    return (
      <div className='App'>
        <header className='App-header'>
          <h1 className='App-header-title'>Ecomata</h1>
        </header>
        <div className='App-content'>

          <div id='canvas-zone' />

        </div>
      </div>
    )
  }
}

export default App
