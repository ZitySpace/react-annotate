import { fabric } from 'fabric'
import {
  RECT_DEFAULT_CONFIG,
  STROKE_WIDTH,
  TEXTBOX_DEFAULT_CONFIG
} from '../../interface/config'
import { Point } from './PointLabel'

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
  color: string

  static fromFabricRect({
    obj,
    offset,
    scale
  }: {
    obj: fabric.Rect
    offset: Point
    scale: number
  }): RectLabel {
    return new this({
      x: obj.left!,
      y: obj.top!,
      w: obj.getScaledWidth() - STROKE_WIDTH,
      h: obj.getScaledHeight() - STROKE_WIDTH,
      id: (obj as any).id,
      categoryName: (obj as any).categoryName,
      strokeWidth: obj.strokeWidth,
      color: (obj as any).color,
      scale,
      offset
    })
  }

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
    strokeWidth,
    color
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
    color?: string
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
    this.color = color!
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

  getFabricObjects({
    currentColor,
    visible = true
  }: {
    currentColor?: string
    visible?: boolean
  }) {
    const { x, y, w, h, color: oriColor, id, categoryName } = this
    const color = currentColor || oriColor
    const rect = new fabric.Rect({
      ...RECT_DEFAULT_CONFIG,
      left: x,
      top: y,
      width: w,
      height: h,
      stroke: color,
      visible
    })
    rect.setOptions({ id, categoryName, color, labelType: 'Rect' })

    const textbox = new fabric.Textbox(id.toString(), {
      ...TEXTBOX_DEFAULT_CONFIG,
      left: x + STROKE_WIDTH,
      top: y + STROKE_WIDTH,
      backgroundColor: color,
      fontSize: Math.min(14, w / 2, h / 2),
      visible
    })
    textbox.setOptions({ id, categoryName, labelType: 'Rect' })

    return { rect, textbox }
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
    const rect = new fabric.Rect({
      ...RECT_DEFAULT_CONFIG,
      left: x - STROKE_WIDTH,
      top: y - STROKE_WIDTH,
      stroke: color
    })
    rect.setOptions({ id, categoryName, color, labelType: 'Rect' })

    const textbox = new fabric.Textbox(id.toString(), {
      ...TEXTBOX_DEFAULT_CONFIG,
      backgroundColor: color,
      visible: false
    })
    textbox.setOptions({ id, categoryName, labelType: 'Rect' })
    return [rect, textbox]
  }
}
