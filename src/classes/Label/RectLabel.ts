import { fabric } from 'fabric'
import { LabelType } from '.'
import {
  RECT_DEFAULT_CONFIG,
  STROKE_WIDTH,
  TEXTBOX_DEFAULT_CONFIG
} from '../../interfaces/config'
import { Point, Rect } from '../Geometry'

export class RectLabel implements Rect {
  readonly type = LabelType.Rect
  scale: number
  offset: Point
  id: number
  categoryName: string | null
  color: string
  x: number
  y: number
  w: number
  h: number
  x1: number
  y1: number

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
    categoryName,
    offset,
    scale,
    color
  }: {
    x: number
    y: number
    w: number
    h: number
    id: number
    categoryName?: string
    offset?: Point
    scale?: number
    color?: string
  }) {
    this.x = x
    this.y = y
    this.w = w
    this.h = h
    this.x1 = x + w
    this.y1 = y + h
    this.id = id
    this.categoryName = categoryName || null
    this.offset = offset || { x: 0, y: 0 }
    this.scale = scale || 1
    this.color = color!
  }

  scaleTransform(scale: number, offset: Point = { x: 0, y: 0 }) {
    if (this.scale !== 1 || this.offset.x || this.offset.y) this.origin()
    this.scale = scale
    this.offset = offset
    this.x = this.x * scale + offset.x - STROKE_WIDTH
    this.y = this.y * scale + offset.y - STROKE_WIDTH
    this.w = this.w * scale + STROKE_WIDTH
    this.h = this.h * scale + STROKE_WIDTH
    this.x1 = this.x1 * scale + offset.x - STROKE_WIDTH
    this.y1 = this.y1 * scale + offset.y - STROKE_WIDTH
    return this
  }

  origin() {
    this.x = (this.x + STROKE_WIDTH - this.offset.x) / this.scale
    this.y = (this.y + STROKE_WIDTH - this.offset.y) / this.scale
    this.w = (this.w - STROKE_WIDTH) / this.scale
    this.h = (this.h - STROKE_WIDTH) / this.scale
    this.x1 = (this.x1 + STROKE_WIDTH - this.offset.x) / this.scale
    this.y1 = (this.y1 + STROKE_WIDTH - this.offset.y) / this.scale
    this.scale = 1
    this.offset = { x: 0, y: 0 }
    return this
  }

  getOrigin() {
    return {
      ...this,
      x: (this.x + STROKE_WIDTH - this.offset.x) / this.scale,
      y: (this.y + STROKE_WIDTH - this.offset.y) / this.scale,
      w: (this.w - STROKE_WIDTH) / this.scale,
      h: (this.h - STROKE_WIDTH) / this.scale,
      x1: (this.x1 + STROKE_WIDTH - this.offset.x) / this.scale,
      y1: (this.y1 + STROKE_WIDTH - this.offset.y) / this.scale
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
    rect.setOptions({ id, categoryName, color, labelType: LabelType.Rect })

    const textbox = new fabric.Textbox(id.toString(), {
      ...TEXTBOX_DEFAULT_CONFIG,
      left: x + STROKE_WIDTH,
      top: y + STROKE_WIDTH,
      backgroundColor: color,
      fontSize: Math.min(14, w / 2, h / 2),
      visible
    })
    textbox.setOptions({ id, categoryName, labelType: LabelType.Rect })

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
    rect.setOptions({ id, categoryName, color, labelType: LabelType.Rect })

    const textbox = new fabric.Textbox(id.toString(), {
      ...TEXTBOX_DEFAULT_CONFIG,
      backgroundColor: color,
      visible: false
    })
    textbox.setOptions({ id, categoryName, labelType: LabelType.Rect })
    return [rect, textbox]
  }
}
