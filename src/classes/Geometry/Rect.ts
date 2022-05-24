import { Dimension } from './Dimension';
import { Line } from './Line';
import { Point } from './Point';

export interface Rect extends Line, Dimension {}

export class Rect implements Rect {
  /**
   *
   * @param args [x, y, w, h]
   */
  constructor(...args: number[]) {
    this.x = args[0];
    this.y = args[1];
    this.w = args[2];
    this.h = args[3];
    this._x = args[0] + args[2];
    this._y = args[1] + args[3];
  }

  /**
   *
   * @param ratio zoom ratio
   * @returns this
   */
  zoom(ratio: number): Rect {
    this.x *= ratio;
    this.y *= ratio;
    this.w *= ratio;
    this.h *= ratio;
    this._x *= ratio;
    this._y *= ratio;
    return this;
  }

  /**
   *
   * @param offset offset
   * @returns
   */
  translate(offset: Point): Rect {
    this.x += offset.x;
    this.y += offset.y;
    this._x += offset.x;
    this._y += offset.y;
    return this;
  }

  /**
   * Calculate the size of the area
   * @returns area sieze
   */
  getSize(): number {
    return this.w * this.h;
  }

  /**
   * Get the intersection rectangle assumed to exist within the boundary
   * @param rect target rectangle
   */
  intersection(rect: Rect): Rect {
    const { x, y, _x, _y } = this;
    const { x: x1, y: y1, _x: _x1, _y: _y1 } = rect;
    const xr = Math.max(x, x1);
    const yr = Math.max(y, y1);
    const _xr = Math.min(_x, _x1);
    const _yr = Math.min(_y, _y1);
    return new Rect(xr, yr, _xr - xr, _yr - yr);
  }
}
