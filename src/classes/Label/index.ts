import { Point } from '../Geometry/Point'

export enum LabelType {
  None,
  Point,
  Line,
  Rect
}

export abstract class Label {
  readonly labelType: LabelType
  category: string
  id: number
  scale: number
  offset: Point
  color: string

  constructor({
    labelType,
    category,
    id,
    scale,
    offset,
    color
  }: {
    labelType: LabelType
    category: string
    id: number
    scale: number
    offset: Point
    color: string
  }) {
    this.labelType = labelType
    this.category = category
    this.id = id
    this.scale = scale
    this.offset = offset
    this.color = color
  }

  abstract scaleTransform(scale: number, offset: Point): this
  abstract origin(): this
  // abstract genFabricObjs(visible?: boolean): fabric.Object[]
  abstract getFabricObjects({
    currentColor,
    visible
  }: {
    currentColor?: string
    visible?: boolean
  }): fabric.Object[]
}
