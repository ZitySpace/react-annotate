import { fabric } from 'fabric'
import { LabelType } from '.'
import {
  DEFAULT_COLOR,
  RECT_DEFAULT_CONFIG,
  STROKE_WIDTH,
  TEXTBOX_DEFAULT_CONFIG
} from '../../interfaces/config'
import { Point, Rect } from '../Geometry'

interface RectLabelArgs {
  category?: string
  id?: number
  scale?: number
  offset?: Point
  color?: string
  x?: number
  y?: number
  w?: number
  h?: number
  obj?: fabric.Rect
}

export class RectLabel implements Rect {
  readonly labelType = LabelType.Rect
  category: string | null
  id: number
  scale: number
  offset: Point
  color: string
  x: number
  y: number
  w: number
  h: number
  x1: number
  y1: number

  private xywh(...args: number[]): void {
    this.x = args[0]
    this.y = args[1]
    this.w = args[2]
    this.h = args[3]
    this.x1 = args[0] + args[2]
    this.y1 = args[1] + args[3]
  }

  constructor({ obj, offset, scale }: RectLabelArgs)
  constructor({ x, y, category, id, scale, offset, color }: RectLabelArgs)
  constructor({ x, y, w, h, category, id, scale, offset, color }: RectLabelArgs)
  constructor({
    x = 0,
    y = 0,
    w = 0,
    h = 0,
    category = '',
    id = 0,
    scale = 1,
    offset = new Point(),
    color = DEFAULT_COLOR,
    obj
  }: RectLabelArgs) {
    if (obj) {
      const { left: x, top: y, category, id, color } = obj as any
      const w = obj.getScaledWidth() + STROKE_WIDTH
      const h = obj.getScaledHeight() + STROKE_WIDTH

      this.category = category
      this.id = id
      this.scale = scale
      this.offset = offset
      this.color = color

      this.xywh(x, y, w, h)
    } else {
      this.category = category
      this.id = id
      this.scale = scale
      this.offset = offset
      this.color = color

      this.xywh(x, y, w, h)
    }
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
    const { x, y, w, h, color: oriColor, id, category, labelType } = this
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
    rect.setOptions({ id, category, color, labelType })

    const textbox = new fabric.Textbox(id.toString(), {
      ...TEXTBOX_DEFAULT_CONFIG,
      left: x + STROKE_WIDTH,
      top: y + STROKE_WIDTH,
      backgroundColor: color,
      fontSize: Math.min(14, w / 2, h / 2),
      visible
    })
    textbox.setOptions({ id, category, labelType })

    return { rect, textbox }
  }

  static newFabricObjects({
    position,
    id,
    category,
    color
  }: {
    position: Point
    id: number
    category: string
    color: string
  }) {
    const { x, y } = position
    const rect = new fabric.Rect({
      ...RECT_DEFAULT_CONFIG,
      left: x - STROKE_WIDTH,
      top: y - STROKE_WIDTH,
      stroke: color
    })
    rect.setOptions({ id, category, color, labelType: LabelType.Rect })

    const textbox = new fabric.Textbox(id.toString(), {
      ...TEXTBOX_DEFAULT_CONFIG,
      backgroundColor: color,
      visible: false
    })
    textbox.setOptions({ id, category, labelType: LabelType.Rect })
    return [rect, textbox]
  }
}
