import { Label, LabelType } from '../classes/Label'

export interface ImageObject {
  filename: string
  width: number
  height: number
  annotations: Label[]
  url: string
}

export interface Focus {
  isMultipleSelectionMode: boolean
  drawingType: LabelType
  visibleType: LabelType[]
  category: string | null
  objects: Label[]
}
