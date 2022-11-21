import { Label } from '../labels';

export interface Annotations {
  point?: {
    x: number;
    y: number;
    category: string;
    timestamp?: string;
    hash?: string;
  }[];

  line?: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    category: string;
    timestamp?: string;
    hash?: string;
  }[];

  box?: {
    x: number;
    y: number;
    w: number;
    h: number;
    category: string;
    timestamp?: string;
    hash?: string;
  }[];

  polyline?: {
    paths: { x: number; y: number }[][];
    category: string;
    timestamp?: string;
    hash?: string;
  }[];

  mask?: {
    paths: {
      points: { x: number; y: number }[];
      closed?: boolean;
      hole?: boolean;
    }[];
    category: string;
    timestamp?: string;
    hash?: string;
  }[];

  keypoints?: {
    keypoints: { x: number; y: number; vis: boolean; sid: number }[];
    category: string;
    timestamp?: string;
    hash?: string;
  }[];
}

export interface ImageData {
  name: string;
  width?: number;
  height?: number;
  annotations: Annotations;
  url?: string;
  [k: string]: unknown;
}

export interface LabeledImageData {
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
