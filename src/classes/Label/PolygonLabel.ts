import { fabric } from 'fabric'
import { Label } from '.'
import { Point } from '../Geometry/Point'

interface PolygonLabelArgs {
  category?: string
  id?: number
  scale?: number
  offset?: Point
  endpoints?: Point[]
  obj?: fabric.Polygon
}

export class PolygonLabel extends Label {
  endpoints: Point[]

  scaleTransform(scale: number, offset: Point = new Point()): this {
    if (this.scale !== 1 || this.offset.x || this.offset.y) this.origin()
    this.scale = scale
    this.offset = offset
    this.endpoints.forEach((p) => p.zoom(scale).translate(offset))
    return this
  }

  origin(): this {
    this.endpoints.forEach((p) =>
      p.translate(this.offset.inverse()).zoom(1 / this.scale)
    )
    this.scale = 1
    this.offset = new Point()
    return this
  }

  getFabricObjects(color: string, visible?: boolean) {
    return [
      new fabric.Polygon(this.endpoints, {
        fill: color,
        stroke: color,
        strokeWidth: 1,
        visible
      })
    ]
  }
}
