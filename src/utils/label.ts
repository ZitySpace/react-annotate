import { Point } from '../classes/Geometry/Point'
import { Label, LabelType } from '../classes/Label'
import { LineLabel } from '../classes/Label/LineLabel'
import { PointLabel } from '../classes/Label/PointLabel'
import { PolygonLabel } from '../classes/Label/PolygonLabel'
import { RectLabel } from '../classes/Label/RectLabel'

const _newLabel = {
  [LabelType.Point]: (args: any) => new PointLabel(args),
  [LabelType.Line]: (args: any) => new LineLabel(args),
  [LabelType.Rect]: (args: any) => new RectLabel(args),
  [LabelType.Polygon]: (args: any) => new PolygonLabel(args)
}

export function newLabel({
  labelType,
  position,
  category,
  id,
  scale,
  offset
}: {
  labelType: LabelType
  position: Point
  category: string
  id: number
  scale: number
  offset: Point
}): Label

export function newLabel({
  obj,
  scale,
  offset
}: {
  obj: fabric.Object
  scale: number
  offset: Point
}): Label

export function newLabel({
  labelType,
  position,
  category,
  id,
  scale = 1,
  offset = new Point(),
  obj
}: {
  labelType?: LabelType
  category?: string
  id?: number
  scale?: number
  offset?: Point
  position?: Point
  obj?: fabric.Object
}): Label {
  if (position && labelType) {
    const { x, y } = position
    return _newLabel[labelType]({ x, y, category, id, scale, offset })
  } else {
    const { labelType } = obj as any
    return _newLabel[labelType]({ obj, scale, offset })
  }
}

export const isRect = ({ type, labelType }: any) =>
  type === 'rect' && labelType === LabelType.Rect

export const isPoint = ({ type, labelType }: any) =>
  type === 'circle' && labelType === LabelType.Point

export const isLine = ({ type, labelType }: any) =>
  type === 'line' && labelType === LabelType.Line

export const isLineEndpoint = ({ type, labelType }: any) =>
  type === 'circle' && labelType === LabelType.Line

export const isPolygon = ({ type, labelType }: any) =>
  type === 'polygon' && labelType === LabelType.Polygon

export const isLabel = ({ type, labelType }: any) =>
  isRect({ type, labelType }) ||
  isLine({ type, labelType }) ||
  isPoint({ type, labelType }) ||
  isPolygon({ type, labelType })
