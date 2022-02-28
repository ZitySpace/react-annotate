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
