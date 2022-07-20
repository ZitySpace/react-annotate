import { fabric } from 'fabric';
import md5 from 'md5';
import {
  Label,
  LabelType,
  CoordSystemType,
  LabelRenderMode,
} from './BaseLabel';
import {
  LINE_DEFAULT_CONFIG,
  POINT_DEFAULT_CONFIG,
  POLYGON_DEFAULT_CONFIG,
  RADIUS,
  STROKE_WIDTH,
  TEXTBOX_DEFAULT_CONFIG,
  TRANSPARENT,
} from '../interfaces/config';
import { getLocalTimeISOString, getFontSize } from './utils';

export class MaskLabel extends Label {
  points: { x: number; y: number }[];

  constructor({
    points,
    category = '',
    id = 0,
    scale = 1,
    offset = { x: 0, y: 0 },
    coordSystem = CoordSystemType.Image,
    timestamp,
    hash,
  }: {
    points: { x: number; y: number }[];
    category: string;
    id: number;
    scale?: number;
    offset?: { x: number; y: number };
    coordSystem?: CoordSystemType;
    timestamp?: string;
    hash?: string;
  }) {
    const labelType = LabelType.Mask;
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
    this.points = points;
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
      points,
      category,
      id,
      timestamp: timestamp_,
      hash: hash_,
    } = obj as any;

    return new MaskLabel({
      points,
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
    new MaskLabel({
      points: this.points,
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
    const points = this.points.map((pt) =>
      super._toCanvasCoordSystem(scale, offset, pt)
    );

    const t = inplace ? this : this.clone();

    t.points = points;
    t.scale = scale;
    t.offset = offset;
    t.coordSystem = CoordSystemType.Canvas;
    return t;
  };

  toImageCoordSystem = (inplace = true) => {
    const points = this.points.map((pt) => super._toImageCoordSystem(pt));

    const t = inplace ? this : this.clone();

    t.points = points;
    t.scale = 1;
    t.offset = { x: 0, y: 0 };
    t.coordSystem = CoordSystemType.Image;
    return t;
  };

  toCanvasObjects = (color: string, mode: string) => {
    const { points, labelType, category, id, timestamp, hash } = this;

    const polygon = new fabric.Polygon([...points], {
      ...POLYGON_DEFAULT_CONFIG,
      fill: color,
    });

    polygon.setOptions({
      labelType,
      category,
      id,
      timestamp,
      hash,
      syncToLabel: true,
    });

    if (mode === LabelRenderMode.Hidden) {
      polygon.visible = false;
      polygon.hasControls = false;
      return [polygon];
    }

    const ys = points.map((p) => p.y);
    const idxOfTopPoint = ys.indexOf(Math.min(...ys));

    const textbox = new fabric.Textbox(this.id.toString(), {
      ...TEXTBOX_DEFAULT_CONFIG,
      left: points[idxOfTopPoint].x,
      top: points[idxOfTopPoint].y - RADIUS - STROKE_WIDTH / 2,
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

    if (mode === LabelRenderMode.Preview) return [polygon, textbox];

    const circles = points.map(
      (pt) =>
        new fabric.Circle({
          ...POINT_DEFAULT_CONFIG,
          left: pt.x,
          top: pt.y,
          fill: color,
          stroke: TRANSPARENT,
        })
    );

    circles.forEach((c) =>
      c.setOptions({
        labelType,
        category,
        id,
        timestamp,
        hash,
        syncToLabel: false,
      })
    );

    const l = points.length;
    const lines =
      points.length > 1
        ? Array.from(
            { length: points.length },
            (_, i) =>
              new fabric.Line(
                [
                  points[i % l].x,
                  points[i % l].y,
                  points[(i + 1) % l].x,
                  points[(i + 1) % l].y,
                ],
                {
                  ...LINE_DEFAULT_CONFIG,
                  stroke: color,
                }
              )
          )
        : [];

    lines.forEach((l) =>
      l.setOptions({
        labelType,
        category,
        id,
        timestamp,
        hash,
        syncToLabel: false,
      })
    );

    polygon.visible = false;

    if (mode === LabelRenderMode.Drawing)
      return [
        polygon,
        ...(l > 1 ? circles.slice(0, -1) : circles),
        ...lines.slice(0, -1),
      ];

    if (mode === LabelRenderMode.Selected)
      return [polygon, ...circles, ...lines];

    return [];
  };
}
