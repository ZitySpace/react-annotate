import { fabric } from 'fabric'
import { LabelType } from '.'
import {
  DEFAULT_COLOR,
  LINE_DEFAULT_CONFIG,
  POINT_DEFAULT_CONFIG,
  RADIUS,
  STROKE_WIDTH,
  TEXTBOX_DEFAULT_CONFIG,
  TRANSPARENT
} from '../../interfaces/config'
import { Line, Point } from '../Geometry'

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

export class LineLabel implements Line {
  readonly labelType = LabelType.Line
  category: string | null
  id: number
  scale: number
  offset: Point
  color: string
  x: number
  y: number
  _x: number
  _y: number
  distance: number

  private xy_xy(...args: number[]): void {
    this.x = args[0]
    this.y = args[1]
    this._x = args[2]
    this._y = args[3]
    this.distance = Math.sqrt(
      Math.pow(this._x - this.x, 2) + Math.pow(this._y - this.y, 2)
    )
  }

  constructor({ obj, scale, offset }: LineLabelArgs)
  constructor({ x, y, category, id, scale, offset, color }: LineLabelArgs)
  constructor({
    x,
    y,
    _x,
    _y,
    category,
    id,
    scale,
    offset,
    color
  }: LineLabelArgs)
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
    if (obj) {
      const { x1: x, y1: y, x2: _x, y2: _y, category, id, color } = obj as any
      this.category = category
      this.id = id
      this.scale = scale
      this.offset = offset
      this.color = color

      this.xy_xy(x, y, _x, _y)
    } else {
      this.category = category
      this.id = id
      this.scale = scale
      this.offset = offset
      this.color = color

      this.xy_xy(x, y, _x || x, _y || y)
    }
  }

  scaleTransform(scale: number, offset: Point) {
    if (this.scale !== 1 || this.offset.x || this.offset.y) this.origin()
    this.scale = scale
    this.offset = offset
    this.x = this.x * scale + offset.x - STROKE_WIDTH
    this.y = this.y * scale + offset.y - STROKE_WIDTH
    this._x = this._x * scale + offset.x - STROKE_WIDTH
    this._y = this._y * scale + offset.y - STROKE_WIDTH
    return this
  }

  origin() {
    this.x = (this.x - this.offset.x + STROKE_WIDTH) / this.scale
    this.y = (this.y - this.offset.y + STROKE_WIDTH) / this.scale
    this._x = (this._x - this.offset.x + STROKE_WIDTH) / this.scale
    this._y = (this._y - this.offset.y + STROKE_WIDTH) / this.scale
    this.scale = 1
    this.offset = { x: 0, y: 0 }
    return this
  }

  getOrigin() {
    return {
      ...this,
      x: (this.x - this.offset.x + STROKE_WIDTH) / this.scale,
      y: (this.y - this.offset.y + STROKE_WIDTH) / this.scale,
      _x: (this._x - this.offset.x + STROKE_WIDTH) / this.scale,
      _y: (this._y - this.offset.y + STROKE_WIDTH) / this.scale
    }
  }

  getFabricObjects({
    currentColor,
    visible = true
  }: {
    currentColor?: string
    visible?: boolean
  }) {
    const { x, y, _x, _y, color: oriColor, id, category, labelType } = this
    const color = currentColor || oriColor
    const line = new fabric.Line(
      [x, y, _x, _y].map((coord) => coord - STROKE_WIDTH / 2),
      {
        ...LINE_DEFAULT_CONFIG,
        stroke: color,
        visible
      }
    )

    const endpoints = [
      [x, y],
      [_x, _y]
    ].map((coord, _id) => {
      const endpoint = new fabric.Circle({
        ...POINT_DEFAULT_CONFIG,
        left: coord[0],
        top: coord[1],
        fill: color,
        stroke: TRANSPARENT,
        visible
      })
      endpoint.setOptions({
        id,
        _id: _id + 1,
        category,
        color,
        line,
        labelType
      })
      return endpoint
    })

    const topPoint = endpoints.sort((a, b) => a.top! - b.top!)[0]
    const textbox = new fabric.Textbox(id.toString(), {
      ...TEXTBOX_DEFAULT_CONFIG,
      left: topPoint.left!,
      top: topPoint.top! - RADIUS,
      originX: 'center',
      originY: 'bottom',
      backgroundColor: currentColor || color,
      visible
    })
    textbox.setOptions({ id, category, labelType: LabelType.Line })
    line.setOptions({
      id,
      category,
      color,
      endpoints,
      labelType
    })
    return { line, textbox, point1: endpoints[0], point2: endpoints[1] }
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
    const line = new fabric.Line(
      [x, y, x, y].map((coord) => coord - STROKE_WIDTH / 2),
      {
        ...LINE_DEFAULT_CONFIG,
        stroke: color
      }
    )
    const endpoints = [...Array(2).keys()].map((_id) => {
      const endpoint = new fabric.Circle({
        ...POINT_DEFAULT_CONFIG,
        left: x,
        top: y,
        fill: color,
        stroke: TRANSPARENT
      })
      endpoint.setOptions({
        id,
        _id: _id + 1,
        category,
        color,
        labelType: LabelType.Line,
        line
      })
      return endpoint
    })
    line.setOptions({
      id,
      category,
      color,
      labelType: LabelType.Line,
      endpoints
    })

    const textbox = new fabric.Textbox(id.toString(), {
      ...TEXTBOX_DEFAULT_CONFIG,
      originX: 'center',
      originY: 'bottom',
      backgroundColor: color,
      visible: false
    })
    textbox.setOptions({ id, category, labelType: LabelType.Line })
    return [line, ...endpoints, textbox]
  }
}
