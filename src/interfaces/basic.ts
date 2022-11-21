import { Label, LabelType } from '../labels';
import { KeypointsLabelConfig } from '../labels/Keypoints';

export type Annotations = ((
  | {
      type: LabelType.Point;
      x: number;
      y: number;
    }
  | {
      type: LabelType.Line;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }
  | {
      type: LabelType.Box;
      x: number;
      y: number;
      w: number;
      h: number;
    }
  | {
      type: LabelType.Polyline;
      paths: { x: number; y: number }[][];
    }
  | {
      type: LabelType.Mask;
      paths: {
        points: { x: number; y: number }[];
        closed?: boolean;
        hole?: boolean;
      }[];
    }
  | {
      type: LabelType.Keypoints;
      keypoints: { x: number; y: number; vis: boolean; sid: number }[];
    }
) & {
  category: string;
  timestamp?: string;
  hash?: string;
})[];

export interface LabelConfigs {
  keypoints?: KeypointsLabelConfig;
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
