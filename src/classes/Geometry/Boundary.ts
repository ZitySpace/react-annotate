import { getBetween } from '../../utils'
import { Line } from './Line'

export class Boundary extends Line {
  /**
   * @param args [x, y, _x, _y]
   */
  constructor(...args: number[]) {
    super(...args)
  }

  /**
   * Get the target coordinates within the bounding box
   * @param obj target coordinate
   * @returns Coordinates within the boundary
   */
  within(obj: { x?: number; y?: number; left?: number; top?: number }) {
    const { x, y, left, top } = obj
    const _x = getBetween(left || x || this.x, this.x, this._x)
    const _y = getBetween(top || y || this.y, this.y, this._y)
    return { x: _x, y: _y, left: _x, top: _y }
  }
}
