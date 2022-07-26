import { fabric } from 'fabric';
import md5 from 'md5';
import { Label, LabelType, CoordSystemType, LabelRenderMode } from '../Base';
import {
  POINT_DEFAULT_CONFIG,
  RADIUS,
  STROKE_WIDTH,
  TEXTBOX_DEFAULT_CONFIG,
  TRANSPARENT,
} from '../config';
import { getLocalTimeISOString } from '../utils/label';

export class PointLabel extends Label {
  x: number;
  y: number;

  constructor({
    x,
    y,
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
    category: string;
    id: number;
    scale?: number;
    offset?: { x: number; y: number };
    coordSystem?: CoordSystemType;
    timestamp?: string;
    hash?: string;
  }) {
    const labelType = LabelType.Point;
    const now = getLocalTimeISOString();
    super({
      labelType,
      category,
      id,
      scale,
      offset,
      coordSystem,
      timestamp: timestamp || now,
      hash: hash || md5(now),
    });
    this.x = x;
    this.y = y;
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
      left: x,
      top: y,
      category,
      id,
      timestamp: timestamp_,
      hash: hash_,
    } = obj as any;

    return new PointLabel({
      x,
      y,
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
    new PointLabel({
      x: this.x,
      y: this.y,
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

    const t = inplace ? this : this.clone();

    t.x = cx;
    t.y = cy;
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

    const t = inplace ? this : this.clone();

    t.x = ix;
    t.y = iy;
    t.scale = 1;
    t.offset = { x: 0, y: 0 };
    t.coordSystem = CoordSystemType.Image;
    return t;
  };

  toCanvasObjects = (color: string, mode: string) => {
    const { x, y, labelType, category, id, timestamp, hash } = this;

    const circle = new fabric.Circle({
      ...POINT_DEFAULT_CONFIG,
      left: x,
      top: y,
      fill: color,
      stroke: TRANSPARENT,
    });

    circle.setOptions({
      labelType,
      category,
      id,
      timestamp,
      hash,
      syncToLabel: true,
    });

    if (mode === LabelRenderMode.Drawing || mode === LabelRenderMode.Selected)
      return [circle];

    if (mode === LabelRenderMode.Hidden) {
      circle.visible = false;
      circle.hasControls = false;
      return [circle];
    }

    const textbox = new fabric.Textbox(this.id.toString(), {
      ...TEXTBOX_DEFAULT_CONFIG,
      left: x,
      top: y - RADIUS - STROKE_WIDTH / 2,
      originX: 'center',
      originY: 'bottom',
      backgroundColor: color,
    });

    textbox.setOptions({
      labelType,
      category,
      id,
      timestamp,
      hash,
      syncToLabel: false,
    });

    if (mode === LabelRenderMode.Preview) return [circle, textbox];

    return [];
  };
}
