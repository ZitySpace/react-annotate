export interface Dimension {
  w: number
  h: number
}

export class Dimension implements Dimension {
  /**
   *
   * @param w width default 0
   * @param w height default 0
   */
  constructor(w: number = 0, h: number = 0) {
    this.w = w
    this.h = h
  }

  getDimensions(): number {
    return this.w * this.h
  }
}
