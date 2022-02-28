import { Point } from '../classes/Geometry'
import { Label, LabelType } from '../classes/Label'
import { LineLabel } from '../classes/Label/LineLabel'
import { PointLabel } from '../classes/Label/PointLabel'
import { RectLabel } from '../classes/Label/RectLabel'

const _newLabel = {
  [LabelType.Point]: (args: any) => new PointLabel(args),
  [LabelType.Line]: (args: any) => new LineLabel(args),
  [LabelType.Rect]: (args: any) => new RectLabel(args)
}

export function newLabel({
  labelType,
  position,
  category,
  id,
  scale,
  offset,
  color
}: {
  labelType: LabelType
  position: Point
  category: string
  id: number
  scale: number
  offset: Point
  color: string
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
  color,
  obj
}: {
  labelType?: LabelType
  category?: string
  id?: number
  scale?: number
  offset?: Point
  color?: string
  position?: Point
  obj?: fabric.Object
}): Label {
  if (position && labelType) {
    const { x, y } = position
    return _newLabel[labelType]({ x, y, category, id, scale, offset, color })
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

export const isLabel = ({ type, labelType }: any) =>
  isRect({ type, labelType }) ||
  isLine({ type, labelType }) ||
  isPoint({ type, labelType })
