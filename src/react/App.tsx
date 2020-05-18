import React, { Component } from 'react'
import './App.scss'
import * as PIXI from 'pixi.js'
import { World } from './World'
import { TooltipHandler } from './tooltip'
import { WorldDrawer } from './WorldDrawer'

const DEFAULT_MS_PER_TICK = 100

interface State {
  paused: boolean,
  msPerTick: number
}
interface Props {

}

class App extends Component<Props, State> {
  app: PIXI.Application
  world: World
  container: PIXI.Container
  time: number
  lastWorldTick: number
  worldDrawer: WorldDrawer
  tooltip: TooltipHandler
  state: State

  constructor (props: Props) {
    super(props)
    this.state = {
      paused: true,
      msPerTick: DEFAULT_MS_PER_TICK
    }
  }

  componentDidMount () {
    //TODO: do not used application as it eats up cpu even when game is paused
    this.app = new PIXI.Application({
      width: 640,
      height: 480,
      antialias: true
    })
    document.querySelector('#canvas-zone').appendChild(this.app.view)

    this.app.ticker.add(this.animate.bind(this))

    this.initWorld()
    this.initUI()
    this.worldDrawer.draw()
    this.launchTicker()
  }

  initUI () {
    const tooltipHandler = new TooltipHandler(this.container, this.worldDrawer.container, this.world)
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

    this.worldDrawer = new WorldDrawer()
    this.worldDrawer.init(this.world)
    this.container.addChild(this.worldDrawer.container)
  }

  launchTicker () {
    setTimeout(() => {
      if (!this.state.paused) {
        this.world.tick()
        this.worldDrawer.draw()
      }
      this.launchTicker()
    }, this.state.msPerTick)
  }

  animate () {
    const delta = this.app.ticker.deltaMS
    this.time += delta
    if (delta >= 100) {
      console.log('too slow!')
    }
  }

  handlePause () {
    this.setState({
      paused: !this.state.paused
    })
  }

  handleReset () {
    this.world.setup()
    this.worldDrawer.draw()
    this.setState({
      paused: true
    })
  }

  handleMsChange (value:string) {
    this.setState({ msPerTick: +value })
  }

  render () {
    return (
      <div className='App'>
        <header className='App-header'>
          <h1 className='App-header-title'>Ecomata</h1>
        </header>
        <div className='App-content'>

          <div id='canvas-zone' />
          <div id='controls'>
            <button onClick={() => this.handlePause()}>
              {this.state.paused ? 'Play' : 'Pause'}
            </button>
            <button onClick={() => this.handleReset()}>
              Reset
            </button>
            <label>ms per tick:
              <input type='number' value={this.state.msPerTick} step='10' onChange={(ev) => this.handleMsChange(ev.target.value)} />
            </label>
          </div>

        </div>
      </div>
    )
  }
}

export default App
