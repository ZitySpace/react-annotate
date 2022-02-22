import { Label, LabelType } from '../classes/Label'

export interface ImageObject {
  fileName: string
  fileSize: number
  imageWidth: number
  imageHeight: number
  annotations: Label[]
  blobUrl: string
}

export interface Focus {
  drawingType: LabelType | null
  visibleType: LabelType[]
  category: string | null
  objects: Label[]
}

export interface Dimension {
  w: number
  h: number
}
