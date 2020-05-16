import * as PIXI from 'pixi.js'
import { World, Cell } from './World'
import { HEXAGON_X_SEP, HEXAGON_RADIUS, HEXAGON_HEIGHT, hexToScreen } from './hex'

interface Hex {
  group: PIXI.Container,
  ground: PIXI.Graphics,
  text: PIXI.Text,
  subText: PIXI.Text
}

const COLOURS:{
  [index:string]: number
} = {
  void: 0x0,
  ocean: 0x00295e,
  rock: 0xDCDCDC,
  sand: 0xEFDD6F,
  earth: 0x007f1a

}

const ANIMALS:{
  [index:string]:string
} = {
  fish: '🐠',
  shark: '🦈',
  monkey: '🐒',
  gorilla: '🦍',
  dog: '🐕',
  poodle: '🐩',
  wolf: '🐺',
  fox: '🦊',
  raccoon: '🦝',
  cat: '🐈',
  lion: '🦁',
  tiger: '🐅',
  leopard: '🐆',
  horse: '🐎',
  unicorn: '🦄',
  zebra: '🦓',
  deer: '🦌',
  ox: '🐂',
  'water buffalo': '🐃',
  cow: '🐄',
  pig: '🐖',
  boar: '🐗',
  ram: '🐏',
  sheep: '🐑',
  goat: '🐐',
  camel: '🐪',
  llama: '🦙',
  giraffe: '🦒',
  elephant: '🐘',
  rhinoceros: '🦏',
  hippopotamus: '🦛',
  mouse: '🐁',
  rat: '🐀',
  rabbit: '🐇',
  chipmunk: '🐿',
  hedgehog: '🦔',
  bat: '🦇',
  bear: '🐻',
  koala: '🐨',
  panda: '🐼',
  kangaroo: '🦘',
  badger: '🦡',
  turkey: '🦃',
  chicken: '🐔',
  rooster: '🐓',
  'baby chick': '🐤',
  bird: '🐦',
  penguin: '🐧',
  eagle: '🦅',
  duck: '🦆',
  swan: '🦢',
  owl: '🦉',
  peacock: '🦚',
  parrot: '🦜',
  frog: '🐸',
  crocodile: '🐊',
  turtle: '🐢',
  lizard: '🦎',
  snake: '🐍',
  dragon: '🐉',
  sauropod: '🦕',
  't-rex': '🦖',
  whale: '🐳',
  dolphin: '🐬',
  tuna: '🐟',
  blowfish: '🐡',
  octopus: '🐙',
  'spiral shell': '🐚',
  snail: '🐌',
  butterfly: '🦋',
  bug: '🐛',
  ant: '🐜',
  honeybee: '🐝',
  'lady beetle': '🐞',
  cricket: '🦗',
  spider: '🕷',
  'spider web': '🕸',
  scorpion: '🦂',
  mosquito: '🦟',
  microbe: '🦠',
  crab: '🦀',
  lobster: '🦞',
  shrimp: '🦐',
  squid: '🦑'
}

const PLANTS:{
  [index:string]:string
} = {
  bouquet: '💐',
  'cherry blossom': '🌸',
  'white flower': '💮',
  rosette: '🏵',
  rose: '🌹',
  'wilted flower': '🥀',
  hibiscus: '🌺',
  sunflower: '🌻',
  blossom: '🌼',
  tulip: '🌷',
  seedling: '🌱',
  pine: '🌲',
  tree: '🌳',
  'palm tree': '🌴',
  cactus: '🌵',
  'sheaf of rice': '🌾',
  herb: '🌿',
  'four leaf clover': '🍀',
  mushroom: '🍄',
  chestnut: '🌰'
}

export class WorldDrawer {
  world: World
  hexes: Hex[]
  container: PIXI.Container

  init (world: World) {
    this.hexes = []
    this.world = world
    const container = new PIXI.Container()

    for (const cell of world.cells) {
      const hexaP = hexToScreen(cell)
      const hex: Hex = {
        group: new PIXI.Container(),
        ground: new PIXI.Graphics(),
        subText: new PIXI.Text('', {
          fontSize: 20
        }),
        text: new PIXI.Text('', {
          fontSize: 24
        })
      }

      hex.text.scale.set(0.5)
      hex.text.anchor.set(0.5)
      hex.subText.scale.set(0.4)
      hex.subText.anchor.set(0.5, 0)

      hex.group.position.set(hexaP.x, hexaP.y)

      hex.group.addChild(hex.ground, hex.text)
      container.addChild(hex.group)

      this.hexes.push(hex)
    }
    const g = new PIXI.Graphics()
    g.lineStyle(2, 0xFF0000, 1, 1)
    g.drawRect(0, 0, world.width * HEXAGON_X_SEP + HEXAGON_RADIUS / 2, (world.height + 0.5) * HEXAGON_HEIGHT)
    g.position.set(
      -HEXAGON_RADIUS, -HEXAGON_HEIGHT / 2
    )
    container.addChild(g)

    return container
  }

  drawHex (cell:Cell) {
    const colour:number = COLOURS[cell.type]
    // debugger
    const hex = this.hexes[cell.index]

    const g = hex.ground
    g.clear()
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

    if (cell.animal) {
      const emoji = ANIMALS[cell.animal]
      hex.text.text = emoji
    } else {
      hex.text.text = ''
    }

    if (cell.plant) {
      const emoji = PLANTS[cell.animal]
      hex.subText.text = emoji
    } else {
      hex.subText.text = ''
    }
  }

  draw () {
    for (const cell of this.world.cells) {
      if (cell.type !== 'void') {
        this.drawHex(cell)
      }
    }
  }
}
