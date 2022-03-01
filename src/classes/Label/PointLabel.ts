import { fabric } from 'fabric'
import { Label, LabelType } from '.'
import {
  DEFAULT_COLOR,
  POINT_DEFAULT_CONFIG,
  RADIUS,
  STROKE_WIDTH,
  TEXTBOX_DEFAULT_CONFIG,
  TRANSPARENT
} from '../../interfaces/config'
import { Point } from '../Geometry/Point'

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
export class PointLabel extends Label {
  point: Point

  constructor({ obj, scale, offset }: PointLabelArgs) // construct from fabric object
  constructor({ x, y, category, id, scale, offset, color }: PointLabelArgs) // construct from cursor position
  constructor({ x, y, category, id, color }: PointLabelArgs) // construct from existing data
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
    const labelType = LabelType.Point
    if (obj) {
      const { left: x, top: y, category, id, color } = obj as any
      super({ labelType, category, id, scale, offset, color })
      this.point = new Point(x, y)
    } else {
      super({ labelType, category, id, scale, offset, color })
      this.point = new Point(x, y)
    }
  }

  scaleTransform(scale: number, offset: Point = new Point()) {
    if (this.scale !== 1 || this.offset.x || this.offset.y) this.origin()
    this.scale = scale
    this.offset = offset
    this.point.zoom(scale).translate(offset)
    return this
  }

  origin() {
    this.point.translate(this.offset.inverse()).zoom(1 / this.scale)
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
    const {
      point: { x, y },
      color: oriColor,
      id,
      category,
      labelType
    } = this
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
      backgroundColor: color,
      visible
    })

    const products = [point, textbox]
    products.forEach((obj) =>
      obj.setOptions({ labelType, category, id, color })
    )
    return products
  }
}
