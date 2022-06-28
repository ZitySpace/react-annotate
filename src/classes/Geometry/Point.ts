export interface Point {
  x: number;
  y: number;
}

export class Point implements Point {
  /**
   *
   * @param x x_coordinate default 0
   * @param y y_coordinate default 0
   */

  constructor(x: number, y: number);
  constructor(o?: { x: number; y: number });
  constructor(o: number | { x: number; y: number } = 0, y: number = 0) {
    if (typeof o !== 'number') {
      const { x, y } = o;
      this.x = x;
      this.y = y;
    } else {
      this.x = o;
      this.y = y;
    }
  }

  /**
   *
   * @param ratio zoom ratio
   * @returns this
   */
  zoom(ratio: number): Point {
    this.x *= ratio;
    this.y *= ratio;
    return this;
  }

  /**
   *
   * @param offset
   * @returns
   */
  translate(offset: Point): Point {
    this.x += offset.x;
    this.y += offset.y;
    return this;
  }

  /**
   * For origin reversal
   * @returns this Point
   */
  inverse(): Point {
    return new Point(-this.x, -this.y);
  }

  /**
   * Get the distance of this point from another point like object
   */
  distanceFrom(target: {
    x?: number;
    y?: number;
    left?: number;
    top?: number;
  }): number {
    return target.x && target.y
      ? Math.sqrt(
          Math.pow(this.x - target.x, 2) + Math.pow(this.y - target.y, 2)
        )
      : Math.sqrt(
          Math.pow(this.x - target.left!, 2) + Math.pow(this.y - target.top!, 2)
        );
  }
}
