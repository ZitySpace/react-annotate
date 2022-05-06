import { Label, LabelType } from '../classes/Label'

export interface ImageData {
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

export enum DataState {
  Ready,
  Loading,
  Error
}
