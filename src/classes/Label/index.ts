import { Point } from '../Geometry/Point';

export enum LabelType {
  None,
  Point,
  Line,
  Rect,
  Polygon,
}

export abstract class Label {
  readonly labelType: LabelType;
  category: string;
  id: number;
  scale: number;
  offset: Point;
  timestamp: string;
  hash: string;

  constructor({
    labelType,
    category,
    id,
    scale,
    offset,
    timestamp,
    hash,
  }: {
    labelType: LabelType;
    category: string;
    id: number;
    scale: number;
    offset: Point;
    timestamp: string;
    hash: string;
  }) {
    this.labelType = labelType;
    this.category = category;
    this.id = id;
    this.scale = scale;
    this.offset = offset;
    this.timestamp = timestamp;
    this.hash = hash;
  }

  abstract scaleTransform(scale: number, offset: Point): this;
  abstract origin(): this;
  abstract getAnnotation(): this;
  abstract getFabricObjects(color: string, needText?: boolean): fabric.Object[];
}
