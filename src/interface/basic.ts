import { Label } from '../label/Label'

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
