import { LineLabel } from '../label/LineLabel'
import { Point, PointLabel } from '../label/PointLabel'
import { RectLabel } from '../label/RectLabel'

export type Label = PointLabel | LineLabel | RectLabel
export const LABEL = RectLabel || PointLabel || LineLabel

export const newFabricObjects = ({
  type,
  position,
  id,
  categoryName,
  color
}: {
  type: string // | null | undefined
  position: Point
  id: number
  categoryName: string
  color: string
}) => {
  switch (type) {
    case 'Point':
      return PointLabel.newFabricObjects({ position, id, categoryName, color })
    case 'Line':
      return LineLabel.newFabricObjects({ position, id, categoryName, color })
    case 'Rect':
      return RectLabel.newFabricObjects({ position, id, categoryName, color })
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
    case 'Point':
      return PointLabel.fromFabricPoint({ obj, offset, scale })
    case 'Line':
      return LineLabel.fromFabricLine({ obj, offset, scale })
    case 'Rect':
      return RectLabel.fromFabricRect({ obj, offset, scale })
    default:
      throw new Error('obj types error')
  }
}

export const isRect = ({ type, labelType }: any) =>
  type === 'rect' && labelType === 'Rect'

export const isPoint = ({ type, labelType }: any) =>
  type === 'circle' && labelType === 'Point'

export const isLine = ({ type, labelType }: any) =>
  type === 'line' && labelType === 'Line'

export const isLineEndpoint = ({ type, labelType }: any) =>
  type === 'circle' && labelType === 'Line'

export const isLabel = ({ type, labelType }: any) =>
  isRect({ type, labelType }) ||
  isLine({ type, labelType }) ||
  isPoint({ type, labelType })
