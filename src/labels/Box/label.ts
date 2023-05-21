import * as fabric from 'fabric';
import md5 from 'md5';
import { Label, LabelType, CoordSystemType, LabelRenderMode } from '../Base';
import {
  RECT_DEFAULT_CONFIG,
  STROKE_WIDTH,
  TEXTBOX_DEFAULT_CONFIG,
} from '../config';
import { getFontSize, getLocalTimeISOString } from '../utils/label';

export class BoxLabel extends Label {
  x: number;
  y: number;
  w: number;
  h: number;

  constructor({
    x,
    y,
    w,
    h,
    category = '',
    id = 0,
    scale = 1,
    offset = { x: 0, y: 0 },
    coordSystem = CoordSystemType.Image,
    timestamp,
    hash,
  }: {
    x: number;
    y: number;
    w: number;
    h: number;
    category: string;
    id: number;
    scale?: number;
    offset?: { x: number; y: number };
    coordSystem?: CoordSystemType;
    timestamp?: string;
    hash?: string;
  }) {
    super({
      labelType: LabelType.Box,
      category,
      id,
      scale,
      offset,
      coordSystem,
      ...(() => {
        const now = getLocalTimeISOString();
        return {
          timestamp: timestamp || now,
          hash: hash || md5(now),
        };
      })(),
    });
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  public static newFromCanvasObject = ({
    obj,
    scale,
    offset,
    timestamp,
    hash,
  }: {
    obj: fabric.Object;
    scale: number;
    offset: { x: number; y: number };
    timestamp?: string;
    hash?: string;
  }) => {
    const {
      left,
      top,
      category,
      id,
      timestamp: timestamp_,
      hash: hash_,
    } = obj as any;
    const x = left + STROKE_WIDTH / 2;
    const y = top + STROKE_WIDTH / 2;
    const w = obj.getScaledWidth() - STROKE_WIDTH;
    const h = obj.getScaledHeight() - STROKE_WIDTH;

    return new BoxLabel({
      x,
      y,
      w,
      h,
      category,
      id,
      scale,
      offset,
      coordSystem: CoordSystemType.Canvas,
      timestamp: timestamp || timestamp_,
      hash: hash || hash_,
    });
  };

  clone = () =>
    new BoxLabel({
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h,
      category: this.category,
      id: this.id,
      scale: this.scale,
      offset: { x: this.offset.x, y: this.offset.y },
      coordSystem: this.coordSystem,
      timestamp: this.timestamp,
      hash: this.hash,
    });

  toCanvasCoordSystem = (
    {
      scale,
      offset,
    }: {
      scale: number;
      offset: { x: number; y: number };
    },
    inplace = true
  ) => {
    const { x: cx, y: cy } = super._toCanvasCoordSystem(scale, offset, {
      x: this.x,
      y: this.y,
    });
    const cw = (this.w * scale) / this.scale;
    const ch = (this.h * scale) / this.scale;

    const t = inplace ? this : this.clone();
    t.x = cx;
    t.y = cy;
    t.w = cw;
    t.h = ch;
    t.scale = scale;
    t.offset = offset;
    t.coordSystem = CoordSystemType.Canvas;
    return t;
  };

  toImageCoordSystem = (inplace = true) => {
    const { x: ix, y: iy } = super._toImageCoordSystem({
      x: this.x,
      y: this.y,
    });
    const iw = this.w / this.scale;
    const ih = this.h / this.scale;

    const t = inplace ? this : this.clone();
    t.x = ix;
    t.y = iy;
    t.w = iw;
    t.h = ih;
    t.scale = 1;
    t.offset = { x: 0, y: 0 };
    t.coordSystem = CoordSystemType.Image;
    return t;
  };

  toCanvasObjects = (color: string, mode: string) => {
    const { x, y, w, h, labelType, category, id, timestamp, hash } = this;

    const rect = new fabric.Rect({
      ...RECT_DEFAULT_CONFIG,
      left: x - STROKE_WIDTH / 2,
      top: y - STROKE_WIDTH / 2,
      width: w,
      height: h,
      stroke: color,
    });

    rect.set({
      labelType,
      category,
      id,
      timestamp,
      hash,
      syncToLabel: true,
    });

    if (mode === LabelRenderMode.Drawing || mode === LabelRenderMode.Selected)
      return [rect];

    if (mode === LabelRenderMode.Hidden) {
      rect.visible = false;
      rect.hasControls = false;
      return [rect];
    }

    const textbox = new fabric.Textbox(this.id.toString(), {
      ...TEXTBOX_DEFAULT_CONFIG,
      left: x + STROKE_WIDTH / 2,
      top: y + STROKE_WIDTH / 2,
      backgroundColor: color,
      fontSize: getFontSize(w, h),
    });

    textbox.set({
      labelType,
      category,
      id,
      timestamp,
      hash,
      syncToLabel: false,
    });

    if (mode === LabelRenderMode.Preview) return [rect, textbox];

    return [];
  };
}
