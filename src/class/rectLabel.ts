// eslint-disable-next-line no-unused-vars
import { Point } from './pointLabel'

interface Rect extends Point {
  w: number
  h: number
  x1: number
  y1: number
}

export class RectLabel implements Rect {
  readonly type = 'Rect'
  w: number
  h: number
  x1: number
  y1: number
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
    w,
    h,
    id,
    categoryId,
    categoryName,
    offset,
    scale,
    strokeWidth
  }: {
    x: number
    y: number
    w: number
    h: number
    id: number
    categoryId?: number
    categoryName?: string
    offset?: Point
    scale?: number
    strokeWidth?: number
  }) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.x1 = x + w
    this.y1 = y + h
    this.id = id
    this.categoryId = categoryId || null
    this.categoryName = categoryName || null
    this.offset = offset || { x: 0, y: 0 }
    this.scale = scale || 1
    this.strokeWidth = strokeWidth || 1.5
  }

  scaleTransform(scale: number, offset: Point = { x: 0, y: 0 }) {
    if (this.scale !== 1 || this.offset.x || this.offset.y) this.origin()
    this.scale = scale
    this.offset = offset
    this.x = this.x * scale + offset.x - this.strokeWidth
    this.y = this.y * scale + offset.y - this.strokeWidth
    this.w = this.w * scale + this.strokeWidth
    this.h = this.h * scale + this.strokeWidth
    this.x1 = this.x1 * scale + offset.x - this.strokeWidth
    this.y1 = this.y1 * scale + offset.y - this.strokeWidth
    return this
  }

  origin() {
    this.x = (this.x + this.strokeWidth - this.offset.x) / this.scale
    this.y = (this.y + this.strokeWidth - this.offset.y) / this.scale
    this.w = (this.w - this.strokeWidth) / this.scale
    this.h = (this.h - this.strokeWidth) / this.scale
    this.x1 = (this.x1 + this.strokeWidth - this.offset.x) / this.scale
    this.y1 = (this.y1 + this.strokeWidth - this.offset.y) / this.scale
    this.scale = 1
    this.offset = { x: 0, y: 0 }
    return this
  }

  getOrigin() {
    return {
      ...this,
      x: (this.x + this.strokeWidth - this.offset.x) / this.scale,
      y: (this.y + this.strokeWidth - this.offset.y) / this.scale,
      w: (this.w - this.strokeWidth) / this.scale,
      h: (this.h - this.strokeWidth) / this.scale,
      x1: (this.x1 + this.strokeWidth - this.offset.x) / this.scale,
      y1: (this.y1 + this.strokeWidth - this.offset.y) / this.scale
    }
  }
}
