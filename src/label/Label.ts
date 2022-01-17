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
