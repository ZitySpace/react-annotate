import { fabric } from 'fabric'
import { Label, LabelType } from '.'
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
    } else if (points) {
      super({ labelType, category, id, scale, offset })
      this.points = points
    } else {
      super({ labelType, category, id, scale, offset })
      this.points = [new Point(x, y), new Point(x, y)]
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

  getFabricObjects(color: string, visible?: boolean) {
    return [
      new fabric.Polygon(this.points, {
        fill: color,
        stroke: color,
        strokeWidth: 1,
        visible
      })
    ]
  }
}
