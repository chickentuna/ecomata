export interface Point {
  x:number,
  y:number
}

export function randint (a:number, b:number):number {
  return Math.floor(a + Math.random() * (b - a))
}

export function choice <T> (arr:T[]):T {
  if (arr.length === 1) {
    return arr[0]
  }
  return arr[randint(0, arr.length)]
}
