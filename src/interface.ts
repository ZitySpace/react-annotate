// basic geometric definition
interface Point {
  x: number
  y: number
}

// interface Line extends Point {
//   _x: number
//   _y: number
// }

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
  constructor(x: number, y: number): void
  scaleTransform(scale: number): Point
}

export class PointLabel implements PointLabel {
  readonly type = 'Point'
  constructor(
    x: number,
    y: number,
    categoryId: number | null = null,
    categoryName: string | null = null
  ) {
    this.x = x
    this.y = y
    this.categoryId = categoryId
    this.categoryName = categoryName
  }

  scaleTransform(scale: number) {
    this.x = this.x * scale
    this.y = this.y * scale
    return this
  }
}

// interface LineLabel extends Line {
//   categoryName: string | null
//   categoryId: number | null
// }

export interface RectLabel extends Rect {
  categoryName: string | null
  categoryId: number | null
  constructor(x: number, y: number, w: number, h: number): void
  scaleTransform(scale: number): RectLabel
  origin(): RectLabel
}

export class RectLabel implements RectLabel {
  readonly type = 'Rect'
  scale: number = 1
  constructor(
    x: number,
    y: number,
    w: number,
    h: number,
    categoryId = null,
    categoryName = null
  ) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.x1 = x + w
    this.y1 = y + h
    this.categoryId = categoryId
    this.categoryName = categoryName
  }

  scaleTransform(scale: number) {
    this.scale *= scale
    this.x *= scale
    this.y *= scale
    this.w *= scale
    this.h *= scale
    this.x1 *= scale
    this.y1 *= scale
    return this
  }

  origin() {
    this.x /= this.scale
    this.y /= this.scale
    this.w /= this.scale
    this.h /= this.scale
    this.x1 /= this.scale
    this.y1 /= this.scale
    this.scale = 1
    return this
  }
}

// interface PolygonLabel extends Polygon {
//   categoryName: string | null
//   categoryId: number | null
// }

// input definitions
export interface ImageObject {
  fileName: string
  fileSize: number
  imageWidth: number
  imageHeight: number
  annotations: [RectLabel, PointLabel]
  blobUrl: string
}
