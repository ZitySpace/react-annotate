import { fabric } from 'fabric'
import { Label, LabelType } from '.'
import {
  POLYGON_DEFAULT_CONFIG,
  RADIUS,
  TEXTBOX_DEFAULT_CONFIG
} from '../../interfaces/config'
import { transparenter } from '../../utils'
import { Point } from '../Geometry/Point'

interface PolygonLabelArgs {
  category?: string
  id?: number
  scale?: number
  offset?: Point
  x?: number
  y?: number
  points?: Point[]
  obj?: fabric.Polygon
}

export class PolygonLabel extends Label {
  points: Point[]

  constructor({ obj, scale, offset }: PolygonLabelArgs) // construct from fabric object
  constructor({ x, y, category, obj, scale, offset }: PolygonLabelArgs) // construct from cursor position
  constructor({ points, category, id }: PolygonLabelArgs) // construct from existing data
  constructor({
    x = 0,
    y = 0,
    category = '',
    id = 0,
    scale = 1,
    offset = new Point(),
    points,
    obj
  }: PolygonLabelArgs) {
    const labelType = LabelType.Polygon
    if (obj) {
      const { points, category, id } = obj as any
      super({ labelType, category, id, scale, offset })
      this.points = points.map(({ x, y }: Point) => new Point(x, y))
    } else {
      super({ labelType, category, id, scale, offset })
      this.points = points || [new Point(x, y)]
    }
  }

  scaleTransform(scale: number, offset: Point = new Point()): this {
    if (this.scale !== 1 || this.offset.x || this.offset.y) this.origin()
    this.scale = scale
    this.offset = offset
    this.points.forEach((p) => p.zoom(scale).translate(offset))
    return this
  }

  origin(): this {
    this.points.forEach((p) =>
      p.translate(this.offset.inverse()).zoom(1 / this.scale)
    )
    this.scale = 1
    this.offset = new Point()
    return this
  }

  getAnnotation() {
    const points = this.points
    return {
      ...this,
      points: points.map((p) =>
        p.translate(this.offset.inverse()).zoom(1 / this.scale)
      )
    }
  }

  getFabricObjects(
    color: string,
    visible: boolean = true,
    needText: boolean = true
  ) {
    const { points, id, category, labelType } = this
    const polygon = new fabric.Polygon(
      points.map(({ x, y }) => new fabric.Point(x, y)),
      {
        ...POLYGON_DEFAULT_CONFIG,
        cornerColor: color,
        fill: transparenter(color)
      }
    )

    const topPoint = points.sort((a, b) => a.y - b.y)[0]
    const textbox = new fabric.Textbox(id.toString(), {
      ...TEXTBOX_DEFAULT_CONFIG,
      left: topPoint.x,
      top: topPoint.y - RADIUS,
      originX: 'center',
      originY: 'bottom',
      backgroundColor: color,
      visible
    })

    const products = needText ? [polygon, textbox] : [polygon]
    products.forEach((obj) => obj.setOptions({ labelType, category, id }))
    return products
  }
}
