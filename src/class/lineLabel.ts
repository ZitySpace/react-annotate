// eslint-disable-next-line no-unused-vars
import { Point } from './pointLabel'

interface Line extends Point {
  _x: number
  _y: number
  distance: number
}

export class LineLabel implements Line {
  readonly type = 'Line'
  _x: number
  _y: number
  distance: number
  x: number
  y: number
  scale: number
  offset: Point
  strokeWidth: number
  id: number
  categoryId: number | null
  categoryName: string | null
  constructor({
    x,
    y,
    _x,
    _y,
    id,
    categoryId,
    categoryName,
    offset,
    scale,
    strokeWidth
  }: {
    x: number
    y: number
    _x: number
    _y: number
    id: number
    categoryId?: number
    categoryName?: string
    offset?: Point
    scale?: number
    strokeWidth?: number
  }) {
    this.x = x
    this.y = y
    this._x = _x
    this._y = _y
    this.distance = Math.sqrt(
      Math.pow(Math.abs(x - _x), 2) + Math.pow(Math.abs(y - _y), 2)
    )
    this.id = id
    this.categoryId = categoryId || null
    this.categoryName = categoryName || null
    this.offset = offset || { x: 0, y: 0 }
    this.scale = scale || 1
    this.strokeWidth = strokeWidth || 1.5
  }

  scaleTransform(scale: number, offset: Point) {
    if (this.scale !== 1 || this.offset.x || this.offset.y) this.origin()
    this.scale = scale
    this.offset = offset
    this.x = this.x * scale + offset.x - this.strokeWidth
    this.y = this.y * scale + offset.y - this.strokeWidth
    this._x = this._x * scale + offset.x - this.strokeWidth
    this._y = this._y * scale + offset.y - this.strokeWidth
    return this
  }

  origin() {
    this.x = (this.x - this.offset.x + this.strokeWidth) / this.scale
    this.y = (this.y - this.offset.y + this.strokeWidth) / this.scale
    this._x = (this._x - this.offset.x + this.strokeWidth) / this.scale
    this._y = (this._y - this.offset.y + this.strokeWidth) / this.scale
    this.scale = 1
    this.offset = { x: 0, y: 0 }
    return this
  }

  getOrigin() {
    return {
      ...this,
      x: (this.x - this.offset.x + this.strokeWidth) / this.scale,
      y: (this.y - this.offset.y + this.strokeWidth) / this.scale,
      _x: (this._x - this.offset.x + this.strokeWidth) / this.scale,
      _y: (this._y - this.offset.y + this.strokeWidth) / this.scale
    }
  }
}
