import { fabric } from 'fabric';
import md5 from 'md5';
import { Label, LabelType, CoordSystemType, LabelRenderMode } from '../Base';
import {
  LINE_DEFAULT_CONFIG,
  POINT_DEFAULT_CONFIG,
  POLYGON_DEFAULT_CONFIG,
  RADIUS,
  STROKE_WIDTH,
  TEXTBOX_DEFAULT_CONFIG,
  TRANSPARENT,
} from '../config';
import { getLocalTimeISOString, getFontSize } from '../utils/label';

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
      points: (points as { x: number; y: number }[]).map((pt) => ({ ...pt })),
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
      points: this.points.map((pt) => ({ ...pt })),
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

    const polygon = new fabric.Polygon(
      points.map((pt) => ({ ...pt })),
      {
        ...POLYGON_DEFAULT_CONFIG,
        fill: color,
      }
    );

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

    circles.forEach((c, i) =>
      c.setOptions({
        labelType,
        category,
        id,
        timestamp,
        hash,
        syncToLabel: false,
        lineStarting: null,
        lineEnding: null,
        pointOfPolygon: polygon.points![i],
        pidOfPolygon: i,
      })
    );

    const l = points.length;
    const lines =
      l > 1
        ? Array.from(
            { length: l },
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
                  selectable: false,
                  hoverCursor: 'default',
                }
              )
          )
        : [];

    lines.forEach((line, i) =>
      line.setOptions({
        labelType,
        category,
        id,
        timestamp,
        hash,
        syncToLabel: false,
        midpoint: null,
        pidsOfPolygon: [i % l, (i + 1) % l],
      })
    );

    l > 1 &&
      circles.forEach((circle, i) => {
        circle.setOptions({
          lineStarting: lines[i],
          lineEnding: lines[(i + l - 1) % l],
        });
      });

    const [r, g, b, a] = color.replace(/[^\d, .]/g, '').split(',');
    polygon.fill = `rgba(${r}, ${g}, ${b}, 0.01)`;
    polygon.selectable = false;

    if (mode === LabelRenderMode.Drawing) {
      circles.forEach((c) => (c.selectable = false));
      return [polygon, ...lines.slice(0, -1), ...circles];
    }

    if (mode === LabelRenderMode.Selected)
      return [polygon, ...lines, ...circles];

    return [];
  };
}
