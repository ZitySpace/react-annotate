import { fabric } from 'fabric'
import { Label, LabelType } from '.'
import {
  DEFAULT_COLOR,
  LINE_DEFAULT_CONFIG,
  POINT_DEFAULT_CONFIG,
  RADIUS,
  TEXTBOX_DEFAULT_CONFIG,
  TRANSPARENT
} from '../../interfaces/config'
import { Line } from '../Geometry/Line'
import { Point } from '../Geometry/Point'

interface LineLabelArgs {
  category?: string
  id?: number
  scale?: number
  offset: Point
  color?: string
  x?: number
  y?: number
  _x?: number
  _y?: number
  obj?: fabric.Line
}

export class LineLabel extends Label {
  line: Line

  constructor({ obj, scale, offset }: LineLabelArgs) // construct from fabric object
  constructor({ x, y, category, id, scale, offset, color }: LineLabelArgs) // construct from cursor position
  constructor({ x, y, _x, _y, category, id, color }: LineLabelArgs) // construct from existing data
  constructor({
    x = 0,
    y = 0,
    _x,
    _y,
    category = '',
    id = 0,
    scale = 1,
    offset = new Point(),
    color = DEFAULT_COLOR,
    obj
  }: LineLabelArgs) {
    const labelType = LabelType.Line
    if (obj) {
      const { x1: x, y1: y, x2: _x, y2: _y, category, id, color } = obj as any
      super({ labelType, category, id, scale, offset, color })
      this.line = new Line(x, y, _x, _y)
    } else {
      super({ labelType, category, id, scale, offset, color })
      this.line = new Line(x, y, _x!, _y!)
    }
  }

  scaleTransform(scale: number, offset: Point) {
    if (this.scale !== 1 || this.offset.x || this.offset.y) this.origin()
    this.scale = scale
    this.offset = offset
    this.line.zoom(scale).translate(offset)
    return this
  }

  origin() {
    this.line.translate(this.offset.inverse()).zoom(1 / this.scale)
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
      line: { x, y, _x, _y },
      color: oriColor,
      id,
      category,
      labelType
    } = this
    const color = currentColor || oriColor
    const line = new fabric.Line([x, y, _x, _y], {
      ...LINE_DEFAULT_CONFIG,
      stroke: color,
      visible
    })

    const endpoints = [
      [x, y],
      [_x, _y]
    ].map(([x, y], _id) => {
      const endpoint = new fabric.Circle({
        ...POINT_DEFAULT_CONFIG,
        left: x,
        top: y,
        fill: color,
        stroke: TRANSPARENT,
        visible
      })
      endpoint.setOptions({ _id: _id + 1, line })
      return endpoint
    })

    line.setOptions({ endpoints })

    const topPoint = endpoints.sort((a, b) => a.top! - b.top!)[0]
    const textbox = new fabric.Textbox(id.toString(), {
      ...TEXTBOX_DEFAULT_CONFIG,
      left: topPoint.left!,
      top: topPoint.top! - RADIUS,
      originX: 'center',
      originY: 'bottom',
      backgroundColor: color,
      visible
    })

    const products = [line, textbox, ...endpoints]
    products.forEach((obj) =>
      obj.setOptions({ labelType, category, id, color })
    )
    return products
  }
}
