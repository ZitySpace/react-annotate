import md5 from 'md5';
import { Point } from '../Geometry/Point';

export const getLocalTimeISOString = () => {
  const tzoffset = new Date().getTimezoneOffset() * 60000;
  const localISOString = new Date(Date.now() - tzoffset)
    .toISOString()
    .slice(0, -5);
  return localISOString;
};

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
    timestamp = getLocalTimeISOString(),
    hash = md5(getLocalTimeISOString()),
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
