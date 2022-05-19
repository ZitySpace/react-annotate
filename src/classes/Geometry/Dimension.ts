import { Boundary } from './Boundary';
import { Point } from './Point';

export interface Dimension {
  w: number;
  h: number;
}

export class Dimension implements Dimension {
  /**
   *
   * @param w width default 0
   * @param w height default 0
   */
  constructor(w: number = 0, h: number = 0) {
    this.w = w;
    this.h = h;
  }

  /**
   * Calculate the dimensions
   * @returns the size of the area
   */
  getDimensions(): number {
    return this.w * this.h;
  }

  /**
   *
   * @param ratio zoom ratio
   * @returns this
   */
  zoom(ratio: number): Dimension {
    this.w *= ratio;
    this.h *= ratio;
    return this;
  }

  /**
   *
   * @param external external
   * @returns
   */
  offsetTo(external: Dimension): Point {
    const { w, h } = external;
    const { w: _w, h: _h } = this;
    return new Point((w - _w) / 2, (h - _h) / 2);
  }

  /**
   *
   * @param external external
   */
  boundaryIn(external: Dimension): Boundary {
    const { w, h } = external;
    const { w: _w, h: _h } = this;
    return new Boundary((w - _w) / 2, (h - _h) / 2, (w + _w) / 2, (h + _h) / 2);
  }
}
