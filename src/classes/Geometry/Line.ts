import { Point } from './Point'

export interface Line extends Point {
  _x: number
  _y: number
}

export class Line {
  /**
   *
   * @param args [x, y, (_x || x), (_y || y)]
   */
  constructor(...args: number[]) {
    this.x = args[0]
    this.y = args[1]
    this._x = args[2] || args[0]
    this._y = args[3] || args[1]
  }

  /**
   *
   * @param ratio zoom ratio
   */
  zoom(ratio: number): Line {
    this.x *= ratio
    this.y *= ratio
    this._x *= ratio
    this._y *= ratio
    return this
  }

  /**
   *
   * @param coefficient coefficient
   * @returns
   */
  translate(offset: Point): Line {
    this.x += offset.x
    this.y += offset.y
    this._x += offset.x
    this._y += offset.y
    return this
  }

  /**
   *  Get the length of the line
   * @returns this Line's length
   */
  getLength(): number {
    return Math.sqrt(
      Math.pow(this.x - this._x, 2) + Math.pow(this.y - this._y, 2)
    )
  }
}