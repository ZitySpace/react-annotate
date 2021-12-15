// basic geometric definition
export interface Point {
  x: number
  y: number
}

interface Line extends Point {
  _x: number
  _y: number
}

interface Rect extends Point {
  w: number
  h: number
  x1: number
  y1: number
}

// interface Polygon extends Array<Point> {}

// annotations basic format

export interface PointLabel extends Point {
  categoryName: string | null
  categoryId: number | null
  id: number
  constructor({ x, y }: Point): void
  scaleTransform(scale: number, offset: Point): PointLabel
  origin(): PointLabel
  getOrigin(): PointLabel
}

export class PointLabel implements PointLabel {
  readonly type = 'Point'
  scale: number
  offset: Point
  radius: number
  strokeWidth: number
  constructor({
    x,
    y,
    id,
    categoryId,
    categoryName,
    scale,
    offset,
    radius,
    strokeWidth
  }: {
    x: number
    y: number
    id: number
    categoryId?: number
    categoryName?: string
    scale?: number
    offset?: Point
    radius?: number
    strokeWidth?: number
  }) {
    this.x = x
    this.y = y
    this.id = id
    this.categoryId = categoryId || null
    this.categoryName = categoryName || null
    this.scale = scale || 1
    this.offset = offset || { x: 0, y: 0 }
    this.radius = radius || 5
    this.strokeWidth = strokeWidth || 1.5
  }

  scaleTransform(scale: number, offset: Point = { x: 0, y: 0 }) {
    if (this.scale !== 1 || this.offset.x || this.offset.y) this.origin()
    this.scale = scale
    this.offset = offset
    this.x = this.x * scale + offset.x - this.radius - this.strokeWidth / 2
    this.y = this.y * scale + offset.y - this.radius - this.strokeWidth / 2
    return this
  }

  origin() {
    this.x =
      (this.x + this.radius + this.strokeWidth / 2 - this.offset.x) / this.scale
    this.y =
      (this.y + this.radius + this.strokeWidth / 2 - this.offset.y) / this.scale
    this.scale = 1
    this.offset = { x: 0, y: 0 }
    return this
  }

  getOrigin() {
    return {
      ...this,
      x:
        (this.x + this.radius + this.strokeWidth / 2 - this.offset.x) /
        this.scale,
      y:
        (this.y + this.radius + this.strokeWidth / 2 - this.offset.y) /
        this.scale
    }
  }
}

export interface LineLabel extends Line {
  categoryName: string | null
  categoryId: number | null
  id: number
  constructor({
    x,
    y,
    _x,
    _y
  }: {
    x: number
    y: number
    _x: number
    _y: number
  }): void
  scaleTransform(scale: number, offset: Point): LineLabel
  origin(): LineLabel
  getOrigin(): LineLabel
}

export class LineLabel implements LineLabel {
  readonly type = 'Line'
  scale: number
  offset: Point
  strokeWidth: number
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
export interface RectLabel extends Rect {
  categoryName: string | null
  categoryId: number | null
  id: number
  constructor({
    x,
    y,
    w,
    h
  }: {
    x: number
    y: number
    w: number
    h: number
  }): void
  scaleTransform(scale: number, offset: Point): RectLabel
  origin(): RectLabel
  getOrigin(): RectLabel
}

export class RectLabel implements RectLabel {
  readonly type = 'Rect'
  scale: number
  offset: Point
  strokeWidth: number
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

// interface PolygonLabel extends Polygon {
//   categoryName: string | null
//   categoryId: number | null
// }
