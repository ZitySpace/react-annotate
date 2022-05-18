import { Label, LabelType } from '../classes/Label';

export interface ImageData {
  filename: string;
  width: number;
  height: number;
  annotations: Label[];
  url: string;
}

export enum DataState {
  Ready,
  Loading,
  Error,
}
