import { Label } from '../classes/Label';

export interface ImageData {
  name: string;
  width?: number;
  height?: number;
  annotations: Label[];
  url?: string;
  [k: string]: unknown;
}

export enum DataState {
  Ready,
  Loading,
  Error,
}
