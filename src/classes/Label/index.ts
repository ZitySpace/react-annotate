import { Point } from '../Geometry'
import { LineLabel } from './LineLabel'
import { PointLabel } from './PointLabel'
import { RectLabel } from './RectLabel'

export type Label = PointLabel | LineLabel | RectLabel
export const LABEL = RectLabel || PointLabel || LineLabel
export enum LabelType {
  None,
  Point,
  Line,
  Rect
}

export const newFabricObjects = ({
  labelType,
  position,
  id,
  category,
  color
}: {
  labelType: LabelType
  position: Point
  id: number
  category: string
  color: string
}) => {
  switch (labelType) {
    case LabelType.Point:
      return PointLabel.newFabricObjects({ position, id, category, color })
    case LabelType.Line:
      return LineLabel.newFabricObjects({ position, id, category, color })
    case LabelType.Rect:
      return RectLabel.newFabricObjects({ position, id, category, color })
    default:
      return []
  }
}

export const newLabelFromFabricObj = ({
  obj,
  offset,
  scale
}: {
  obj: any
  offset: Point
  scale: number
}) => {
  switch ((obj as any).labelType) {
    case LabelType.Point:
      return new PointLabel({ obj, offset, scale })
    case LabelType.Line:
      return new LineLabel({ obj, offset, scale })
    case LabelType.Rect:
      return new RectLabel({ obj, offset, scale })
    default:
      throw new Error('obj types error')
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
