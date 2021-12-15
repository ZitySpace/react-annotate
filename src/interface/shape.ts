import { PointLabel, RectLabel } from './annotations'

export interface ImageObject {
  fileName: string
  fileSize: number
  imageWidth: number
  imageHeight: number
  annotations: (RectLabel | PointLabel)[]
  blobUrl: string
}

export interface Focus {
  isDrawing?: string | null
  annoType?: string | null
  categoryName?: string | null
  objectId?: number | null
}
