/* eslint-disable no-unused-vars */
import { LineLabel } from '../label/LineLabel'
import { PointLabel } from '../label/PointLabel'
import { RectLabel } from '../label/RectLabel'

export type Label = PointLabel | LineLabel | RectLabel
export const LABEL = RectLabel || PointLabel || LineLabel

export interface ImageObject {
  fileName: string
  fileSize: number
  imageWidth: number
  imageHeight: number
  annotations: Label[]
  blobUrl: string
}

export interface Focus {
  isDrawing?: string | null
  categoryName?: string | null
  objectId?: number | null
}

export interface Dimension {
  w: number
  h: number
}
