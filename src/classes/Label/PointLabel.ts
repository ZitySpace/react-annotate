import { fabric } from 'fabric'
import { LabelType } from '.'
import {
  DEFAULT_COLOR,
  POINT_DEFAULT_CONFIG,
  RADIUS,
  STROKE_WIDTH,
  TEXTBOX_DEFAULT_CONFIG,
  TRANSPARENT
} from '../../interfaces/config'
import { Point } from '../Geometry'

interface PointLabelArgs {
  category?: string
  id?: number
  scale?: number
  offset?: Point
  color?: string
  x?: number
  y?: number
  obj?: fabric.Circle
}
export class PointLabel implements Point {
  readonly labelType = LabelType.Point
  category: string | null
  id: number
  scale: number
  offset: Point
  color: string
  x: number
  y: number

  constructor({ obj, scale, offset }: PointLabelArgs)
  constructor({ x, y, category, id, scale, offset, color }: PointLabelArgs)
  constructor({
    x = 0,
    y = 0,
    category = '',
    id = 0,
    scale = 1,
    offset = new Point(),
    color = DEFAULT_COLOR,
    obj
  }: PointLabelArgs) {
    if (obj) {
      const { left: x, top: y, category, id, color } = obj as any
      this.category = category
      this.id = id
      this.scale = scale
      this.offset = offset
      this.color = color

      this.x = x
      this.y = y
    } else {
      this.category = category
      this.id = id
      this.scale = scale
      this.offset = offset
      this.color = color

      this.x = x
      this.y = y
    }
  }

  scaleTransform(scale: number, offset: Point = { x: 0, y: 0 }) {
    if (this.scale !== 1 || this.offset.x || this.offset.y) this.origin()
    this.scale = scale
    this.offset = offset
    this.x = this.x * scale + offset.x
    this.y = this.y * scale + offset.y
    return this
  }

  origin() {
    this.x = (this.x - this.offset.x) / this.scale
    this.y = (this.y - this.offset.y) / this.scale
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
    const { x, y, color: oriColor, id, category, labelType } = this
    const color = currentColor || oriColor
    const point = new fabric.Circle({
      ...POINT_DEFAULT_CONFIG,
      left: x,
      top: y,
      fill: color,
      stroke: TRANSPARENT,
      visible
    })

    const textbox = new fabric.Textbox(id.toString(), {
      ...TEXTBOX_DEFAULT_CONFIG,
      left: x + RADIUS - STROKE_WIDTH / 2,
      top: y - RADIUS + STROKE_WIDTH / 2,
      originY: 'bottom',
      backgroundColor: currentColor || color,
      visible
    })

    const products = [point, textbox]
    products.forEach((obj) =>
      obj.setOptions({ labelType, category, id, color })
    )

    return products
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
    const point = new fabric.Circle({
      ...POINT_DEFAULT_CONFIG,
      left: x,
      top: y,
      stroke: color
    })
    point.setOptions({ id, category, color, labelType: LabelType.Point })

    const textbox = new fabric.Textbox(id.toString(), {
      ...TEXTBOX_DEFAULT_CONFIG,
      originY: 'bottom',
      backgroundColor: color,
      visible: false
    })
    textbox.setOptions({ id, category, labelType: LabelType.Point })
    return [point, textbox]
  }
}
