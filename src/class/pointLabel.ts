import { fabric } from 'fabric'
import {
  PointDefaultConfig,
  StrokeWidth,
  TextboxDefaultConfig,
  Transparent
} from '../interface/config'
import { getRandomColors } from '../utils/categorys&colors'

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
  color: string
  constructor({
    x,
    y,
    id,
    categoryId,
    categoryName,
    scale,
    offset,
    radius,
    strokeWidth,
    color
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
    color?: string
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
    this.color = color || getRandomColors(1)[0]
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

  getFabricObjects({ currentColor }: { currentColor: string }) {
    const { x, y, radius, color, id, categoryName } = this
    const point = new fabric.Circle({
      ...PointDefaultConfig,
      left: x,
      top: y,
      radius: radius,
      fill: currentColor || color,
      stroke: Transparent
    })
    point.setOptions({
      id,
      categoryName,
      color: currentColor || color,
      labelType: 'Point'
    })

    const textbox = new fabric.Textbox(id.toString(), {
      ...TextboxDefaultConfig,
      left: x + radius - StrokeWidth / 2,
      top: y - radius + StrokeWidth / 2,
      originY: 'bottom',
      backgroundColor: currentColor || color
    })
    textbox.setOptions({ id, categoryName, labelType: 'Point' })

    return { point, textbox }
  }
}
