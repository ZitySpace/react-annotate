import { fabric } from 'fabric'
import { Label, LabelType } from '.'
import {
  DEFAULT_COLOR,
  RECT_DEFAULT_CONFIG,
  STROKE_WIDTH,
  TEXTBOX_DEFAULT_CONFIG
} from '../../interfaces/config'
import { getFontSize } from '../../utils'
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

export class RectLabel extends Label implements Rect {
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

  constructor({ obj, offset, scale }: RectLabelArgs) // construct from fabric object
  constructor({ x, y, category, id, scale, offset, color }: RectLabelArgs) // construct from cursor position
  constructor({ x, y, w, h, category, id, color }: RectLabelArgs) // construct from existing data
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
    const labelType = LabelType.Rect
    if (obj) {
      const { left: x, top: y, category, id, color } = obj as any
      const w = obj.getScaledWidth() // stroke width had been added
      const h = obj.getScaledHeight() // stroke width had been added

      super({ labelType, category, id, scale, offset, color })
      this.xywh(x, y, w, h)
    } else {
      super({ labelType, category, id, scale, offset, color })
      this.xywh(x, y, w, h)
    }
  }

  scaleTransform(scale: number, offset: Point = { x: 0, y: 0 }) {
    if (this.scale !== 1 || this.offset.x || this.offset.y) this.origin()
    this.scale = scale
    this.offset = offset
    const scaled = [this.x, this.y, this.w, this.h].map((v) => v * scale)
    scaled[0] += offset.x
    scaled[1] += offset.y
    this.xywh(...scaled)
    return this
  }

  origin() {
    const { x, y, w, h } = this
    const translated = [x - this.offset.x, y - this.offset.y, w, h]
    this.xywh(...translated.map((v) => v / this.scale))
    this.scale = 1
    this.offset = new Point()
    return this
  }

  getFabricObjects({
    currentColor,
    visible = true
  }: {
    currentColor?: string
    visible?: boolean
  }) {
    const { x, y, w, h, labelType, category, id, color: oriColor } = this
    const color = currentColor || oriColor
    const rect = new fabric.Rect({
      ...RECT_DEFAULT_CONFIG,
      left: x,
      top: y,
      width: w - STROKE_WIDTH,
      height: h - STROKE_WIDTH,
      stroke: color,
      visible
    })

    const textbox = new fabric.Textbox(id.toString(), {
      ...TEXTBOX_DEFAULT_CONFIG,
      left: x + STROKE_WIDTH,
      top: y + STROKE_WIDTH,
      backgroundColor: color,
      fontSize: getFontSize(w, h),
      visible
    })

    const products = [rect, textbox]
    products.forEach((obj) =>
      obj.setOptions({ labelType, category, id, color })
    )
    return products
  }
}
