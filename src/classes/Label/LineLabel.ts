import { fabric } from 'fabric'
import { Label, LabelType } from '.'
import {
  LINE_DEFAULT_CONFIG,
  POINT_DEFAULT_CONFIG,
  RADIUS,
  TEXTBOX_DEFAULT_CONFIG,
  TRANSPARENT
} from '../../interfaces/config'
import { deepClone } from '../../utils'
import { Line } from '../Geometry/Line'
import { Point } from '../Geometry/Point'

interface LineLabelArgs {
  category?: string
  id?: number
  scale?: number
  offset: Point
  x?: number
  y?: number
  _x?: number
  _y?: number
  obj?: fabric.Line
}

export class LineLabel extends Label {
  line: Line

  constructor({ obj, scale, offset }: LineLabelArgs) // construct from fabric object
  constructor({ x, y, category, id, scale, offset }: LineLabelArgs) // construct from cursor position
  constructor({ x, y, _x, _y, category, id }: LineLabelArgs) // construct from existing data
  constructor({
    x = 0,
    y = 0,
    _x,
    _y,
    category = '',
    id = 0,
    scale = 1,
    offset = new Point(),
    obj
  }: LineLabelArgs) {
    const labelType = LabelType.Line
    if (obj) {
      const { x1: x, y1: y, x2: _x, y2: _y, category, id } = obj as any
      super({ labelType, category, id, scale, offset })
      this.line = new Line(x, y, _x, _y)
    } else {
      super({ labelType, category, id, scale, offset })
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

  getAnnotation() {
    const line = this.line
    return {
      ...this,
      line: line.translate(this.offset.inverse()).zoom(1 / this.scale)
    }
  }

  /**
   * generate fabric objects from the label
   * @param color the color of the category
   * @param needText is it need to show the text
   * @returns
   */
  getFabricObjects(color: string, needText: boolean = true) {
    const {
      line: { x, y, _x, _y },
      id,
      category,
      labelType
    } = this

    const line = new fabric.Line([x, y, _x, _y], {
      ...LINE_DEFAULT_CONFIG,
      stroke: color
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
        stroke: TRANSPARENT
      })
      endpoint.setOptions({ _id, lines: [line] })
      return endpoint
    })

    line.setOptions({ endpoints })

    const topPoint = deepClone(endpoints).sort((a, b) => a.top! - b.top!)[0]
    const textbox = new fabric.Textbox(id.toString(), {
      ...TEXTBOX_DEFAULT_CONFIG,
      left: topPoint.left!,
      top: topPoint.top! - RADIUS,
      originX: 'center',
      originY: 'bottom',
      backgroundColor: color
    })

    const products = needText
      ? [textbox, line, ...endpoints]
      : [line, ...endpoints]
    products.forEach((obj) => obj.setOptions({ labelType, category, id }))
    return products
  }
}
