import React, { Component } from 'react'
import './App.scss'
import * as PIXI from 'pixi.js'
import { World } from './World'

interface Point {
  x:number,
  y:number
}

var HEXAGON_WIDTH = 20
var HEXAGON_RADIUS = HEXAGON_WIDTH / 2
var HEXAGON_HEIGHT = HEXAGON_RADIUS * Math.sqrt(3)
var HEXAGON_X_SEP = HEXAGON_RADIUS * 3 / 2

function screenToHex (p:Point): Point {
  var xIdx = Math.round(p.x / (HEXAGON_RADIUS * (3 / 2)))
  const x = xIdx * (HEXAGON_RADIUS * (3 / 2))
  let y
  if (xIdx % 2) {
    y = Math.floor(p.y / (HEXAGON_HEIGHT)) * HEXAGON_HEIGHT + HEXAGON_HEIGHT / 2
  } else {
    y = Math.round(p.y / (HEXAGON_HEIGHT)) * HEXAGON_HEIGHT
  }

  return { x, y }
}

function hexToScreen (p:Point): Point {
  var x = HEXAGON_RADIUS * 3 / 2 * p.x
  var y = HEXAGON_HEIGHT * (p.y + 0.5 * (p.x & 1))
  return { x, y }
}

class App extends Component {
  app: PIXI.Application
  world: World
  container: PIXI.Container

  componentDidMount () {
    this.app = new PIXI.Application({
      width: 640,
      height: 480,
      antialias: true
    })
    document.querySelector('#canvas-zone').appendChild(this.app.view)

    this.app.ticker.add(this.animate)

    this.initWorld()
  }

  initWorld () {
    this.container = new PIXI.Container()
    this.app.stage.addChild(this.container)
    this.container.position.set(30, 30)

    this.world = new World()
    this.drawWorld()
  }

  drawWorld () {
    const world = this.world
    const app = this.app

    for (let y = 0; y < world.height; ++y) {
      for (let x = 0; x < world.width; ++x) {
        var hexaP = hexToScreen({
          x, y
        })

        const g = new PIXI.Graphics()
        g.beginFill(0x00FF00, 1)
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
        console.log(hexaP)
        g.position.set(hexaP.x, hexaP.y)
        this.container.addChild(g)
      }
    }
    const g = new PIXI.Graphics()
    g.lineStyle(2, 0xFF0000, 1, 1)
    g.drawRect(0, 0, world.width * HEXAGON_X_SEP + HEXAGON_RADIUS / 2, (world.height + 0.5) * HEXAGON_HEIGHT)
    g.position.set(-HEXAGON_RADIUS, -HEXAGON_HEIGHT / 2)
    this.container.addChild(g)
    this.container.scale.set(2)
  }

  animate (delta) {

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
