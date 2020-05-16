export interface Point {
  x:number,
  y:number
}

export function randint (a:number, b:number):number {
  return Math.floor(a + Math.random() * (b - a))
}

export function choice <T> (arr:T[]):T {
  return arr[randint(0, arr.length)]
}
