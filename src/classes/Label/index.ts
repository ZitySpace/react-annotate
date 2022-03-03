import { Point } from '../Geometry/Point'

export enum LabelType {
  None,
  Point,
  Line,
  Rect,
  Polygon
}

export abstract class Label {
  readonly labelType: LabelType
  category: string
  id: number
  scale: number
  offset: Point

  constructor({
    labelType,
    category,
    id,
    scale,
    offset
  }: {
    labelType: LabelType
    category: string
    id: number
    scale: number
    offset: Point
  }) {
    this.labelType = labelType
    this.category = category
    this.id = id
    this.scale = scale
    this.offset = offset
  }

  abstract scaleTransform(scale: number, offset: Point): this
  abstract origin(): this
  abstract getFabricObjects(color: string, visible?: boolean): fabric.Object[]
}
