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

  /**
   *
   * @param ratio zoom ratio
   * @returns this
   */
  zoom(ratio: number): Point {
    this.x *= ratio
    this.y *= ratio
    return this
  }

  /**
   *
   * @param coefficient coefficient
   * @returns
   */
  translate(offset: Point): Point {
    this.x += offset.x
    this.y += offset.y
    return this
  }

  /**
   * For origin reversal
   * @returns this Point
   */
  inverse(): Point {
    return new Point(-this.x, -this.y)
  }
}
