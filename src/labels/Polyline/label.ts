import { fabric } from 'fabric';
import md5 from 'md5';
import { Label, LabelType, CoordSystemType, LabelRenderMode } from '../Base';
import {
  LINE_DEFAULT_CONFIG,
  POINT_DEFAULT_CONFIG,
  POLYLINE_DEFAULT_CONFIG,
  RADIUS,
  STROKE_WIDTH,
  TEXTBOX_DEFAULT_CONFIG,
  TRANSPARENT,
} from '../config';
import { getLocalTimeISOString } from '../utils/label';

export class PolylineLabel extends Label {
  paths: { x: number; y: number }[][];

  constructor({
    paths,
    category = '',
    id = 0,
    scale = 1,
    offset = { x: 0, y: 0 },
    coordSystem = CoordSystemType.Image,
    timestamp,
    hash,
  }: {
    paths: { x: number; y: number }[][];
    category: string;
    id: number;
    scale?: number;
    offset?: { x: number; y: number };
    coordSystem?: CoordSystemType;
    timestamp?: string;
    hash?: string;
  }) {
    const labelType = LabelType.Polyline;
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
    this.paths = paths;
  }

  public static newFromCanvasObject = ({
    grp,
    scale,
    offset,
    timestamp,
    hash,
  }: {
    grp: fabric.Object[];
    scale: number;
    offset: { x: number; y: number };
    timestamp?: string;
    hash?: string;
  }) => {
    const { category, id, timestamp: timestamp_, hash: hash_ } = grp[0] as any;
    const paths = grp.map((pl) =>
      (pl as fabric.Polyline).points!.map((pt) => ({ x: pt.x, y: pt.y }))
    );

    return new PolylineLabel({
      paths,
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
    new PolylineLabel({
      paths: this.paths.map((path) => path.map((pt) => ({ ...pt }))),
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
    const paths = this.paths.map((path) =>
      path.map((pt) => super._toCanvasCoordSystem(scale, offset, pt))
    );

    const t = inplace ? this : this.clone();

    t.paths = paths;
    t.scale = scale;
    t.offset = offset;
    t.coordSystem = CoordSystemType.Canvas;
    return t;
  };

  toImageCoordSystem = (inplace = true) => {
    const paths = this.paths.map((path) =>
      path.map((pt) => super._toImageCoordSystem(pt))
    );

    const t = inplace ? this : this.clone();

    t.paths = paths;
    t.scale = 1;
    t.offset = { x: 0, y: 0 };
    t.coordSystem = CoordSystemType.Image;
    return t;
  };

  toCanvasObjects = (color: string, mode: string) => {
    const { paths, labelType, category, id, timestamp, hash } = this;

    const polylines = paths.map(
      (path) =>
        new fabric.Polyline(
          path.map((pt) => ({ ...pt })),
          {
            ...POLYLINE_DEFAULT_CONFIG,
            stroke: color,
          }
        )
    );

    polylines.forEach((pl) =>
      pl.setOptions({
        labelType,
        category,
        id,
        timestamp,
        hash,
        syncToLabel: true,
      })
    );

    if (mode === LabelRenderMode.Hidden) {
      polylines.forEach((pl) => {
        pl.visible = false;
        pl.hasControls = false;
      });
      return [polylines];
    }

    const xs = paths.map((path) => path.map((pt) => pt.x)).flat();
    const ys = paths.map((path) => path.map((pt) => pt.y)).flat();
    const idxOfTopPoint = ys.indexOf(Math.min(...ys));

    const textbox = new fabric.Textbox(this.id.toString(), {
      ...TEXTBOX_DEFAULT_CONFIG,
      left: xs[idxOfTopPoint],
      top: ys[idxOfTopPoint] - RADIUS - STROKE_WIDTH / 2,
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

    if (mode === LabelRenderMode.Preview) {
      polylines.forEach((pl) => (pl.hoverCursor = undefined));
      return [polylines, textbox];
    }

    const circles = paths.map((path) =>
      path.map(
        (pt) =>
          new fabric.Circle({
            ...POINT_DEFAULT_CONFIG,
            left: pt.x,
            top: pt.y,
            fill: color,
            stroke: TRANSPARENT,
          })
      )
    );

    circles.forEach((cs, i) =>
      cs.forEach((c, j) =>
        c.setOptions({
          labelType,
          category,
          id,
          timestamp,
          hash,
          syncToLabel: false,
          lineStarting: null,
          lineEnding: null,
        })
      )
    );

    const lines = paths.map((path) =>
      path.slice(0, -1).map(
        (_, i) =>
          new fabric.Line(
            [path[i].x, path[i].y, path[i + 1].x, path[i + 1].y],
            {
              ...LINE_DEFAULT_CONFIG,
              stroke: color,
              selectable: false,
              hoverCursor: 'default',
            }
          )
      )
    );

    lines.forEach((ls, i) =>
      ls.forEach((l, j) =>
        l.setOptions({
          labelType,
          category,
          id,
          timestamp,
          hash,
          syncToLabel: false,
          midpoint: null,
        })
      )
    );

    const [r, g, b, a] = color.replace(/[^\d, .]/g, '').split(',');
    polylines.forEach((pl) => {
      pl.stroke = `rgba(${r}, ${g}, ${b}, 0)`;
      pl.selectable = false;
    });

    if (mode === LabelRenderMode.Drawing) {
      circles.forEach((cs) => cs.forEach((c) => (c.selectable = false)));
      return [polylines, lines, circles];
    }

    if (mode === LabelRenderMode.Selected) return [polylines, lines, circles];

    return [];
  };
}
