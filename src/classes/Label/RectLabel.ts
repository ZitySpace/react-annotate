import { fabric } from 'fabric';
import md5 from 'md5';
import { Label, LabelType, getLocalTimeISOString } from '.';
import {
  RECT_DEFAULT_CONFIG,
  STROKE_WIDTH,
  TEXTBOX_DEFAULT_CONFIG,
} from '../../interfaces/config';
import { getFontSize } from '../../utils';
import { Point } from '../Geometry/Point';
import { Rect } from '../Geometry/Rect';

interface RectLabelArgs {
  category?: string;
  id?: number;
  scale?: number;
  offset?: Point;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  obj?: fabric.Rect;
  timestamp?: string;
  hash?: string;
}

export class RectLabel extends Label {
  rect: Rect;

  constructor({ obj, scale, offset }: RectLabelArgs); // construct from fabric object
  constructor({ x, y, category, id, scale, offset }: RectLabelArgs); // construct from cursor position
  constructor({ x, y, w, h, category, id }: RectLabelArgs); // construct from existing data
  constructor({
    x = 0,
    y = 0,
    w = 0,
    h = 0,
    category = '',
    id = 0,
    scale = 1,
    offset = new Point(),
    timestamp,
    hash,
    obj,
  }: RectLabelArgs) {
    const labelType = LabelType.Rect;
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
      const w = obj.getScaledWidth(); // stroke width had been added
      const h = obj.getScaledHeight(); // stroke width had been added

      super({
        labelType,
        category,
        id,
        scale,
        offset,
        timestamp: timestamp || timestamp_ || now,
        hash: hash || hash_ || md5(now),
      });
      this.rect = new Rect(x, y, w, h);
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
      this.rect = new Rect(x, y, w, h);
    }
  }

  scaleTransform(scale: number, offset: Point = new Point()) {
    if (this.scale !== 1 || this.offset.x || this.offset.y) this.origin();
    this.scale = scale;
    this.offset = offset;
    this.rect.zoom(scale).translate(offset);
    return this;
  }

  origin() {
    this.rect.translate(this.offset.inverse()).zoom(1 / this.scale);
    this.scale = 1;
    this.offset = new Point();
    return this;
  }

  getAnnotation() {
    const rect = this.rect;
    return {
      ...this,
      rect: rect.translate(this.offset.inverse()).zoom(1 / this.scale),
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
      rect: { x, y, w, h },
      labelType,
      category,
      id,
      timestamp,
      hash,
    } = this;
    console.log(timestamp);
    const rect = new fabric.Rect({
      ...RECT_DEFAULT_CONFIG,
      left: x,
      top: y,
      width: w - STROKE_WIDTH,
      height: h - STROKE_WIDTH,
      stroke: color,
    });

    const textbox = new fabric.Textbox(id.toString(), {
      ...TEXTBOX_DEFAULT_CONFIG,
      left: x + STROKE_WIDTH,
      top: y + STROKE_WIDTH,
      backgroundColor: color,
      fontSize: getFontSize(w, h),
    });

    const products = needText ? [textbox, rect] : [rect];
    products.forEach((obj) =>
      obj.setOptions({ labelType, category, id, timestamp, hash })
    );
    return products;
  }
}
