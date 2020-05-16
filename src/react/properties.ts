export const BONE_MASS:{[index:string]:number} = {
  fish: 0.05,
  shark: 0.1
}

export const HUMIDITY_SOURCE:string[] = [
  'ocean'
]

// Maybe it should be more like this:
interface Tag{
  name: string,
  value?: any
}

const TAGS:{[index:string]:Tag[]} = {
  fish: [{
    name: 'bonesmass',
    value: 0.1
  }, {
    name: 'diet',
    value: { plantlife: 0.01 }
  }],
  ocean: [
    { name: 'humiditySource' }
  ]
}

// TODO: for animal death, maybe this is esiaer, doesnt feel like cellular automata though
const EATEN_BY = {
  fish: ['shark']
}

// maybe I can have constants for properties with values, like bonemass, but tags for the rest
const TAGS_2 = {
  ocean: ['humiditySource']
}
// It makes sense, but if I wanna add tags later, it makes things harder than just creating a new object.
