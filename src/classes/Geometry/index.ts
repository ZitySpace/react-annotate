export interface Point {
  x: number
  y: number
}

export class Point implements Point {
  /**
   *
   * @param x x_coordinate default 0
   * @param y y_coordinate default 0
   */
  constructor(x: number = 0, y: number = 0) {
    this.x = x
    this.y = y
  }
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
