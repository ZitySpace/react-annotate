import { fabric } from 'fabric'
import {
  POINT_DEFAULT_CONFIG,
  STROKE_WIDTH,
  TEXTBOX_DEFAULT_CONFIG,
  TRANSPARENT
} from '../interface/config'

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

  static fromFabricPoint({
    obj,
    offset,
    scale
  }: {
    obj: fabric.Circle
    offset: Point
    scale: number
  }): PointLabel {
    return new this({
      x: obj.left!,
      y: obj.top!,
      id: (obj as any).id,
      categoryName: (obj as any).categoryName,
      strokeWidth: obj.strokeWidth,
      radius: obj.radius,
      color: (obj as any).color,
      scale,
      offset
    })
  }

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
    color: string
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
    this.color = color
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

  getFabricObjects({
    currentColor,
    visible = true
  }: {
    currentColor?: string
    visible?: boolean
  }) {
    const { x, y, radius, color: oriColor, id, categoryName } = this
    const color = currentColor || oriColor
    const point = new fabric.Circle({
      ...POINT_DEFAULT_CONFIG,
      left: x,
      top: y,
      radius: radius,
      fill: color,
      stroke: TRANSPARENT,
      visible
    })
    point.setOptions({ id, categoryName, color, labelType: 'Point' })

    const textbox = new fabric.Textbox(id.toString(), {
      ...TEXTBOX_DEFAULT_CONFIG,
      left: x + radius - STROKE_WIDTH / 2,
      top: y - radius + STROKE_WIDTH / 2,
      originY: 'bottom',
      backgroundColor: currentColor || color,
      visible
    })
    textbox.setOptions({ id, categoryName, labelType: 'Point' })

    return { point, textbox }
  }

  static newFabricObjects({
    position,
    id,
    categoryName,
    color
  }: {
    position: Point
    id: number
    categoryName: string
    color: string
  }) {
    const { x, y } = position
    const point = new fabric.Circle({
      ...POINT_DEFAULT_CONFIG,
      left: x,
      top: y,
      stroke: color
    })
    point.setOptions({ id, categoryName, color, labelType: 'Point' })

    const textbox = new fabric.Textbox(id.toString(), {
      ...TEXTBOX_DEFAULT_CONFIG,
      originY: 'bottom',
      backgroundColor: color,
      visible: false
    })
    textbox.setOptions({ id, categoryName, labelType: 'Point' })
    return [point, textbox]
  }
}
