import { fabric } from 'fabric';
import md5 from 'md5';
import { Label, LabelType, getLocalTimeISOString } from '.';
import {
  POINT_DEFAULT_CONFIG,
  RADIUS,
  STROKE_WIDTH,
  TEXTBOX_DEFAULT_CONFIG,
  TRANSPARENT,
} from '../../interfaces/config';
import { Point } from '../Geometry/Point';

interface PointLabelArgs {
  category?: string;
  id?: number;
  scale?: number;
  offset?: Point;
  x?: number;
  y?: number;
  obj?: fabric.Circle;
  timestamp?: string;
  hash?: string;
}
export class PointLabel extends Label {
  point: Point;

  constructor({ obj, scale, offset }: PointLabelArgs); // construct from fabric object
  constructor({ x, y, category, id, scale, offset }: PointLabelArgs); // construct from cursor position
  constructor({ x, y, category, id }: PointLabelArgs); // construct from existing data
  constructor({
    x = 0,
    y = 0,
    category = '',
    id = 0,
    scale = 1,
    offset = new Point(),
    timestamp,
    hash,
    obj,
  }: PointLabelArgs) {
    const labelType = LabelType.Point;
    const now = getLocalTimeISOString();
    if (obj) {
      const {
        left: x,
        top: y,
        category,
        id,
        timestamp: timestamp_,
        hash: hash_,
      } = obj as any;
      super({
        labelType,
        category,
        id,
        scale,
        offset,
        timestamp: timestamp || timestamp_ || now,
        hash: hash || hash_ || md5(now),
      });
      this.point = new Point(x, y);
    } else {
      super({
        labelType,
        category,
        id,
        scale,
        offset,
        timestamp: timestamp || now,
        hash: hash || md5(now),
      });
      this.point = new Point(x, y);
    }
  }

  scaleTransform(scale: number, offset: Point = new Point()) {
    if (this.scale !== 1 || this.offset.x || this.offset.y) this.origin();
    this.scale = scale;
    this.offset = offset;
    this.point.zoom(scale).translate(offset);
    return this;
  }

  origin() {
    this.point.translate(this.offset.inverse()).zoom(1 / this.scale);
    this.scale = 1;
    this.offset = new Point();
    return this;
  }

  getAnnotation() {
    const point = this.point;
    return {
      ...this,
      point: point.translate(this.offset.inverse()).zoom(1 / this.scale),
    };
  }

  /**
   * generate fabric objects from the label
   * @param color the color of the category
   * @param needText is it need to show the text
   * @returns
   */
  getFabricObjects(color: string, needText: boolean = true) {
    const {
      point: { x, y },
      id,
      category,
      labelType,
      timestamp,
      hash,
    } = this;
    const point = new fabric.Circle({
      ...POINT_DEFAULT_CONFIG,
      left: x,
      top: y,
      fill: color,
      stroke: TRANSPARENT,
    });

    const textbox = new fabric.Textbox(id.toString(), {
      ...TEXTBOX_DEFAULT_CONFIG,
      left: x + RADIUS - STROKE_WIDTH / 2,
      top: y - RADIUS + STROKE_WIDTH / 2,
      originY: 'bottom',
      backgroundColor: color,
    });

    const products = needText ? [textbox, point] : [point];
    products.forEach((obj) =>
      obj.setOptions({ labelType, category, id, timestamp, hash })
    );
    return products;
  }
}
