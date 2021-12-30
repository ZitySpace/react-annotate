export interface Point {
  x: number
  y: number
}

export class PointLabel implements Point {
  readonly type = 'Point'
  x: number
  y: number
  categoryName: string | null
  categoryId: number | null
  id: number
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
