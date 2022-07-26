import { fabric } from 'fabric';
import md5 from 'md5';
import { Label, LabelType, CoordSystemType, LabelRenderMode } from '../Base';
import {
  LINE_DEFAULT_CONFIG,
  POINT_DEFAULT_CONFIG,
  RADIUS,
  STROKE_WIDTH,
  TEXTBOX_DEFAULT_CONFIG,
  TRANSPARENT,
} from '../config';
import { getLocalTimeISOString } from '../utils/label';

export class LineLabel extends Label {
  x1: number;
  y1: number;
  x2: number;
  y2: number;

  constructor({
    x1,
    y1,
    x2,
    y2,
    category = '',
    id = 0,
    scale = 1,
    offset = { x: 0, y: 0 },
    coordSystem = CoordSystemType.Image,
    timestamp,
    hash,
  }: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    category: string;
    id: number;
    scale?: number;
    offset?: { x: number; y: number };
    coordSystem?: CoordSystemType;
    timestamp?: string;
    hash?: string;
  }) {
    const labelType = LabelType.Line;
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
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
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
      x1,
      y1,
      x2,
      y2,
      category,
      id,
      timestamp: timestamp_,
      hash: hash_,
    } = obj as any;

    return new LineLabel({
      x1,
      y1,
      x2,
      y2,
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
    new LineLabel({
      x1: this.x1,
      y1: this.y1,
      x2: this.x2,
      y2: this.y2,
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
    const { x: cx1, y: cy1 } = super._toCanvasCoordSystem(scale, offset, {
      x: this.x1,
      y: this.y1,
    });
    const { x: cx2, y: cy2 } = super._toCanvasCoordSystem(scale, offset, {
      x: this.x2,
      y: this.y2,
    });

    const t = inplace ? this : this.clone();

    t.x1 = cx1;
    t.y1 = cy1;
    t.x2 = cx2;
    t.y2 = cy2;
    t.scale = scale;
    t.offset = offset;
    t.coordSystem = CoordSystemType.Canvas;
    return t;
  };

  toImageCoordSystem = (inplace = true) => {
    const { x: ix1, y: iy1 } = super._toImageCoordSystem({
      x: this.x1,
      y: this.y1,
    });
    const { x: ix2, y: iy2 } = super._toImageCoordSystem({
      x: this.x2,
      y: this.y2,
    });

    const t = inplace ? this : this.clone();

    t.x1 = ix1;
    t.y1 = iy1;
    t.x2 = ix2;
    t.y2 = iy2;
    t.scale = 1;
    t.offset = { x: 0, y: 0 };
    t.coordSystem = CoordSystemType.Image;
    return t;
  };

  toCanvasObjects = (color: string, mode: string) => {
    const { x1, y1, x2, y2, labelType, category, id, timestamp, hash } = this;

    const line = new fabric.Line([x1, y1, x2, y2], {
      ...LINE_DEFAULT_CONFIG,
      stroke: color,
    });

    line.setOptions({
      labelType,
      category,
      id,
      timestamp,
      hash,
      syncToLabel: true,
    });

    if (mode === LabelRenderMode.Drawing) return [line];

    if (mode === LabelRenderMode.Hidden) {
      line.visible = false;
      line.hasControls = false;
      return [line];
    }

    const textbox = new fabric.Textbox(this.id.toString(), {
      ...TEXTBOX_DEFAULT_CONFIG,
      left: y1 < y2 ? x1 : x2,
      top: (y1 < y2 ? y1 : y2) - RADIUS - STROKE_WIDTH / 2,
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

    if (mode === LabelRenderMode.Preview) return [line, textbox];

    const circle1 = new fabric.Circle({
      ...POINT_DEFAULT_CONFIG,
      left: x1,
      top: y1,
      fill: color,
      stroke: TRANSPARENT,
    });

    circle1.setOptions({
      labelType,
      category,
      id,
      timestamp,
      hash,
      syncToLabel: false,
      line,
      endpointOfLine: 1,
    });

    const circle2 = new fabric.Circle({
      ...POINT_DEFAULT_CONFIG,
      left: x2,
      top: y2,
      fill: color,
      stroke: TRANSPARENT,
    });

    circle2.setOptions({
      labelType,
      category,
      id,
      timestamp,
      hash,
      syncToLabel: false,
      line,
      endpointOfLine: 2,
    });

    line.setOptions({
      endpoints: [circle1, circle2],
    });

    if (mode === LabelRenderMode.Selected) return [line, circle1, circle2];

    return [];
  };
}
