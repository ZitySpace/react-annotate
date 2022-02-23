export interface Point {
  x: number
  y: number
}

export interface Dimension {
  w: number
  h: number
}

export interface Rect extends Point, Dimension {
  x1: number
  y1: number
}

export interface Line extends Point {
  _x: number
  _y: number
  distance: number
}
