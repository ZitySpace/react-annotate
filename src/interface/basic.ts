/* eslint-disable no-unused-vars */
import { LineLabel } from '../class/lineLabel'
import { PointLabel } from '../class/pointLabel'
import { RectLabel } from '../class/rectlabel'

export type Label = PointLabel | LineLabel | RectLabel

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
